import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'
import type { QuizOption } from './student'

export type ExamDifficulty = 'facile' | 'moyen' | 'difficile'
export type ExamStatus = 'brouillon' | 'publie'

/** Examen tel que listé par le BFF admin. */
export type AdminExamListItem = {
  id: string
  title: string
  subjectId: string
  themeId: string | null
  classId: string | null
  durationMin: number
  questionCount: number
  premium: boolean
  difficulty: ExamDifficulty | null
  status: ExamStatus
  createdAt: string
}

/**
 * Question d'examen côté ADMIN (auteur) : inclut la bonne réponse + l'explication
 * pour permettre la ré-édition. L'endpoint ÉLÈVE ne renvoie jamais ces champs.
 */
export type AdminExamQuestion = {
  id: string
  prompt: string
  katex: string | null
  themeId: string | null
  explanation: string | null
  explanationKatex: string | null
  correctOptionId: string | null
  options: QuizOption[]
}

/** Détail d'un examen + ses questions (énoncé/options sans la bonne réponse). */
export type AdminExamDetail = AdminExamListItem & {
  questions: AdminExamQuestion[]
}

export type CreateExamInput = {
  title: string
  subjectId: string
  themeId?: string | null
  classId?: string | null
  durationMin?: number
  premium?: boolean
  difficulty?: ExamDifficulty
}

/** Champs modifiables d'un examen (PATCH partiel). */
export type UpdateExamInput = Partial<{
  title: string
  subjectId: string
  themeId: string | null
  classId: string | null
  durationMin: number
  premium: boolean
  difficulty: ExamDifficulty
  status: ExamStatus
}>

/** Question composée par l'admin (entrée d'attache) — 2 à 8 options, exactement 1 correcte. */
export type ComposedExamQuestion = {
  prompt: string
  katex?: string | null
  themeId?: string | null
  explanation?: string | null
  explanationKatex?: string | null
  options: { label: string; isCorrect: boolean }[]
}

/** Service examens (rôle admin) — `/admin/exams/*`. */
export const adminExamsService = {
  list: (pagination?: Pagination) =>
    api.get<AdminExamListItem[]>('/admin/exams', { query: pagination }),
  get: (id: string) => api.get<AdminExamDetail>(`/admin/exams/${id}`),
  create: (input: CreateExamInput) => api.post<AdminExamListItem>('/admin/exams', input),
  update: (id: string, input: UpdateExamInput) =>
    api.patch<AdminExamListItem>(`/admin/exams/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/admin/exams/${id}`),
  attachQuestions: (id: string, questions: ComposedExamQuestion[]) =>
    api.post<{ attached: number }>(`/admin/exams/${id}/questions`, { questions }),
  /** Remplace l'ensemble des questions (builder de la page dédiée). */
  setQuestions: (id: string, questions: ComposedExamQuestion[]) =>
    api.put<{ count: number }>(`/admin/exams/${id}/questions`, { questions }),
}
