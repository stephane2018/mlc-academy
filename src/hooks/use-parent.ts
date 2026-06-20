import { useQuery } from '@tanstack/react-query'
import { parentService } from '@/services/parent'

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
