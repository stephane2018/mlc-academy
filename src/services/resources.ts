import { api } from '@/lib/api-client'
import { supabase } from '@/lib/supabase'

export type SharedResourceType = 'video' | 'pdf' | 'exercice' | 'fiche'
export type SharedStatus = 'publie' | 'planifie' | 'brouillon'

export type SharedResource = {
  id: string
  title: string
  description: string | null
  type: SharedResourceType
  status: SharedStatus
  message: string | null
  storagePath: string | null
  fileName: string | null
  fileSize: string | null
  scheduledAt: string | null
  createdAt: string
  groups: string[]
}

export type CreateResourceInput = {
  title: string
  type: SharedResourceType
  description?: string | null
  message?: string | null
  status?: SharedStatus
  scheduledAt?: string | null
  storagePath?: string | null
  fileName?: string | null
  fileSize?: string | null
}

const BUCKET = 'resources'

/** Détails d'un fichier uploadé, à passer à `create`. */
export type UploadedFile = { storagePath: string; fileName: string; fileSize: string }

/**
 * Upload direct du fichier dans le bucket `resources` (RLS : prof autorisé),
 * sous `{userId}/{uuid}-{nom}`. Le chemin est ensuite enregistré via le BFF.
 */
export async function uploadResourceFile(file: File): Promise<UploadedFile> {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('Session expirée — reconnecte-toi.')
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return { storagePath: path, fileName: file.name, fileSize: String(file.size) }
}

/** Image de QCM (énoncé/option) → bucket `resources`, dossier `{userId}/questions/…`. */
export async function uploadQuestionImage(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('Session expirée — reconnecte-toi.')
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${userId}/questions/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

/** URL signée (5 min) pour télécharger/visualiser un fichier de ressource. */
export async function getResourceDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 300)
  if (error || !data) throw error ?? new Error('Lien de téléchargement indisponible')
  return data.signedUrl
}

/** Service resources (espace prof) — `/resources/*`. */
export const resourcesService = {
  list: () => api.get<SharedResource[]>('/resources'),
  create: (input: CreateResourceInput) => api.post<SharedResource>('/resources', input),
  update: (id: string, input: Partial<CreateResourceInput>) => api.patch<SharedResource>(`/resources/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/resources/${id}`),
  setTargets: (id: string, groupIds: string[]) => api.post<{ targeted: number }>(`/resources/${id}/targets`, { groupIds }),
}
