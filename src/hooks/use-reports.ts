import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportsService, type SendReportInput } from '@/services/reports'
import type { Pagination } from '@/services/assignments'

export function useReports(pagination?: Pagination) {
  return useQuery({ queryKey: ['reports', 'list', pagination ?? {}], queryFn: () => reportsService.list(pagination) })
}
export function useReport(id: string) {
  return useQuery({ queryKey: ['reports', 'detail', id], queryFn: () => reportsService.get(id), enabled: !!id })
}
export function useSendReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SendReportInput) => reportsService.send(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  })
}
export function useMarkReportRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reportsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  })
}
