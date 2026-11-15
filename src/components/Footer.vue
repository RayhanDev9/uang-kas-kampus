<script setup>
import { RouterLink } from 'vue-router'
import { Lock, ShieldCheck, LogOut } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

const { isAuthenticated, openLoginModal, logout } = useAuth()
</script>

<template>
  <footer class="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
    <div class="mx-auto flex min-w-0 max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div>
        <p class="font-medium text-slate-700 flex items-center gap-1.5">
          <span class="font-bold text-slate-900">KasKita</span>
          <span>&bull;</span>
          <span>Transparansi kas kelas, jelas dan terpercaya.</span>
        </p>
        <p class="text-slate-400 mt-0.5">
          Data pembayaran disinkronkan langsung oleh bendahara kelas.
        </p>
      </div>

      <!-- Right Side: Secret Access or Active State -->
      <div class="flex items-center gap-3 pt-1 sm:pt-0">
        <!-- Not logged in: Discrete secret link -->
        <button
          v-if="!isAuthenticated"
          type="button"
          class="group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-400 opacity-60 transition-all hover:bg-slate-100 hover:text-slate-700 hover:opacity-100"
          title="Akses Pengurus / Bendahara"
          @click="openLoginModal"
        >
          <Lock class="h-3 w-3 transition-transform group-hover:scale-110" />
          <span>Akses Bendahara</span>
        </button>

        <!-- Logged in as Bendahara -->
        <div
          v-else
          class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] text-emerald-800 shadow-sm"
        >
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span class="font-bold">Bendahara Aktif</span>
          <span class="text-emerald-300">&bull;</span>
          <RouterLink
            to="/admin"
            class="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
          >
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Ruang Bendahara</span>
          </RouterLink>
          <span class="text-emerald-300">&bull;</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
            @click="logout"
          >
            <LogOut class="w-3 h-3" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
