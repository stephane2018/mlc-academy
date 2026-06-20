import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coachService } from '@/services/coach'

export function useCoachHistory() {
  return useQuery({ queryKey: ['coach', 'history'], queryFn: () => coachService.history() })
}
export function useAskCoach() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => coachService.ask(message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach', 'history'] }),
  })
}
