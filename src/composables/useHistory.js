import { computed, toValue } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

async function fetchHistory({ semesterId, search = '', kategori = 'all', bulan = '', limit = 200, page = 1 } = {}) {
  try {
    const params = new URLSearchParams()
    if (semesterId && semesterId !== 'default-active') {
      params.set('semesterId', semesterId)
    }
    if (search) {
      params.set('search', search)
    }
    if (kategori && kategori !== 'all') {
      params.set('kategori', kategori)
    }
    if (bulan) {
      params.set('bulan', bulan)
    }
    if (limit) {
      params.set('limit', String(limit))
    }
    if (page) {
      params.set('page', String(page))
    }

    const query = params.toString()
    const { data } = await api.get(`/history${query ? `?${query}` : ''}`)
    if (data?.success) {
      return {
        data: Array.isArray(data.data) ? data.data : [],
        summary: data.summary || {
          totalMutasi: 0,
          totalKasMasuk: 0,
          totalPengeluaranOperasional: 0,
          totalUangDikembalikan: 0,
        },
        daftarBulan: Array.isArray(data.daftarBulan) ? data.daftarBulan : [],
        pagination: data.pagination || {
          totalData: Array.isArray(data.data) ? data.data.length : 0,
          page: 1,
          limit: 200,
          totalPages: 1,
        },
      }
    }
    return {
      data: [],
      summary: { totalMutasi: 0, totalKasMasuk: 0, totalPengeluaranOperasional: 0, totalUangDikembalikan: 0 },
      daftarBulan: [],
      pagination: { totalData: 0, page: 1, limit: 200, totalPages: 1 },
    }
  } catch (err) {
    console.warn('Backend /history belum tersedia atau error.', err)
    return {
      data: [],
      summary: { totalMutasi: 0, totalKasMasuk: 0, totalPengeluaranOperasional: 0, totalUangDikembalikan: 0 },
      daftarBulan: [],
      pagination: { totalData: 0, page: 1, limit: 200, totalPages: 1 },
    }
  }
}

export function useHistory(filters = {}) {
  const queryClient = useQueryClient()

  const currentFilters = computed(() => ({
    semesterId: toValue(filters.semesterId),
    search: String(toValue(filters.search) ?? '').trim(),
    kategori: String(toValue(filters.kategori) ?? 'all'),
    bulan: String(toValue(filters.bulan) ?? ''),
    limit: Number(toValue(filters.limit) ?? 200),
    page: Number(toValue(filters.page) ?? 1),
  }))

  const queryKey = computed(() => ['history', currentFilters.value])

  const historyQuery = useQuery({
    queryKey,
    queryFn: () => fetchHistory(currentFilters.value),
  })

  const records = computed(() => historyQuery.data.value?.data || [])
  const summary = computed(
    () =>
      historyQuery.data.value?.summary || {
        totalMutasi: 0,
        totalKasMasuk: 0,
        totalPengeluaranOperasional: 0,
        totalUangDikembalikan: 0,
      }
  )
  const daftarBulan = computed(() => historyQuery.data.value?.daftarBulan || [])
  const pagination = computed(
    () =>
      historyQuery.data.value?.pagination || {
        totalData: 0,
        page: 1,
        limit: 200,
        totalPages: 1,
      }
  )

  return {
    historyQuery,
    records,
    summary,
    daftarBulan,
    pagination,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  }
}
