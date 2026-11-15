<script setup>
import { ref, computed, watch } from 'vue'
import {
  X,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Users,
  Wallet,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  semester: {
    type: Object,
    default: () => ({}),
  },
  students: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close'])

const STORAGE_KEY_REK = 'kaskita_wa_rekening'
const STORAGE_KEY_MSG = 'kaskita_wa_pesan'

const catatanRekening = ref(
  localStorage.getItem(STORAGE_KEY_REK) ||
    '💳 Transfer Bank: BCA 1234567890 (a.n Bendahara)\n📱 e-Wallet: DANA / GoPay 081234567890'
)

const pesanTambahan = ref(
  localStorage.getItem(STORAGE_KEY_MSG) ||
    'Mohon kerja samanya untuk segera melunasi iuran kas demi kelancaran kegiatan kelas kita. Terima kasih banyak! 🙏✨'
)

const copied = ref(false)
const showSettings = ref(false)

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0)

// Target kas per mahasiswa
const targetKas = computed(() => {
  return Number(props.semester?.targetKasPerMhs) || 50000
})

// Daftar mahasiswa yang belum lunas
const unpaidStudents = computed(() => {
  const list = Array.isArray(props.students) ? props.students : []
  return list
    .filter((s) => {
      const nominal = Number(s.nominal) || 0
      return s.status !== 'Lunas' || nominal < targetKas.value
    })
    .sort((a, b) => {
      const namaA = (a.nama || '').trim().toLowerCase()
      const namaB = (b.nama || '').trim().toLowerCase()
      return namaA.localeCompare(namaB, 'id', { sensitivity: 'base' })
    })
})

// Total nominal dana yang masih tertunggak
const totalTertunggak = computed(() => {
  return unpaidStudents.value.reduce((sum, s) => {
    const kurang = Math.max(0, targetKas.value - (Number(s.nominal) || 0))
    return sum + kurang
  }, 0)
})

// Format pesan WhatsApp terstruktur
const generatedMessage = computed(() => {
  const semesterNama = props.semester?.nama || 'Semester Aktif'
  const list = unpaidStudents.value

  let text = `📢 *PENGINGAT IURAN KAS KELAS*\n`
  text += `*Semester:* ${semesterNama}\n`
  text += `*Target Kas:* ${formatCurrency(targetKas.value)} / mahasiswa\n\n`

  if (list.length === 0) {
    text += `🎉 *Luar Biasa! Seluruh mahasiswa sudah LUNAS 100%!* Terima kasih atas partisipasi teman-teman semua! 🙌✨\n`
    return text
  }

  text += `Halo teman-teman! Berikut rekap mahasiswa yang status iuran kasnya *belum lunas*:\n\n`

  list.forEach((mhs, idx) => {
    const bayar = Number(mhs.nominal) || 0
    const kurang = Math.max(0, targetKas.value - bayar)
    if (bayar > 0) {
      text += `${idx + 1}. *${mhs.nama}* — Kurang ${formatCurrency(kurang)} (Sudah bayar ${formatCurrency(bayar)})\n`
    } else {
      text += `${idx + 1}. *${mhs.nama}* — Kurang ${formatCurrency(kurang)} (Belum bayar)\n`
    }
  })

  text += `\n📊 *Total Belum Lunas:* ${list.length} Mahasiswa\n`
  text += `💰 *Total Tagihan Tertunggak:* ${formatCurrency(totalTertunggak.value)}\n\n`

  if (catatanRekening.value.trim()) {
    text += `*Metode Pembayaran (Tunai / Transfer):*\n${catatanRekening.value.trim()}\n\n`
  }

  if (pesanTambahan.value.trim()) {
    text += `${pesanTambahan.value.trim()}\n`
  }

  return text
})

// Simpan preferensi rekening/pesan ke localStorage
watch([catatanRekening, pesanTambahan], ([newRek, newMsg]) => {
  localStorage.setItem(STORAGE_KEY_REK, newRek)
  localStorage.setItem(STORAGE_KEY_MSG, newMsg)
})

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(generatedMessage.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    // Fallback manual jika clipboard API terhalang
    const textArea = document.createElement('textarea')
    textArea.value = generatedMessage.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  }
}

function openWhatsApp() {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(generatedMessage.value)}`
  window.open(url, '_blank')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto"
        role="presentation"
        @click.self="emit('close')"
        @keydown.esc="emit('close')"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl ring-1 ring-slate-900/10 my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="broadcast-modal-title"
        >
          <!-- Tombol Tutup X -->
          <button
            type="button"
            class="absolute top-5 right-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Tutup modal tagihan WhatsApp"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>

          <!-- Header Dialog -->
          <div class="flex items-start gap-3.5 pr-8">
            <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <MessageSquare class="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles class="h-3 w-3" />
                Format WhatsApp Siap Kirim
              </span>
              <h3 id="broadcast-modal-title" class="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                Broadcast Tagihan Kas Kelas
              </h3>
            </div>
          </div>

          <!-- Summary Strip -->
          <div class="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
            <div>
              <p class="text-[10px] font-bold uppercase text-slate-400">Belum Lunas</p>
              <p class="text-sm font-extrabold text-slate-900 mt-0.5">
                {{ unpaidStudents.length }} Mahasiswa
              </p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase text-slate-400">Total Tertunggak</p>
              <p class="text-sm font-mono font-extrabold text-rose-600 mt-0.5">
                {{ formatCurrency(totalTertunggak) }}
              </p>
            </div>
          </div>

          <!-- Box Preview Pesan WhatsApp -->
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between">
              <label for="wa-preview" class="text-xs font-bold text-slate-700">
                Pratinjau Pesan yang Akan Dikirim:
              </label>
              <span class="text-[10px] text-slate-400 font-medium">Auto-format Markdown WA</span>
            </div>
            <textarea
              id="wa-preview"
              :value="generatedMessage"
              readonly
              rows="8"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed resize-none shadow-inner select-all"
            ></textarea>
          </div>

          <!-- Pengaturan Rekening & Pesan Tambahan (Collapsible) -->
          <div class="mt-3.5 border-t border-slate-100 pt-3">
            <button
              type="button"
              class="flex w-full items-center justify-between text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors py-1"
              @click="showSettings = !showSettings"
            >
              <span class="flex items-center gap-1.5">
                <Wallet class="h-3.5 w-3.5 text-slate-400" />
                Kustomisasi Info Rekening & Catatan Bendahara
              </span>
              <component :is="showSettings ? ChevronUp : ChevronDown" class="h-4 w-4 text-slate-400" />
            </button>

            <div v-if="showSettings" class="mt-2.5 space-y-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                  Info Rekening Bank / e-Wallet (Tersimpan otomatis):
                </label>
                <textarea
                  v-model="catatanRekening"
                  rows="2"
                  class="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="Contoh: BCA 1234567890 (a.n Bendahara)..."
                ></textarea>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">
                  Pesan Penutup Tambahan:
                </label>
                <textarea
                  v-model="pesanTambahan"
                  rows="2"
                  class="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="Contoh: Batas pelunasan minggu ini ya teman-teman..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi Bawah -->
          <div class="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              @click="copyToClipboard"
            >
              <Check v-if="copied" class="h-4 w-4 text-emerald-600 stroke-[2.5]" />
              <Copy v-else class="h-4 w-4 text-slate-500" />
              <span>{{ copied ? 'Tersalin ke Clipboard!' : 'Salin Teks' }}</span>
            </button>

            <button
              type="button"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              @click="openWhatsApp"
            >
              <ExternalLink class="h-4 w-4 stroke-[2.2]" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
