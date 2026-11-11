<script setup>
defineProps({
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
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
    <div v-if="records.length" class="overflow-x-auto">
      <table class="w-full min-w-[760px] text-left text-sm">
        <thead class="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" class="px-5 py-4">Mahasiswa</th>
            <th scope="col" class="px-5 py-4">Periode</th>
            <th scope="col" class="px-5 py-4">Nominal</th>
            <th scope="col" class="px-5 py-4">Status</th>
            <th scope="col" class="px-5 py-4">Tanggal bayar</th>
            <th v-if="showActions" scope="col" class="px-5 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(record, index) in records" :key="recordId(record) ?? `${record.nim}-${record.periode}-${index}`" class="transition hover:bg-slate-50/70">
            <td class="px-5 py-4">
              <p class="font-bold text-slate-900">{{ record.nama || '—' }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ record.nim || 'NIM tidak tersedia' }}</p>
            </td>
            <td class="px-5 py-4 font-medium text-slate-600">{{ record.periode || '—' }}</td>
            <td class="px-5 py-4 font-semibold text-slate-800">{{ formatCurrency(record.nominal) }}</td>
            <td class="px-5 py-4">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                :class="record.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="record.status === 'Lunas' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                {{ record.status || 'Belum Lunas' }}
              </span>
            </td>
            <td class="px-5 py-4 text-slate-500">{{ formatDate(record.tanggalBayar) }}</td>
            <td v-if="showActions" class="px-5 py-4">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  :aria-label="`Edit data kas ${record.nama || record.nim}`"
                  @click="$emit('edit', record)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-rose-100 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                  :aria-label="`Hapus data kas ${record.nama || record.nim}`"
                  @click="$emit('delete', record)"
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="grid min-h-56 place-items-center px-6 py-12 text-center">
      <div>
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-400" aria-hidden="true">⌕</span>
        <p class="mt-4 font-bold text-slate-800">Belum ada data yang cocok</p>
        <p class="mt-1 text-sm text-slate-500">Coba ubah kata pencarian atau filter status.</p>
      </div>
    </div>
    <p class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
      Menampilkan {{ records.length }} data kas
    </p>
  </div>
</template>
