import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsService, type NotificationPref } from '@/services/notifications'
import type { Pagination } from '@/services/assignments'

export function useNotifications(pagination?: Pagination) {
  return useQuery({
    queryKey: ['notifications', 'list', pagination ?? {}],
    queryFn: () => notificationsService.list(pagination),
  })
}
export function useNotificationPrefs() {
  return useQuery({ queryKey: ['notifications', 'prefs'], queryFn: () => notificationsService.prefs() })
}
export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  })
}
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  })
}
export function useUpsertNotificationPref() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pref: NotificationPref) => notificationsService.upsertPref(pref),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'prefs'] }),
  })
}
