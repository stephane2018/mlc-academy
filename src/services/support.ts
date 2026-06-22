import { api } from '@/lib/api-client'

/** Statut d'un ticket de support. */
export type SupportTicketStatus = 'ouvert' | 'en_cours' | 'resolu'

/** Ticket de support tel que renvoyé par le BFF (vue liste). */
export type SupportTicket = {
  id: string
  authorId: string
  authorName: string | null
  subject: string
  category: string | null
  status: SupportTicketStatus
  createdAt: string
  updatedAt: string
}

/** Message d'un fil de support. */
export type SupportMessage = {
  id: string
  authorId: string
  body: string
  createdAt: string
}

/** Détail d'un ticket : le ticket + son fil de messages. */
export type SupportTicketDetail = SupportTicket & {
  messages: SupportMessage[]
}

/** Service support (rôle admin) — `/support/*`. */
export const supportService = {
  /** L'admin voit TOUS les tickets. */
  list: () => api.get<SupportTicket[]>('/support/tickets'),
  get: (id: string) => api.get<SupportTicketDetail>(`/support/tickets/${id}`),
  reply: (id: string, body: string) =>
    api.post<{ ok: true }>(`/support/tickets/${id}/messages`, { body }),
  updateStatus: (id: string, status: SupportTicketStatus) =>
    api.patch<SupportTicket>(`/support/tickets/${id}`, { status }),
}
