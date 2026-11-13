<script setup>
import { computed, reactive, ref } from 'vue'
import { 
  Plus, 
  KeyRound, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  UploadCloud,
  Coins,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  Receipt,
  ArrowDownRight,
  ExternalLink
} from 'lucide-vue-next'
import { getErrorMessage } from '../api/axios'
import KasFormModal from '../components/KasFormModal.vue'
import KasTable from '../components/KasTable.vue'
import KasImportModal from '../components/KasImportModal.vue'
import { useKas } from '../composables/useKas'
import { useSemester } from '../composables/useSemester'
import { usePemasukanLain } from '../composables/usePemasukanLain'
import { usePengeluaran } from '../composables/usePengeluaran'

const { selectedSemesterId, selectedSemester, semesters, createSemester, activateSemester } = useSemester()
const { kasQuery, createKas, updateKas, deleteKas } = useKas({ semesterId: selectedSemesterId })
const { records: nonKasRecords, totalNominal: nonKasTotal, createPemasukanLain, deletePemasukanLain, pemasukanLainQuery } = usePemasukanLain(selectedSemesterId)
const { records: pengeluaranRecords, totalPengeluaran, createPengeluaran, deletePengeluaran, pengeluaranQuery } = usePengeluaran(selectedSemesterId)

const activeTab = ref('kas') // 'kas' | 'non-kas' | 'pengeluaran' | 'semester'
const pin = ref('')
const modalOpen = ref(false)
const importModalOpen = ref(false)
const editingRecord = ref(null)
const recordToDelete = ref(null)
const nonKasToDelete = ref(null)
const pengeluaranToDelete = ref(null)

// Non-Kas Form state
const nonKasForm = reactive({
  judul: '',
  kategori: 'Sisa Semester Lalu',
  nominal: '',
  tanggalMasuk: new Date().toISOString().substring(0, 10),
  keterangan: '',
})

// Pengeluaran (Cash Out) Form state
const pengeluaranForm = reactive({
  judul: '',
  kategori: 'Perlengkapan Kelas',
  nominal: '',
  tanggalPengeluaran: new Date().toISOString().substring(0, 10),
  penanggungJawab: '',
  keterangan: '',
  buktiNotaUrl: '',
})

// Semester Form state
const semesterForm = reactive({
  nama: '',
  kode: '',
  targetKasPerMhs: 50000,
  tanggalMulai: '',
  tanggalSelesai: '',
})

// Toast state
const toast = ref({
  show: false,
  type: 'success', // 'success' | 'error'
  message: '',
})

let toastTimer = null

function showToast(type, message) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, message }
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

function dismissToast() {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value.show = false
}

const isSaving = computed(() => createKas.isPending.value || updateKas.isPending.value)
const isDeleting = computed(() => deleteKas.isPending.value || deletePemasukanLain.isPending.value || deletePengeluaran.isPending.value)
const isSavingNonKas = computed(() => createPemasukanLain.isPending.value)
const isSavingPengeluaran = computed(() => createPengeluaran.isPending.value)
const isSavingSemester = computed(() => createSemester.isPending.value)

const kasLunasTotal = computed(() => {
  return (kasQuery.data.value?.data || [])
    .filter((k) => k.status === 'Lunas')
    .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0)
})

const totalPemasukanAll = computed(() => kasLunasTotal.value + nonKasTotal.value)
const sisaKasTersedia = computed(() => totalPemasukanAll.value - totalPengeluaran.value)
const isDeficitRisk = computed(() => {
  const nominalInput = Number(pengeluaranForm.nominal) || 0
  return nominalInput > 0 && nominalInput > sisaKasTersedia.value
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function openCreateForm() {
  editingRecord.value = null
  modalOpen.value = true
}

function openEditForm(record) {
  editingRecord.value = record
  modalOpen.value = true
}

async function saveRecord(payload) {
  try {
    if (editingRecord.value) {
      const id = editingRecord.value._id ?? editingRecord.value.id
      await updateKas.mutateAsync({ id, payload, pin: pin.value })
      showToast('success', 'Catatan kas berhasil diperbarui.')
    } else {
      await createKas.mutateAsync({ 
        payload: { ...payload, semesterId: selectedSemesterId.value }, 
        pin: pin.value 
      })
      showToast('success', 'Catatan kas baru berhasil ditambahkan.')
    }
    modalOpen.value = false
    editingRecord.value = null
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

function confirmDelete(record) {
  recordToDelete.value = record
}

async function executeDelete() {
  if (!recordToDelete.value) return
  const record = recordToDelete.value
  const label = record.nama || record.nim || 'data ini'

  try {
    await deleteKas.mutateAsync({
      id: record._id ?? record.id,
      pin: pin.value,
    })
    showToast('success', `Catatan kas ${label} berhasil dihapus.`)
    recordToDelete.value = null
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

// Non-Kas Handlers
async function submitNonKas() {
  if (!pin.value.trim()) {
    showToast('error', 'PIN bendahara wajib diisi untuk otorisasi.')
    return
  }

  try {
    await createPemasukanLain.mutateAsync({
      payload: {
        semesterId: selectedSemesterId.value,
        judul: nonKasForm.judul.trim(),
        kategori: nonKasForm.kategori,
        nominal: Number(nonKasForm.nominal),
        tanggalMasuk: nonKasForm.tanggalMasuk,
        keterangan: nonKasForm.keterangan.trim(),
      },
      pin: pin.value,
    })
    showToast('success', 'Pemasukan non-kas berhasil dicatat.')
    nonKasForm.judul = ''
    nonKasForm.nominal = ''
    nonKasForm.keterangan = ''
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

async function executeDeleteNonKas(item) {
  if (!window.confirm(`Hapus pemasukan "${item.judul}"?`)) return
  try {
    await deletePemasukanLain.mutateAsync({
      id: item._id,
      pin: pin.value,
    })
    showToast('success', `Pemasukan "${item.judul}" berhasil dihapus.`)
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

// Pengeluaran (Cash Out) Handlers
async function submitPengeluaran() {
  if (!pin.value.trim()) {
    showToast('error', 'PIN bendahara wajib diisi untuk otorisasi.')
    return
  }

  const nominal = Number(pengeluaranForm.nominal)
  if (!nominal || nominal < 1) {
    showToast('error', 'Nominal pengeluaran harus berupa angka minimal Rp 1.')
    return
  }

  if (nominal > sisaKasTersedia.value) {
    const proceed = window.confirm(
      `Peringatan: Nominal belanja (${formatCurrency(nominal)}) melebihi sisa saldo kas yang tersedia (${formatCurrency(sisaKasTersedia.value)}). Lanjutkan pencatatan?`
    )
    if (!proceed) return
  }

  try {
    await createPengeluaran.mutateAsync({
      payload: {
        semesterId: selectedSemesterId.value,
        judul: pengeluaranForm.judul.trim(),
        kategori: pengeluaranForm.kategori,
        nominal,
        tanggalPengeluaran: pengeluaranForm.tanggalPengeluaran,
        penanggungJawab: pengeluaranForm.penanggungJawab.trim(),
        keterangan: pengeluaranForm.keterangan ? pengeluaranForm.keterangan.trim() : '',
        buktiNotaUrl: pengeluaranForm.buktiNotaUrl ? pengeluaranForm.buktiNotaUrl.trim() : '',
      },
      pin: pin.value,
    })
    showToast('success', 'Pengeluaran kas berhasil dicatat.')
    pengeluaranForm.judul = ''
    pengeluaranForm.nominal = ''
    pengeluaranForm.penanggungJawab = ''
    pengeluaranForm.keterangan = ''
    pengeluaranForm.buktiNotaUrl = ''
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

function confirmDeletePengeluaran(item) {
  pengeluaranToDelete.value = item
}

async function executeDeletePengeluaran() {
  if (!pengeluaranToDelete.value) return
  if (!pin.value.trim()) {
    showToast('error', 'PIN bendahara wajib diisi untuk otorisasi.')
    return
  }
  const item = pengeluaranToDelete.value
  try {
    await deletePengeluaran.mutateAsync({
      id: item._id,
      pin: pin.value,
    })
    showToast('success', `Pengeluaran "${item.judul}" berhasil dibatalkan/dihapus.`)
    pengeluaranToDelete.value = null
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

// Semester Handlers
async function submitSemester() {
  if (!pin.value.trim()) {
    showToast('error', 'PIN bendahara wajib diisi untuk otorisasi.')
    return
  }

  try {
    await createSemester.mutateAsync({
      payload: {
        nama: semesterForm.nama.trim(),
        kode: semesterForm.kode.trim().toUpperCase(),
        targetKasPerMhs: Number(semesterForm.targetKasPerMhs),
        tanggalMulai: semesterForm.tanggalMulai || undefined,
        tanggalSelesai: semesterForm.tanggalSelesai || undefined,
      },
      pin: pin.value,
    })
    showToast('success', 'Semester baru berhasil dibuat.')
    semesterForm.nama = ''
    semesterForm.kode = ''
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

async function handleActivateSemester(semester) {
  if (!pin.value.trim()) {
    showToast('error', 'PIN bendahara wajib diisi untuk mengubah semester aktif.')
    return
  }

  try {
    await activateSemester.mutateAsync({
      id: semester._id,
      pin: pin.value,
    })
    showToast('success', `"${semester.nama}" kini menjadi semester aktif.`)
  } catch (error) {
    showToast('error', getErrorMessage(error))
  }
}

function exportExcel() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const semParam = selectedSemesterId.value && selectedSemesterId.value !== 'default-active' 
    ? `&semesterId=${encodeURIComponent(selectedSemesterId.value)}` 
    : ''
  window.open(`${apiBase}/kas/export?format=xlsx${semParam}`, '_blank')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
          <ShieldCheck class="h-3.5 w-3.5 text-emerald-600" />
          <span>Ruang Pengelolaan Bendahara</span>
        </div>
        <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Kelola kas & semester.
        </h1>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
          Kelola iuran mahasiswa, catat uang masuk non-kas (sisa semester lalu/sponsor), atau konfigurasi semester kelas.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-start">
        <button
          type="button"
          class="btn-secondary text-xs inline-flex items-center gap-2"
          @click="exportExcel"
        >
          <FileSpreadsheet class="h-4 w-4 text-emerald-700" />
          <span>Export Excel</span>
        </button>

        <button
          type="button"
          class="btn-secondary text-xs inline-flex items-center gap-2"
          @click="importModalOpen = true"
        >
          <UploadCloud class="h-4 w-4 text-teal-600" />
          <span>Import Excel/CSV</span>
        </button>

        <button 
          type="button" 
          class="btn-primary text-xs inline-flex items-center gap-1.5 shadow-md"
          @click="openCreateForm"
        >
          <Plus class="h-4 w-4" />
          <span>Catat Kas Baru</span>
        </button>
      </div>
    </section>

    <!-- Global PIN Authentication Card -->
    <section class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card transition-all sm:p-6">
      <div class="flex items-center gap-2.5">
        <div class="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <KeyRound class="h-4 w-4" />
        </div>
        <label for="admin-pin" class="text-sm font-extrabold text-slate-900">PIN Otorisasi Bendahara</label>
      </div>
      <p class="mt-1.5 text-xs text-slate-500">
        PIN dikirimkan melalui header HTTP <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">x-admin-pin</code> untuk menyimpan perubahan atau impor data.
      </p>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative w-full sm:max-w-xs">
          <input 
            id="admin-pin" 
            v-model="pin" 
            type="password" 
            inputmode="numeric" 
            autocomplete="current-password" 
            class="form-input tracking-widest font-mono text-center font-bold" 
            placeholder="••••••" 
          />
        </div>
        <div 
          class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
          :class="pin.trim() ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
        >
          <span class="h-2 w-2 rounded-full" :class="pin.trim() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
          <span>{{ pin.trim() ? 'PIN siap digunakan' : 'PIN belum diisi' }}</span>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div class="border-b border-slate-200">
      <nav class="flex gap-4 sm:gap-8" aria-label="Tab manajemen">
        <button
          type="button"
          class="border-b-2 py-3 text-sm font-bold transition-all duration-150 inline-flex items-center gap-2"
          :class="activeTab === 'kas' 
            ? 'border-emerald-600 text-emerald-800' 
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
          @click="activeTab = 'kas'"
        >
          <Layers class="h-4 w-4" />
          <span>Iuran Mahasiswa</span>
        </button>

        <button
          type="button"
          class="border-b-2 py-3 text-sm font-bold transition-all duration-150 inline-flex items-center gap-2"
          :class="activeTab === 'non-kas' 
            ? 'border-emerald-600 text-emerald-800' 
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
          @click="activeTab = 'non-kas'"
        >
          <Coins class="h-4 w-4" />
          <span>Pemasukan Non-Kas (Sisa Lalu / Sponsor)</span>
        </button>

        <button
          type="button"
          class="border-b-2 py-3 text-sm font-bold transition-all duration-150 inline-flex items-center gap-2"
          :class="activeTab === 'pengeluaran' 
            ? 'border-rose-600 text-rose-800' 
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
          @click="activeTab = 'pengeluaran'"
        >
          <Receipt class="h-4 w-4" />
          <span>Pengeluaran (Belanja Kelas)</span>
        </button>

        <button
          type="button"
          class="border-b-2 py-3 text-sm font-bold transition-all duration-150 inline-flex items-center gap-2"
          :class="activeTab === 'semester' 
            ? 'border-emerald-600 text-emerald-800' 
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
          @click="activeTab = 'semester'"
        >
          <GraduationCap class="h-4 w-4" />
          <span>Kelola Semester</span>
        </button>
      </nav>
    </div>

    <!-- TAB 1: Iuran Mahasiswa -->
    <section v-if="activeTab === 'kas'" class="space-y-4">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Database Kas</p>
          <h2 class="mt-1 text-xl font-black tracking-tight text-slate-900">
            Catatan Kas Mahasiswa &bull; {{ selectedSemester?.nama }}
          </h2>
        </div>
        <button 
          type="button" 
          class="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 font-bold" 
          :disabled="kasQuery.isFetching.value" 
          @click="kasQuery.refetch()"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': kasQuery.isFetching.value }" />
          <span>{{ kasQuery.isFetching.value ? 'Memuat...' : 'Segarkan Data' }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="kasQuery.isLoading.value" class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <div class="h-6 w-48 rounded-lg skeleton-shimmer"></div>
        <div class="space-y-3">
          <div v-for="row in 5" :key="row" class="h-14 w-full rounded-2xl skeleton-shimmer"></div>
        </div>
      </div>

      <!-- Error State -->
      <section v-else-if="kasQuery.isError.value" class="alert-error" role="alert">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-bold text-rose-900">Data kas belum dapat dimuat</p>
              <p class="mt-1 text-xs text-rose-700">{{ getErrorMessage(kasQuery.error.value) }}</p>
            </div>
          </div>
          <button type="button" class="btn-secondary border-rose-200 bg-white" @click="kasQuery.refetch()">Coba lagi</button>
        </div>
      </section>

      <!-- Data Table -->
      <KasTable
        v-else
        :records="kasQuery.data.value?.data ?? []"
        show-actions
        @edit="openEditForm"
        @delete="confirmDelete"
      />
    </section>

    <!-- TAB 2: Pemasukan Non-Kas -->
    <section v-else-if="activeTab === 'non-kas'" class="space-y-6">
      <!-- Input Card for Non-Kas Income -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
          <Sparkles class="h-3.5 w-3.5" />
          <span>Input Pemasukan Eksternal / Sisa Kas</span>
        </div>
        <h3 class="text-xl font-black text-slate-900">Catat Uang Masuk Selain Kas Mahasiswa</h3>
        <p class="text-xs text-slate-500 mt-1">
          Gunakan formulir ini untuk memasukkan saldo sisa dari semester sebelumnya, uang sponsor, donasi, atau dana usaha.
        </p>

        <form class="mt-5 space-y-4" @submit.prevent="submitNonKas">
          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Judul Pemasukan
              <input 
                v-model="nonKasForm.judul" 
                required 
                class="form-input mt-1.5" 
                placeholder="Contoh: Sisa Saldo Semester 2" 
              />
            </label>

            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Kategori
              <select v-model="nonKasForm.kategori" required class="form-input mt-1.5">
                <option value="Sisa Semester Lalu">Sisa Semester Lalu</option>
                <option value="Dana Usaha">Dana Usaha</option>
                <option value="Sponsor">Sponsor</option>
                <option value="Donasi">Donasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </label>

            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Nominal (Rp)
              <input 
                v-model="nonKasForm.nominal" 
                required 
                type="number" 
                min="1" 
                class="form-input mt-1.5" 
                placeholder="450000" 
              />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Tanggal Masuk
              <input 
                v-model="nonKasForm.tanggalMasuk" 
                type="date" 
                required 
                class="form-input mt-1.5" 
              />
            </label>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Catatan / Keterangan Tambahan
              <input 
                v-model="nonKasForm.keterangan" 
                class="form-input mt-1.5" 
                placeholder="Keterangan pengurus lama..." 
              />
            </label>
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              class="btn-primary text-xs font-bold inline-flex items-center gap-1.5"
              :disabled="isSavingNonKas"
            >
              <Coins class="h-4 w-4" />
              <span>{{ isSavingNonKas ? 'Menyimpan...' : 'Simpan Pemasukan Non-Kas' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- List of Non-Kas Incomes -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 class="font-extrabold text-slate-900 text-base">Daftar Pemasukan Non-Kas</h4>
            <p class="text-xs text-slate-500">Semester: {{ selectedSemester?.nama }}</p>
          </div>
          <span class="rounded-2xl bg-teal-50 px-3.5 py-1.5 text-xs font-black text-teal-800">
            Total: {{ formatCurrency(nonKasTotal) }}
          </span>
        </div>

        <div v-if="nonKasRecords.length === 0" class="py-12 text-center text-xs text-slate-500">
          Belum ada catatan pemasukan non-kas untuk semester ini.
        </div>

        <div v-else class="divide-y divide-slate-100 mt-2">
          <div 
            v-for="(item, idx) in nonKasRecords" 
            :key="item._id" 
            class="flex items-center justify-between py-3.5 hover:bg-slate-50/70 px-2 rounded-xl transition"
          >
            <div class="flex items-center gap-3">
              <span class="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 font-mono text-[10px] font-bold text-slate-500 shrink-0">
                {{ idx + 1 }}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">{{ item.judul }}</span>
                  <span class="rounded px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700">
                    {{ item.kategori }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">
                  {{ item.tanggalMasuk?.substring(0, 10) }} &bull; {{ item.keterangan || 'Tanpa keterangan' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono font-bold text-sm text-slate-900">{{ formatCurrency(item.nominal) }}</span>
              <button
                type="button"
                class="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                title="Hapus pemasukan"
                @click="executeDeleteNonKas(item)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Pengeluaran (Belanja Kelas / Cash Out) -->
    <section v-else-if="activeTab === 'pengeluaran'" class="space-y-6">
      <!-- Input Card for Cash Out -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-1">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            <Receipt class="h-3.5 w-3.5" />
            <span>Pencatatan Belanja Kelas (Cash Out)</span>
          </div>
          <div class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
            <span>Sisa Kas Tersedia:</span>
            <span :class="sisaKasTersedia <= 0 ? 'text-rose-600' : 'text-emerald-700'">
              {{ formatCurrency(sisaKasTersedia) }}
            </span>
          </div>
        </div>

        <h3 class="text-xl font-black text-slate-900">Catat Penarikan Uang Kas Kelas</h3>
        <p class="text-xs text-slate-500 mt-1">
          Catat setiap dana kas yang ditarik untuk fotokopi modul, perlengkapan kelas, konsumsi acara, atau santunan sosial secara transparan.
        </p>

        <!-- Deficit Warning Banner -->
        <div v-if="isDeficitRisk" class="mt-4 flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50/90 p-4 text-xs text-rose-900 shadow-sm" role="alert">
          <AlertTriangle class="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p class="font-bold">Peringatan: Nominal Belanja Melebihi Saldo Kas (Defisit)</p>
            <p class="mt-1 leading-relaxed text-rose-800">
              Nominal yang diajukan (<strong>{{ formatCurrency(pengeluaranForm.nominal) }}</strong>) lebih besar dari sisa saldo kas yang tersedia (<strong>{{ formatCurrency(sisaKasTersedia) }}</strong>). Sistem akan memvalidasi agar tidak terjadi defisit saldo yang tidak terotorisasi.
            </p>
          </div>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitPengeluaran">
          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Keperluan / Judul Belanja
              <input 
                v-model="pengeluaranForm.judul" 
                required 
                class="form-input mt-1.5" 
                placeholder="Contoh: Fotokopi Modul Praktikum" 
              />
            </label>

            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Kategori Belanja
              <select v-model="pengeluaranForm.kategori" required class="form-input mt-1.5">
                <option value="Akademik & Materi">Akademik & Materi</option>
                <option value="Perlengkapan Kelas">Perlengkapan Kelas</option>
                <option value="Acara & Konsumsi">Acara & Konsumsi</option>
                <option value="Sosial & Santunan">Sosial & Santunan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </label>

            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Nominal Pengeluaran (Rp)
              <input 
                v-model="pengeluaranForm.nominal" 
                required 
                type="number" 
                min="1" 
                class="form-input mt-1.5 font-mono" 
                placeholder="75000" 
              />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Tanggal Belanja / Tarik
              <input 
                v-model="pengeluaranForm.tanggalPengeluaran" 
                type="date" 
                required 
                class="form-input mt-1.5" 
              />
            </label>

            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Penanggung Jawab / Penerima
              <input 
                v-model="pengeluaranForm.penanggungJawab" 
                required 
                class="form-input mt-1.5" 
                placeholder="Contoh: Budi Santoso (Sie Perlengkapan)" 
              />
            </label>

            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Tautan Bukti Nota / Kwitansi (Opsional)
              <input 
                v-model="pengeluaranForm.buktiNotaUrl" 
                type="url" 
                class="form-input mt-1.5" 
                placeholder="https://..." 
              />
            </label>
          </div>

          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Catatan / Rincian Belanja
            <input 
              v-model="pengeluaranForm.keterangan" 
              class="form-input mt-1.5" 
              placeholder="Contoh: 35 set modul untuk lab pertemuan 4..." 
            />
          </label>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              class="btn-primary bg-rose-600 hover:bg-rose-700 text-xs font-bold inline-flex items-center gap-1.5"
              :disabled="isSavingPengeluaran"
            >
              <ArrowDownRight class="h-4 w-4" />
              <span>{{ isSavingPengeluaran ? 'Menyimpan...' : 'Simpan Pengeluaran Kas' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- List of Pengeluaran -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 class="font-extrabold text-slate-900 text-base">Daftar Pengeluaran & Belanja Kelas</h4>
            <p class="text-xs text-slate-500">Semester: {{ selectedSemester?.nama }}</p>
          </div>
          <span class="rounded-2xl bg-rose-50 px-3.5 py-1.5 text-xs font-black text-rose-800">
            Total Belanja: {{ formatCurrency(totalPengeluaran) }}
          </span>
        </div>

        <div v-if="pengeluaranRecords.length === 0" class="py-12 text-center text-xs text-slate-500">
          Belum ada catatan pengeluaran kas untuk semester ini.
        </div>

        <!-- Table View Desktop -->
        <div v-else class="mt-4 hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th scope="col" class="py-3 px-3 w-12 text-center">No.</th>
                <th scope="col" class="py-3 px-4">Keperluan Belanja</th>
                <th scope="col" class="py-3 px-3">Kategori</th>
                <th scope="col" class="py-3 px-3">Tanggal</th>
                <th scope="col" class="py-3 px-4">Penanggung Jawab</th>
                <th scope="col" class="py-3 px-4 text-right">Nominal (Rp)</th>
                <th scope="col" class="py-3 px-3 text-center">Bukti</th>
                <th scope="col" class="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="(item, idx) in pengeluaranRecords" 
                :key="item._id" 
                class="hover:bg-slate-50/80 transition"
              >
                <td class="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                  {{ idx + 1 }}
                </td>
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-900">{{ item.judul }}</p>
                  <p v-if="item.keterangan" class="text-[11px] text-slate-400 italic mt-0.5">
                    {{ item.keterangan }}
                  </p>
                </td>
                <td class="py-3.5 px-3">
                  <span class="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                    {{ item.kategori }}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-slate-500">
                  {{ item.tanggalPengeluaran?.substring(0, 10) }}
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-700">
                  {{ item.penanggungJawab }}
                </td>
                <td class="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                  - {{ formatCurrency(item.nominal) }}
                </td>
                <td class="py-3.5 px-3 text-center">
                  <a
                    v-if="item.buktiNotaUrl"
                    :href="item.buktiNotaUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline"
                  >
                    <span>Nota</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                  <span v-else class="text-slate-300">—</span>
                </td>
                <td class="py-3.5 px-3 text-center">
                  <button
                    type="button"
                    class="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus pengeluaran"
                    @click="confirmDeletePengeluaran(item)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards List with Numbering -->
        <div v-if="pengeluaranRecords.length > 0" class="mt-4 space-y-3 md:hidden">
          <div 
            v-for="(item, idx) in pengeluaranRecords" 
            :key="item._id" 
            class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2.5"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="grid h-6 w-6 place-items-center rounded-lg bg-slate-200/80 font-mono text-[10px] font-bold text-slate-600">
                  #{{ idx + 1 }}
                </span>
                <span class="rounded px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                  {{ item.kategori }}
                </span>
              </div>
              <span class="font-mono font-bold text-rose-600 text-sm">
                - {{ formatCurrency(item.nominal) }}
              </span>
            </div>

            <div>
              <p class="font-bold text-slate-900 text-sm">{{ item.judul }}</p>
              <p v-if="item.keterangan" class="text-xs text-slate-500 italic mt-0.5">
                "{{ item.keterangan }}"
              </p>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs text-slate-500">
              <div>
                <p class="font-medium text-slate-700">{{ item.penanggungJawab }}</p>
                <p class="text-[11px] text-slate-400">{{ item.tanggalPengeluaran?.substring(0, 10) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <a
                  v-if="item.buktiNotaUrl"
                  :href="item.buktiNotaUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-teal-700 hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  <span>Nota</span>
                  <ExternalLink class="h-3 w-3" />
                </a>
                <button
                  type="button"
                  class="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 transition"
                  title="Hapus pengeluaran"
                  @click="confirmDeletePengeluaran(item)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: Kelola Semester -->
    <section v-else-if="activeTab === 'semester'" class="space-y-6">
      <!-- Create Semester Form -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7">
        <h3 class="text-xl font-black text-slate-900">Buat Semester Baru</h3>
        <p class="text-xs text-slate-500 mt-1">
          Tambahkan periode semester baru agar catatan kas tidak tercampur dengan semester lalu.
        </p>

        <form class="mt-5 space-y-4" @submit.prevent="submitSemester">
          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Nama Semester
              <input 
                v-model="semesterForm.nama" 
                required 
                class="form-input mt-1.5" 
                placeholder="Semester Genap 2024/2025" 
              />
            </label>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Kode Unik
              <input 
                v-model="semesterForm.kode" 
                required 
                class="form-input mt-1.5 font-mono uppercase" 
                placeholder="2024-2" 
              />
            </label>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Target Kas per Mahasiswa (Rp)
              <input 
                v-model="semesterForm.targetKasPerMhs" 
                type="number" 
                class="form-input mt-1.5 font-mono" 
                placeholder="50000" 
              />
            </label>
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              class="btn-primary text-xs font-bold inline-flex items-center gap-1.5"
              :disabled="isSavingSemester"
            >
              <Plus class="h-4 w-4" />
              <span>{{ isSavingSemester ? 'Menyimpan...' : 'Buat Semester' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- List Semesters -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
        <h4 class="font-extrabold text-slate-900 text-base mb-4">Daftar Semua Semester</h4>
        <div class="divide-y divide-slate-100">
          <div 
            v-for="(sem, idx) in semesters" 
            :key="sem._id" 
            class="flex items-center justify-between py-4 hover:bg-slate-50/70 px-2 rounded-xl transition"
          >
            <div class="flex items-center gap-3">
              <span class="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 font-mono text-[10px] font-bold text-slate-500 shrink-0">
                {{ idx + 1 }}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">{{ sem.nama }}</span>
                  <span 
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    :class="sem.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ sem.isAktif ? 'Sedang Aktif' : 'Arsip' }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 font-mono mt-0.5">Kode: {{ sem.kode }}</p>
              </div>
            </div>

            <button
              v-if="!sem.isAktif"
              type="button"
              class="btn-secondary text-xs px-3 py-1.5 font-bold hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
              @click="handleActivateSemester(sem)"
            >
              Jadikan Aktif
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Create / Edit Kas Modal -->
    <KasFormModal
      v-if="modalOpen"
      :record="editingRecord"
      :saving="isSaving"
      @close="modalOpen = false"
      @submit="saveRecord"
    />

    <!-- Import Modal -->
    <KasImportModal
      :show="importModalOpen"
      @close="importModalOpen = false"
      @success="(msg) => showToast('success', msg)"
    />

    <!-- Custom Delete Confirmation Modal -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="recordToDelete" 
        class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
        @click.self="recordToDelete = null"
      >
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
          <div class="flex items-start gap-4">
            <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle class="h-6 w-6" />
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">Konfirmasi Hapus Data</h3>
              <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
                Apakah Anda yakin ingin menghapus catatan kas untuk 
                <strong class="text-slate-800 font-bold">{{ recordToDelete.nama || recordToDelete.nim }}</strong>? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              class="btn-secondary" 
              :disabled="isDeleting"
              @click="recordToDelete = null"
            >
              Batal
            </button>
            <button 
              type="button" 
              class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:opacity-60"
              :disabled="isDeleting"
              @click="executeDelete"
            >
              <Trash2 class="h-4 w-4" />
              <span>{{ isDeleting ? 'Menghapus...' : 'Hapus Catatan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Custom Delete Pengeluaran Confirmation Modal -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="pengeluaranToDelete" 
        class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
        @click.self="pengeluaranToDelete = null"
      >
        <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
          <div class="flex items-start gap-4">
            <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle class="h-6 w-6" />
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">Konfirmasi Hapus Pengeluaran</h3>
              <p class="mt-1.5 text-xs leading-relaxed text-slate-500">
                Apakah Anda yakin ingin membatalkan/menghapus catatan belanja 
                <strong class="text-slate-800 font-bold">"{{ pengeluaranToDelete.judul }}"</strong> 
                sebesar <strong class="text-rose-600 font-mono">{{ formatCurrency(pengeluaranToDelete.nominal) }}</strong> 
                oleh {{ pengeluaranToDelete.penanggungJawab }}? Dana akan dikembalikan ke saldo kas riil.
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              class="btn-secondary" 
              :disabled="isDeletingPengeluaran"
              @click="pengeluaranToDelete = null"
            >
              Batal
            </button>
            <button 
              type="button" 
              class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:opacity-60"
              :disabled="isDeletingPengeluaran"
              @click="executeDeletePengeluaran"
            >
              <Trash2 class="h-4 w-4" />
              <span>{{ isDeletingPengeluaran ? 'Menghapus...' : 'Hapus Belanja' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Toast Notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-3 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="opacity-100 translate-y-0 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 sm:translate-x-0"
      leave-to-class="opacity-0 translate-y-3 sm:translate-y-0 sm:translate-x-4"
    >
      <div
        v-if="toast.show"
        class="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all sm:bottom-6 sm:right-6"
        :class="toast.type === 'success' 
          ? 'bg-slate-900 text-white border border-slate-800' 
          : 'bg-rose-900 text-white border border-rose-800'"
        role="alert"
      >
        <component 
          :is="toast.type === 'success' ? CheckCircle2 : AlertCircle" 
          class="h-5 w-5 shrink-0" 
          :class="toast.type === 'success' ? 'text-emerald-400' : 'text-rose-300'"
        />
        <p class="text-xs font-semibold leading-relaxed flex-1">{{ toast.message }}</p>
        <button 
          type="button" 
          class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          aria-label="Tutup notifikasi"
          @click="dismissToast"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>
