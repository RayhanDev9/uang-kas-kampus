<script setup>
import { computed, ref } from 'vue'
import { getErrorMessage } from '../api/axios'
import KasTable from '../components/KasTable.vue'
import StatCards from '../components/StatCards.vue'
import { useKas } from '../composables/useKas'

const search = ref('')
const status = ref('Semua')

const { kasQuery: publicKasQuery } = useKas({ search, status })
const summary = computed(() => publicKasQuery.data.value?.summary ?? {})
const records = computed(() => publicKasQuery.data.value?.data ?? [])
</script>

<template>
  <div class="min-w-0 space-y-9">
    <section class="flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0">
        <p class="text-sm font-bold text-emerald-700">Halo, teman kelas 👋</p>
        <h1 class="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Kas kelas, jelas ke mana arahnya.</h1>
        <p class="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Pantau ringkasan saldo dan status pembayaran kas dalam satu tempat.</p>
      </div>
      <RouterLink to="/info" class="btn-secondary self-start md:shrink-0 md:self-auto">
        Cara pembayaran <span aria-hidden="true">→</span>
      </RouterLink>
    </section>

    <div v-if="publicKasQuery.isLoading.value" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Memuat ringkasan">
      <div v-for="item in 3" :key="item" class="h-36 animate-pulse rounded-3xl bg-slate-200/70"></div>
    </div>
    <section v-else-if="publicKasQuery.isError.value" class="alert-error" role="alert">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-bold">Data kas belum dapat dimuat</p>
          <p class="mt-1 text-sm">{{ getErrorMessage(publicKasQuery.error.value) }}</p>
        </div>
        <button type="button" class="btn-secondary border-rose-200 bg-white" @click="publicKasQuery.refetch()">Coba lagi</button>
      </div>
    </section>
    <StatCards v-else :summary="summary" />

    <section class="space-y-4">
      <div class="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Transparansi</p>
          <h2 class="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Catatan pembayaran</h2>
        </div>
        <div class="flex w-full min-w-0 flex-col gap-2 md:w-auto md:flex-row">
          <label class="relative block min-w-0 md:w-64">
            <span class="sr-only">Cari nama atau NIM</span>
            <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">⌕</span>
            <input v-model="search" type="search" class="form-input pl-10" placeholder="Cari nama atau NIM" />
          </label>
          <label class="block min-w-0 md:w-44">
            <span class="sr-only">Filter status</span>
            <select v-model="status" class="form-input">
              <option>Semua</option>
              <option>Lunas</option>
              <option>Belum Lunas</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="publicKasQuery.isLoading.value" class="grid min-h-56 place-items-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500 shadow-card">
        Memuat catatan pembayaran...
      </div>
      <div v-else-if="publicKasQuery.isError.value" class="grid min-h-56 place-items-center rounded-3xl border border-slate-200 bg-white px-6 text-center text-sm text-slate-500 shadow-card">
        Daftar kas tidak tersedia karena data gagal dimuat.
      </div>
      <KasTable v-else :records="records" />
      <p v-if="publicKasQuery.isFetching.value && !publicKasQuery.isLoading.value" class="text-xs font-medium text-emerald-700" role="status">
        Memperbarui daftar...
      </p>
      <p class="text-xs leading-5 text-slate-400">Informasi pada halaman ini mengikuti data yang tercatat oleh bendahara kelas.</p>
    </section>
  </div>
</template>
