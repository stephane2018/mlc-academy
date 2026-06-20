import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignmentsService,
  type AssignmentStatus,
  type CreateAssignmentInput,
  type Pagination,
} from '@/services/assignments'

const keys = {
  all: ['assignments'] as const,
  list: (p?: Pagination) => ['assignments', 'list', p ?? {}] as const,
  detail: (id: string) => ['assignments', 'detail', id] as const,
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

export function useSubmitAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assignmentsService.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}
