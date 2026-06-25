import { api } from '@/lib/api-client'

/** Image de la banque réutilisable du prof (`/teacher/images`). */
export type TeacherImage = {
  id: string
  storagePath: string
  fileName: string | null
  createdAt: string
}

export const teacherImagesService = {
  list: () => api.get<TeacherImage[]>('/teacher/images'),
  register: (storagePath: string, fileName?: string | null) =>
    api.post<TeacherImage>('/teacher/images', { storagePath, fileName }),
  remove: (id: string) => api.delete<{ ok: true }>(`/teacher/images/${id}`),
}
