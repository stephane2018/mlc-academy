import { api } from '@/lib/api-client'

export type SharedResourceType = 'video' | 'pdf' | 'exercice' | 'fiche'
export type SharedStatus = 'publie' | 'planifie' | 'brouillon'

export type SharedResource = {
  id: string
  title: string
  description: string | null
  type: SharedResourceType
  status: SharedStatus
  message: string | null
  fileName: string | null
  fileSize: string | null
  scheduledAt: string | null
  createdAt: string
  groups: string[]
}

export type CreateResourceInput = {
  title: string
  type: SharedResourceType
  description?: string | null
  message?: string | null
  status?: SharedStatus
  scheduledAt?: string | null
}

/** Service resources (espace prof) — `/resources/*`. */
export const resourcesService = {
  list: () => api.get<SharedResource[]>('/resources'),
  create: (input: CreateResourceInput) => api.post<SharedResource>('/resources', input),
  update: (id: string, input: Partial<CreateResourceInput>) => api.patch<SharedResource>(`/resources/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/resources/${id}`),
  setTargets: (id: string, groupIds: string[]) => api.post<{ targeted: number }>(`/resources/${id}/targets`, { groupIds }),
}
