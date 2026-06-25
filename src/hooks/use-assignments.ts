import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignmentsService,
  uploadSubmissionFile,
  type AssignmentStatus,
  type CreateAssignmentInput,
  type Pagination,
} from '@/services/assignments'
import type { GameAnswer } from '@/services/student'

const keys = {
  all: ['assignments'] as const,
  list: (p?: Pagination) => ['assignments', 'list', p ?? {}] as const,
  detail: (id: string) => ['assignments', 'detail', id] as const,
  questions: (id: string) => ['assignments', 'questions', id] as const,
  submissions: (id: string) => ['assignments', 'submissions', id] as const,
}

export function useAssignments(pagination?: Pagination) {
  return useQuery({
    queryKey: keys.list(pagination),
    queryFn: () => assignmentsService.list(pagination),
  })
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => assignmentsService.get(id),
    enabled: !!id,
  })
}

export function useCreateAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAssignmentInput) => assignmentsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useUpdateAssignmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignmentStatus }) =>
      assignmentsService.updateStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.setQueryData(keys.detail(updated.id), updated)
    },
  })
}

export function useAssignmentQuestions(id: string) {
  return useQuery({
    queryKey: keys.questions(id),
    queryFn: () => assignmentsService.questions(id),
    enabled: !!id,
  })
}

export function useAssignmentSubmissions(id: string) {
  return useQuery({
    queryKey: keys.submissions(id),
    queryFn: () => assignmentsService.submissions(id),
    enabled: !!id,
  })
}

/** Remise d'une copie par fichier (accessibilité) : upload puis enregistrement. */
export function useSubmitAssignmentFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const storagePath = await uploadSubmissionFile(file)
      return assignmentsService.submitFile(id, storagePath)
    },
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: keys.detail(id) })
      qc.invalidateQueries({ queryKey: keys.submissions(id) })
      qc.invalidateQueries({ queryKey: ['student', 'me'] })
    },
  })
}

/** Notation manuelle d'une copie par le prof. */
export function useGradeSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      studentId,
      score,
      feedback,
    }: {
      id: string
      studentId: string
      score: number
      feedback?: string | null
    }) => assignmentsService.grade(id, { studentId, score, feedback }),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: keys.submissions(id) })
    },
  })
}

export function useSubmitAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: GameAnswer[] }) =>
      assignmentsService.submit(id, answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all })
      qc.invalidateQueries({ queryKey: ['student', 'me'] })
    },
  })
}
