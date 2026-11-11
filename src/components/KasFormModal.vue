<script setup>
import { computed, reactive, watch } from 'vue'

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
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="kas-form-title"
        class="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Data kas kelas</p>
            <h2 id="kas-form-title" class="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {{ isEditing ? 'Ubah catatan kas' : 'Catat kas baru' }}
            </h2>
          </div>
          <button type="button" class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup formulir" @click="emit('close')">✕</button>
        </div>

        <form class="mt-7 space-y-4" @submit.prevent="submitForm">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold text-slate-700">
              NIM
              <input v-model="form.nim" required maxlength="40" autocomplete="off" class="form-input mt-2" placeholder="Contoh: 24123456" />
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              Nama
              <input v-model="form.nama" required maxlength="120" autocomplete="name" class="form-input mt-2" placeholder="Nama mahasiswa" />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold text-slate-700">
              Periode
              <input v-model="form.periode" required maxlength="80" class="form-input mt-2" placeholder="Contoh: Minggu 1" />
            </label>
            <label class="block text-sm font-semibold text-slate-700">
              Nominal (Rp)
              <input v-model="form.nominal" required type="number" min="0" step="1" class="form-input mt-2" placeholder="10000" />
            </label>
          </div>

          <label class="block text-sm font-semibold text-slate-700">
            Status pembayaran
            <select v-model="form.status" required class="form-input mt-2">
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </label>

          <div class="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
            <button type="button" class="btn-secondary" :disabled="saving" @click="emit('close')">Batal</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Simpan catatan' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
