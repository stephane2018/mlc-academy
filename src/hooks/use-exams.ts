import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { examsService } from '@/services/exams'
import type { Pagination } from '@/services/assignments'

export function useExams(opts?: Pagination & { subjectId?: string }) {
  return useQuery({ queryKey: ['exams', 'list', opts ?? {}], queryFn: () => examsService.list(opts) })
}
export function useExam(id: string) {
  return useQuery({ queryKey: ['exams', 'detail', id], queryFn: () => examsService.get(id), enabled: !!id })
}
export function useCreateExamAttempt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, score }: { id: string; score?: number }) => examsService.createAttempt(id, score),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  })
}
