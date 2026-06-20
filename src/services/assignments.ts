import { api } from '@/lib/api-client'

export type AssignmentType = 'devoir' | 'evaluation'
export type AssignmentDifficulty = 'facile' | 'moyen' | 'difficile'
export type AssignmentStatus = 'brouillon' | 'publie' | 'cloture'

export type AssignmentListItem = {
  id: string
  title: string
  type: string
  subjectId: string
  difficulty: string
  dueDate: string | null
  status: string
}

export type Assignment = AssignmentListItem & {
  teacherId: string
  themeId: string | null
  durationMin: number | null
  xpReward: number
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
  submit: (id: string) => api.post<{ ok: true }>(`/assignments/${id}/submit`),
}
