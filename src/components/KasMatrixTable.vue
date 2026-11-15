<script setup>
import { ref, computed } from 'vue'
import { 
  Check, 
  Minus, 
  Search, 
  Loader2, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-vue-next'

const props = defineProps({
  daftarPertemuan: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  totalPerMinggu: {
    type: Array,
    default: () => [],
  },
  grandTotalKas: {
    type: Number,
    default: 0,
  },
  semesterInfo: {
    type: Object,
    default: () => ({}),
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  pin: {
    type: String,
    default: '',
  },
  searchQuery: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: 'Semua',
  },
})

const emit = defineEmits(['toggleCell', 'needPin'])

// Tracking cell currently being updated: `${rowId}-${pertemuanKe}`
const mutatingCellKey = ref(null)

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

// Filter rows based on search and status props
const filteredRows = computed(() => {
  let list = Array.isArray(props.rows) ? props.rows : []

  // Filter search
  const q = (props.searchQuery || '').trim().toLowerCase()
  if (q) {
    list = list.filter(
      (r) =>
        (r.nama && r.nama.toLowerCase().includes(q)) ||
        (r.nim && r.nim.toLowerCase().includes(q))
    )
  }

  // Filter status
  if (props.statusFilter && props.statusFilter !== 'Semua') {
    list = list.filter((r) => r.status === props.statusFilter)
  }

  // Ensure alphabetical sort
  return [...list].sort((a, b) => {
    const namaA = (a.nama || '').trim().toLowerCase()
    const namaB = (b.nama || '').trim().toLowerCase()
    return namaA.localeCompare(namaB, 'id', { sensitivity: 'base' })
  })
})

function getDetail(row, pertemuanKe) {
  if (!row.detailMingguan) return null
  return row.detailMingguan.find((d) => d.pertemuanKe === pertemuanKe)
}

function handleCellClick(row, pertemuan) {
  if (!props.interactive) return

  if (!props.pin || !props.pin.trim()) {
    emit('needPin')
    return
  }

  const detail = getDetail(row, pertemuan.pertemuanKe)
  const currentBayar = detail ? Boolean(detail.bayar) : false
  const targetBayar = !currentBayar

  mutatingCellKey.value = `${row._id}-${pertemuan.pertemuanKe}`

  emit('toggleCell', {
    kasId: row._id,
    pertemuanKe: pertemuan.pertemuanKe,
    bayar: targetBayar,
    nominal: detail?.nominal || props.semesterInfo?.nominalPerMinggu || 5000,
    callback: () => {
      mutatingCellKey.value = null
    },
  })
}
</script>

<template>
  <div class="space-y-3">
    <!-- Mobile scroll hint banner -->
    <div class="flex items-center justify-between px-2 text-[11px] text-slate-500 lg:hidden">
      <span class="inline-flex items-center gap-1.5 font-medium">
        <Info class="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        Geser tabel ke samping untuk melihat seluruh pertemuan
      </span>
      <span class="font-mono text-[10px] text-slate-400">Excel View</span>
    </div>

    <!-- Spreadsheet Table Container -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-card">
      <div 
        class="max-h-[68vh] overflow-x-auto overflow-y-auto overscroll-contain select-none"
        tabindex="0"
        role="region"
        aria-label="Tabel matriks absensi kas mingguan"
      >
        <table class="w-full border-collapse text-left text-xs">
          <!-- Table Header -->
          <thead class="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200/80">
            <tr>
              <!-- Sticky Left 1: No Urut -->
              <th 
                scope="col" 
                class="sticky left-0 z-40 bg-slate-100/95 px-3 py-3 text-center w-12 border-r border-slate-200/80 shrink-0"
              >
                No
              </th>

              <!-- Sticky Left 2: NIM -->
              <th 
                scope="col" 
                class="sticky left-12 z-40 bg-slate-100/95 px-3.5 py-3 w-28 border-r border-slate-200/80 shrink-0"
              >
                NIM
              </th>

              <!-- Sticky Left 3: Nama Mahasiswa -->
              <th 
                scope="col" 
                class="sticky left-40 z-40 bg-slate-100/95 px-4 py-3 min-w-[180px] max-w-[220px] border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)] shrink-0"
              >
                Nama Mahasiswa
              </th>

              <!-- Dynamic Meeting Columns (P1, P2, ...) -->
              <th
                v-for="p in daftarPertemuan"
                :key="p.pertemuanKe"
                scope="col"
                class="px-2 py-2.5 text-center min-w-[58px] border-r border-slate-100/80 transition-colors hover:bg-slate-200/50"
              >
                <div class="font-mono text-[11px] font-extrabold text-slate-800">
                  {{ p.tanggal || `P${p.pertemuanKe}` }}
                </div>
                <div class="text-[9px] font-medium text-slate-400 mt-0.5">
                  P{{ p.pertemuanKe }}
                </div>
              </th>

              <!-- Summary Columns on the Right -->
              <th scope="col" class="px-4 py-3 text-right min-w-[100px] border-l border-slate-200/80 bg-slate-50/95">
                Total Bayar
              </th>
              <th scope="col" class="px-4 py-3 text-center min-w-[95px] bg-slate-50/95">
                Status
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(row, idx) in filteredRows"
              :key="row._id || row.nim"
              class="group hover:bg-emerald-50/20 transition-colors duration-150"
            >
              <!-- Sticky Left 1: No Urut -->
              <td 
                class="sticky left-0 z-20 bg-white group-hover:bg-slate-50/90 px-3 py-2.5 text-center font-mono font-bold text-slate-400 group-hover:text-emerald-700 border-r border-slate-200/80 transition-colors"
              >
                {{ idx + 1 }}
              </td>

              <!-- Sticky Left 2: NIM -->
              <td 
                class="sticky left-12 z-20 bg-white group-hover:bg-slate-50/90 px-3.5 py-2.5 font-mono text-[11px] font-medium text-slate-600 border-r border-slate-200/80 transition-colors truncate"
                :title="row.nim"
              >
                {{ row.nim || '—' }}
              </td>

              <!-- Sticky Left 3: Nama Mahasiswa -->
              <td 
                class="sticky left-40 z-20 bg-white group-hover:bg-slate-50/90 px-4 py-2.5 font-bold text-slate-900 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)] transition-colors min-w-[180px] max-w-[220px]"
              >
                <div class="truncate text-xs" :title="row.nama">
                  {{ row.nama || '—' }}
                </div>
              </td>

              <!-- Dynamic Meeting Cells -->
              <td
                v-for="p in daftarPertemuan"
                :key="p.pertemuanKe"
                class="px-1.5 py-2 text-center border-r border-slate-100/80 transition-all"
                :class="[
                  interactive ? 'cursor-pointer hover:bg-emerald-100/50 active:scale-95' : '',
                  getDetail(row, p.pertemuanKe)?.bayar ? 'bg-emerald-50/30' : ''
                ]"
                @click="handleCellClick(row, p)"
              >
                <!-- Cell with attendance indicator -->
                <div class="flex items-center justify-center">
                  <!-- Loading spinner during mutation -->
                  <div 
                    v-if="mutatingCellKey === `${row._id}-${p.pertemuanKe}`" 
                    class="h-7 w-7 rounded-lg bg-emerald-100 grid place-items-center animate-spin"
                  >
                    <Loader2 class="h-3.5 w-3.5 text-emerald-700" />
                  </div>

                  <!-- Paid: Centang Hijau ✓ -->
                  <div
                    v-else-if="getDetail(row, p.pertemuanKe)?.bayar"
                    class="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100/80 text-emerald-700 font-black shadow-sm ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105"
                    :title="`Pertemuan ${p.pertemuanKe} (${p.tanggal}): Lunas ${formatCurrency(getDetail(row, p.pertemuanKe)?.nominal || 5000)}`"
                  >
                    <Check class="h-4 w-4 stroke-[3]" />
                  </div>

                  <!-- Unpaid: Strip Abu-abu - -->
                  <div
                    v-else
                    class="grid h-7 w-7 place-items-center rounded-lg text-slate-300 hover:text-slate-400 font-bold transition-colors"
                    :title="`Pertemuan ${p.pertemuanKe} (${p.tanggal}): Belum Bayar`"
                  >
                    <Minus class="h-3.5 w-3.5 stroke-[2]" />
                  </div>
                </div>
              </td>

              <!-- Summary: Total Bayar -->
              <td class="px-4 py-2.5 text-right font-mono font-bold text-slate-900 border-l border-slate-200/80 bg-slate-50/40">
                {{ formatCurrency(row.nominal) }}
              </td>

              <!-- Summary: Status Pelunasan -->
              <td class="px-3 py-2.5 text-center bg-slate-50/40">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                  :class="
                    row.status === 'Lunas'
                      ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20'
                      : 'bg-amber-100 text-amber-900 ring-1 ring-amber-600/20'
                  "
                >
                  {{ row.status || 'Belum Lunas' }}
                </span>
              </td>
            </tr>

            <!-- Empty Rows State -->
            <tr v-if="filteredRows.length === 0">
              <td 
                :colspan="daftarPertemuan.length + 5" 
                class="px-6 py-12 text-center text-slate-400 bg-white"
              >
                <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner mb-3">
                  <Search class="h-5 w-5" />
                </div>
                <p class="font-bold text-slate-700 text-sm">Tidak ada data mahasiswa ditemukan</p>
                <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer (Rekap Pertemuan & Grand Total) -->
          <tfoot class="sticky bottom-0 z-30 bg-slate-100/95 backdrop-blur-md border-t-2 border-slate-300 text-[11px] font-bold text-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <!-- Row 1: Mahasiswa yang membayar -->
            <tr>
              <td 
                colspan="3" 
                class="sticky left-0 z-40 bg-slate-200/95 px-4 py-2 text-right font-extrabold uppercase tracking-wider text-slate-600 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]"
              >
                Mhs Bayar
              </td>
              <td
                v-for="p in daftarPertemuan"
                :key="`mhs-${p.pertemuanKe}`"
                class="px-1.5 py-2 text-center border-r border-slate-200/80 font-mono text-[11px] font-extrabold text-emerald-700"
              >
                {{ totalPerMinggu.find((item) => item.pertemuanKe === p.pertemuanKe)?.jumlahBayar ?? 0 }}
              </td>
              <td colspan="2" class="px-4 py-2 text-center text-slate-400 font-medium">
                {{ filteredRows.filter(r => r.status === 'Lunas').length }} Lunas
              </td>
            </tr>

            <!-- Row 2: Subtotal Uang Masuk per Pertemuan -->
            <tr class="border-t border-slate-200/80 bg-slate-200/90">
              <td 
                colspan="3" 
                class="sticky left-0 z-40 bg-slate-300/95 px-4 py-2.5 text-right font-black uppercase tracking-wider text-slate-800 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]"
              >
                Total Masuk
              </td>
              <td
                v-for="p in daftarPertemuan"
                :key="`uang-${p.pertemuanKe}`"
                class="px-1 py-2.5 text-center border-r border-slate-200/80 font-mono text-[10px] font-extrabold text-slate-900"
              >
                {{ formatCurrency(totalPerMinggu.find((item) => item.pertemuanKe === p.pertemuanKe)?.totalUang ?? 0) }}
              </td>
              <td class="px-4 py-2.5 text-right font-mono font-black text-emerald-800 border-l border-slate-300 text-xs">
                {{ formatCurrency(grandTotalKas) }}
              </td>
              <td class="px-3 py-2.5 text-center text-[10px] font-extrabold text-slate-500 uppercase">
                Grand Total
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Footer Info Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          <span>Menampilkan <strong>{{ filteredRows.length }}</strong> mahasiswa (Matriks Mingguan)</span>
        </div>
        <div class="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span v-if="interactive" class="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Mode Edit Aktif (Klik sel untuk ubah bayar)
          </span>
          <span v-else>Mode Publik (Read-Only)</span>
        </div>
      </div>
    </div>
  </div>
</template>
