<script setup>
import { 
  Banknote, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Clock
} from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <section class="max-w-3xl">
      <div class="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
        <Sparkles class="h-3.5 w-3.5 text-emerald-600" />
        <span>Panduan Pembayaran Kas</span>
      </div>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Cara pembayaran kas kelas.
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
        Informasi dan ketentuan pembayaran iuran kas kelas. Silakan ikuti panduan berikut agar pencatatan kas kelas tetap transparan, aman, dan akurat.
      </p>
    </section>

    <!-- Payment Methods Grid -->
    <section class="grid gap-6 lg:grid-cols-2">
      <!-- Method 1: Setor Langsung / Tunai -->
      <article class="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-8">
        <div>
          <div class="flex items-center justify-between">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
              <Banknote class="h-6 w-6" />
            </div>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
              Metode Utama
            </span>
          </div>

          <h2 class="mt-5 text-xl font-extrabold text-slate-900">
            Setor Tunai ke Bendahara
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Pembayaran kas kelas dapat diserahkan langsung secara tunai kepada Bendahara Kelas saat jadwal perkuliahan atau pertemuan di kampus.
          </p>

          <!-- Interactive Info Box -->
          <div class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 class="h-4 w-4 text-emerald-600" />
              <span>Proses Verifikasi Instan</span>
            </div>
            <p class="mt-2 text-xs text-slate-600 leading-relaxed">
              Serahkan uang pas sesuai nominal iuran. Bendahara akan langsung menginput dan mencentang absensi pembayaran Anda ke sistem KasKita.
            </p>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/60">
          <Clock class="h-4 w-4 shrink-0 text-slate-400" />
          <span>Bisa dibayarkan setiap minggu atau langsung dilunasi sesuai periode semester.</span>
        </div>
      </article>

      <!-- Method 2: Transfer / Non-Tunai (Konfirmasi Langsung) -->
      <article class="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-8">
        <div>
          <div class="flex items-center justify-between">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm">
              <CreditCard class="h-6 w-6" />
            </div>
            <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-600/20">
              Transfer / E-Wallet
            </span>
          </div>

          <h2 class="mt-5 text-xl font-extrabold text-slate-900">
            Pembayaran Non-Tunai
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Untuk menjaga keamanan dan mencegah kekeliruan transfer, nomor rekening/e-wallet resmi diberikan langsung melalui konfirmasi bendahara.
          </p>

          <!-- Direct Confirmation Box -->
          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <MessageCircle class="h-4 w-4 text-teal-600" />
              <span>Hubungi Bendahara Kelas</span>
            </div>
            <p class="mt-2 text-xs text-slate-600 leading-relaxed">
              Jika ingin membayar via transfer bank atau e-wallet (DANA / GoPay / ShopeePay / QRIS), silakan tanyakan nomor rekening/e-wallet aktif langsung ke Bendahara Kelas di grup WhatsApp kelas.
            </p>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200/70">
          <AlertTriangle class="h-4 w-4 shrink-0 text-amber-600" />
          <span>Jangan mentransfer ke nomor pihak ketiga di luar konfirmasi resmi bendahara kelas.</span>
        </div>
      </article>
    </section>

    <!-- Terms & Instructions (Clean Gradient Banner) -->
    <section class="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-card sm:p-8">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
        <ShieldCheck class="h-4 w-4" />
        <span>Ketentuan Pembayaran Kas</span>
      </div>

      <div class="mt-5 grid gap-6 sm:grid-cols-3">
        <div class="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-300">1</span>
            <p class="font-bold text-white text-sm">Nominal Sesuai</p>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-300">
            Pastikan membayar sesuai tarif iuran kas kelas yang telah disepakati bersama untuk semester berjalan.
          </p>
        </div>

        <div class="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-300">2</span>
            <p class="font-bold text-white text-sm">Konfirmasi Bukti</p>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-300">
            Jika membayar via transfer, segera kirimkan tangkapan layar bukti transfer ke bendahara untuk diverifikasi.
          </p>
        </div>

        <div class="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-300">3</span>
            <p class="font-bold text-white text-sm">Cek di Dasbor</p>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-300">
            Setelah membayar, Anda dapat langsung memeriksa pembaruan status dan kehadiran kas Anda di halaman Dasbor.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
