import { env } from './env'
import { getAccessToken } from './supabase'

/**
 * Erreur d'API normalisée (miroir de l'enveloppe `{ error: { code, message } }`
 * du backend). Permet aux composants de réagir au `code`/`status`.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

type RequestOptions = {
  /** Query string (les valeurs null/undefined sont ignorées). */
  query?: Query
  /** Corps JSON (sérialisé automatiquement). */
  body?: unknown
  /** Endpoint public (n'attache pas le JWT). */
  skipAuth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(env.apiUrl + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

/**
 * Requête bas-niveau vers le BFF. Ajoute le Bearer JWT (sauf skipAuth),
 * déballe `{ data }` en cas de succès, lève `ApiError` sinon.
 */
async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (!opts.skipAuth) {
    const token = await getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  })

  // 204 / corps vide
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; issues?: unknown } }).error
    throw new ApiError(res.status, err?.code ?? 'error', err?.message ?? res.statusText, err?.issues)
  }
  // Enveloppe backend : { data: ... }
  return (json as { data: T }).data
}

/** Client HTTP du BFF — toutes les requêtes data passent par ici. */
export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
}
