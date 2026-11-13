<script setup>
import { computed, reactive, watch } from 'vue'
import { X, User, Hash, Calendar, DollarSign, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps({
  record: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])
const form = reactive({
  nim: '',
  nama: '',
  periode: '',
  nominal: '',
  status: 'Belum Lunas',
})
const isEditing = computed(() => Boolean(props.record))

watch(
  () => props.record,
  (record) => {
    form.nim = record?.nim ?? ''
    form.nama = record?.nama ?? ''
    form.periode = record?.periode ?? ''
    form.nominal = record?.nominal ?? ''
    form.status = record?.status ?? 'Belum Lunas'
  },
  { immediate: true },
)

function submitForm() {
  emit('submit', {
    nim: form.nim.trim(),
    nama: form.nama.trim(),
    periode: form.periode.trim(),
    nominal: Number(form.nominal),
    status: form.status,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm transition-all"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="kas-form-title"
        class="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              Manajemen Data Kas
            </span>
            <h2 id="kas-form-title" class="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {{ isEditing ? 'Ubah Catatan Kas' : 'Catat Kas Baru' }}
            </h2>
          </div>
          <button 
            type="button" 
            class="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition" 
            aria-label="Tutup formulir" 
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="submitForm">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              <span class="flex items-center gap-1.5 mb-1.5">
                <Hash class="h-3.5 w-3.5 text-slate-400" />
                NIM
              </span>
              <input 
                v-model="form.nim" 
                required 
                maxlength="40" 
                autocomplete="off" 
                class="form-input" 
                placeholder="Contoh: 24123456" 
              />
            </label>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              <span class="flex items-center gap-1.5 mb-1.5">
                <User class="h-3.5 w-3.5 text-slate-400" />
                Nama Mahasiswa
              </span>
              <input 
                v-model="form.nama" 
                required 
                maxlength="120" 
                autocomplete="name" 
                class="form-input" 
                placeholder="Nama lengkap..." 
              />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              <span class="flex items-center gap-1.5 mb-1.5">
                <Calendar class="h-3.5 w-3.5 text-slate-400" />
                Periode
              </span>
              <input 
                v-model="form.periode" 
                required 
                maxlength="80" 
                class="form-input" 
                placeholder="Contoh: Minggu 1" 
              />
            </label>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              <span class="flex items-center gap-1.5 mb-1.5">
                <DollarSign class="h-3.5 w-3.5 text-slate-400" />
                Nominal (Rp)
              </span>
              <input 
                v-model="form.nominal" 
                required 
                type="number" 
                min="0" 
                step="1" 
                class="form-input" 
                placeholder="10000" 
              />
            </label>
          </div>

          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
            <span class="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 class="h-3.5 w-3.5 text-slate-400" />
              Status Pembayaran
            </span>
            <select v-model="form.status" required class="form-input font-medium">
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </label>

          <div class="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end border-t border-slate-100">
            <button type="button" class="btn-secondary" :disabled="saving" @click="emit('close')">
              Batal
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Catatan' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
