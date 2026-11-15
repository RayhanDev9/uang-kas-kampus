import { computed, toValue } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api, { getErrorMessage } from '../api/axios'

function requirePin(pin) {
  if (!pin || !pin.trim()) throw new Error('PIN bendahara wajib diisi untuk mengubah absensi.')
  return pin.trim()
}

export function useKasMatrix(semesterIdRef) {
  const queryClient = useQueryClient()

  const currentSemesterId = computed(() => {
    const val = toValue(semesterIdRef)
    return String(val ?? '').trim()
  })

  const matrixQueryKey = computed(() => ['kas-matrix', currentSemesterId.value])

  const matrixQuery = useQuery({
    queryKey: matrixQueryKey,
    queryFn: async () => {
      const semId = currentSemesterId.value
      const query = semId && semId !== 'default-active' ? `?semesterId=${encodeURIComponent(semId)}` : ''
      const { data } = await api.get(`/kas/matrix${query}`)
      if (!data?.success) {
        throw new Error(data?.message || 'Gagal memuat matriks kas.')
      }
      return data
    },
    enabled: computed(() => Boolean(currentSemesterId.value)),
    staleTime: 1000 * 60, // 1 menit
  })

  const togglePertemuan = useMutation({
    mutationFn: async ({ kasId, pertemuanKe, bayar, nominal, pin }) => {
      if (!kasId) throw new Error('ID catatan kas tidak valid.')
      const cleanPin = requirePin(pin)

      const payload = {
        pertemuanKe: Number(pertemuanKe),
        bayar: Boolean(bayar),
      }
      if (typeof nominal === 'number') {
        payload.nominal = nominal
      }

      const { data } = await api.put(`/kas/${encodeURIComponent(kasId)}/pertemuan`, payload, {
        headers: { 'x-admin-pin': cleanPin },
      })

      if (!data?.success) {
        throw new Error(data?.message || 'Gagal memperbarui status pertemuan.')
      }

      return data
    },
    onMutate: async ({ kasId, pertemuanKe, bayar, nominal }) => {
      // Cancel queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: matrixQueryKey.value })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(matrixQueryKey.value)

      if (previousData?.rows) {
        // Deep copy rows and summary for optimistic UI
        const nextData = JSON.parse(JSON.stringify(previousData))
        const row = nextData.rows.find((r) => r._id === kasId)
        if (row) {
          const detail = row.detailMingguan.find((d) => d.pertemuanKe === pertemuanKe)
          const targetNominal = typeof nominal === 'number' ? nominal : (detail?.nominal || nextData.semester?.nominalPerMinggu || 5000)
          
          if (detail) {
            detail.bayar = bayar
            detail.nominal = targetNominal
          } else {
            row.detailMingguan.push({
              pertemuanKe,
              tanggal: `P${pertemuanKe}`,
              bayar,
              nominal: targetNominal,
            })
          }

          // Recalculate row metrics
          const newNominal = row.detailMingguan.reduce((sum, d) => sum + (d.bayar ? (d.nominal || targetNominal) : 0), 0)
          row.nominal = newNominal
          row.totalPertemuanBayar = row.detailMingguan.filter((d) => d.bayar).length
          const targetKas = nextData.semester?.targetKasPerMhs || 0
          row.status = newNominal >= targetKas && targetKas > 0 ? 'Lunas' : 'Belum Lunas'

          // Recalculate totalPerMinggu
          nextData.totalPerMinggu = (nextData.daftarPertemuan || []).map((p) => {
            let jml = 0
            let uang = 0
            nextData.rows.forEach((r) => {
              const d = r.detailMingguan.find((item) => item.pertemuanKe === p.pertemuanKe)
              if (d && d.bayar) {
                jml += 1
                uang += d.nominal || targetNominal
              }
            })
            return {
              pertemuanKe: p.pertemuanKe,
              tanggal: p.tanggal,
              jumlahBayar: jml,
              totalUang: uang,
            }
          })

          nextData.grandTotalKas = nextData.rows.reduce((sum, r) => sum + (r.nominal || 0), 0)
          queryClient.setQueryData(matrixQueryKey.value, nextData)
        }
      }

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback to previous data if mutation fails
      if (context?.previousData) {
        queryClient.setQueryData(matrixQueryKey.value, context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate relevant queries to guarantee sync
      queryClient.invalidateQueries({ queryKey: matrixQueryKey.value })
      queryClient.invalidateQueries({ queryKey: ['kas'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })

  return {
    matrixData: matrixQuery.data,
    daftarPertemuan: computed(() => matrixQuery.data.value?.daftarPertemuan || []),
    rows: computed(() => matrixQuery.data.value?.rows || []),
    totalPerMinggu: computed(() => matrixQuery.data.value?.totalPerMinggu || []),
    grandTotalKas: computed(() => matrixQuery.data.value?.grandTotalKas || 0),
    semesterInfo: computed(() => matrixQuery.data.value?.semester || null),
    isLoading: matrixQuery.isLoading,
    isFetching: matrixQuery.isFetching,
    isError: matrixQuery.isError,
    error: matrixQuery.error,
    refetch: matrixQuery.refetch,
    togglePertemuan,
  }
}
