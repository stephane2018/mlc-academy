import { api } from '@/lib/api-client'

/** Difficulté d'une question (énumération côté backend). */
export type QuestionDifficulty = 'facile' | 'moyen' | 'difficile'

/** Option d'une question telle que renvoyée par le BFF. */
export type QuestionOption = {
  id: string
  label: string
  imagePath: string | null
  isCorrect: boolean
  position: number
}

/** Question de la banque (forme renvoyée par le BFF). */
export type Question = {
  id: string
  type: string
  prompt: string
  katex: string | null
  imagePath: string | null
  subjectId: string
  themeId: string | null
  classId: string | null
  difficulty: QuestionDifficulty
  explanation: string | null
  explanationKatex: string | null
  options: QuestionOption[]
  optionsCount: number
}

/** Filtres/pagination de la liste des questions. */
export type QuestionListParams = {
  subjectId?: string | null
  themeId?: string | null
  page?: number
  limit?: number
}

/** Option envoyée lors de la création/édition (sans id, généré côté backend). */
export type QuestionOptionInput = {
  label: string
  isCorrect: boolean
  position?: number
}

/** Corps de création d'une question. */
export type CreateQuestionInput = {
  subjectId: string
  themeId?: string | null
  classId?: string | null
  type?: string
  prompt: string
  katex?: string | null
  difficulty?: QuestionDifficulty
  explanation?: string | null
  explanationKatex?: string | null
  options: QuestionOptionInput[]
}

/** Corps d'édition : champs partiels ; `options` REMPLACE l'ensemble si fourni. */
export type UpdateQuestionInput = Partial<CreateQuestionInput>

/** Service questions (banque de questions admin) — `/questions/*`. */
export const questionsService = {
  list: (params?: QuestionListParams) =>
    api.get<Question[]>('/questions', { query: params }),
  get: (id: string) => api.get<Question>(`/questions/${id}`),
  create: (input: CreateQuestionInput) => api.post<Question>('/questions', input),
  update: (id: string, input: UpdateQuestionInput) =>
    api.patch<Question>(`/questions/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/questions/${id}`),
}
