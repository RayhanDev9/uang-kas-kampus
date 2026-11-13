<script setup>
import { ref, computed } from 'vue'
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  FileText 
} from 'lucide-vue-next'
import { useKas } from '../composables/useKas'
import { useSemester } from '../composables/useSemester'
import { getErrorMessage } from '../api/axios'

defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'success'])

const { selectedSemesterId, selectedSemester } = useSemester()
const { importKas } = useKas()

const file = ref(null)
const isDragging = ref(false)
const pin = ref('')
const error = ref('')
const previewRows = ref([])
const totalPreviewRows = ref(0)
const isUploading = computed(() => importKas.isPending.value)

function handleDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    processFile(droppedFiles[0])
  }
}

function handleFileSelect(e) {
  const selectedFiles = e.target.files
  if (selectedFiles && selectedFiles.length > 0) {
    processFile(selectedFiles[0])
  }
}

function processFile(selectedFile) {
  error.value = ''
  previewRows.value = []
  totalPreviewRows.value = 0

  const validExtensions = ['.xlsx', '.xls', '.csv']
  const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()

  if (!validExtensions.includes(fileExt)) {
    error.value = 'Format file tidak didukung. Mohon gunakan file .xlsx, .xls, atau .csv.'
    return
  }

  if (selectedFile.size > 5 * 1024 * 1024) {
    error.value = 'Ukuran file melebihi batas 5MB.'
    return
  }

  file.value = selectedFile

  // Parse CSV client-side preview if text
  if (fileExt === '.csv') {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result
        if (typeof text === 'string') {
          const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
          if (lines.length > 1) {
            const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''))
            const parsed = lines.slice(1).map((line) => {
              const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''))
              const obj = {}
              headers.forEach((h, i) => {
                obj[h] = cols[i] || ''
              })
              return obj
            })
            totalPreviewRows.value = parsed.length
            previewRows.value = parsed.slice(0, 5)
          }
        }
      } catch (err) {
        console.warn('Gagal membaca preview CSV', err)
      }
    }
    reader.readAsText(selectedFile)
  }
}

function downloadTemplate() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  // Trigger backend template download or fallback CSV
  window.open(`${apiBase}/kas/template`, '_blank')
}

async function submitImport() {
  if (!file.value) {
    error.value = 'Silakan pilih file terlebih dahulu.'
    return
  }
  if (!pin.value.trim()) {
    error.value = 'PIN bendahara wajib diisi untuk otorisasi import.'
    return
  }

  error.value = ''
  const formData = new FormData()
  formData.append('file', file.value)
  if (selectedSemesterId.value && selectedSemesterId.value !== 'default-active') {
    formData.append('semesterId', selectedSemesterId.value)
  }

  try {
    const result = await importKas.mutateAsync({
      formData,
      pin: pin.value,
    })
    emit('success', result?.message || 'Data kas berhasil diimpor.')
    emit('close')
  } catch (err) {
    error.value = getErrorMessage(err)
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-700 shadow-sm">
              <FileSpreadsheet class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-slate-900">Import Data Kas (.xlsx / .csv)</h3>
              <p class="text-xs text-slate-500 font-medium">
                Tujuan: <strong class="text-slate-800">{{ selectedSemester?.nama || 'Semester Aktif' }}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Tutup"
            @click="emit('close')"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Download Template helper banner -->
        <div class="mt-5 flex items-center justify-between rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 text-xs">
          <div class="flex items-center gap-2 text-slate-600">
            <FileText class="h-4 w-4 text-slate-400 shrink-0" />
            <span>Format kolom belum sesuai?</span>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition"
            @click="downloadTemplate"
          >
            <Download class="h-3.5 w-3.5" />
            <span>Unduh Template</span>
          </button>
        </div>

        <!-- Dropzone -->
        <div
          class="mt-4 grid min-h-40 place-items-center rounded-3xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer"
          :class="isDragging 
            ? 'border-emerald-500 bg-emerald-50/50' 
            : file 
              ? 'border-teal-400 bg-teal-50/30' 
              : 'border-slate-300 bg-slate-50/60 hover:border-slate-400'"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx, .xls, .csv"
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="!file" class="flex flex-col items-center">
            <UploadCloud class="h-10 w-10 text-slate-400 mb-2" />
            <p class="text-xs font-bold text-slate-800">
              Tarik file Excel/CSV ke sini, atau <span class="text-emerald-700 underline">pilih dari komputer</span>
            </p>
            <p class="mt-1 text-[11px] text-slate-400">
              Mendukung file .xlsx, .xls, atau .csv (maksimal 5MB)
            </p>
          </div>

          <div v-else class="flex flex-col items-center text-teal-800">
            <CheckCircle2 class="h-9 w-9 text-teal-600 mb-2" />
            <p class="text-xs font-black truncate max-w-xs">{{ file.name }}</p>
            <p class="mt-0.5 text-[11px] text-slate-500">
              {{ (file.size / 1024).toFixed(1) }} KB &bull; Siap diunggah
            </p>
          </div>
        </div>

        <!-- CSV Preview Table if available -->
        <div v-if="previewRows.length > 0" class="mt-4 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
            <span>Preview (Menampilkan 5 dari {{ totalPreviewRows }} baris):</span>
          </div>
          <div class="overflow-x-auto text-[11px]">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-200 text-slate-400 uppercase text-[9px]">
                  <th v-for="(val, key) in previewRows[0]" :key="key" class="py-1 px-2">{{ key }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(row, idx) in previewRows" :key="idx">
                  <td v-for="(val, key) in row" :key="key" class="py-1 px-2 font-mono text-slate-700">{{ val }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PIN Input -->
        <div class="mt-5">
          <label for="import-pin" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            <span class="flex items-center gap-1.5 mb-1.5">
              <KeyRound class="h-3.5 w-3.5 text-slate-400" />
              PIN Otorisasi Bendahara
            </span>
            <input
              id="import-pin"
              v-model="pin"
              type="password"
              inputmode="numeric"
              autocomplete="current-password"
              class="form-input tracking-widest font-mono text-center font-bold"
              placeholder="••••••"
            />
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
          <AlertCircle class="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <p>{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            class="btn-secondary text-xs"
            :disabled="isUploading"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="button"
            class="btn-primary text-xs"
            :disabled="!file || isUploading"
            @click="submitImport"
          >
            {{ isUploading ? 'Mengimpor Data...' : 'Mulai Import Kas' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
