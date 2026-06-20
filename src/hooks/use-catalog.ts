import { useQuery } from '@tanstack/react-query'
import { catalogService } from '@/services/catalog'

/** Référentiels : peu changeants → cache long. */
export function useClasses() {
  return useQuery({
    queryKey: ['catalog', 'classes'],
    queryFn: () => catalogService.classes(),
    staleTime: 10 * 60_000,
  })
}

export function useSubjects() {
  return useQuery({
    queryKey: ['catalog', 'subjects'],
    queryFn: () => catalogService.subjects(),
    staleTime: 10 * 60_000,
  })
}
