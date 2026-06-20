import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type ExamListItem = {
  id: string
  title: string
  subjectId: string
  classId: string | null
  difficulty: string | null
  durationMin: number
  questionCount: number
  premium: boolean
}

export type Exam = ExamListItem & {
  themeId: string | null
  createdBy: string | null
  createdAt: string
}

export type ExamAttempt = {
  id: string
  examId: string | null
  studentId: string | null
  score: number | null
  submittedAt: string | null
}

/** Service exams — `/exams/*`. */
export const examsService = {
  list: (opts?: Pagination & { subjectId?: string }) => api.get<ExamListItem[]>('/exams', { query: opts }),
  get: (id: string) => api.get<Exam>(`/exams/${id}`),
  createAttempt: (id: string, score?: number) => api.post<ExamAttempt>(`/exams/${id}/attempts`, { score }),
}
