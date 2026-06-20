import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/services/groups'

export function useGroups() {
  return useQuery({ queryKey: ['groups', 'list'], queryFn: () => groupsService.list() })
}
export function useGroup(id: string) {
  return useQuery({ queryKey: ['groups', 'detail', id], queryFn: () => groupsService.get(id), enabled: !!id })
}
export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; classId: string }) => groupsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}
export function useRegenerateGroupCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groupsService.regenerateCode(id),
    onSuccess: (_d, id) => qc.invalidateQueries({ queryKey: ['groups', 'detail', id] }),
  })
}
