import { api } from '@/lib/api-client'

export type WeeklyRank = {
  studentId: string
  pseudo: string
  avatar: string
  classId: string
  classCode: string
  classLabel: string
  weekXp: number
  rankInClass: number
}

export type GlobalRank = {
  studentId: string
  pseudo: string
  avatar: string
  classId: string
  classCode: string
  classLabel: string
  xp: number
  level: number
  rankGlobal: number
  rankClass: number
}

export type Badge = { id: string; emoji: string; name: string; description: string | null; tier: 'bronze' | 'argent' | 'or'; unlockedAt: string | null }
export type XpRule = { action: string; baseXp: number; dailyCap: number; enabled: boolean }
export type Level = { level: number; xpRequired: number; title: string }
export type Rules = { xpRules: XpRule[]; levels: Level[] }

export type CreateGameSessionInput = {
  mode: 'mission' | 'entrainement' | 'defi'
  subjectId: string | null
  themeId: string | null
  difficulty: 'facile' | 'moyen' | 'difficile' | null
  total: number
  correct: number
  score: number
  xpEarned: number
  comboMax: number
  durationSec: number
  status?: 'termine' | 'abandonne'
}

/** Service gamification — `/gamification/*`. */
export const gamificationService = {
  weeklyLeaderboard: () => api.get<WeeklyRank[]>('/gamification/leaderboard/weekly'),
  globalLeaderboard: () => api.get<GlobalRank[]>('/gamification/leaderboard/global'),
  badges: () => api.get<Badge[]>('/gamification/badges'),
  rules: () => api.get<Rules>('/gamification/rules'),
  createGameSession: (input: CreateGameSessionInput) => api.post('/gamification/game-sessions', input),
}
