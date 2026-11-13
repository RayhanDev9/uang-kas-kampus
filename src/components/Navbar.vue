<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Wallet, LayoutDashboard, Info, ShieldCheck, History, Menu, X } from 'lucide-vue-next'
import SemesterSwitcher from './SemesterSwitcher.vue'
import HistoryDrawer from './HistoryDrawer.vue'

const route = useRoute()
const menuOpen = ref(false)
const historyOpen = ref(false)

const links = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/info', label: 'Cara Bayar', icon: Info },
  { to: '/admin', label: 'Ruang Bendahara', icon: ShieldCheck },
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
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <!-- Left: Brand Logo & Semester Switcher -->
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <RouterLink
          to="/"
          class="group flex shrink-0 items-center gap-2.5 transition-transform active:scale-95"
          aria-label="KasKita, halaman utama"
          @click="menuOpen = false"
        >
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-700/20 transition-all duration-300 group-hover:shadow-glow group-hover:scale-105">
            <Wallet class="h-5 w-5" />
          </div>
          <div>
            <span class="block text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">KasKita</span>
            <span class="hidden text-[11px] font-medium text-slate-500 min-[420px]:block">Transparansi kas kelas</span>
          </div>
        </RouterLink>

        <!-- Semester Switcher Dropdown -->
        <SemesterSwitcher />
      </div>

      <!-- Right: Desktop Navigation -->
      <div class="hidden items-center gap-2 md:flex">
        <nav class="flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-100/80 p-1.5 shadow-inner" aria-label="Navigasi utama">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 lg:px-4 lg:text-sm"
            :class="isActive(link.to) 
              ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-900/5' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
          >
            <component :is="link.icon" class="h-4 w-4" :class="isActive(link.to) ? 'text-emerald-600' : 'text-slate-400'" />
            <span>{{ link.label }}</span>
          </RouterLink>
        </nav>

        <!-- Button to open History Drawer -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          @click="historyOpen = true"
        >
          <History class="h-4 w-4 text-emerald-600" />
          <span>Riwayat</span>
        </button>
      </div>

      <!-- Mobile Action Buttons -->
      <div class="flex items-center gap-2 md:hidden">
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm active:scale-95"
          title="Buka riwayat mutasi kas"
          @click="historyOpen = true"
        >
          <History class="h-5 w-5 text-emerald-700" />
        </button>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          :aria-label="menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'"
          @click="menuOpen = !menuOpen"
        >
          <component :is="menuOpen ? X : Menu" class="h-5 w-5 transition-transform duration-200" />
        </button>
      </div>
    </div>

    <!-- Mobile Nav Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="menuOpen"
        id="mobile-navigation"
        class="border-b border-slate-200/80 bg-white/95 px-4 pb-4 pt-2 shadow-lg backdrop-blur-lg md:hidden"
      >
        <nav class="flex flex-col gap-1.5" aria-label="Navigasi mobile">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
            :class="isActive(link.to) ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <component :is="link.icon" class="h-5 w-5" :class="isActive(link.to) ? 'text-emerald-600' : 'text-slate-400'" />
            <span>{{ link.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </Transition>

    <!-- History Drawer Instance -->
    <HistoryDrawer :show="historyOpen" @close="historyOpen = false" />
  </header>
</template>
