import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type Manager = { id: string; name: string; email: string; caps: string[] }

/** Capacité back-office assignable, issue du catalogue `permissions` (BD). */
export type Capability = { key: string; label: string; description: string | null; category: string }

export type StripeEvent = {
  id: string
  type: string | null
  status: string
  last_error: string | null
  failed_at: string | null
  processed_at: string | null
}

/** Fiche groupe (vue admin). */
export type AdminGroup = {
  id: string
  name: string
  code: string
  classCode: string | null
  teacherId: string | null
  teacherName: string | null
  members: { id: string; pseudo: string; avatar: string }[]
}

/** Fiche devoir + copies (vue admin). */
export type AdminAssignment = {
  id: string
  title: string
  type: string
  status: string
  questionCount: number
  teacherName: string | null
  submissions: { studentId: string; pseudo: string; score: number | null; status: string; hasFile: boolean }[]
}

/** Service admin (rôle admin) — `/admin/*`. */
export const adminService = {
  managers: () => api.get<Manager[]>('/admin/managers'),
  capabilities: () => api.get<Capability[]>('/admin/managers/capabilities'),
  setManagerPermissions: (id: string, caps: string[]) =>
    api.put<{ userId: string; caps: string[] }>(`/admin/managers/${id}/permissions`, { caps }),
  stripeEvents: (opts?: Pagination & { status?: 'processed' | 'failed' }) =>
    api.get<StripeEvent[]>('/admin/stripe-events', { query: opts }),
  replayStripeEvent: (id: string) =>
    api.post<{ id: string; type: string; status: 'processed' }>(`/admin/stripe-events/${id}/replay`),
  group: (id: string) => api.get<AdminGroup>(`/admin/groups/${id}`),
  assignment: (id: string) => api.get<AdminAssignment>(`/admin/assignments/${id}`),
}
