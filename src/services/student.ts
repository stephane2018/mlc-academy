import { api } from '@/lib/api-client'

export type StudentMe = {
  id: string
  pseudo: string
  avatar: string
  level: number
  xp: number
  streak: number
  lastActive: string | null
  /** XP requis pour le niveau suivant (null si au max). */
  xpForNextLevel: number | null
  weekXp: number
  weekRank: number | null
}

export type SubjectSkill = {
  subjectId: string
  subjectName: string
  color: string | null
  mastery: number
  themes: { themeId: string; name: string; mastery: number }[]
}

/** Service espace élève — `/student/*`. */
export const studentService = {
  me: () => api.get<StudentMe>('/student/me'),
  skills: () => api.get<SubjectSkill[]>('/student/skills'),
}
