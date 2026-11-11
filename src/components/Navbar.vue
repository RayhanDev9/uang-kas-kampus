<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)
const links = [
  { to: '/', label: 'Ringkasan' },
  { to: '/info', label: 'Info pembayaran' },
  { to: '/admin', label: 'Bendahara' },
]

function isActive(path) {
  return route.path === path
}

watch(
  () => route.path,
  () => {
    menuOpen.value = false
  },
)
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 min-[670px]:flex-nowrap min-[670px]:gap-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex shrink-0 items-center gap-3" aria-label="KasKita, halaman utama" @click="menuOpen = false">
        <span class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-700 text-lg font-black text-white shadow-sm">K</span>
        <span>
          <span class="block text-base font-extrabold tracking-tight text-slate-900">KasKita</span>
          <span class="hidden text-xs font-medium text-slate-500 min-[400px]:block">Kas kelas, transparan</span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 rounded-full bg-slate-100 p-1 min-[670px]:flex" aria-label="Navigasi utama">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-3 py-2 text-xs font-semibold transition min-[900px]:px-4 min-[900px]:text-sm"
          :class="isActive(link.to) ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <button
        type="button"
        class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 min-[670px]:hidden"
        :aria-expanded="menuOpen"
        aria-controls="mobile-navigation"
        :aria-label="menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>

      <nav
        v-if="menuOpen"
        id="mobile-navigation"
        class="flex w-full flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-card min-[670px]:hidden"
        aria-label="Navigasi mobile"
      >
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="isActive(link.to) ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
