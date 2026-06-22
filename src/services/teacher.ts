import { api } from '@/lib/api-client'

export type TeacherStudent = { id: string; pseudo: string; avatar: string; groups: string[] }

/** Service teacher (espace prof) — `/teacher/*`. */
export const teacherService = {
  students: () => api.get<TeacherStudent[]>('/teacher/students'),
}
