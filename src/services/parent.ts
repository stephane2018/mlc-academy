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

/** Service espace parent — `/parent/*`. */
export const parentService = {
  children: () => api.get<Child[]>('/parent/children'),
  overview: (childId: string) => api.get<ChildOverview>(`/parent/children/${childId}/overview`),
}
