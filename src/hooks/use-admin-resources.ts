import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminResourcesService,
  type AdminResourcesQuery,
  type CreateResourceInput,
  type UpdateResourceInput,
} from '@/services/admin-resources'

const keys = {
  all: ['admin', 'resources'] as const,
  list: (q?: AdminResourcesQuery) => ['admin', 'resources', 'list', q ?? {}] as const,
  detail: (id: string) => ['admin', 'resources', 'detail', id] as const,
}

/** Liste du catalogue de ressources (filtrable matière/type, paginée). */
export function useAdminResources(query?: AdminResourcesQuery) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: () => adminResourcesService.list(query),
  })
}

/** Détail d'une ressource. */
export function useAdminResource(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => adminResourcesService.get(id),
    enabled: !!id,
  })
}

export function useCreateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateResourceInput) => adminResourcesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useUpdateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResourceInput }) =>
      adminResourcesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useDeleteResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminResourcesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}
