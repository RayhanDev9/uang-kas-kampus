<script setup>
import { computed } from 'vue'
import { 
  TrendingUp, 
  CheckCircle2, 
  Coins, 
  Target, 
  Sparkles, 
  Layers 
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
const totalSaldoKonsolidasi = computed(() => {
  // If backend already calculated consolidated totalSaldo, use it; otherwise sum
  if (props.summary.totalKasLunas !== undefined && props.summary.totalPemasukanLain !== undefined) {
    return Number(props.summary.totalSaldo) || (kasMahasiswaSaldo.value + nonKasSaldo.value)
  }
  return kasMahasiswaSaldo.value + nonKasSaldo.value
})
</script>

<template>
  <div class="space-y-4">
    <section class="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Ringkasan kas">
      <!-- Card 1: Total Saldo Terkonsolidasi (Hero Card) -->
      <article class="group relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
        <!-- Ambient shapes -->
        <div class="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-emerald-500/20 blur-xl transition-all duration-500 group-hover:scale-125"></div>
        <div class="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-teal-400/10 blur-lg"></div>

        <div class="relative flex flex-col justify-between h-full">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <Sparkles class="h-3.5 w-3.5 text-emerald-300" />
              Total Saldo Terkonsolidasi
            </span>
            <div class="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <TrendingUp class="h-5 w-5 text-emerald-100" />
            </div>
          </div>

          <div class="mt-6">
            <p class="text-3xl font-black tracking-tight text-white lg:text-4xl">
              {{ formatCurrency(totalSaldoKonsolidasi) }}
            </p>
            <div class="mt-3 flex items-center justify-between text-xs text-emerald-100/90 border-t border-white/10 pt-3">
              <span>Kas Mhs + Non-Kas</span>
              <span class="inline-flex items-center gap-1 font-semibold text-emerald-200">
                <Target class="h-3.5 w-3.5" />
                {{ completionRate }}% target lunas
              </span>
            </div>
          </div>
        </div>
      </article>

      <!-- Card 2: Iuran Kas Mahasiswa -->
      <article class="group min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/80 hover:shadow-card-hover">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Iuran Mahasiswa</span>
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-200 group-hover:bg-emerald-100">
            <CheckCircle2 class="h-5 w-5" />
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-baseline justify-between">
            <p class="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">
              {{ formatCurrency(kasMahasiswaSaldo) }}
            </p>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {{ totalLunas }} Lunas
            </span>
          </div>

          <!-- Mini Progress Bar -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Kepatuhan Pembayaran</span>
              <span class="font-bold text-emerald-600">{{ totalLunas }} / {{ totalStudents }} Mhs</span>
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

      <!-- Card 3: Pemasukan Non-Kas (Sisa Semester Lalu, Sponsor, dll) -->
      <article class="group min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/80 hover:shadow-card-hover">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Pemasukan Non-Kas</span>
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-600 transition-colors duration-200 group-hover:bg-teal-100">
            <Coins class="h-5 w-5" />
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-baseline justify-between">
            <p class="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">
              {{ formatCurrency(nonKasSaldo) }}
            </p>
            <span class="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              Dana Eksternal
            </span>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Sisa semester lalu & sponsor</span>
            <span class="inline-flex items-center gap-1 font-bold text-teal-700">
              <Layers class="h-3 w-3" />
              Non-iuran
            </span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
