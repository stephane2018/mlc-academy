import { api } from '@/lib/api-client'

/**
 * Service billing — `/billing/*`. Renvoie une URL de redirection Stripe Checkout
 * (le composant fait `window.location.href = url`). Le webhook est serveur-only.
 */
export type Plan = { id: string; name: string; priceCents: number; period: string | null; features: unknown }

export const billingService = {
  plans: () => api.get<Plan[]>('/billing/plans'),
  checkout: (productId: string) => api.post<{ url: string | null }>('/billing/checkout', { productId }),
  subscribe: (planId: string, studentId: string) =>
    api.post<{ url: string | null }>('/billing/subscribe', { planId, studentId }),
}
