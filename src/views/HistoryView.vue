<script setup>
import { computed, ref, watch } from 'vue'
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet
} from 'lucide-vue-next'
import { useHistory } from '../composables/useHistory'
import { useSemester } from '../composables/useSemester'
import TransactionDetailModal from '../components/TransactionDetailModal.vue'

const { selectedSemesterId, selectedSemester } = useSemester()

const activeCategory = ref('all') // 'all' | 'pemasukan' | 'pengeluaran' | 'refund' | 'status'
const selectedBulan = ref('')
const search = ref('')
const selectedItem = ref(null)
const detailModalOpen = ref(false)

const { records, summary, daftarBulan, historyQuery, refetch } = useHistory({
  semesterId: selectedSemesterId,
  kategori: activeCategory,
  bulan: selectedBulan,
  search,
  limit: 300
})

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(val) || 0)

function formatRelativeTime(dateString) {
  if (!dateString) return 'Baru saja'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} mnt lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari lalu`

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatDateHeader(dateString) {
  if (!dateString) return 'Tanggal Lainnya'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Tanggal Lainnya'

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function formatTimeOnly(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Group records by calendar date
const groupedRecords = computed(() => {
  const groups = new Map()

  records.value.forEach((item) => {
    const dateKey = formatDateHeader(item.waktu || item.createdAt)
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey).push(item)
  })

  return Array.from(groups.entries()).map(([dateHeader, items]) => ({
    dateHeader,
    items
  }))
})

function getItemVisual(item) {
  const isRefund =
    item.isRefund ||
    item.dataSnapshot?.kategori === 'Pengembalian Kas' ||
    (item.keterangan && item.keterangan.toLowerCase().includes('pengembalian'))

  if (isRefund) {
    return {
      label: 'Pengembalian Kas',
      icon: HandCoins,
      sign: '↺',
      color: 'teal',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
      amountClass: 'text-teal-700'
    }
  }

  if (item.aksi === 'EXPENSE_CREATE') {
    return {
      label: 'Belanja Kelas',
      icon: ArrowDownRight,
      sign: '-',
      color: 'rose',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
      amountClass: 'text-rose-600'
    }
  }

  if (item.aksi === 'CREATE' || item.aksi === 'IMPORT_EXCEL') {
    return {
      label: 'Kas Masuk',
      icon: ArrowUpRight,
      sign: '+',
      color: 'emerald',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      amountClass: 'text-emerald-700'
    }
  }

  return {
    label: 'Ubah Absensi / Data',
    icon: CheckCircle2,
    sign: '',
    color: 'sky',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    iconBg: 'bg-sky-50 text-sky-700 border-sky-200',
    amountClass: 'text-slate-800'
  }
}

function openDetail(item) {
  selectedItem.value = item
  detailModalOpen.value = true
}

function handlePrint() {
  window.print()
}

// Reset filter bulan jika semester berganti
watch(
  () => selectedSemesterId.value,
  () => {
    selectedBulan.value = ''
    search.value = ''
  }
)
</script>

<template>
  <div class="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-800">
          <History class="h-3.5 w-3.5 text-emerald-600" />
          <span>Buku Kas & Riwayat Mutasi Lengkap</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
          Riwayat Pembayaran & Kas Kelas
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau seluruh jejak audit transaksi, pembayaran iuran kas, belanja operasional, dan pengembalian kas secara transparan.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          title="Cetak laporan mutasi"
          @click="handlePrint"
        >
          <Printer class="w-4 h-4 text-slate-500" />
          <span>Cetak Laporan</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          title="Segarkan data"
          @click="refetch"
        >
          <RefreshCw class="w-4 h-4 text-slate-500" :class="{ 'animate-spin': historyQuery.isFetching.value }" />
          <span class="hidden sm:inline">Segarkan</span>
        </button>
      </div>
    </div>

    <!-- Print Header (Only visible when printing) -->
    <div class="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
      <h1 class="text-2xl font-black text-slate-900">LAPORAN MUTASI & BUKU KAS KELAS</h1>
      <p class="text-sm font-semibold text-slate-700 mt-1">
        Semester: {{ selectedSemester?.nama || 'Semester Aktif' }} &bull; Tanggal Cetak: {{ new Date().toLocaleDateString('id-ID') }}
      </p>
    </div>

    <!-- 1. Top Summary Cards (4 Metrik) -->
    <section class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 print:grid-cols-4">
      <!-- Total Mutasi -->
      <div class="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-card transition-all">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Total Mutasi</span>
          <div class="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <History class="w-4 h-4" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
          {{ summary.totalMutasi }}
          <span class="text-xs font-semibold text-slate-500 font-sans">Aktivitas</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Tercatat dalam log audit</p>
      </div>

      <!-- Akumulasi Kas Masuk -->
      <div class="rounded-2xl sm:rounded-3xl border border-emerald-200/80 bg-gradient-to-tr from-emerald-50/70 to-white p-4 sm:p-5 shadow-card transition-all">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">Kas Masuk</span>
          <div class="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
            <ArrowUpRight class="w-4 h-4" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-black text-emerald-700 mt-2 font-mono">
          + {{ formatCurrency(summary.totalKasMasuk) }}
        </div>
        <p class="text-[11px] text-emerald-600/80 mt-1">Iuran & dana non-iuran</p>
      </div>

      <!-- Akumulasi Belanja Kelas -->
      <div class="rounded-2xl sm:rounded-3xl border border-rose-200/80 bg-gradient-to-tr from-rose-50/70 to-white p-4 sm:p-5 shadow-card transition-all">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-800">Belanja Kelas</span>
          <div class="grid h-8 w-8 place-items-center rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-600/20">
            <ArrowDownRight class="w-4 h-4" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-black text-rose-600 mt-2 font-mono">
          - {{ formatCurrency(summary.totalPengeluaranOperasional) }}
        </div>
        <p class="text-[11px] text-rose-600/80 mt-1">Peralatan & konsumsi</p>
      </div>

      <!-- Total Uang Dikembalikan (Refund) -->
      <div class="rounded-2xl sm:rounded-3xl border border-teal-200/80 bg-gradient-to-tr from-teal-50/70 to-white p-4 sm:p-5 shadow-card transition-all">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-teal-800">Kas Dikembalikan</span>
          <div class="grid h-8 w-8 place-items-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/20">
            <HandCoins class="w-4 h-4" />
          </div>
        </div>
        <div class="text-xl sm:text-2xl font-black text-teal-700 mt-2 font-mono">
          ↺ {{ formatCurrency(summary.totalUangDikembalikan) }}
        </div>
        <p class="text-[11px] text-teal-600/80 mt-1">Sisa kas dibagikan ke mhs</p>
      </div>
    </section>

    <!-- 2. Controls & Filter Bar -->
    <section class="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-card space-y-4 print:hidden">
      <!-- Category Segmented Buttons -->
      <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/70 w-fit">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
          :class="activeCategory === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          @click="activeCategory = 'all'"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>Semua Mutasi</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
          :class="activeCategory === 'pemasukan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          @click="activeCategory = 'pemasukan'"
        >
          <ArrowUpRight class="w-3.5 h-3.5" />
          <span>Uang Masuk</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
          :class="activeCategory === 'pengeluaran' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          @click="activeCategory = 'pengeluaran'"
        >
          <ArrowDownRight class="w-3.5 h-3.5" />
          <span>Belanja Operasional</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
          :class="activeCategory === 'refund' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          @click="activeCategory = 'refund'"
        >
          <HandCoins class="w-3.5 h-3.5" />
          <span>Pengembalian Kas</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
          :class="activeCategory === 'status' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          @click="activeCategory = 'status'"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Log Absensi / Data</span>
        </button>
      </div>

      <!-- Search & Month Filter Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div class="relative flex-1 max-w-md">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Cari nama mahasiswa, NIM (251******), atau keperluan belanja..."
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        <!-- Month Dropdown -->
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-slate-400 shrink-0" />
          <select
            v-model="selectedBulan"
            class="rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
          >
            <option value="">Semua Bulan Transaksi</option>
            <option
              v-for="b in daftarBulan"
              :key="b.key"
              :value="b.key"
            >
              {{ b.label }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- 3. Transactions List Section (Date Grouped ala Rekening Koran) -->
    <section class="space-y-6">
      <!-- Loading Skeleton -->
      <div v-if="historyQuery.isLoading.value" class="space-y-4">
        <div v-for="i in 5" :key="i" class="h-24 rounded-3xl skeleton-shimmer"></div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="records.length === 0"
        class="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-card"
      >
        <div class="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-3">
          <History class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-slate-800">Tidak ada transaksi ditemukan</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Tidak ada riwayat mutasi yang cocok dengan filter atau kata kunci pencarian yang dipilih.
        </p>
      </div>

      <!-- Date Grouped Statements -->
      <div
        v-else
        v-for="group in groupedRecords"
        :key="group.dateHeader"
        class="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-card"
      >
        <!-- Sticky Date Header -->
        <div class="bg-slate-50/90 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-extrabold text-slate-800 tracking-tight">
            <Calendar class="w-4 h-4 text-emerald-600" />
            <span>{{ group.dateHeader }}</span>
          </div>
          <span class="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/70">
            {{ group.items.length }} Transaksi
          </span>
        </div>

        <!-- Items Inside this Date -->
        <div class="divide-y divide-slate-100">
          <div
            v-for="item in group.items"
            :key="item._id"
            class="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
            @click="openDetail(item)"
          >
            <!-- 1. Left: Icon + Name / Item + PIC / NIM -->
            <div class="flex items-start gap-3.5 min-w-0 flex-1">
              <div
                class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-sm transition-transform group-hover:scale-105"
                :class="getItemVisual(item).iconBg"
              >
                <component :is="getItemVisual(item).icon" class="w-5 h-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {{ item.nama }}
                  </span>
                  <span
                    v-if="item.nim && item.nim !== '-'"
                    class="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                  >
                    {{ item.nim }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span class="flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5" />
                    <span>{{ formatTimeOnly(item.waktu || item.createdAt) || formatRelativeTime(item.waktu || item.createdAt) }}</span>
                  </span>
                  <span>&bull;</span>
                  <span class="text-slate-500 font-medium truncate max-w-[200px]">
                    {{ item.keterangan || getItemVisual(item).label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 2. Middle: Category Badge & Status Shift -->
            <div class="flex items-center gap-2 sm:justify-center">
              <span
                class="inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold border tracking-wide uppercase"
                :class="getItemVisual(item).badgeBg"
              >
                {{ getItemVisual(item).label }}
              </span>

              <span
                v-if="item.statusLama && item.statusBaru"
                class="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg"
              >
                <span>{{ item.statusLama }}</span>
                <span class="text-slate-400">&rarr;</span>
                <span class="text-emerald-700 font-bold">{{ item.statusBaru }}</span>
              </span>
            </div>

            <!-- 3. Right: Amount & Detail Chevron -->
            <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div class="text-right">
                <div
                  v-if="item.nominal"
                  class="font-mono font-black text-base sm:text-lg tracking-tight"
                  :class="getItemVisual(item).amountClass"
                >
                  <span v-if="getItemVisual(item).sign">{{ getItemVisual(item).sign }} </span>
                  {{ formatCurrency(item.nominal) }}
                </div>
                <div v-else class="text-xs font-bold text-slate-400">
                  Log Status
                </div>
                <span class="text-[10px] text-slate-400 font-medium">Klik untuk rincian</span>
              </div>
              <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Rincian Bukti Transaksi -->
    <TransactionDetailModal
      :show="detailModalOpen"
      :item="selectedItem"
      @close="detailModalOpen = false"
    />
  </div>
</template>

<style scoped>
@media print {
  body {
    background-color: white !important;
  }
}
</style>
