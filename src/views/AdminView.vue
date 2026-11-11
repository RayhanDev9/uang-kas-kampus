<script setup>
import { computed, ref } from 'vue'
import { getErrorMessage } from '../api/axios'
import KasFormModal from '../components/KasFormModal.vue'
import KasTable from '../components/KasTable.vue'
import { useKas } from '../composables/useKas'

const { kasQuery, createKas, updateKas, deleteKas } = useKas()
const pin = ref('')
const modalOpen = ref(false)
const editingRecord = ref(null)
const failedDelete = ref(null)
const actionMessage = ref('')
const actionError = ref('')
const isSaving = computed(() => createKas.isPending.value || updateKas.isPending.value)

function openCreateForm() {
  editingRecord.value = null
  actionMessage.value = ''
  actionError.value = ''
  modalOpen.value = true
}

function openEditForm(record) {
  editingRecord.value = record
  actionMessage.value = ''
  actionError.value = ''
  modalOpen.value = true
}

async function saveRecord(payload) {
  actionMessage.value = ''
  actionError.value = ''

  try {
    if (editingRecord.value) {
      const id = editingRecord.value._id ?? editingRecord.value.id
      await updateKas.mutateAsync({ id, payload, pin: pin.value })
      actionMessage.value = 'Catatan kas berhasil diperbarui.'
    } else {
      await createKas.mutateAsync({ payload, pin: pin.value })
      actionMessage.value = 'Catatan kas baru berhasil disimpan.'
    }
    modalOpen.value = false
    editingRecord.value = null
  } catch (error) {
    actionError.value = getErrorMessage(error)
  }
}

async function removeRecord(record) {
  if (!record) return
  const label = record.nama || record.nim || 'data ini'
  if (!window.confirm(`Hapus catatan kas ${label}? Tindakan ini tidak dapat dibatalkan.`)) return

  actionMessage.value = ''
  actionError.value = ''
  failedDelete.value = null
  try {
    await deleteKas.mutateAsync({
      id: record._id ?? record.id,
      pin: pin.value,
    })
    actionMessage.value = `Catatan kas ${label} berhasil dihapus.`
  } catch (error) {
    failedDelete.value = record
    actionError.value = getErrorMessage(error)
  }
}
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-sm font-bold text-emerald-700">Ruang bendahara</p>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Kelola catatan kas.</h1>
        <p class="mt-3 max-w-xl text-sm leading-6 text-slate-500">Masukkan PIN untuk mengotorisasi perubahan. PIN hanya disimpan sementara di halaman ini.</p>
      </div>
      <button type="button" class="btn-primary self-start" @click="openCreateForm">
        <span aria-hidden="true" class="text-lg leading-none">+</span>
        Catat kas baru
      </button>
    </section>

    <section class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
      <label for="admin-pin" class="block text-sm font-bold text-slate-800">PIN bendahara</label>
      <p class="mt-1 text-sm text-slate-500">PIN dikirim melalui header <code class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">x-admin-pin</code> saat menyimpan perubahan.</p>
      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <input id="admin-pin" v-model="pin" type="password" inputmode="numeric" autocomplete="current-password" class="form-input sm:max-w-sm" placeholder="Masukkan PIN bendahara" />
        <span class="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <span class="h-2 w-2 rounded-full" :class="pin.trim() ? 'bg-emerald-500' : 'bg-slate-300'"></span>
          {{ pin.trim() ? 'PIN siap digunakan' : 'PIN belum diisi' }}
        </span>
      </div>
    </section>

    <div v-if="actionMessage" class="alert-success" role="status">{{ actionMessage }}</div>
    <div v-if="actionError" class="alert-error" role="alert">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{{ actionError }}</p>
        <button v-if="failedDelete" type="button" class="btn-secondary border-rose-200 bg-white" @click="removeRecord(failedDelete)">Coba lagi</button>
      </div>
    </div>

    <section class="space-y-4">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Data tersimpan</p>
          <h2 class="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Semua catatan kas</h2>
        </div>
        <button type="button" class="btn-secondary px-3 py-2 text-xs" :disabled="kasQuery.isFetching.value" @click="kasQuery.refetch()">
          {{ kasQuery.isFetching.value ? 'Memuat...' : 'Segarkan' }}
        </button>
      </div>

      <div v-if="kasQuery.isLoading.value" class="grid min-h-56 place-items-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500 shadow-card">
        Memuat data kas...
      </div>
      <section v-else-if="kasQuery.isError.value" class="alert-error" role="alert">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-bold">Data kas belum dapat dimuat</p>
            <p class="mt-1 text-sm">{{ getErrorMessage(kasQuery.error.value) }}</p>
          </div>
          <button type="button" class="btn-secondary border-rose-200 bg-white" @click="kasQuery.refetch()">Coba lagi</button>
        </div>
      </section>
      <KasTable
        v-else
        :records="kasQuery.data.value?.data ?? []"
        show-actions
        @edit="openEditForm"
        @delete="removeRecord"
      />
    </section>

    <KasFormModal
      v-if="modalOpen"
      :record="editingRecord"
      :saving="isSaving"
      @close="modalOpen = false"
      @submit="saveRecord"
    />
  </div>
</template>
