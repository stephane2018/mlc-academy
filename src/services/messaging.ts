import { api } from '@/lib/api-client'

export type Conversation = {
  id: string
  teacherId: string
  studentId: string
  createdAt: string
  unreadCount: number
}

export type Message = {
  id: string
  sender: 'prof' | 'eleve'
  body: string
  read: boolean
  createdAt: string
}

/** Service messaging — `/messaging/*`. */
export const messagingService = {
  conversations: () => api.get<Conversation[]>('/messaging/conversations'),
  createConversation: (studentId: string) =>
    api.post<Conversation>('/messaging/conversations', { studentId }),
  messages: (conversationId: string) =>
    api.get<Message[]>(`/messaging/conversations/${conversationId}/messages`),
  send: (conversationId: string, body: string) =>
    api.post<Message>(`/messaging/conversations/${conversationId}/messages`, { body }),
  markRead: (conversationId: string) =>
    api.put<{ ok: true; marked: number }>(`/messaging/conversations/${conversationId}/read`),
}
