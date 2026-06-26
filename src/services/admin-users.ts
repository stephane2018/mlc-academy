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

/** Compétence (maîtrise) par matière. */
export type SubjectSkill = {
  subjectId: string
  subjectName: string
  color: string | null
  mastery: number
  themes: { themeId: string; name: string; mastery: number }[]
}

/** Détail enrichi d'un compte (un seul bloc renseigné selon le rôle). */
export type AdminUserDetail = AdminUser & {
  student: {
    level: number
    xp: number
    streak: number
    nextLevelXp: number | null
    lastActive: string | null
    classCode: string | null
    groups: string[]
    parents: string[]
    skills: SubjectSkill[]
  } | null
  teacher: { groups: { name: string; memberCount: number }[]; studentCount: number } | null
  parent: { children: { pseudo: string; classCode: string | null }[] } | null
  caps: string[] | null
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
  get: (id: string) => api.get<AdminUserDetail>(`/admin/users/${id}`),
  setRole: (id: string, role: UserRole) =>
    api.patch<{ ok: true }>(`/admin/users/${id}/role`, { role }),
  block: (id: string) => api.post<{ ok: true }>(`/admin/users/${id}/block`),
  unblock: (id: string) => api.post<{ ok: true }>(`/admin/users/${id}/unblock`),
}
