<script setup>
import { computed } from 'vue'
import {
  X,
  Receipt,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  HandCoins,
  FileText,
  Tag,
  ShieldCheck,
  MessageSquare
} from 'lucide-vue-next'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: null }
})

const emit = defineEmits(['close'])

function shareReceiptWA() {
  if (!props.item) return
  const item = props.item
  const nama = item.nama || 'Mahasiswa'
  const nim = item.nim || '251*********'
  const nominal = formatCurrency(item.nominal || 0)
  const status = item.statusBaru || (item.aksi === 'EXPENSE_CREATE' ? 'Pengeluaran' : 'Lunas')

  let text = `🧾 *BUKTI TRANSAKSI KAS KELAS*\n`
  text += `================================\n`
  text += `*Nama:* ${nama}\n`
  if (nim && nim !== '-') {
    text += `*NIM:* ${nim}\n`
  }
  text += `*Nominal:* ${nominal}\n`
  text += `*Status:* ${status}\n`
  if (item.keterangan) {
    text += `*Keterangan:* ${item.keterangan}\n`
  }
  if (item.waktu) {
    text += `*Waktu:* ${formatFullDate(item.waktu)}\n`
  }
  text += `\n_Dicatat resmi oleh Sistem Buku Kas Kelas_\n_Terima kasih! 🙌✨_`

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(val) || 0)

function formatFullDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date)
}

const typeInfo = computed(() => {
  if (!props.item) return { label: 'Aktivitas', icon: Receipt, color: 'emerald' }

  const action = props.item.aksi
  const isRefund =
    props.item.isRefund ||
    props.item.dataSnapshot?.kategori === 'Pengembalian Kas' ||
    (props.item.keterangan && props.item.keterangan.toLowerCase().includes('pengembalian'))

  if (isRefund) {
    return {
      label: 'Pengembalian Kas (Refund)',
      icon: HandCoins,
      color: 'teal',
      sign: '↺',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
    }
  }

  if (action === 'EXPENSE_CREATE') {
    return {
      label: 'Pengeluaran / Belanja Kelas',
      icon: ArrowDownRight,
      color: 'rose',
      sign: '-',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }

  if (action === 'CREATE' || action === 'IMPORT_EXCEL') {
    return {
      label: 'Penerimaan Iuran Kas',
      icon: ArrowUpRight,
      color: 'emerald',
      sign: '+',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }

  return {
    label: 'Perubahan Data / Absensi',
    icon: CheckCircle2,
    color: 'sky',
    sign: '',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show && item"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-receipt-title"
        @click.self="emit('close')"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Close Button -->
          <button
            type="button"
            class="absolute top-5 right-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Top Badge & Header -->
          <div class="flex items-center gap-3">
            <div
              class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-sm"
              :class="typeInfo.badgeClass"
            >
              <component :is="typeInfo.icon" class="w-6 h-6" />
            </div>
            <div>
              <span
                class="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border"
                :class="typeInfo.badgeClass"
              >
                {{ typeInfo.label }}
              </span>
              <h3 id="modal-receipt-title" class="text-base font-extrabold text-slate-900 mt-1">
                {{ item.nama }}
              </h3>
            </div>
          </div>

          <!-- Nominal Display -->
          <div class="mt-5 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 text-center">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nominal Transaksi
            </p>
            <div
              class="text-2xl sm:text-3xl font-black font-mono mt-1"
              :class="{
                'text-emerald-600': typeInfo.color === 'emerald',
                'text-rose-600': typeInfo.color === 'rose',
                'text-teal-600': typeInfo.color === 'teal',
                'text-slate-800': typeInfo.color === 'sky'
              }"
            >
              <span v-if="typeInfo.sign">{{ typeInfo.sign }} </span>
              {{ formatCurrency(item.nominal || 0) }}
            </div>
            <p v-if="item.statusBaru" class="text-xs font-semibold text-slate-600 mt-1 flex items-center justify-center gap-1.5">
              <span>Status Pelunasan:</span>
              <span
                class="inline-block rounded px-2 py-0.5 text-[11px] font-bold"
                :class="item.statusBaru === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ item.statusBaru }}
              </span>
            </p>
          </div>

          <!-- Details Grid -->
          <div class="mt-5 space-y-3 divide-y divide-slate-100 text-xs">
            <!-- Tanggal -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar class="w-3.5 h-3.5 text-slate-400" /> Waktu Transaksi
              </span>
              <span class="font-bold text-slate-800 text-right">
                {{ formatFullDate(item.waktu || item.createdAt) }}
              </span>
            </div>

            <!-- Mahasiswa / NIM -->
            <div v-if="item.nim && item.nim !== '-'" class="flex items-center justify-between pt-2.5">
              <span class="text-slate-500 flex items-center gap-1.5 font-medium">
                <Hash class="w-3.5 h-3.5 text-slate-400" /> NIM Mahasiswa
              </span>
              <span class="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {{ item.nim }}
              </span>
            </div>

            <!-- Keterangan / Deskripsi -->
            <div v-if="item.keterangan" class="pt-2.5">
              <span class="text-slate-500 flex items-center gap-1.5 font-medium mb-1">
                <FileText class="w-3.5 h-3.5 text-slate-400" /> Rincian Keterangan
              </span>
              <p class="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 leading-relaxed">
                "{{ item.keterangan }}"
              </p>
            </div>

            <!-- Perubahan Status Sebelum vs Sesudah -->
            <div v-if="item.statusLama && item.statusBaru" class="flex items-center justify-between pt-2.5">
              <span class="text-slate-500 flex items-center gap-1.5 font-medium">
                <Tag class="w-3.5 h-3.5 text-slate-400" /> Riwayat Perubahan
              </span>
              <div class="flex items-center gap-1.5 font-bold">
                <span class="text-slate-500">{{ item.statusLama }}</span>
                <span class="text-slate-400">&rarr;</span>
                <span class="text-emerald-700">{{ item.statusBaru }}</span>
              </div>
            </div>

            <!-- Audit ID -->
            <div class="flex items-center justify-between pt-2.5 text-[11px]">
              <span class="text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck class="w-3.5 h-3.5 text-slate-400" /> ID Audit Mutasi
              </span>
              <span class="font-mono text-slate-400 truncate max-w-[180px]">
                {{ item._id }}
              </span>
            </div>
          </div>

          <!-- Bottom Buttons -->
          <div class="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              class="w-full sm:w-auto rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-colors"
              @click="emit('close')"
            >
              Tutup Rincian
            </button>
            <button
              type="button"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
              @click="shareReceiptWA"
            >
              <MessageSquare class="w-4 h-4" />
              <span>Bagikan Bukti ke WA</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
