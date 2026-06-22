import { api } from '@/lib/api-client'

export type TeacherStudent = { id: string; pseudo: string; avatar: string; lastActive: string | null; groups: string[] }

export type TeacherStudentSkill = {
  subjectId: string
  subjectName: string
  color: string | null
  mastery: number
  themes: { themeId: string; name: string; mastery: number }[]
}

export type TeacherStudentDetail = {
  id: string
  pseudo: string
  avatar: string
  level: number
  xp: number
  streak: number
  lastActive: string | null
  groups: string[]
  skills: TeacherStudentSkill[]
}

/** Service teacher (espace prof) — `/teacher/*`. */
export const teacherService = {
  students: () => api.get<TeacherStudent[]>('/teacher/students'),
  student: (id: string) => api.get<TeacherStudentDetail>(`/teacher/students/${id}`),
}
