import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { examsService } from '@/services/exams'
import type { Pagination } from '@/services/assignments'
import type { GameAnswer } from '@/services/student'

export function useExams(opts?: Pagination & { subjectId?: string }) {
  return useQuery({ queryKey: ['exams', 'list', opts ?? {}], queryFn: () => examsService.list(opts) })
}
export function useExam(id: string) {
  return useQuery({ queryKey: ['exams', 'detail', id], queryFn: () => examsService.get(id), enabled: !!id })
}
export function useExamQuestions(id: string) {
  return useQuery({ queryKey: ['exams', 'questions', id], queryFn: () => examsService.questions(id), enabled: !!id })
}
export function useSubmitExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: GameAnswer[] }) => examsService.submit(id, answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams'] })
      qc.invalidateQueries({ queryKey: ['student', 'me'] })
    },
  })
}
