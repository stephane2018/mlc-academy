import { api } from '@/lib/api-client'

export type CatalogClass = { id: string; code: string; label: string; ordre: number }
export type CatalogTheme = { id: string; code: string; name: string }
export type CatalogSubject = {
  id: string
  code: string
  name: string
  color: string | null
  icon: string | null
  themes: CatalogTheme[]
}

/** Service catalog — référentiels en lecture (`/catalog/*`). */
export const catalogService = {
  classes: () => api.get<CatalogClass[]>('/catalog/classes'),
  subjects: () => api.get<CatalogSubject[]>('/catalog/subjects'),
}
