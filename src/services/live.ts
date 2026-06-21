import { api } from '@/lib/api-client'

export type LiveSession = {
  id: string
  title: string
  groupId: string | null
  groupName: string | null
  teacherName: string | null
  scheduledAt: string
  durationMin: number
  status: string
  meetUrl: string | null
  replayUrl: string | null
  confirmed: boolean
}

export type CreateSessionInput = {
  groupId: string
  title: string
  scheduledAt: string
  durationMin?: number
  meetUrl?: string
}

/** Service live — `/live/*`. */
export const liveService = {
  list: () => api.get<LiveSession[]>('/live'),
  create: (input: CreateSessionInput) => api.post<LiveSession>('/live', input),
  confirmAttendance: (id: string) => api.post<{ ok: true }>(`/live/${id}/attendance`),
}
