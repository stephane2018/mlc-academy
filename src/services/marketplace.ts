import { api } from '@/lib/api-client'
import { supabase } from '@/lib/supabase'
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
  coverPath: string | null
  hasContent: boolean
}

export type PublishProductInput = {
  title: string
  description?: string
  kind: 'ebook' | 'fiche' | 'pack' | 'video' | 'autre'
  subjectId: string | null
  classId: string | null
  priceCents: number
  coverPath?: string | null
  contentPath?: string | null
  contentFileName?: string | null
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Session expirée — reconnecte-toi.')
  return data.user.id
}

const safe = (name: string) => name.replace(/[^\w.\-]+/g, '_')

/** Couverture → bucket `resources` (lecture authentifiée), affichable en vignette. */
export async function uploadProductCover(file: File): Promise<string> {
  const userId = await currentUserId()
  const path = `${userId}/products/covers/${crypto.randomUUID()}-${safe(file.name)}`
  const { error } = await supabase.storage.from('resources').upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

/** Contenu vendu → bucket privé `products` (téléchargement via le BFF après achat). */
export async function uploadProductContent(file: File): Promise<{ storagePath: string; fileName: string }> {
  const userId = await currentUserId()
  const path = `${userId}/${crypto.randomUUID()}-${safe(file.name)}`
  const { error } = await supabase.storage.from('products').upload(path, file, { upsert: false })
  if (error) throw error
  return { storagePath: path, fileName: file.name }
}

/** URL signée d'une couverture (bucket `resources`). */
export async function getCoverUrl(coverPath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('resources').createSignedUrl(coverPath, 600)
  if (error || !data) throw error ?? new Error('Couverture indisponible')
  return data.signedUrl
}

/** Service marketplace — `/marketplace/*`. */
export const marketplaceService = {
  list: (pagination?: Pagination) => api.get<Product[]>('/marketplace/products', { query: pagination }),
  mine: () => api.get<Product[]>('/marketplace/products/mine'),
  publish: (input: PublishProductInput) => api.post<Product>('/marketplace/products', input),
  /** URL signée du contenu (le BFF vérifie vendeur/acheteur). */
  contentUrl: (id: string) => api.get<{ url: string; fileName: string | null }>(`/marketplace/products/${id}/content`),
}
