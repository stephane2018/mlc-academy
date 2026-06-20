import { api } from '@/lib/api-client'
import type { Pagination } from './assignments'

export type Product = { id: string; title: string; kind: string; priceCents: number; status: string }

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
  publish: (input: PublishProductInput) => api.post<Product>('/marketplace/products', input),
}
