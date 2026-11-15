<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from '../api/axios'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  Loader2
} from 'lucide-vue-next'

const props = defineProps({
  semesterId: {
    type: String,
    default: '',
  },
})

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0)

const formatShortCurrency = (val) => {
  const num = Number(val) || 0
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}jt`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}rb`
  }
  return String(num)
}

// Fetch analytics data
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: computed(() => ['analytics-summary', props.semesterId]),
  queryFn: async () => {
    const params = {}
    if (props.semesterId) params.semesterId = props.semesterId
    const res = await api.get('/analytics/summary', { params })
    return res.data
  },
})

const summary = computed(() => data.value || {})
const monthlyTrend = computed(() => summary.value.monthlyTrend || [])
const expenseByCategory = computed(() => summary.value.expenseByCategory || [])
const paymentProgress = computed(() => summary.value.paymentProgress || {})

// Max value for scaling monthly bar chart
const maxMonthlyValue = computed(() => {
  let max = 100_000
  monthlyTrend.value.forEach((m) => {
    if (m.pemasukan > max) max = m.pemasukan
    if (m.pengeluaran > max) max = m.pengeluaran
  })
  return max
})

// Palette warna konsisten untuk kategori belanja
const categoryColors = [
  '#0ea5e9', // Sky (Perlengkapan)
  '#8b5cf6', // Violet (Akademik & Materi)
  '#14b8a6', // Teal (Pengembalian Kas)
  '#f59e0b', // Amber (Acara & Konsumsi)
  '#ec4899', // Pink (Sosial & Santunan)
  '#64748b', // Slate (Lainnya)
]

function getCategoryColor(index) {
  return categoryColors[index % categoryColors.length]
}

// Donut circle calculations (Circumference of r=65 is 2 * PI * 65 ≈ 408.4)
const CIRCUMFERENCE = 2 * Math.PI * 65

const donutSlices = computed(() => {
  const list = expenseByCategory.value
  let accumulatedPercent = 0

  return list.map((item, idx) => {
    const percent = Number(item.persentase) || 0
    const strokeDasharray = `${(percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`
    const strokeDashoffset = -((accumulatedPercent / 100) * CIRCUMFERENCE)
    accumulatedPercent += percent

    return {
      kategori: item.kategori,
      nominal: item.nominal,
      persentase: percent,
      color: getCategoryColor(idx),
      strokeDasharray,
      strokeDashoffset,
    }
  })
})

const totalExpense = computed(() => {
  return expenseByCategory.value.reduce((acc, curr) => acc + (curr.nominal || 0), 0)
})

// Active hover state for bar chart tooltip
const activeBar = ref(null)
</script>

<template>
  <div class="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-card space-y-6">
    <!-- Header Charts -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <BarChart3 class="h-4 w-4 stroke-[2.2]" />
          </span>
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
            Analitik & Tren Keuangan Kelas
          </h3>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Visualisasi arus kas bulanan, komposisi penggunaan dana, dan progres pelunasan mahasiswa.
        </p>
      </div>

      <!-- Quick Progress Pill -->
      <div v-if="paymentProgress.totalMahasiswa" class="flex items-center gap-2 rounded-2xl bg-slate-50 p-2.5 border border-slate-200/80">
        <div class="text-right">
          <p class="text-[10px] font-bold uppercase text-slate-400">Tingkat Lunas</p>
          <p class="text-xs font-black text-emerald-700">
            {{ paymentProgress.persentaseLunas }}%
            <span class="text-[11px] font-normal text-slate-500">({{ paymentProgress.lunasCount }}/{{ paymentProgress.totalMahasiswa }})</span>
          </p>
        </div>
        <div class="h-8 w-1 rounded-full bg-slate-200"></div>
        <div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Tertunggak</p>
          <p class="text-xs font-mono font-bold text-rose-600">
            {{ formatCurrency(paymentProgress.totalTertunggak) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 class="h-8 w-8 animate-spin text-emerald-600" />
      <p class="text-xs font-medium">Memuat grafik analitik keuangan...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="py-8 text-center text-rose-500 text-xs">
      <p class="font-bold">Gagal memuat analitik keuangan.</p>
      <button type="button" class="mt-2 text-xs font-bold text-emerald-600 underline" @click="refetch">
        Coba lagi
      </button>
    </div>

    <!-- Charts Grid Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 1. Monthly Cashflow Bar Chart (Left 7 Cols) -->
      <div class="lg:col-span-7 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <TrendingUp class="h-4 w-4 text-emerald-600" />
            <span>Arus Kas Bulanan (Masuk vs Keluar)</span>
          </div>
          <!-- Legend -->
          <div class="flex items-center gap-3 text-[11px] font-bold">
            <span class="flex items-center gap-1.5 text-emerald-700">
              <span class="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
              Pemasukan
            </span>
            <span class="flex items-center gap-1.5 text-rose-600">
              <span class="h-2.5 w-2.5 rounded-sm bg-rose-500"></span>
              Pengeluaran
            </span>
          </div>
        </div>

        <!-- SVG Bar Chart -->
        <div class="relative w-full overflow-x-auto">
          <div class="min-w-[320px]">
            <svg viewBox="0 0 540 220" class="w-full h-auto overflow-visible select-none">
              <!-- Horizontal Grid Lines -->
              <line x1="40" y1="20" x2="520" y2="20" stroke="#e2e8f0" stroke-dasharray="3 3" />
              <line x1="40" y1="80" x2="520" y2="80" stroke="#e2e8f0" stroke-dasharray="3 3" />
              <line x1="40" y1="140" x2="520" y2="140" stroke="#e2e8f0" stroke-dasharray="3 3" />
              <line x1="40" y1="180" x2="520" y2="180" stroke="#cbd5e1" stroke-width="1.5" />

              <!-- Y-Axis Labels -->
              <text x="35" y="24" text-anchor="end" font-size="9" fill="#94a3b8" font-family="monospace">
                {{ formatShortCurrency(maxMonthlyValue) }}
              </text>
              <text x="35" y="84" text-anchor="end" font-size="9" fill="#94a3b8" font-family="monospace">
                {{ formatShortCurrency(maxMonthlyValue * 0.6) }}
              </text>
              <text x="35" y="144" text-anchor="end" font-size="9" fill="#94a3b8" font-family="monospace">
                {{ formatShortCurrency(maxMonthlyValue * 0.25) }}
              </text>
              <text x="35" y="184" text-anchor="end" font-size="9" fill="#94a3b8" font-family="monospace">
                0
              </text>

              <!-- Bars grouped per month -->
              <g
                v-for="(item, idx) in monthlyTrend"
                :key="item.month"
                :transform="`translate(${70 + idx * ((500 - 70) / Math.max(1, monthlyTrend.length))}, 0)`"
                class="cursor-pointer group"
                @mouseenter="activeBar = item"
                @mouseleave="activeBar = null"
              >
                <!-- Income Bar (Green) -->
                <rect
                  :x="-18"
                  :y="180 - Math.max(4, (item.pemasukan / maxMonthlyValue) * 160)"
                  width="16"
                  :height="Math.max(4, (item.pemasukan / maxMonthlyValue) * 160)"
                  rx="3"
                  fill="#10b981"
                  class="transition-all duration-200 group-hover:brightness-110"
                />

                <!-- Expense Bar (Red) -->
                <rect
                  :x="2"
                  :y="180 - Math.max(4, (item.pengeluaran / maxMonthlyValue) * 160)"
                  width="16"
                  :height="Math.max(4, (item.pengeluaran / maxMonthlyValue) * 160)"
                  rx="3"
                  fill="#f43f5e"
                  class="transition-all duration-200 group-hover:brightness-110"
                />

                <!-- X Axis Label (Month Name) -->
                <text
                  x="0"
                  y="200"
                  text-anchor="middle"
                  font-size="10"
                  font-weight="bold"
                  fill="#64748b"
                >
                  {{ item.label.split(' ')[0] }}
                </text>
                <text
                  x="0"
                  y="212"
                  text-anchor="middle"
                  font-size="8"
                  fill="#94a3b8"
                >
                  {{ item.label.split(' ')[1] || '' }}
                </text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Tooltip Card when hovering a month -->
        <div
          v-if="activeBar"
          class="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200 text-xs shadow-sm transition-all"
        >
          <span class="font-bold text-slate-800">{{ activeBar.label }}</span>
          <div class="flex items-center gap-3">
            <span class="font-mono text-emerald-700 font-bold">
              + {{ formatCurrency(activeBar.pemasukan) }}
            </span>
            <span class="font-mono text-rose-600 font-bold">
              - {{ formatCurrency(activeBar.pengeluaran) }}
            </span>
          </div>
        </div>
        <div v-else class="text-[11px] text-slate-400 text-center italic">
          Arahkan mouse / sentuh batang bulan untuk melihat rincian angka kas.
        </div>
      </div>

      <!-- 2. Expense Category Donut Chart (Right 5 Cols) -->
      <div class="lg:col-span-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <PieChartIcon class="h-4 w-4 text-sky-600" />
            <span>Kategori Pengeluaran Kelas</span>
          </div>
          <span class="font-mono text-[11px] font-bold text-slate-600">
            {{ formatCurrency(totalExpense) }}
          </span>
        </div>

        <!-- Donut Visual & Legend Stack -->
        <div class="flex flex-col sm:flex-row lg:flex-col items-center gap-4">
          <!-- Donut SVG -->
          <div class="relative shrink-0">
            <svg width="150" height="150" viewBox="0 0 170 170" class="rotate-[-90deg]">
              <!-- Background Ring -->
              <circle
                cx="85"
                cy="85"
                r="65"
                fill="none"
                stroke="#e2e8f0"
                stroke-width="22"
              />
              <!-- Slices -->
              <circle
                v-for="slice in donutSlices"
                :key="slice.kategori"
                cx="85"
                cy="85"
                r="65"
                fill="none"
                :stroke="slice.color"
                stroke-width="22"
                :stroke-dasharray="slice.strokeDasharray"
                :stroke-dashoffset="slice.strokeDashoffset"
                stroke-linecap="butt"
                class="transition-all duration-500 hover:opacity-85"
              />
            </svg>
            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Belanja</span>
              <span class="text-xs font-black text-slate-800 font-mono mt-0.5">
                {{ formatShortCurrency(totalExpense) }}
              </span>
            </div>
          </div>

          <!-- Category Legend List -->
          <div class="w-full space-y-2 text-xs divide-y divide-slate-100">
            <div
              v-for="cat in donutSlices"
              :key="cat.kategori"
              class="flex items-center justify-between pt-1.5 first:pt-0"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="h-2.5 w-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: cat.color }"
                ></span>
                <span class="font-medium text-slate-700 truncate" :title="cat.kategori">
                  {{ cat.kategori }}
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="font-mono text-[11px] font-bold text-slate-900">
                  {{ formatCurrency(cat.nominal) }}
                </span>
                <span class="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {{ cat.persentase }}%
                </span>
              </div>
            </div>

            <!-- Empty category state -->
            <div v-if="donutSlices.length === 0" class="py-4 text-center text-slate-400 text-xs">
              Belum ada data pengeluaran pada semester ini.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
