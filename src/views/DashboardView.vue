<script setup>
import { computed, ref, watch } from 'vue'
import { 
  Search, 
  X, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Download, 
  History, 
  AlertTriangle,
  FileSpreadsheet,
  HandCoins,
  List,
  TableProperties
} from 'lucide-vue-next'
import { getErrorMessage } from '../api/axios'
import KasTable from '../components/KasTable.vue'
import KasMatrixTable from '../components/KasMatrixTable.vue'
import PemasukanLainTable from '../components/PemasukanLainTable.vue'
import StatCards from '../components/StatCards.vue'
import { useKas } from '../composables/useKas'
import { useKasMatrix } from '../composables/useKasMatrix'
import { useSemester } from '../composables/useSemester'
import { usePemasukanLain } from '../composables/usePemasukanLain'
import { usePengeluaran } from '../composables/usePengeluaran'

const search = ref('')
const status = ref('Semua')
const viewMode = ref('matriks')

const { selectedSemesterId, selectedSemester, isViewingArchived } = useSemester()
const { kasQuery: publicKasQuery } = useKas({ search, status, semesterId: selectedSemesterId })
const { 
  daftarPertemuan, 
  rows: matrixRows, 
  totalPerMinggu, 
  grandTotalKas, 
  semesterInfo: matrixSemesterInfo, 
  isLoading: matrixLoading,
  isError: matrixError,
  error: matrixErrorObj
} = useKasMatrix(selectedSemesterId)
const { records: nonKasRecords, totalNominal: nonKasTotal } = usePemasukanLain(selectedSemesterId)
const { totalPengeluaran: pengeluaranTotal, totalRefund: refundTotal } = usePengeluaran(selectedSemesterId)

// Otomatis atur tampilan default: Matriks untuk mingguan, Ringkas untuk semester flat
watch(
  () => selectedSemester.value?.tipeIuran,
  (tipe) => {
    viewMode.value = tipe === 'MINGGUAN' ? 'matriks' : 'ringkas'
  },
  { immediate: true }
)

const summary = computed(() => publicKasQuery.data.value?.summary ?? {})
const records = computed(() => publicKasQuery.data.value?.data ?? [])

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const filterOptions = [
  { value: 'Semua', label: 'Semua Status' },
  { value: 'Lunas', label: 'Lunas', icon: CheckCircle2 },
  { value: 'Belum Lunas', label: 'Belum Lunas', icon: Clock },
]

function exportToExcel() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const semParam = selectedSemesterId.value && selectedSemesterId.value !== 'default-active' 
    ? `&semesterId=${encodeURIComponent(selectedSemesterId.value)}` 
    : ''
  window.open(`${apiBase}/kas/export?format=xlsx${semParam}`, '_blank')
}
</script>

<template>
  <div class="min-w-0 space-y-8">
    <!-- Archived Semester Alert Banner -->
    <div
      v-if="isViewingArchived"
      class="flex items-center gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-xs text-amber-900 shadow-sm"
      role="alert"
    >
      <AlertTriangle class="h-4 w-4 shrink-0 text-amber-600" />
      <p class="leading-relaxed">
        Anda sedang melihat data arsip <strong>{{ selectedSemester?.nama }}</strong>. Status data ini bersifat peninjauan historis (read-only).
      </p>
    </div>

    <!-- Refund Transparency Banner (jika ada pengembalian kas di semester terpilih) -->
    <div
      v-if="refundTotal > 0"
      class="flex items-center gap-3 rounded-2xl border border-teal-200/90 bg-teal-50/90 px-4 py-3 text-xs text-teal-900 shadow-sm"
      role="status"
    >
      <HandCoins class="h-4 w-4 shrink-0 text-teal-600" />
      <p class="leading-relaxed">
        <strong>Transparansi Kas:</strong> Terdapat pengembalian dana sisa kas sebesar 
        <strong>{{ formatCurrency(refundTotal) }}</strong> yang telah dibagikan kembali ke mahasiswa pada semester ini.
      </p>
    </div>

    <!-- Hero Banner -->
    <section class="flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0">
        <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
          <Sparkles class="h-3.5 w-3.5 text-emerald-600" />
          <span>{{ selectedSemester?.nama || 'Semester Aktif' }}</span>
        </div>
        <h1 class="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
          Kas kelas, transparan & terpercaya.
        </h1>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Pantau ringkasan saldo, kepatuhan pembayaran, dan catatan kas secara real-time dalam satu dasbor.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
        <button
          type="button"
          class="btn-secondary text-xs inline-flex items-center gap-2"
          title="Download laporan Excel kas semester ini"
          @click="exportToExcel"
        >
          <FileSpreadsheet class="h-4 w-4 text-emerald-700" />
          <span>Export Excel</span>
        </button>

        <RouterLink
          to="/riwayat"
          class="btn-secondary text-xs inline-flex items-center gap-2"
          title="Lihat riwayat mutasi kas"
        >
          <History class="h-4 w-4 text-slate-600" />
          <span>Riwayat Kas</span>
        </RouterLink>

        <RouterLink 
          to="/info" 
          class="btn-secondary group text-xs inline-flex items-center gap-1.5 shadow-sm"
        >
          <span>Cara Bayar</span>
          <ArrowRight class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </RouterLink>
      </div>
    </section>

    <!-- Summary Cards Section -->
    <section aria-label="Ringkasan kas">
      <!-- Loading Shimmer for StatCards -->
      <div v-if="publicKasQuery.isLoading.value" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Memuat ringkasan">
        <div v-for="item in 3" :key="item" class="h-40 rounded-3xl skeleton-shimmer border border-slate-200/60 shadow-sm"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="publicKasQuery.isError.value" class="alert-error" role="alert">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-bold text-rose-900">Data kas belum dapat dimuat</p>
              <p class="mt-1 text-xs text-rose-700">{{ getErrorMessage(publicKasQuery.error.value) }}</p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-secondary border-rose-300 bg-white text-xs font-bold hover:bg-rose-50" 
            @click="publicKasQuery.refetch()"
          >
            Coba lagi
          </button>
        </div>
      </div>

      <!-- StatCards with Consolidated Balance, Cash Out & Refund -->
      <StatCards 
        v-else 
        :summary="summary" 
        :pemasukan-lain-nominal="nonKasTotal"
        :pengeluaran-nominal="pengeluaranTotal"
        :refund-nominal="refundTotal"
      />
    </section>

    <!-- Transactions Section -->
    <section class="space-y-4">
      <!-- Toolbar Header -->
      <div class="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">Audit & Transparansi</p>
          <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-900">Catatan Pembayaran Mahasiswa</h2>
        </div>

        <!-- Filter & Search Controls -->
        <div class="flex w-full min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center lg:w-auto">
          <!-- Segmented View Mode Toggle (Hanya untuk Semester Mingguan) -->
          <div 
            v-if="selectedSemester?.tipeIuran === 'MINGGUAN'" 
            class="inline-flex rounded-xl border border-slate-200 bg-slate-100/90 p-1 shadow-inner shrink-0" 
            role="group" 
            aria-label="Mode tampilan tabel"
          >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              :class="viewMode === 'ringkas' 
                ? 'bg-white text-slate-900 font-bold shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'"
              @click="viewMode = 'ringkas'"
            >
              <List class="h-3.5 w-3.5" :class="viewMode === 'ringkas' ? 'text-emerald-600' : 'text-slate-400'" />
              <span>Ringkas</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              :class="viewMode === 'matriks' 
                ? 'bg-emerald-700 text-white font-bold shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'"
              @click="viewMode = 'matriks'"
            >
              <TableProperties class="h-3.5 w-3.5" :class="viewMode === 'matriks' ? 'text-white' : 'text-slate-400'" />
              <span>Matriks Mingguan</span>
            </button>
          </div>

          <!-- Filter Pills (Chips) -->
          <div class="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner" role="group" aria-label="Filter status">
            <button
              v-for="opt in filterOptions"
              :key="opt.value"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              :class="status === opt.value 
                ? 'bg-white text-slate-900 font-bold shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'"
              @click="status = opt.value"
            >
              <component :is="opt.icon" v-if="opt.icon" class="h-3.5 w-3.5" :class="status === opt.value ? 'text-emerald-600' : 'text-slate-400'" />
              <span>{{ opt.label }}</span>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative min-w-0 flex-1 sm:w-64">
            <label class="sr-only" for="search-input">Cari nama mahasiswa</label>
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              id="search-input"
              v-model="search" 
              type="search" 
              class="form-input pl-10 pr-9 text-xs sm:text-sm" 
              placeholder="Cari nama mahasiswa..." 
            />
            <button
              v-if="search"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              aria-label="Bersihkan pencarian"
              @click="search = ''"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Table / Cards Loading State -->
      <div v-if="publicKasQuery.isLoading.value" class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <div class="h-6 w-48 rounded-lg skeleton-shimmer"></div>
        <div class="space-y-3">
          <div v-for="row in 6" :key="row" class="h-14 w-full rounded-2xl skeleton-shimmer"></div>
        </div>
      </div>

      <!-- Table Error State -->
      <div v-else-if="publicKasQuery.isError.value" class="grid min-h-56 place-items-center rounded-3xl border border-slate-200 bg-white px-6 text-center text-sm text-slate-500 shadow-card">
        Daftar kas tidak tersedia karena data gagal dimuat.
      </div>

      <!-- Table / Cards Component -->
      <KasMatrixTable
        v-if="selectedSemester?.tipeIuran === 'MINGGUAN' && viewMode === 'matriks'"
        :daftar-pertemuan="daftarPertemuan"
        :rows="matrixRows"
        :total-per-minggu="totalPerMinggu"
        :grand-total-kas="grandTotalKas"
        :semester-info="matrixSemesterInfo || selectedSemester"
        :search-query="search"
        :status-filter="status"
        :interactive="false"
      />
      <KasTable v-else :records="records" />

      <!-- Sub-footer Info & Refresh status -->
      <div class="flex items-center justify-between text-xs text-slate-400">
        <p>Informasi otomatis disinkronkan dengan catatan bendahara kelas.</p>
        <span 
          v-if="publicKasQuery.isFetching.value && !publicKasQuery.isLoading.value" 
          class="inline-flex items-center gap-1.5 font-semibold text-emerald-700 animate-pulse"
        >
          <RefreshCw class="h-3.5 w-3.5 animate-spin" />
          Memperbarui...
        </span>
      </div>
    </section>

    <!-- Non-Kas Funds Section (Pemisahan Dana Masuk Non-Iuran) -->
    <section class="space-y-4 pt-2">
      <PemasukanLainTable 
        :records="nonKasRecords" 
        :total-nominal="nonKasTotal" 
      />
    </section>
  </div>
</template>
