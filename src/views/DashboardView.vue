<script setup>
import { computed, ref } from 'vue'
import { getErrorMessage } from '../api/axios'
import KasTable from '../components/KasTable.vue'
import StatCards from '../components/StatCards.vue'
import { useKas } from '../composables/useKas'

const { kasQuery } = useKas()
const search = ref('')
const status = ref('Semua')

const summary = computed(() => kasQuery.data.value?.summary ?? {})
const filteredRecords = computed(() => {
  const records = kasQuery.data.value?.data ?? []
  const normalizedSearch = search.value.trim().toLocaleLowerCase('id-ID')

  return records.filter((record) => {
    const matchesSearch =
      !normalizedSearch ||
      String(record.nama ?? '').toLocaleLowerCase('id-ID').includes(normalizedSearch) ||
      String(record.nim ?? '').toLocaleLowerCase('id-ID').includes(normalizedSearch)
    const matchesStatus = status.value === 'Semua' || record.status === status.value
    return matchesSearch && matchesStatus
  })
})
</script>

<template>
  <div class="space-y-9">
    <section class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-bold text-emerald-700">Halo, teman kelas 👋</p>
        <h1 class="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Kas kelas, jelas ke mana arahnya.</h1>
        <p class="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Pantau ringkasan saldo dan status pembayaran kas dalam satu tempat.</p>
      </div>
      <RouterLink to="/info" class="btn-secondary shrink-0 self-start sm:self-auto">
        Cara pembayaran <span aria-hidden="true">→</span>
      </RouterLink>
    </section>

    <div v-if="kasQuery.isLoading.value" class="grid gap-4 sm:grid-cols-3" aria-label="Memuat ringkasan">
      <div v-for="item in 3" :key="item" class="h-36 animate-pulse rounded-3xl bg-slate-200/70"></div>
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
    <StatCards v-else :summary="summary" />

    <section class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Transparansi</p>
          <h2 class="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Catatan pembayaran</h2>
        </div>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label class="relative block sm:w-64">
            <span class="sr-only">Cari nama atau NIM</span>
            <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">⌕</span>
            <input v-model="search" type="search" class="form-input pl-10" placeholder="Cari nama atau NIM" />
          </label>
          <label class="block sm:w-44">
            <span class="sr-only">Filter status</span>
            <select v-model="status" class="form-input">
              <option>Semua</option>
              <option>Lunas</option>
              <option>Belum Lunas</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="kasQuery.isLoading.value" class="grid min-h-56 place-items-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500 shadow-card">
        Memuat catatan pembayaran...
      </div>
      <div v-else-if="kasQuery.isError.value" class="grid min-h-56 place-items-center rounded-3xl border border-slate-200 bg-white px-6 text-center text-sm text-slate-500 shadow-card">
        Daftar kas tidak tersedia karena data gagal dimuat.
      </div>
      <KasTable v-else :records="filteredRecords" />
      <p class="text-xs leading-5 text-slate-400">Informasi pada halaman ini mengikuti data yang tercatat oleh bendahara kelas.</p>
    </section>
  </div>
</template>
