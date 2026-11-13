import { computed, toValue } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

async function fetchPengeluaran({ semesterId, search, kategori } = {}) {
  try {
    const params = new URLSearchParams()
    if (semesterId && semesterId !== 'default-active') {
      params.set('semesterId', semesterId)
    }
    if (search && search.trim()) {
      params.set('search', search.trim())
    }
    if (kategori && kategori.trim()) {
      params.set('kategori', kategori.trim())
    }
    const query = params.toString()
    const { data } = await api.get(`/pengeluaran${query ? `?${query}` : ''}`)
    if (data?.success && Array.isArray(data.data)) {
      return data.data
    }
    return []
  } catch (err) {
    console.warn('Backend /pengeluaran belum tersedia atau error.', err)
    return []
  }
}

export function usePengeluaran(semesterIdRef, filters = {}) {
  const queryClient = useQueryClient()
  const semesterIdVal = computed(() => toValue(semesterIdRef))
  const searchVal = computed(() => toValue(filters.search) || '')
  const kategoriVal = computed(() => toValue(filters.kategori) || '')

  const queryKey = computed(() => [
    'pengeluaran',
    semesterIdVal.value,
    searchVal.value,
    kategoriVal.value,
  ])

  const pengeluaranQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchPengeluaran({
        semesterId: semesterIdVal.value,
        search: searchVal.value,
        kategori: kategoriVal.value,
      }),
  })

  const records = computed(() => pengeluaranQuery.data.value || [])

  const totalPengeluaran = computed(() => {
    return records.value.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0)
  })

  const createPengeluaran = useMutation({
    mutationFn: async ({ payload, pin }) => {
      const { data } = await api.post('/pengeluaran', payload, {
        headers: { 'x-admin-pin': pin?.trim() },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal mencatat pengeluaran kas.')
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengeluaran'] })
      queryClient.invalidateQueries({ queryKey: ['kas'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })

  const deletePengeluaran = useMutation({
    mutationFn: async ({ id, pin }) => {
      const { data } = await api.delete(`/pengeluaran/${encodeURIComponent(id)}`, {
        headers: { 'x-admin-pin': pin?.trim() },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal menghapus pengeluaran kas.')
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pengeluaran'] })
      queryClient.invalidateQueries({ queryKey: ['kas'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })

  return {
    pengeluaranQuery,
    records,
    totalPengeluaran,
    createPengeluaran,
    deletePengeluaran,
  }
}
