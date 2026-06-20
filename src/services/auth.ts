import { api } from '@/lib/api-client'

/** Rôles applicatifs (miroir de l'enum SQL app_role). */
export type AppRole = 'eleve' | 'prof' | 'parent' | 'admin' | 'gestionnaire'

/** Réponse de `GET /auth/me` — profil + droits effectifs (pilote l'UI). */
export type Me = {
  user: { id: string; email: string | null }
  roles: AppRole[]
  isAdmin: boolean
  permissions: string[]
}

/** Service auth — endpoints `/auth/*` du BFF (l'auth Supabase est dans lib/auth). */
export const authService = {
  /** Profil + rôles + permissions effectives de l'utilisateur courant. */
  me: () => api.get<Me>('/auth/me'),

  /** L'élève génère un code de rattachement (à transmettre au parent). */
  issueParentCode: () => api.post<{ code: string; expiresAt: string }>('/auth/parent-code'),

  /** Le parent rattache un enfant via son code. */
  linkChild: (code: string) => api.post<{ studentId: string }>('/auth/link-child', { code }),
}
