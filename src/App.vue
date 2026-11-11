<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen min-w-0">
    <Navbar />
    <main class="mx-auto w-full min-w-0 max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pt-8">
      <RouterView />
    </main>
    <footer class="border-t border-slate-200/80 bg-white/70">
      <div class="mx-auto flex min-w-0 max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>KasKita · Transparansi kas, tumbuh bersama.</p>
        <p>Data pembayaran dikelola oleh bendahara kelas.</p>
      </div>
    </footer>
  </div>
</template>
