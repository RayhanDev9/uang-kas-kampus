<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Eye, EyeOff, X, ShieldAlert, Sparkles, Loader2 } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isAuthModalOpen, isLoggingIn, authError, login, closeLoginModal } = useAuth()

const pin = ref('')
const showPin = ref(false)
const pinInputRef = ref(null)

watch(
  () => isAuthModalOpen.value,
  async (isOpen) => {
    if (isOpen) {
      pin.value = ''
      showPin.value = false
      await nextTick()
      if (pinInputRef.value) {
        pinInputRef.value.focus()
      }
    }
  }
)

async function handleSubmit() {
  if (!pin.value.trim() || isLoggingIn.value) return

  const success = await login(pin.value)
  if (success) {
    pin.value = ''
    router.push('/admin')
  }
}
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
        v-if="isAuthModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        @click.self="closeLoginModal"
      >
        <div
          class="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-slate-100"
        >
          <!-- Close Button -->
          <button
            type="button"
            class="absolute top-5 right-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            @click="closeLoginModal"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Header Icon & Title -->
          <div class="flex items-center gap-3.5 mb-5">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
              <Lock class="w-6 h-6" />
            </div>
            <div>
              <h3 id="auth-modal-title" class="text-lg font-extrabold text-slate-900 tracking-tight">
                Akses Bendahara
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Masukkan PIN otorisasi untuk mengelola kas kelas
              </p>
            </div>
          </div>

          <!-- Error Alert -->
          <div
            v-if="authError"
            class="mb-4 flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 px-4 py-3 text-xs font-semibold text-rose-700 animate-shake"
          >
            <ShieldAlert class="w-4 h-4 shrink-0 text-rose-600" />
            <span>{{ authError }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="bendahara-pin-input" class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                PIN Keamanan
              </label>
              <div class="relative">
                <input
                  id="bendahara-pin-input"
                  ref="pinInputRef"
                  v-model="pin"
                  :type="showPin ? 'text' : 'password'"
                  placeholder="Masukkan 6 digit PIN"
                  autocomplete="current-password"
                  required
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 pr-11 text-sm font-semibold tracking-wider text-slate-900 transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  :title="showPin ? 'Sembunyikan PIN' : 'Lihat PIN'"
                  @click="showPin = !showPin"
                >
                  <component :is="showPin ? EyeOff : Eye" class="w-4 h-4" />
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">
                Sesi login akan disimpan di peramban ini agar tidak perlu mengisi PIN berulang kali.
              </p>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                class="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                @click="closeLoginModal"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isLoggingIn || !pin.trim()"
                class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Loader2 v-if="isLoggingIn" class="w-3.5 h-3.5 animate-spin" />
                <Sparkles v-else class="w-3.5 h-3.5" />
                <span>{{ isLoggingIn ? 'Memverifikasi...' : 'Masuk Bendahara' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
