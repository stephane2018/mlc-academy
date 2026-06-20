import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Client Supabase côté navigateur — utilisé UNIQUEMENT pour :
 *  - l'authentification (login/signup, session, refresh du JWT)
 *  - le temps réel (abonnements messages/notifications, RLS active)
 *
 * Les DONNÉES passent par le backend BFF (cf. lib/api-client), jamais en accès
 * direct aux tables. La clé est la clé publiable (anon) : sûre côté client.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** Jeton d'accès courant (JWT) ou null — pour authentifier les appels au BFF. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
