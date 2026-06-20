import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { liveService, type CreateSessionInput } from '@/services/live'

export function useLiveSessions() {
  return useQuery({ queryKey: ['live', 'list'], queryFn: () => liveService.list() })
}
export function useCreateLiveSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSessionInput) => liveService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live'] }),
  })
}
export function useConfirmAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => liveService.confirmAttendance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live'] }),
  })
}
