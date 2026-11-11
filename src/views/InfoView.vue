<script setup>
import { ref } from 'vue'

const qrisUnavailable = ref(false)
const qrisImageUrl = `${import.meta.env.BASE_URL}qris.png`
</script>

<template>
  <div class="space-y-9">
    <section class="max-w-3xl">
      <p class="text-sm font-bold text-emerald-700">Pembayaran kas</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Cara ikut menjaga kas kelas.</h1>
      <p class="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Gunakan informasi pembayaran resmi dari bendahara. Pastikan nama dan periode pembayaran dicantumkan saat mengirim bukti.</p>
    </section>

    <section class="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <article class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <span class="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700" aria-hidden="true">↗</span>
        <h2 class="mt-5 text-xl font-extrabold text-slate-900">Rekening / e-wallet</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">Detail rekening atau e-wallet belum tersedia. Silakan konfirmasi nomor tujuan pembayaran langsung kepada bendahara kelas sebelum melakukan transfer.</p>
        <div class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Penerima</p>
          <p class="mt-1 font-semibold text-slate-600">Konfirmasi kepada bendahara</p>
        </div>
      </article>

      <article class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Pembayaran digital</p>
            <h2 class="mt-2 text-xl font-extrabold text-slate-900">QRIS kelas</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">QRIS</span>
        </div>
        <div class="mx-auto mt-6 grid min-h-56 max-w-xs place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <img
            v-if="!qrisUnavailable"
            :src="qrisImageUrl"
            alt="Kode QRIS pembayaran kas kelas"
            class="max-h-64 w-full rounded-xl object-contain"
            @error="qrisUnavailable = true"
          />
          <div v-else class="text-center">
            <span class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl text-slate-400 shadow-sm" aria-hidden="true">▦</span>
            <p class="mt-3 font-bold text-slate-700">QRIS belum ditambahkan</p>
            <p class="mt-1 text-xs leading-5 text-slate-500">Tempatkan aset QRIS bendahara di <code class="rounded bg-white px-1">public/qris.png</code>.</p>
          </div>
        </div>
        <p class="mt-4 text-center text-xs leading-5 text-slate-500">Pastikan nama merchant/penerima benar sebelum mengonfirmasi pembayaran.</p>
      </article>
    </section>

    <section class="rounded-3xl bg-emerald-900 p-6 text-white shadow-card sm:p-8">
      <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Ketentuan pembayaran</p>
      <div class="mt-4 grid gap-6 sm:grid-cols-3">
        <div>
          <p class="font-bold">Nominal mingguan</p>
          <p class="mt-1 text-sm leading-6 text-emerald-100/80">Konfirmasi nominal yang berlaku kepada bendahara.</p>
        </div>
        <div>
          <p class="font-bold">Cantumkan periode</p>
          <p class="mt-1 text-sm leading-6 text-emerald-100/80">Sertakan nama, NIM, dan minggu/periode pembayaran.</p>
        </div>
        <div>
          <p class="font-bold">Simpan bukti transfer</p>
          <p class="mt-1 text-sm leading-6 text-emerald-100/80">Kirim bukti kepada bendahara agar pembayaran dapat diverifikasi.</p>
        </div>
      </div>
    </section>
  </div>
</template>
