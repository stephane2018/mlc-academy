import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type ResourceType = 'video' | 'pdf' | 'exercice' | 'fiche'

export type Resource = {
  id: string
  title: string
  type: ResourceType
  subjectId: string
  themeId: string | null
  chapter: string | null
  premium: boolean
  duration: string | null
  pages: number | null
  /** Progression de l'élève courant (0–100). */
  progress: number
}

export type ResourceDetail = Resource & {
  description: string | null
  questionCount: number | null
  videoUrl: string | null
  fileUrl: string | null
}

export type LibraryFilters = Pagination & { subjectId?: string; type?: ResourceType }

/** Service library — `/library/*`. */
export const libraryService = {
  list: (filters?: LibraryFilters) => api.get<Resource[]>('/library', { query: filters }),
  get: (id: string) => api.get<ResourceDetail>(`/library/${id}`),
  updateProgress: (id: string, progress: number) =>
    api.put<{ ok: true }>(`/library/${id}/progress`, { progress }),
}
