<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen min-w-0 flex flex-col justify-between">
    <div>
      <Navbar />
      <main class="mx-auto w-full min-w-0 max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <footer class="border-t border-slate-200/80 bg-white/60 backdrop-blur-sm">
      <div class="mx-auto flex min-w-0 max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p class="font-medium text-slate-600">
          KasKita &bull; Transparansi kas kelas, jelas dan terpercaya.
        </p>
        <p class="text-slate-400">
          Data pembayaran disinkronkan oleh bendahara kelas.
        </p>
      </div>
    </footer>
  </div>
</template>
