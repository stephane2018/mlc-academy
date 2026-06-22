import { api } from '@/lib/api-client'

/** Formule d'abonnement renvoyée par le BFF (`GET /admin/plans`). */
export type AdminPlan = {
  id: string
  name: string
  priceCents: number
  period: string | null
  features: unknown
  stripePriceId: string | null
  stripeProductId: string | null
}

/** Corps de création d'une formule (`POST /admin/plans`). */
export type CreatePlanInput = {
  name: string
  priceCents: number
  period?: string | null
  features?: unknown
}

/** Corps partiel d'édition d'une formule (`PATCH /admin/plans/:id`). */
export type UpdatePlanInput = {
  name?: string
  priceCents?: number
  period?: string | null
  features?: unknown
}

/** Statuts d'abonnement (miroir Stripe). */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid'

/** Abonnement renvoyé par le BFF (`GET /admin/subscriptions`). */
export type AdminSubscription = {
  id: string
  parentId: string | null
  planId: string | null
  status: SubscriptionStatus
  method: string | null
  startedAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
}

/** Pagination du listing des abonnements. */
export type AdminSubscriptionsQuery = {
  page?: number
  limit?: number
}

/** Service admin facturation — formules (`/admin/plans/*`) et abonnements (`/admin/subscriptions`). */
export const adminBillingService = {
  listPlans: () => api.get<AdminPlan[]>('/admin/plans'),
  createPlan: (body: CreatePlanInput) => api.post<AdminPlan>('/admin/plans', body),
  updatePlan: (id: string, body: UpdatePlanInput) => api.patch<AdminPlan>(`/admin/plans/${id}`, body),
  deletePlan: (id: string) => api.delete<{ ok: true }>(`/admin/plans/${id}`),
  listSubscriptions: (query?: AdminSubscriptionsQuery) =>
    api.get<AdminSubscription[]>('/admin/subscriptions', { query }),
}
