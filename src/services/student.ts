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

export type QuizOption = { id: string; label: string }
export type QuizQuestion = {
  id: string
  type: string
  prompt: string
  katex: string | null
  themeId: string | null
  explanation: string | null
  explanationKatex: string | null
  correctId: string | null
  options: QuizOption[]
}

export type GameAnswer = { questionId: string; optionId: string }
export type GameResult = {
  correct: number
  total: number
  score: number
  xpEarned: number
  newXp: number
  newLevel: number
  leveledUp: boolean
}

/** Service espace élève — `/student/*`. */
export const studentService = {
  me: () => api.get<StudentMe>('/student/me'),
  skills: () => api.get<SubjectSkill[]>('/student/skills'),
  questions: (subjectId: string, limit = 10) =>
    api.get<QuizQuestion[]>('/student/questions', { query: { subjectId, limit } }),
  submitGame: (input: { subjectId: string; answers: GameAnswer[]; durationSec?: number }) =>
    api.post<GameResult>('/student/game', input),
}
