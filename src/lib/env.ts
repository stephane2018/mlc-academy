/**
 * Variables d'environnement client (Vite n'expose que les `VITE_*`).
 * Lecture centralisée + garde-fou : une clé manquante échoue tôt et clairement.
 */
function required(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Variable d'env manquante : ${key} (préfixe VITE_ requis, cf. .env.local)`)
  return value
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  /** Base URL du backend BFF (sans slash final). */
  apiUrl: required('VITE_API_URL', import.meta.env.VITE_API_URL).replace(/\/$/, ''),
} as const
