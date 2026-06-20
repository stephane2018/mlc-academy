import { api } from '@/lib/api-client'

export type CoachMessage = { role: 'eleve' | 'coach'; body: string }

/** Service coach IA — `/coach/*`. */
export const coachService = {
  history: () => api.get<CoachMessage[]>('/coach/messages'),
  ask: (message: string) => api.post<{ reply: string }>('/coach/messages', { message }),
}
