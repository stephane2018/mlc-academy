import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminUsersService,
  type AdminUsersQuery,
  type UserRole,
} from '@/services/admin-users'

const KEY = ['admin', 'users'] as const

/** Liste paginée/filtrée des comptes (`GET /admin/users`). */
export function useAdminUsers(query?: AdminUsersQuery) {
  return useQuery({
    queryKey: [...KEY, query ?? {}],
    queryFn: () => adminUsersService.list(query),
  })
}

/** Change le rôle d'un compte. */
export function useSetUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      adminUsersService.setRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Bloque un compte. */
export function useBlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminUsersService.block(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Débloque un compte. */
export function useUnblockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminUsersService.unblock(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
