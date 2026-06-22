import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type Product = {
  id: string
  title: string
  description: string | null
  kind: string
  subjectId: string | null
  classId: string | null
  sellerName: string | null
  priceCents: number
  status: string
  reviewNote: string | null
  createdAt: string | null
}

export type PublishProductInput = {
  title: string
  description?: string
  kind: 'ebook' | 'fiche' | 'pack' | 'video' | 'autre'
  subjectId: string | null
  classId: string | null
  priceCents: number
}

/** Service marketplace — `/marketplace/*`. */
export const marketplaceService = {
  list: (pagination?: Pagination) => api.get<Product[]>('/marketplace/products', { query: pagination }),
  mine: () => api.get<Product[]>('/marketplace/products/mine'),
  publish: (input: PublishProductInput) => api.post<Product>('/marketplace/products', input),
}
