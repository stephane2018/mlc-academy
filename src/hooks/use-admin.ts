import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import { contentService, type ModerateInput, type ProductStatus } from '@/services/content'
import type { Pagination } from '@/services/assignments'

// ── Gestionnaires & events Stripe (rôle admin) ───────────────────────────────
export function useManagers() {
  return useQuery({ queryKey: ['admin', 'managers'], queryFn: () => adminService.managers() })
}
export function useManagerCapabilities() {
  return useQuery({ queryKey: ['admin', 'capabilities'], queryFn: () => adminService.capabilities() })
}
export function useAdminGroup(id: string) {
  return useQuery({ queryKey: ['admin', 'group', id], queryFn: () => adminService.group(id) })
}
export function useAdminAssignment(id: string) {
  return useQuery({ queryKey: ['admin', 'assignment', id], queryFn: () => adminService.assignment(id) })
}
export function useSetManagerPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, caps }: { id: string; caps: string[] }) => adminService.setManagerPermissions(id, caps),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'managers'] }),
  })
}
export function useStripeEvents(opts?: Pagination & { status?: 'processed' | 'failed' }) {
  return useQuery({ queryKey: ['admin', 'stripe-events', opts ?? {}], queryFn: () => adminService.stripeEvents(opts) })
}
export function useReplayStripeEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.replayStripeEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'stripe-events'] }),
  })
}

// ── Modération marketplace (admin.marketplace) ───────────────────────────────
export function useModerationProducts(status?: ProductStatus) {
  return useQuery({ queryKey: ['admin', 'products', status ?? 'all'], queryFn: () => contentService.listProducts(status) })
}
export function useModerateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ModerateInput }) => contentService.moderateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })
}
