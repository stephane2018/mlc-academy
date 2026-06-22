import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { marketplaceService, type PublishProductInput } from '@/services/marketplace'
import type { Pagination } from '@/services/assignments'

export function useProducts(pagination?: Pagination) {
  return useQuery({ queryKey: ['marketplace', 'list', pagination ?? {}], queryFn: () => marketplaceService.list(pagination) })
}
export function useMyProducts() {
  return useQuery({ queryKey: ['marketplace', 'mine'], queryFn: () => marketplaceService.mine() })
}
export function usePublishProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PublishProductInput) => marketplaceService.publish(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketplace'] }),
  })
}
