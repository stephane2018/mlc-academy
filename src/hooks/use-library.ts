import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { libraryService, type LibraryFilters } from '@/services/library'

export function useResources(filters?: LibraryFilters) {
  return useQuery({
    queryKey: ['library', 'list', filters ?? {}],
    queryFn: () => libraryService.list(filters),
  })
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ['library', 'detail', id],
    queryFn: () => libraryService.get(id),
    enabled: !!id,
  })
}

export function useUpdateProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => libraryService.updateProgress(id, progress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['library'] }),
  })
}
