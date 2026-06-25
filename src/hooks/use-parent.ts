import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parentService } from '@/services/parent'
import { authService } from '@/services/auth'

/** Enfants rattachés au parent courant. */
export function useChildren() {
  return useQuery({ queryKey: ['parent', 'children'], queryFn: () => parentService.children() })
}

/** Synthèse d'un enfant (score, maîtrise, XP hebdo). */
export function useChildOverview(childId: string | undefined) {
  return useQuery({
    queryKey: ['parent', 'overview', childId],
    queryFn: () => parentService.overview(childId!),
    enabled: !!childId,
  })
}

/** Devoirs/évaluations ciblant l'enfant + statut. */
export function useChildAssignments(childId: string | undefined) {
  return useQuery({
    queryKey: ['parent', 'assignments', childId],
    queryFn: () => parentService.assignments(childId!),
    enabled: !!childId,
  })
}

/** Rattache un enfant au parent courant via son code de liaison (`MLC-XXXX`). */
export function useLinkChild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => authService.linkChild(code.trim().toUpperCase()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent'] }),
  })
}

/** Réinitialisation du code PIN d'un enfant. */
export function useResetChildPin() {
  return useMutation({
    mutationFn: ({ childId, pin }: { childId: string; pin: string }) => parentService.resetPin(childId, pin),
  })
}
