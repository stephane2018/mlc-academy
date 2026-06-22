import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  rolePermissionsService,
  type RolePermissionsMatrix,
  type SetRolePermissionInput,
} from '@/services/role-permissions'

const ROLE_PERMISSIONS_KEY = ['role-permissions'] as const

/** Charge le catalogue des permissions + la matrice rôle → clés accordées. */
export function useRolePermissions() {
  return useQuery<RolePermissionsMatrix>({
    queryKey: ROLE_PERMISSIONS_KEY,
    queryFn: () => rolePermissionsService.matrix(),
  })
}

/** Bascule un droit pour un rôle puis invalide la matrice. */
export function useSetRolePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SetRolePermissionInput) => rolePermissionsService.set(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLE_PERMISSIONS_KEY }),
  })
}
