import { api } from '@/lib/api-client'
import { supabase } from '@/lib/supabase'
import type { QuizOption, GameAnswer } from './student'

export type AssignmentType = 'devoir' | 'evaluation'
export type AssignmentDifficulty = 'facile' | 'moyen' | 'difficile'
export type AssignmentStatus = 'brouillon' | 'publie' | 'cloture'

/** Soumission de l'élève courant (null s'il n'a pas rendu). */
export type AssignmentSubmission = {
  status: string
  score: number | null
  submittedAt: string | null
  feedback: string | null
  hasFile: boolean
}

export type AssignmentListItem = {
  id: string
  title: string
  type: string
  subjectId: string
  themeId: string | null
  difficulty: string
  durationMin: number | null
  dueDate: string | null
  status: string
  xpReward: number
  questionCount: number
  submission: AssignmentSubmission | null
}

/** Question de devoir — SANS la bonne réponse (correction 100% serveur). */
export type AssignmentQuestion = {
  id: string
  type: string
  prompt: string
  katex: string | null
  imagePath: string | null
  themeId: string | null
  options: QuizOption[]
}

/** Correction d'une question, renvoyée APRÈS remise. */
export type AssignmentCorrection = {
  questionId: string
  correctOptionId: string | null
  explanation: string | null
  explanationKatex: string | null
}

export type AssignmentResult = {
  correct: number
  total: number
  score: number | null
  passed: boolean
  xpEarned: number
  newXp: number
  newLevel: number
  leveledUp: boolean
  corrections: AssignmentCorrection[]
}

export type Assignment = AssignmentListItem & {
  teacherId: string
  message: string | null
  createdAt: string
}

export type CreateAssignmentInput = {
  title: string
  type: AssignmentType
  subjectId: string
  themeId: string | null
  difficulty: AssignmentDifficulty
  durationMin?: number
  dueDate?: string
  xpReward?: number
  message?: string
}

export type Pagination = { page?: number; limit?: number }

/** Service assignments — `/assignments/*`. */
export const assignmentsService = {
  list: (pagination?: Pagination) => api.get<AssignmentListItem[]>('/assignments', { query: pagination }),
  get: (id: string) => api.get<Assignment>(`/assignments/${id}`),
  create: (input: CreateAssignmentInput) => api.post<Assignment>('/assignments', input),
  updateStatus: (id: string, status: AssignmentStatus) =>
    api.put<Assignment>(`/assignments/${id}/status`, { status }),
  questions: (id: string) => api.get<AssignmentQuestion[]>(`/assignments/${id}/questions`),
  submit: (id: string, answers: GameAnswer[]) =>
    api.post<AssignmentResult>(`/assignments/${id}/submit`, { answers }),
  attachQuestions: (id: string, questions: ComposedQuestion[]) =>
    api.post<{ attached: number }>(`/assignments/${id}/questions`, { questions }),
  setTargets: (id: string, input: { groupIds?: string[]; studentIds?: string[] }) =>
    api.post<{ targeted: number }>(`/assignments/${id}/targets`, input),
  submissions: (id: string) => api.get<AssignmentSubmissionRow[]>(`/assignments/${id}/submissions`),
  /** Remise par fichier (accessibilité) : la copie est déjà uploadée. */
  submitFile: (id: string, storagePath: string) =>
    api.post<{ ok: true }>(`/assignments/${id}/submit-file`, { storagePath }),
  /** URL signée de la copie déposée (prof auteur ou élève proprio). */
  submissionFileUrl: (id: string, studentId: string) =>
    api.get<{ url: string }>(`/assignments/${id}/submissions/${studentId}/file`),
  /** Notation manuelle d'une copie (prof auteur). */
  grade: (id: string, input: { studentId: string; score: number; feedback?: string | null }) =>
    api.post<{ ok: true }>(`/assignments/${id}/grade`, input),
}

/** Upload de la copie de l'élève dans le bucket privé `submissions` (`{userId}/…`). */
export async function uploadSubmissionFile(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('Session expirée — reconnecte-toi.')
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from('submissions').upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

/** Copie d'élève dans la vue résultats du prof. */
export type AssignmentSubmissionRow = {
  studentId: string
  pseudo: string
  avatar: string
  status: string
  score: number | null
  submittedAt: string | null
  hasFile: boolean
  feedback: string | null
}

/** Question composée par le prof (entrée d'attache). */
export type ComposedQuestion = {
  prompt: string
  katex?: string | null
  imagePath?: string | null
  themeId?: string | null
  explanation?: string | null
  options: { label: string; isCorrect: boolean; imagePath?: string | null }[]
}
