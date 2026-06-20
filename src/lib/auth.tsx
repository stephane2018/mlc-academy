import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { authService, type AppRole, type Me } from '@/services/auth'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthValue = {
  status: AuthStatus
  session: Session | null
  /** Profil + droits effectifs (null tant que non chargé / déconnecté). */
  me: Me | null
  roles: AppRole[]
  isAdmin: boolean
  /** Droit effectif (admin → toujours vrai via le joker '*'). */
  can: (permission: string) => boolean
  hasRole: (role: AppRole) => boolean
  signInWithPassword: (email: string, password: string) => Promise<void>
  /** Connexion élève au pseudo + PIN (le BFF renvoie la session, on la pose). */
  signInStudent: (pseudo: string, pin: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

/**
 * Fournit l'état d'auth (session Supabase + profil `/auth/me`) à toute l'app.
 * Auth gérée CÔTÉ CLIENT : la session vit dans le navigateur ; les gardes de
 * route lisent ce contexte (avec un état `loading` pendant l'hydratation SSR).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    let active = true

    // Charge le profil BFF quand une session existe ; sinon nettoie l'état.
    async function sync(next: Session | null) {
      if (!active) return
      setSession(next)
      if (!next) {
        setMe(null)
        setStatus('unauthenticated')
        return
      }
      try {
        const profile = await authService.me()
        if (!active) return
        setMe(profile)
        setStatus('authenticated')
      } catch {
        // Session présente mais /auth/me échoue (token invalide, BFF down…)
        if (active) setStatus('authenticated') // session valide ; profil indisponible
      }
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => sync(next))
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value: AuthValue = {
    status,
    session,
    me,
    roles: me?.roles ?? [],
    isAdmin: me?.isAdmin ?? false,
    can: (permission) => me?.isAdmin === true || (me?.permissions.includes(permission) ?? false),
    hasRole: (role) => me?.roles.includes(role) ?? false,
    async signInWithPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // onAuthStateChange déclenchera le sync du profil.
    },
    async signInStudent(pseudo, pin) {
      // Le BFF résout pseudo→e-mail et fait le password-grant (PIN), puis nous rend la session.
      const { accessToken, refreshToken } = await authService.loginStudent(pseudo, pin)
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (error) throw error
    },
    async signOut() {
      await supabase.auth.signOut()
      queryClient.clear() // purge le cache server-state de l'utilisateur précédent
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Accès à l'état d'auth. À utiliser sous `<AuthProvider>`. */
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
