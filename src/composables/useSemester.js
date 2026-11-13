import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

const LOCAL_STORAGE_KEY = 'kaskita_selected_semester_id'
const selectedSemesterId = ref(localStorage.getItem(LOCAL_STORAGE_KEY) || '')

// Fallback dummy semester if backend endpoint doesn't return data yet
const DEFAULT_FALLBACK_SEMESTER = {
  _id: 'default-active',
  nama: 'Semester Ganjil 2024/2025',
  kode: '2024-1',
  isAktif: true,
  targetKasPerMhs: 50000,
}

async function fetchSemesters() {
  try {
    const { data } = await api.get('/semesters')
    if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data
    }
    return [DEFAULT_FALLBACK_SEMESTER]
  } catch (err) {
    // If endpoint doesn't exist yet (404), return fallback
    console.warn('Backend /semesters belum tersedia, menggunakan data default.', err)
    return [DEFAULT_FALLBACK_SEMESTER]
  }
}

export function useSemester() {
  const queryClient = useQueryClient()

  const semestersQuery = useQuery({
    queryKey: ['semesters'],
    queryFn: fetchSemesters,
    staleTime: 1000 * 60 * 5, // 5 menit
  })

  const semesters = computed(() => semestersQuery.data.value || [DEFAULT_FALLBACK_SEMESTER])

  const activeSemester = computed(() => {
    return semesters.value.find((s) => s.isAktif) || semesters.value[0] || DEFAULT_FALLBACK_SEMESTER
  })

  // Ensure selectedSemesterId is initialized
  if (!selectedSemesterId.value && activeSemester.value?._id) {
    selectedSemesterId.value = activeSemester.value._id
  }

  const selectedSemester = computed(() => {
    const found = semesters.value.find((s) => s._id === selectedSemesterId.value)
    return found || activeSemester.value
  })

  const isViewingArchived = computed(() => {
    return Boolean(selectedSemester.value && !selectedSemester.value.isAktif)
  })

  function setSelectedSemester(id) {
    selectedSemesterId.value = id
    localStorage.setItem(LOCAL_STORAGE_KEY, id)
    // Invalidate dependent queries
    queryClient.invalidateQueries({ queryKey: ['kas'] })
    queryClient.invalidateQueries({ queryKey: ['pemasukanLain'] })
    queryClient.invalidateQueries({ queryKey: ['history'] })
  }

  const createSemester = useMutation({
    mutationFn: async ({ payload, pin }) => {
      const { data } = await api.post('/semesters', payload, {
        headers: { 'x-admin-pin': pin?.trim() },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal membuat semester baru.')
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
    },
  })

  const activateSemester = useMutation({
    mutationFn: async ({ id, pin }) => {
      const { data } = await api.put(`/semesters/${encodeURIComponent(id)}/activate`, {}, {
        headers: { 'x-admin-pin': pin?.trim() },
      })
      if (!data?.success) throw new Error(data?.message || 'Gagal mengaktifkan semester.')
      return data.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
      setSelectedSemester(variables.id)
    },
  })

  return {
    selectedSemesterId,
    selectedSemester,
    semesters,
    activeSemester,
    isViewingArchived,
    semestersQuery,
    setSelectedSemester,
    createSemester,
    activateSemester,
  }
}
