<script setup>
defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
</script>

<template>
  <section class="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Ringkasan kas">
    <article class="relative min-w-0 overflow-hidden rounded-3xl bg-emerald-800 p-5 text-white shadow-card sm:p-6">
      <div class="absolute -right-7 -top-8 h-32 w-32 rounded-full bg-emerald-600/40"></div>
      <div class="relative">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-emerald-100">Total saldo terkumpul</p>
          <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/15" aria-hidden="true">↗</span>
        </div>
        <p class="mt-7 text-2xl font-extrabold tracking-tight sm:text-3xl">{{ formatCurrency(summary.totalSaldo) }}</p>
        <p class="mt-2 text-xs text-emerald-100/80">Akumulasi pembayaran yang sudah lunas</p>
      </div>
    </article>

    <article class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-500">Sudah lunas</p>
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden="true">✓</span>
      </div>
      <p class="mt-7 text-3xl font-extrabold tracking-tight text-slate-900">{{ Number(summary.totalLunas) || 0 }}</p>
      <p class="mt-2 text-xs text-slate-500">Pembayaran tercatat lunas</p>
    </article>

    <article class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-500">Belum lunas</p>
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700" aria-hidden="true">!</span>
      </div>
      <p class="mt-7 text-3xl font-extrabold tracking-tight text-slate-900">{{ Number(summary.totalBelumLunas) || 0 }}</p>
      <p class="mt-2 text-xs text-slate-500">Menunggu pembayaran</p>
    </article>
  </section>
</template>
