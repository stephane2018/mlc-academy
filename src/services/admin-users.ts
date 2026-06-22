import { api } from '@/lib/api-client'

/** Rôles assignables à un utilisateur. */
export type UserRole = 'eleve' | 'prof' | 'parent' | 'admin' | 'gestionnaire'

/** Compte renvoyé par le BFF (`GET /admin/users`). */
export type AdminUser = {
  id: string
  email: string
  role: UserRole | null
  displayName: string | null
  blocked: boolean
  createdAt: string
}

/** Filtres de listing des comptes admin. */
export type AdminUsersQuery = {
  page?: number
  limit?: number
  role?: UserRole
  search?: string
}

/** Service admin — gestion des comptes utilisateurs (`/admin/users/*`). */
export const adminUsersService = {
  list: (query?: AdminUsersQuery) => api.get<AdminUser[]>('/admin/users', { query }),
  setRole: (id: string, role: UserRole) =>
    api.patch<{ ok: true }>(`/admin/users/${id}/role`, { role }),
  block: (id: string) => api.post<{ ok: true }>(`/admin/users/${id}/block`),
  unblock: (id: string) => api.post<{ ok: true }>(`/admin/users/${id}/unblock`),
}
