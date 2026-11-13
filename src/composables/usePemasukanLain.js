import { computed, toValue } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

async function fetchPemasukanLain(semesterId) {
  try {
    const params = new URLSearchParams()
    if (semesterId && semesterId !== 'default-active') {
      params.set('semesterId', semesterId)
    }
    const query = params.toString()
    const { data } = await api.get(`/pemasukan-lain${query ? `?${query}` : ''}`)
    if (data?.success && Array.isArray(data.data)) {
      return data.data
    }
    return []
  } catch (err) {
    console.warn('Backend /pemasukan-lain belum tersedia atau error.', err)
    return []
  }
}

export function usePemasukanLain(semesterIdRef) {
  const queryClient = useQueryClient()
  const semesterIdVal = computed(() => toValue(semesterIdRef))

  const queryKey = computed(() => ['pemasukanLain', semesterIdVal.value])

  const pemasukanLainQuery = useQuery({
    queryKey,
    queryFn: () => fetchPemasukanLain(semesterIdVal.value),
  })

  const records = computed(() => pemasukanLainQuery.data.value || [])

  const totalNominal = computed(() => {
    return records.value.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0)
  })

  const createPemasukanLain = useMutation({
    mutationFn: async ({ payload, pin }) => {
      const { data } = await api.post('/pemasukan-lain', payload, {
        headers: { 'x-admin-pin': pin?.trim() },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal menyimpan pemasukan lain.')
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pemasukanLain'] })
      queryClient.invalidateQueries({ queryKey: ['kas'] })
    },
  })

  const deletePemasukanLain = useMutation({
    mutationFn: async ({ id, pin }) => {
      const { data } = await api.delete(`/pemasukan-lain/${encodeURIComponent(id)}`, {
        headers: { 'x-admin-pin': pin?.trim() },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal menghapus pemasukan.')
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pemasukanLain'] })
      queryClient.invalidateQueries({ queryKey: ['kas'] })
    },
  })

  return {
    pemasukanLainQuery,
    records,
    totalNominal,
    createPemasukanLain,
    deletePemasukanLain,
  }
}
