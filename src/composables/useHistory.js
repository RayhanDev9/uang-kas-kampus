import { computed, toValue } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

async function fetchHistory({ semesterId, search = '' } = {}) {
  try {
    const params = new URLSearchParams()
    if (semesterId && semesterId !== 'default-active') {
      params.set('semesterId', semesterId)
    }
    if (search) {
      params.set('search', search)
    }
    const query = params.toString()
    const { data } = await api.get(`/history${query ? `?${query}` : ''}`)
    if (data?.success && Array.isArray(data.data)) {
      return data.data
    }
    return []
  } catch (err) {
    console.warn('Backend /history belum tersedia atau error.', err)
    return []
  }
}

export function useHistory(filters = {}) {
  const queryClient = useQueryClient()

  const currentFilters = computed(() => ({
    semesterId: toValue(filters.semesterId),
    search: String(toValue(filters.search) ?? '').trim(),
  }))

  const queryKey = computed(() => ['history', currentFilters.value])

  const historyQuery = useQuery({
    queryKey,
    queryFn: () => fetchHistory(currentFilters.value),
  })

  const records = computed(() => historyQuery.data.value || [])

  return {
    historyQuery,
    records,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  }
}
