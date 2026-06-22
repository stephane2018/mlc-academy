import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { resourcesService, type CreateResourceInput } from '@/services/resources'

export function useResources() {
  return useQuery({ queryKey: ['resources', 'list'], queryFn: () => resourcesService.list() })
}
export function useCreateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateResourceInput) => resourcesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  })
}
export function useUpdateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateResourceInput> }) => resourcesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  })
}
export function useDeleteResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resourcesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  })
}
export function useShareResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, groupIds }: { id: string; groupIds: string[] }) => resourcesService.setTargets(id, groupIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  })
}
