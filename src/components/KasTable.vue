<script setup>
import { computed } from 'vue'
import { Pencil, Trash2, Search, Calendar, User, CheckCircle2, Clock } from 'lucide-vue-next'

const props = defineProps({
  records: { type: Array, default: () => [] },
  showActions: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function recordId(record) {
  return record._id ?? record.id
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const colorVariants = [
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-rose-100 text-rose-800 border-rose-200',
]

function getAvatarColor(str) {
  if (!str) return colorVariants[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colorVariants.length
  return colorVariants[index]
}
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition-all">
    <div v-if="records.length">
      <!-- 1. Tampilan Desktop (Tabel Interaktif) -->
      <div
        class="hidden md:block max-h-[58vh] min-w-0 overflow-auto overscroll-contain"
        role="region"
        aria-label="Daftar pembayaran kas"
        tabindex="0"
      >
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <tr>
              <th scope="col" class="px-5 py-3.5">Mahasiswa</th>
              <th scope="col" class="px-5 py-3.5">Periode</th>
              <th scope="col" class="px-5 py-3.5">Nominal</th>
              <th scope="col" class="px-5 py-3.5">Status</th>
              <th scope="col" class="px-5 py-3.5">Tanggal Bayar</th>
              <th v-if="showActions" scope="col" class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(record, index) in records"
              :key="recordId(record) ?? `${record.nim}-${record.periode}-${index}`"
              class="group transition-colors duration-150 hover:bg-slate-50/80"
            >
              <!-- Mahasiswa info with Avatar -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-xs font-bold shadow-sm transition-transform group-hover:scale-105"
                    :class="getAvatarColor(record.nama || record.nim)"
                  >
                    {{ getInitials(record.nama) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {{ record.nama || '—' }}
                    </p>
                    <p class="text-xs font-medium text-slate-500 font-mono">
                      {{ record.nim || 'NIM tidak tersedia' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Periode -->
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Calendar class="h-3 w-3 text-slate-500" />
                  {{ record.periode || '—' }}
                </span>
              </td>

              <!-- Nominal -->
              <td class="px-5 py-4 font-bold text-slate-900 font-mono">
                {{ formatCurrency(record.nominal) }}
              </td>

              <!-- Status Badge -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm"
                  :class="record.status === 'Lunas' 
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                    : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'"
                >
                  <component
                    :is="record.status === 'Lunas' ? CheckCircle2 : Clock"
                    class="h-3.5 w-3.5"
                    :class="record.status === 'Lunas' ? 'text-emerald-600' : 'text-amber-600'"
                  />
                  {{ record.status || 'Belum Lunas' }}
                </span>
              </td>

              <!-- Tanggal Bayar -->
              <td class="px-5 py-4 text-xs font-medium text-slate-500">
                {{ formatDate(record.tanggalBayar) }}
              </td>

              <!-- Aksi -->
              <td v-if="showActions" class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
                    :aria-label="`Edit data kas ${record.nama || record.nim}`"
                    @click="$emit('edit', record)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-95"
                    :aria-label="`Hapus data kas ${record.nama || record.nim}`"
                    @click="$emit('delete', record)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. Tampilan Mobile (Stacked Cards View) -->
      <div class="block md:hidden divide-y divide-slate-100 max-h-[65vh] overflow-y-auto p-2 space-y-2">
        <article
          v-for="(record, index) in records"
          :key="recordId(record) ?? `mob-${record.nim}-${record.periode}-${index}`"
          class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:bg-white hover:shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-xs font-bold shadow-sm"
                :class="getAvatarColor(record.nama || record.nim)"
              >
                {{ getInitials(record.nama) }}
              </div>
              <div class="min-w-0">
                <p class="font-bold text-slate-900 truncate">{{ record.nama || '—' }}</p>
                <p class="text-xs font-medium text-slate-500 font-mono">{{ record.nim || 'NIM tidak tersedia' }}</p>
              </div>
            </div>

            <!-- Status Badge -->
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
              :class="record.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'"
            >
              <component
                :is="record.status === 'Lunas' ? CheckCircle2 : Clock"
                class="h-3 w-3"
                :class="record.status === 'Lunas' ? 'text-emerald-600' : 'text-amber-600'"
              />
              {{ record.status || 'Belum Lunas' }}
            </span>
          </div>

          <!-- Detail Metrics -->
          <div class="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 text-xs">
            <div>
              <span class="text-slate-400">Periode:</span>
              <p class="font-semibold text-slate-700 mt-0.5">{{ record.periode || '—' }}</p>
            </div>
            <div>
              <span class="text-slate-400">Nominal:</span>
              <p class="font-bold text-slate-900 font-mono mt-0.5">{{ formatCurrency(record.nominal) }}</p>
            </div>
            <div class="col-span-2 text-slate-500 flex items-center gap-1">
              <Calendar class="h-3 w-3 text-slate-400" />
              <span>Dibayar: {{ formatDate(record.tanggalBayar) }}</span>
            </div>
          </div>

          <!-- Mobile Actions -->
          <div v-if="showActions" class="mt-3 flex items-center justify-end gap-2 border-t border-slate-200/60 pt-2.5">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm active:scale-95"
              @click="$emit('edit', record)"
            >
              <Pencil class="h-3.5 w-3.5 text-slate-500" />
              Edit
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm active:scale-95"
              @click="$emit('delete', record)"
            >
              <Trash2 class="h-3.5 w-3.5 text-rose-500" />
              Hapus
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="grid min-h-60 place-items-center px-6 py-12 text-center">
      <div class="max-w-xs">
        <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner">
          <Search class="h-6 w-6" />
        </div>
        <p class="mt-4 font-extrabold text-slate-800 text-base">Tidak ada data ditemukan</p>
        <p class="mt-1 text-xs text-slate-500 leading-relaxed">
          Coba sesuaikan kata kunci pencarian nama/NIM atau ubah filter status pembayaran.
        </p>
      </div>
    </div>

    <!-- Bottom Footer Count -->
    <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
      <span class="font-medium">Menampilkan <strong class="text-slate-700 font-bold">{{ records.length }}</strong> catatan kas</span>
      <span class="hidden sm:inline text-slate-400 font-mono text-[11px]">KasKita Data Grid</span>
    </div>
  </div>
</template>
