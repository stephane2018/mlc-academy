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

export type QuizOption = { id: string; label: string; imagePath?: string | null }
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

/** Une question telle que renvoyée dans l'historique élève (correction). */
export type HistoryQuestion = {
  id: string
  prompt: string
  katex: string | null
  options: { id: string; label: string }[]
  correctId: string
  explanation: string | null
}

/** Une entrée d'historique (devoir ou examen rendu). */
export type HistoryEntry = {
  id: string
  source: 'devoir' | 'examen'
  title: string
  subject: string
  theme: string | null
  type: 'devoir' | 'evaluation'
  score: number
  submittedAt: string
  xpReward: number
  questions: HistoryQuestion[]
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
  joinGroup: (code: string) =>
    api.post<{ groupId: string; groupName: string; alreadyMember: boolean }>('/student/join-group', { code }),
  history: () => api.get<HistoryEntry[]>('/student/history'),
}
