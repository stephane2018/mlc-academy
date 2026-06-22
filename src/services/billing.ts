import { api } from '@/lib/api-client'

/**
 * Service billing — `/billing/*`. Renvoie une URL de redirection Stripe Checkout
 * (le composant fait `window.location.href = url`). Le webhook est serveur-only.
 */
export type Plan = { id: string; name: string; priceCents: number; period: string | null; features: unknown }

/** Abonnement courant de l'élève (null si aucun). */
export type SubscriptionState = {
  plan: { id: string; name: string; priceCents: number; period: string | null }
  status: string
  method: string | null
  since: string | null
  nextBilling: string | null
  cancelAtPeriodEnd: boolean
}

/** Facture Stripe rattachée à l'abonnement. */
export type Invoice = {
  id: string
  amountCents: number
  currency: string
  status: string
  issuedAt: string | null
  paidAt: string | null
  pdfUrl: string | null
  hostedInvoiceUrl: string | null
}

export const billingService = {
  plans: () => api.get<Plan[]>('/billing/plans'),
  checkout: (productId: string) => api.post<{ url: string | null }>('/billing/checkout', { productId }),
  subscribe: (planId: string, studentId: string) =>
    api.post<{ url: string | null }>('/billing/subscribe', { planId, studentId }),
  /** Souscription d'un élève pour lui-même (espace élève). */
  subscribeSelf: (planId: string) =>
    api.post<{ url: string | null }>('/billing/subscribe/self', { planId }),
  /** Abonnement courant de l'élève (null si aucun). */
  mySubscription: () => api.get<SubscriptionState | null>('/billing/subscription'),
  /** Factures de l'élève. */
  invoices: () => api.get<Invoice[]>('/billing/invoices'),
}
