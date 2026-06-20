import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type NotifChannel = 'inapp' | 'push' | 'email'
export type NotifCategory =
  | 'devoir' | 'retard' | 'rapport' | 'resultat' | 'live' | 'inactivite' | 'badge' | 'message' | 'systeme'

export type Notification = {
  id: string
  kind: string
  title: string
  body: string | null
  read: boolean
  createdAt: string
}

export type NotificationPref = { category: NotifCategory; channel: NotifChannel; enabled: boolean }

/** Service notifications — `/notifications/*`. */
export const notificationsService = {
  list: (pagination?: Pagination) => api.get<Notification[]>('/notifications', { query: pagination }),
  markRead: (id: string) => api.put<{ ok: true }>(`/notifications/${id}/read`),
  markAllRead: () => api.put<{ ok: true }>('/notifications/read-all'),
  prefs: () => api.get<NotificationPref[]>('/notifications/prefs'),
  upsertPref: (pref: NotificationPref) => api.put<{ ok: true }>('/notifications/prefs', pref),
}
