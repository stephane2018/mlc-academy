import { useMutation, useQuery } from '@tanstack/react-query'
import { billingService } from '@/services/billing'

/** Catalogue des formules d'abonnement (boutique parent). */
export function usePlans() {
  return useQuery({ queryKey: ['billing', 'plans'], queryFn: () => billingService.plans(), staleTime: 5 * 60_000 })
}

/** Lance un checkout produit puis redirige vers Stripe. */
export function useCheckout() {
  return useMutation({
    mutationFn: (productId: string) => billingService.checkout(productId),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url
    },
  })
}

/** Lance une souscription (parent → enfant) puis redirige vers Stripe. */
export function useSubscribe() {
  return useMutation({
    mutationFn: ({ planId, studentId }: { planId: string; studentId: string }) =>
      billingService.subscribe(planId, studentId),
    onSuccess: ({ url }) => {
      if (url) window.location.href = url
    },
  })
}
