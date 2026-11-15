import { ref, computed } from 'vue'
import api from '../api/axios'

const TOKEN_KEY = 'kaskita_bendahara_token'
const token = ref(localStorage.getItem(TOKEN_KEY) || null)
const isAuthModalOpen = ref(false)
const isLoggingIn = ref(false)
const authError = ref('')

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  async function login(pinInput) {
    if (!pinInput || !pinInput.trim()) {
      authError.value = 'PIN bendahara wajib diisi'
      return false
    }

    isLoggingIn.value = true
    authError.value = ''

    try {
      const res = await api.post('/auth/login', { pin: pinInput.trim() })
      if (res.data?.success && res.data?.token) {
        token.value = res.data.token
        localStorage.setItem(TOKEN_KEY, res.data.token)
        isAuthModalOpen.value = false
        return true
      }
      authError.value = res.data?.message || 'Login gagal, periksa kembali PIN Anda'
      return false
    } catch (err) {
      authError.value = err.response?.data?.message || 'PIN bendahara tidak sesuai'
      return false
    } finally {
      isLoggingIn.value = false
    }
  }

  function logout() {
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/'
    }
  }

  function openLoginModal() {
    authError.value = ''
    isAuthModalOpen.value = true
  }

  function closeLoginModal() {
    isAuthModalOpen.value = false
    authError.value = ''
  }

  return {
    token,
    isAuthenticated,
    isAuthModalOpen,
    isLoggingIn,
    authError,
    login,
    logout,
    openLoginModal,
    closeLoginModal,
  }
}
