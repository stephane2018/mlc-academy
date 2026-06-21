import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'
import type { QuizOption, GameAnswer } from './student'

export type ExamAttempt = { score: number | null; submittedAt: string | null }

/** Question d'examen — SANS la bonne réponse (correction 100% serveur, anti-triche). */
export type ExamQuestion = {
  id: string
  type: string
  prompt: string
  katex: string | null
  themeId: string | null
  options: QuizOption[]
}

export type ExamListItem = {
  id: string
  title: string
  subjectId: string
  themeId: string | null
  classId: string | null
  difficulty: string | null
  durationMin: number
  questionCount: number
  premium: boolean
  bestScore: number | null
  attempts: ExamAttempt[]
}

export type Exam = {
  id: string
  title: string
  subjectId: string
  themeId: string | null
  classId: string | null
  difficulty: string | null
  durationMin: number
  questionCount: number
  premium: boolean
  createdBy: string | null
  createdAt: string
}

/** Correction d'une question, renvoyée APRÈS soumission (examen terminé). */
export type ExamCorrection = {
  questionId: string
  correctOptionId: string | null
  explanation: string | null
  explanationKatex: string | null
}

export type ExamResult = {
  correct: number
  total: number
  score: number
  passed: boolean
  xpEarned: number
  newXp: number
  newLevel: number
  leveledUp: boolean
  corrections: ExamCorrection[]
}

/** Service exams — `/exams/*`. */
export const examsService = {
  list: (opts?: Pagination & { subjectId?: string }) => api.get<ExamListItem[]>('/exams', { query: opts }),
  get: (id: string) => api.get<Exam>(`/exams/${id}`),
  questions: (id: string) => api.get<ExamQuestion[]>(`/exams/${id}/questions`),
  submit: (id: string, answers: GameAnswer[]) => api.post<ExamResult>(`/exams/${id}/attempts`, { answers }),
}
