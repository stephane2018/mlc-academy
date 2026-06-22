import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminBillingService,
  type AdminSubscriptionsQuery,
  type CreatePlanInput,
  type UpdatePlanInput,
} from '@/services/admin-billing'

const PLANS_KEY = ['admin', 'plans'] as const
const SUBS_KEY = ['admin', 'subscriptions'] as const

/** Liste des formules (`GET /admin/plans`). */
export function useAdminPlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: () => adminBillingService.listPlans(),
  })
}

/** Crée une formule. */
export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePlanInput) => adminBillingService.createPlan(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

/** Met à jour une formule. */
export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePlanInput }) =>
      adminBillingService.updatePlan(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

/** Supprime une formule. */
export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminBillingService.deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

/** Liste paginée des abonnements (`GET /admin/subscriptions`). */
export function useAdminSubscriptions(query?: AdminSubscriptionsQuery) {
  return useQuery({
    queryKey: [...SUBS_KEY, query ?? {}],
    queryFn: () => adminBillingService.listSubscriptions(query),
  })
}
