import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gamificationService, type CreateGameSessionInput } from '@/services/gamification'

export function useWeeklyLeaderboard() {
  return useQuery({ queryKey: ['gamification', 'leaderboard', 'weekly'], queryFn: () => gamificationService.weeklyLeaderboard() })
}
export function useGlobalLeaderboard() {
  return useQuery({ queryKey: ['gamification', 'leaderboard', 'global'], queryFn: () => gamificationService.globalLeaderboard() })
}
export function useBadges() {
  return useQuery({ queryKey: ['gamification', 'badges'], queryFn: () => gamificationService.badges() })
}
export function useGameRules() {
  return useQuery({ queryKey: ['gamification', 'rules'], queryFn: () => gamificationService.rules(), staleTime: 10 * 60_000 })
}
export function useCreateGameSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGameSessionInput) => gamificationService.createGameSession(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gamification'] }),
  })
}
