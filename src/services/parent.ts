import { api } from '@/lib/api-client'

export type Child = {
  id: string
  pseudo: string
  avatar: string
  level: number
  xp: number
  streak: number
  lastActive: string | null
}

export type ChildSkill = { themeId: string; label: string; mastery: number }
export type WeeklyXpDay = { label: string; date: string; xp: number }

export type ChildOverview = {
  avgScore: number | null
  skills: ChildSkill[]
  weeklyXp: WeeklyXpDay[]
}

export type ChildAssignment = {
  id: string
  title: string
  type: string
  subjectId: string
  themeId: string | null
  difficulty: string | null
  dueDate: string | null
  xpReward: number
  status: 'a_faire' | 'en_cours' | 'rendu'
  score: number | null
}

/** Service espace parent — `/parent/*`. */
export const parentService = {
  children: () => api.get<Child[]>('/parent/children'),
  overview: (childId: string) => api.get<ChildOverview>(`/parent/children/${childId}/overview`),
  assignments: (childId: string) => api.get<ChildAssignment[]>(`/parent/children/${childId}/assignments`),
  /** Réinitialise le code PIN (6 chiffres) de l'enfant. */
  resetPin: (childId: string, pin: string) => api.post<{ ok: true }>(`/parent/children/${childId}/pin`, { pin }),
}
