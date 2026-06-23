import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminExamsService,
  type ComposedExamQuestion,
  type CreateExamInput,
  type UpdateExamInput,
} from '@/services/admin-exams'
import type { Pagination } from '@/services/assignments'

const keys = {
  all: ['admin', 'exams'] as const,
  list: (p?: Pagination) => ['admin', 'exams', 'list', p ?? {}] as const,
  detail: (id: string) => ['admin', 'exams', 'detail', id] as const,
}

/** Liste paginée des examens admin. */
export function useAdminExams(pagination?: Pagination) {
  return useQuery({
    queryKey: keys.list(pagination),
    queryFn: () => adminExamsService.list(pagination),
  })
}

/** Détail d'un examen + ses questions. */
export function useAdminExam(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => adminExamsService.get(id),
    enabled: !!id,
  })
}

export function useCreateExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateExamInput) => adminExamsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useUpdateExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExamInput }) =>
      adminExamsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useDeleteExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminExamsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

/** Attache des questions QCM à un examen. */
export function useAttachExamQuestions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, questions }: { id: string; questions: ComposedExamQuestion[] }) =>
      adminExamsService.attachQuestions(id, questions),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

/** Remplace l'ensemble des questions d'un examen (builder de la page dédiée). */
export function useSetExamQuestions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, questions }: { id: string; questions: ComposedExamQuestion[] }) =>
      adminExamsService.setQuestions(id, questions),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: keys.detail(id) })
    },
  })
}
