<script setup>
import { computed } from 'vue'
import { Coins, Trash2, Calendar, FileText, ArrowUpRight } from 'lucide-vue-next'

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  totalNominal: {
    type: Number,
    default: 0,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['delete'])

const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

const categoryColors = {
  'Sisa Semester Lalu': 'bg-teal-50 text-teal-800 border-teal-200',
  'Sponsor': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Dana Usaha': 'bg-sky-50 text-sky-800 border-sky-200',
  'Donasi': 'bg-amber-50 text-amber-800 border-amber-200',
  'Lainnya': 'bg-slate-50 text-slate-800 border-slate-200',
}
</script>

<template>
  <div class="space-y-3">
    <!-- Header Title & Context -->
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="grid h-6 w-6 place-items-center rounded-lg bg-teal-100 text-teal-700">
            <Coins class="h-3.5 w-3.5" />
          </span>
          <h3 class="text-base font-extrabold text-slate-900">
            Dana Masuk Non-Iuran (Luar Absensi Mahasiswa)
          </h3>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Pemasukan tambahan seperti sisa saldo semester lalu, sponsor, dan hasil dana usaha.
        </p>
      </div>

      <!-- Subtotal badge -->
      <div class="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200/80 shadow-sm">
        <span>Total Non-Iuran:</span>
        <strong class="font-mono text-emerald-700">{{ formatCurrency(totalNominal) }}</strong>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div v-if="records.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <tr>
              <th scope="col" class="w-12 px-3 py-3 text-center">No</th>
              <th scope="col" class="px-4 py-3">Sumber Dana / Judul</th>
              <th scope="col" class="px-4 py-3">Kategori</th>
              <th scope="col" class="px-4 py-3">Tanggal Masuk</th>
              <th scope="col" class="px-4 py-3 text-right">Nominal</th>
              <th scope="col" class="px-4 py-3">Catatan / Keterangan</th>
              <th v-if="showActions" scope="col" class="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(item, index) in records"
              :key="item._id || index"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-3 py-3 text-center font-mono font-bold text-slate-400">
                {{ index + 1 }}
              </td>
              <td class="px-4 py-3 font-bold text-slate-900">
                <div class="flex items-center gap-2">
                  <ArrowUpRight class="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>{{ item.judul }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border"
                  :class="categoryColors[item.kategori] || categoryColors['Lainnya']"
                >
                  {{ item.kategori || 'Non-Kas' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600 font-mono text-[11px]">
                {{ formatDate(item.tanggalMasuk) }}
              </td>
              <td class="px-4 py-3 text-right font-mono font-bold text-slate-900 text-xs">
                + {{ formatCurrency(item.nominal) }}
              </td>
              <td class="px-4 py-3 text-slate-500 max-w-xs truncate" :title="item.keterangan">
                {{ item.keterangan || '—' }}
              </td>
              <td v-if="showActions" class="px-3 py-3 text-right">
                <button
                  type="button"
                  class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus pemasukan lain"
                  @click="$emit('delete', item)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="px-6 py-8 text-center text-slate-400">
        <Coins class="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p class="text-xs font-semibold text-slate-600">Tidak ada dana non-iuran di semester ini</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Seluruh dana kas pada periode ini murni bersumber dari iuran mahasiswa.</p>
      </div>
    </div>
  </div>
</template>
