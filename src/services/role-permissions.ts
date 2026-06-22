import { api } from '@/lib/api-client'

/** Rôles éditables dans la matrice (l'admin a tout par défaut, hors matrice). */
export type EditableRole = 'eleve' | 'prof' | 'parent' | 'gestionnaire'

/** Une permission listée dans la matrice. */
export type RolePermission = {
  key: string
  label: string
  category: string
}

/** Réponse de la matrice : catalogue + clés accordées par rôle. */
export type RolePermissionsMatrix = {
  permissions: RolePermission[]
  matrix: Record<string, string[]>
}

/** Entrée : bascule d'un droit pour un rôle. */
export type SetRolePermissionInput = {
  role: EditableRole
  permissionKey: string
  allowed: boolean
}

/** Service matrice des permissions par rôle (rôle admin) — `/admin/role-permissions`. */
export const rolePermissionsService = {
  matrix: () => api.get<RolePermissionsMatrix>('/admin/role-permissions'),
  set: (input: SetRolePermissionInput) => api.put<{ ok: true }>('/admin/role-permissions', input),
}
