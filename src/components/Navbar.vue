<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const links = [
  { to: '/', label: 'Ringkasan', shortLabel: 'Kas' },
  { to: '/info', label: 'Info pembayaran', shortLabel: 'Info' },
  { to: '/admin', label: 'Bendahara', shortLabel: 'Admin' },
]

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex shrink-0 items-center gap-3" aria-label="KasKita, halaman utama">
        <span class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-lg font-black text-white shadow-sm">K</span>
        <span>
          <span class="block text-base font-extrabold tracking-tight text-slate-900">KasKita</span>
          <span class="hidden text-xs font-medium text-slate-500 sm:block">Kas kelas, transparan</span>
        </span>
      </RouterLink>

      <nav class="flex w-full items-center justify-between gap-1 rounded-full bg-slate-100 p-1 sm:w-auto" aria-label="Navigasi utama">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm"
          :class="isActive(link.to) ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
        >
          <span class="sm:hidden">{{ link.shortLabel }}</span>
          <span class="hidden sm:inline">{{ link.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
