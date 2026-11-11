import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

const queryKey = ['kas']

async function fetchKas() {
  const { data } = await api.get('/api/kas')

  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error('Respons GET /api/kas tidak sesuai kontrak API.')
  }

  return data
}

function requirePin(pin) {
  if (!pin?.trim()) throw new Error('PIN bendahara wajib diisi.')
  return pin.trim()
}

export function useKas() {
  const queryClient = useQueryClient()
  const kasQuery = useQuery({
    queryKey,
    queryFn: fetchKas,
  })

  const createKas = useMutation({
    mutationFn: async ({ payload, pin }) => {
      const { data } = await api.post('/api/kas', payload, {
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
      const { data } = await api.put(`/api/kas/${encodeURIComponent(id)}`, payload, {
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
      const { data } = await api.delete(`/api/kas/${encodeURIComponent(id)}`, {
        headers: { 'x-admin-pin': requirePin(pin) },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal menghapus data kas.')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { kasQuery, createKas, updateKas, deleteKas }
}
