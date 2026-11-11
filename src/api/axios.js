import axios from 'axios'

const defaultApiBaseUrl = import.meta.env.PROD
  ? 'https://backend-uang-kas-kampus.vercel.app/api'
  : 'http://localhost:3000/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return error.response.data.message
    if (error.response?.status === 401) return 'PIN bendahara tidak sesuai.'
    if (error.response?.status === 404) return 'Endpoint API tidak ditemukan. Periksa VITE_API_BASE_URL dan rute backend.'
    if (error.code === 'ECONNABORTED') return 'Permintaan ke server melewati batas waktu.'
    if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi dan VITE_API_BASE_URL.'
  }

  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.'
}

export default api
