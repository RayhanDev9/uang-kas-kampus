<script setup>
import { computed } from 'vue'
import { 
  TrendingUp, 
  CheckCircle2, 
  Coins, 
  Target, 
  Sparkles, 
  Layers,
  Receipt,
  ArrowDownRight
} from 'lucide-vue-next'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  pemasukanLainNominal: {
    type: Number,
    default: 0,
  },
  pengeluaranNominal: {
    type: Number,
    default: 0,
  },
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const totalLunas = computed(() => Number(props.summary.totalLunas) || 0)
const totalBelumLunas = computed(() => Number(props.summary.totalBelumLunas) || 0)
const totalStudents = computed(() => totalLunas.value + totalBelumLunas.value)
const completionRate = computed(() => {
  if (totalStudents.value === 0) return 0
  return Math.round((totalLunas.value / totalStudents.value) * 100)
})

const kasMahasiswaSaldo = computed(() => Number(props.summary.totalKasLunas ?? props.summary.totalSaldo) || 0)
const nonKasSaldo = computed(() => Number(props.summary.totalPemasukanLain ?? props.pemasukanLainNominal) || 0)

const totalPemasukan = computed(() => {
  if (props.summary.totalPemasukan !== undefined && props.summary.totalPemasukan !== null) {
    return Number(props.summary.totalPemasukan)
  }
  return kasMahasiswaSaldo.value + nonKasSaldo.value
})

const totalPengeluaran = computed(() => {
  if (props.summary.totalPengeluaran !== undefined && props.summary.totalPengeluaran !== null) {
    return Number(props.summary.totalPengeluaran)
  }
  return Number(props.pengeluaranNominal) || 0
})

const saldoBersih = computed(() => {
  if (props.summary.saldoBersih !== undefined && props.summary.saldoBersih !== null) {
    return Number(props.summary.saldoBersih)
  }
  return totalPemasukan.value - totalPengeluaran.value
})
</script>

<template>
  <div class="space-y-4">
    <section class="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Ringkasan kas">
      <!-- Card 1: Saldo Kas Riil / Bersih Saat Ini (Hero Card) -->
      <article class="group relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
        <!-- Ambient shapes -->
        <div class="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-emerald-500/20 blur-xl transition-all duration-500 group-hover:scale-125"></div>
        <div class="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-teal-400/10 blur-lg"></div>

        <div class="relative flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <Sparkles class="h-3.5 w-3.5 text-emerald-300" />
              Saldo Bersih Kas
            </span>
            <div class="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <TrendingUp class="h-5 w-5 text-emerald-100" />
            </div>
          </div>

          <div class="mt-6">
            <p class="text-3xl font-black tracking-tight text-white lg:text-4xl">
              {{ formatCurrency(saldoBersih) }}
            </p>
            <div class="mt-3 flex items-center justify-between text-xs text-emerald-100/90 border-t border-white/10 pt-3">
              <span class="truncate pr-2" :title="`Masuk: ${formatCurrency(totalPemasukan)} | Keluar: ${formatCurrency(totalPengeluaran)}`">
                Masuk: {{ formatCurrency(totalPemasukan) }}
              </span>
              <span class="inline-flex items-center gap-1 font-semibold text-emerald-200 shrink-0">
                <Target class="h-3.5 w-3.5" />
                {{ completionRate }}% target lunas
              </span>
            </div>
          </div>
        </div>
      </article>

      <!-- Card 2: Total Akumulasi Pemasukan (Iuran Mhs + Non-Kas) -->
      <article class="group min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/80 hover:shadow-card-hover">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pemasukan</span>
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-200 group-hover:bg-emerald-100">
            <Coins class="h-5 w-5" />
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-baseline justify-between">
            <p class="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">
              {{ formatCurrency(totalPemasukan) }}
            </p>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {{ totalLunas }} Lunas
            </span>
          </div>

          <!-- Mini Progress Bar & Breakdown -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Iuran: {{ formatCurrency(kasMahasiswaSaldo) }}</span>
              <span class="font-bold text-teal-700">Non-Kas: {{ formatCurrency(nonKasSaldo) }}</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
                :style="{ width: `${completionRate}%` }"
              ></div>
            </div>
          </div>
        </div>
      </article>

      <!-- Card 3: Total Pengeluaran (Cash Out / Belanja Kelas) -->
      <article class="group min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-rose-300/80 hover:shadow-card-hover">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengeluaran</span>
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600 transition-colors duration-200 group-hover:bg-rose-100">
            <Receipt class="h-5 w-5" />
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-baseline justify-between">
            <p class="text-2xl font-black tracking-tight text-rose-600 lg:text-3xl">
              {{ formatCurrency(totalPengeluaran) }}
            </p>
            <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ArrowDownRight class="h-3 w-3" />
              Cash Out
            </span>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Belanja & keperluan kelas</span>
            <span class="inline-flex items-center gap-1 font-bold text-rose-600">
              <Layers class="h-3 w-3" />
              Pengeluaran
            </span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
