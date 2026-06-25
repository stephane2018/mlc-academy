import { api } from '@/lib/api-client'

export type ResourceType = 'video' | 'pdf' | 'exercice' | 'fiche'

/** Ressource du catalogue telle que renvoyée par le BFF admin. */
export type AdminResource = {
  id: string
  title: string
  description: string | null
  type: ResourceType
  subjectId: string
  themeId: string | null
  classId: string | null
  chapter: string | null
  premium: boolean
  duration: string | null
  pages: number | null
  questionCount: number | null
  videoUrl: string | null
  storagePath: string | null
}

export type AdminResourcesQuery = {
  subjectId?: string
  type?: ResourceType
  page?: number
  limit?: number
}

export type CreateResourceInput = {
  title: string
  type: ResourceType
  subjectId: string
  themeId?: string | null
  classId?: string | null
  description?: string | null
  chapter?: string | null
  premium?: boolean
  duration?: string | null
  pages?: number | null
  questionCount?: number | null
  videoUrl?: string | null
  storagePath?: string | null
}

/** Champs modifiables d'une ressource (PATCH partiel). */
export type UpdateResourceInput = Partial<CreateResourceInput>

/** Service ressources (rôle admin) — `/admin/resources/*`. */
export const adminResourcesService = {
  list: (query?: AdminResourcesQuery) =>
    api.get<AdminResource[]>('/admin/resources', { query }),
  get: (id: string) => api.get<AdminResource>(`/admin/resources/${id}`),
  create: (input: CreateResourceInput) =>
    api.post<AdminResource>('/admin/resources', input),
  update: (id: string, input: UpdateResourceInput) =>
    api.patch<AdminResource>(`/admin/resources/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/admin/resources/${id}`),
}
