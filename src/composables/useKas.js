import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue } from 'vue'
import api from '../api/axios'

const queryKey = ['kas']

async function fetchKas({ search = '', status = '' } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  const query = params.toString()
  const { data } = await api.get(`/kas${query ? `?${query}` : ''}`)

  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error('Respons GET /kas tidak sesuai kontrak API.')
  }

  return data
}

function requirePin(pin) {
  if (!pin?.trim()) throw new Error('PIN bendahara wajib diisi.')
  return pin.trim()
}

export function useKas(filters = {}) {
  const queryClient = useQueryClient()
  const currentFilters = computed(() => ({
    search: String(toValue(filters.search) ?? '').trim(),
    status: toValue(filters.status) === 'Semua' ? '' : String(toValue(filters.status) ?? ''),
  }))
  const filteredQueryKey = computed(() => [...queryKey, currentFilters.value])
  const kasQuery = useQuery({
    queryKey: filteredQueryKey,
    queryFn: ({ queryKey: [, requestFilters] }) => fetchKas(requestFilters),
  })

  const createKas = useMutation({
    mutationFn: async ({ payload, pin }) => {
      const { data } = await api.post('/kas', payload, {
        headers: { 'x-admin-pin': requirePin(pin) },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal mencatat kas.')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const updateKas = useMutation({
    mutationFn: async ({ id, payload, pin }) => {
      if (!id) throw new Error('ID data kas tidak ditemukan.')
      const { data } = await api.put(`/kas/${encodeURIComponent(id)}`, payload, {
        headers: { 'x-admin-pin': requirePin(pin) },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal memperbarui kas.')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const deleteKas = useMutation({
    mutationFn: async ({ id, pin }) => {
      if (!id) throw new Error('ID data kas tidak ditemukan.')
      const { data } = await api.delete(`/kas/${encodeURIComponent(id)}`, {
        headers: { 'x-admin-pin': requirePin(pin) },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal menghapus data kas.')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { kasQuery, createKas, updateKas, deleteKas }
}
