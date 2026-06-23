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
}
