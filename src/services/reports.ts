import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type ReportKind = 'devoir' | 'evaluation' | 'mensuel'

export type ReportSummary = {
  id: string
  studentId: string
  kind: ReportKind
  title: string
  summary: string | null
  score: number | null
  read: boolean
  createdAt: string
}

export type ReportDetail = ReportSummary & {
  teacherId: string | null
  parentId: string | null
  subjectId: string | null
  assignmentId: string | null
  storagePath: string | null
}

export type SendReportInput = {
  studentId: string
  kind: ReportKind
  title: string
  summary?: string
  score?: number
  subjectId?: string | null
  assignmentId?: string | null
}

/** Service reports — `/reports/*`. */
export const reportsService = {
  list: (pagination?: Pagination) => api.get<ReportSummary[]>('/reports', { query: pagination }),
  get: (id: string) => api.get<ReportDetail>(`/reports/${id}`),
  send: (input: SendReportInput) => api.post<ReportSummary>('/reports', input),
  markRead: (id: string) => api.put<{ ok: true }>(`/reports/${id}/read`),
  pdfUrl: (id: string) => api.get<{ url: string }>(`/reports/${id}/pdf`),
}
