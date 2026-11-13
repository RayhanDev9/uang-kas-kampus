<script setup>
import { ref } from 'vue'
import { 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  Maximize2, 
  X, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Info
} from 'lucide-vue-next'

const qrisUnavailable = ref(false)
const qrisImageUrl = `${import.meta.env.BASE_URL}qris.jpg`
const copied = ref(false)
const zoomModal = ref(false)

const paymentInfo = {
  provider: 'DANA',
  accountNumber: '0812-3456-7890',
  rawNumber: '081234567890',
  accountName: 'Bendahara ISC',
}

async function copyToClipboard() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(paymentInfo.rawNumber)
    } else {
      const input = document.createElement('input')
      input.value = paymentInfo.rawNumber
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy', e)
  }
}
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
        Gunakan saluran resmi yang disediakan bendahara di bawah ini. Cantumkan nama lengkap & NIM agar transaksi segera diverifikasi.
      </p>
    </section>

    <!-- Payment Methods Grid -->
    <section class="grid gap-6 lg:grid-cols-2">
      <!-- Method 1: Rekening / E-Wallet with 1-Click Copy -->
      <article class="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-8">
        <div>
          <div class="flex items-center justify-between">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
              <CreditCard class="h-6 w-6" />
            </div>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
              E-Wallet / Transfer
            </span>
          </div>

          <h2 class="mt-5 text-xl font-extrabold text-slate-900">
            Nomor Rekening / E-Wallet
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Kirim setoran kas melalui nomor e-wallet bendahara kelas di bawah ini. Salin nomor dengan satu klik.
          </p>

          <!-- Interactive Copy Box -->
          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-emerald-300">
            <div class="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>{{ paymentInfo.provider }}</span>
              <span>a.n. {{ paymentInfo.accountName }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-3">
              <span class="font-mono text-xl font-black tracking-tight text-slate-900">
                {{ paymentInfo.accountNumber }}
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-all duration-150 active:scale-95"
                :class="copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'"
                :aria-label="copied ? 'Nomor berhasil disalin' : 'Salin nomor pembayaran'"
                @click="copyToClipboard"
              >
                <component :is="copied ? Check : Copy" class="h-4 w-4" />
                <span>{{ copied ? 'Tersalin!' : 'Salin Nomor' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-2 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-800 border border-amber-200/50">
          <Info class="h-4 w-4 shrink-0 text-amber-600" />
          <span>Pastikan nama penerima di aplikasi transfer sesuai sebelum mengirim.</span>
        </div>
      </article>

      <!-- Method 2: QRIS Kelas -->
      <article class="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover sm:p-8">
        <div>
          <div class="flex items-center justify-between">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm">
              <QrCode class="h-6 w-6" />
            </div>
            <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-600/20">
              Instan & Otomatis
            </span>
          </div>

          <h2 class="mt-5 text-xl font-extrabold text-slate-900">
            QRIS Kas Kelas
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Pindai menggunakan aplikasi mobile banking apa saja atau e-wallet (BCA, Mandiri, GoPay, OVO, ShopeePay).
          </p>

          <!-- QRIS Image Container -->
          <div class="relative mx-auto mt-6 grid min-h-56 max-w-xs place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-4 group">
            <div v-if="!qrisUnavailable" class="relative">
              <img
                :src="qrisImageUrl"
                alt="Kode QRIS pembayaran kas kelas"
                class="max-h-56 w-full rounded-2xl object-contain shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
                @error="qrisUnavailable = true"
              />
              <button
                type="button"
                class="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-xl bg-slate-900/80 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-md transition-all hover:bg-slate-900 active:scale-95 shadow-md"
                @click="zoomModal = true"
              >
                <Maximize2 class="h-3.5 w-3.5" />
                <span>Perbesar</span>
              </button>
            </div>

            <!-- Empty QRIS placeholder -->
            <div v-else class="text-center p-4">
              <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <QrCode class="h-6 w-6" />
              </div>
              <p class="mt-3 font-bold text-slate-800 text-sm">QRIS belum ditambahkan</p>
              <p class="mt-1 text-xs text-slate-500">
                Letakkan aset QRIS di <code class="rounded bg-white px-1.5 py-0.5 border border-slate-200 text-slate-700">public/qris.jpg</code>.
              </p>
            </div>
          </div>
        </div>

        <p class="mt-4 text-center text-xs text-slate-400">
          Dukung semua aplikasi pembayaran berstandar QRIS Nasional.
        </p>
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
            Pastikan membayar sesuai tarif iuran kas kelas yang telah disepakati bersama.
          </p>
        </div>

        <div class="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-300">2</span>
            <p class="font-bold text-white text-sm">Catatan Berita</p>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-300">
            Tuliskan Nama Mahasiswa dan Periode (misal: "Budi - Kas Bulan Nov") di berita transfer.
          </p>
        </div>

        <div class="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div class="flex items-center gap-2">
            <span class="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-300">3</span>
            <p class="font-bold text-white text-sm">Konfirmasi Bukti</p>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-slate-300">
            Kirimkan tangkapan layar bukti transfer ke bendahara agar status diubah menjadi Lunas.
          </p>
        </div>
      </div>
    </section>

    <!-- Zoom Lightbox Modal for QRIS -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="zoomModal" 
        class="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
        @click.self="zoomModal = false"
      >
        <div class="relative max-w-sm w-full rounded-3xl bg-white p-6 shadow-2xl">
          <button 
            type="button" 
            class="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            @click="zoomModal = false"
          >
            <X class="h-4 w-4" />
          </button>
          <div class="text-center">
            <h3 class="font-extrabold text-slate-900 text-lg">Pindai QRIS</h3>
            <p class="text-xs text-slate-500 mt-1">Arahkan kamera e-wallet atau m-banking Anda</p>
            <div class="mt-4 p-2 border border-slate-200 rounded-2xl bg-slate-50">
              <img :src="qrisImageUrl" alt="QRIS zoom" class="w-full rounded-xl object-contain max-h-80" />
            </div>
            <button 
              type="button" 
              class="btn-primary mt-4 w-full"
              @click="zoomModal = false"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
