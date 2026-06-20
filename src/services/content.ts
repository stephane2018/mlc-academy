import { api } from '@/lib/api-client'

/** Admin de contenu — `/admin/content/*` (gardé par permission admin.*). */

export type ClassInput = { code: string; label: string; ordre?: number; active?: boolean }
export type ClassPatch = { label?: string; ordre?: number; active?: boolean }
export type SubjectInput = { code: string; name: string; color?: string; icon?: string; ordre?: number; active?: boolean }
export type SubjectPatch = { name?: string; color?: string; icon?: string; ordre?: number; active?: boolean }
export type ThemeInput = { code: string; name: string; ordre?: number }
export type ThemePatch = { name?: string; ordre?: number; active?: boolean }

export type ProductStatus = 'brouillon' | 'en_attente' | 'publie' | 'rejete' | 'archive'
export type ModeratedProduct = {
  id: string
  title: string
  status: string
  sellerId: string | null
  reviewNote: string | null
}
export type ModerateInput = { action: 'publie' | 'rejete' | 'archive'; reviewNote?: string }

export const contentService = {
  // Classes
  createClass: (input: ClassInput) => api.post('/admin/content/classes', input),
  updateClass: (id: string, patch: ClassPatch) => api.put(`/admin/content/classes/${id}`, patch),
  deleteClass: (id: string) => api.delete<{ ok: true }>(`/admin/content/classes/${id}`),
  // Matières & thèmes
  createSubject: (input: SubjectInput) => api.post('/admin/content/subjects', input),
  updateSubject: (id: string, patch: SubjectPatch) => api.put(`/admin/content/subjects/${id}`, patch),
  createTheme: (subjectId: string, input: ThemeInput) =>
    api.post(`/admin/content/subjects/${subjectId}/themes`, input),
  updateTheme: (id: string, patch: ThemePatch) => api.put(`/admin/content/themes/${id}`, patch),
  // Modération marketplace
  listProducts: (status?: ProductStatus) =>
    api.get<ModeratedProduct[]>('/admin/content/products', { query: { status } }),
  moderateProduct: (id: string, input: ModerateInput) =>
    api.put<ModeratedProduct>(`/admin/content/products/${id}/moderate`, input),
}
