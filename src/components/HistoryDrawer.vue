<script setup>
import { ref } from 'vue'
import { 
  X, 
  History, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  FileSpreadsheet, 
  PlusCircle, 
  Edit3 
} from 'lucide-vue-next'
import { useHistory } from '../composables/useHistory'
import { useSemester } from '../composables/useSemester'

defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const search = ref('')
const { selectedSemesterId, selectedSemester } = useSemester()
const { records, historyQuery, refetch } = useHistory({
  semesterId: selectedSemesterId,
  search,
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

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
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari yang lalu`

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getActionInfo(action) {
  switch (action) {
    case 'CREATE':
      return {
        label: 'Catatan Baru',
        icon: PlusCircle,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    case 'UPDATE_STATUS':
      return {
        label: 'Ubah Status',
        icon: CheckCircle2,
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
      }
    case 'UPDATE_NOMINAL':
    case 'UPDATE_DATA':
      return {
        label: 'Ubah Data',
        icon: Edit3,
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    case 'DELETE':
      return {
        label: 'Hapus Catatan',
        icon: Trash2,
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
      }
    case 'IMPORT_EXCEL':
      return {
        label: 'Import Excel/CSV',
        icon: FileSpreadsheet,
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
      }
    default:
      return {
        label: 'Aktivitas Kas',
        icon: Clock,
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
      }
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
        @click="emit('close')"
      ></div>
    </Transition>

    <!-- Slide-over Drawer Panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="show"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Riwayat mutasi kas"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div class="flex items-center gap-2.5">
            <div class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <History class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900">Riwayat Pembayaran</h2>
              <p class="text-xs text-slate-500 font-medium">
                {{ selectedSemester?.nama || 'Semester Aktif' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="Segarkan riwayat"
              @click="refetch"
            >
              <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': historyQuery.isFetching.value }" />
            </button>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Tutup riwayat"
              @click="emit('close')"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="border-b border-slate-100 p-4">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="search"
              type="search"
              class="form-input pl-9 pr-4 py-2 text-xs"
              placeholder="Cari nama atau NIM di riwayat..."
            />
          </div>
        </div>

        <!-- Timeline List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Loading -->
          <div v-if="historyQuery.isLoading.value" class="space-y-4">
            <div v-for="item in 6" :key="item" class="h-20 rounded-2xl skeleton-shimmer"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="records.length === 0" class="grid place-items-center py-16 text-center">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <History class="h-6 w-6" />
            </div>
            <p class="font-bold text-slate-800 text-sm">Belum ada riwayat tercatat</p>
            <p class="text-xs text-slate-500 mt-1 max-w-xs">
              Semua aktivitas pembayaran, pembaruan status, atau mutasi data kas akan muncul di timeline ini secara otomatis.
            </p>
          </div>

          <!-- Timeline Items -->
          <div v-else class="relative space-y-4 before:absolute before:bottom-0 before:left-4 before:top-2 before:w-0.5 before:bg-slate-100">
            <article
              v-for="(item, index) in records"
              :key="item._id || index"
              class="relative flex gap-3.5 pl-1 transition-all"
            >
              <!-- Icon Indicator -->
              <div
                class="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-xl border shadow-sm"
                :class="getActionInfo(item.aksi).bg"
              >
                <component :is="getActionInfo(item.aksi).icon" class="h-4 w-4" />
              </div>

              <!-- Content Card -->
              <div class="flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:bg-white hover:shadow-sm">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {{ getActionInfo(item.aksi).label }}
                    </span>
                    <p class="font-bold text-slate-900 text-xs mt-1">
                      {{ item.nama }}
                      <span v-if="item.nim" class="font-normal font-mono text-slate-500">({{ item.nim }})</span>
                    </p>
                  </div>
                  <span class="text-[11px] font-medium text-slate-400 shrink-0">
                    {{ formatRelativeTime(item.waktu || item.createdAt) }}
                  </span>
                </div>

                <div v-if="item.nominal" class="mt-2 text-xs font-mono font-bold text-slate-800">
                  {{ formatCurrency(item.nominal) }}
                </div>

                <div v-if="item.statusLama && item.statusBaru" class="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <span class="font-medium text-slate-500">{{ item.statusLama }}</span>
                  <span class="text-slate-400">→</span>
                  <span class="font-bold text-emerald-700">{{ item.statusBaru }}</span>
                </div>

                <p v-if="item.keterangan" class="mt-1 text-[11px] text-slate-500 italic">
                  "{{ item.keterangan }}"
                </p>
              </div>
            </article>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 bg-slate-50/50 p-4 text-center text-xs text-slate-400">
          Jejak audit kas otomatis &bull; KasKita
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
