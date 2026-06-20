import { useEffect, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'
import type { AppRole } from '@/services/auth'

/** Page d'accueil par rôle (redirection après login / en cas de mauvais rôle). */
export function roleHome(role: AppRole | undefined): string {
  switch (role) {
    case 'eleve':
      return '/eleve/dashboard'
    case 'prof':
      return '/prof'
    case 'parent':
      return '/parent'
    case 'admin':
    case 'gestionnaire':
      return '/admin'
    default:
      return '/'
  }
}

/**
 * Garde de route côté client : n'affiche les enfants que si l'utilisateur est
 * authentifié ET porte l'un des rôles autorisés. Sinon redirige (login si non
 * connecté, sa propre home si mauvais rôle). Pendant la résolution de session
 * (incl. hydratation SSR), affiche un état de chargement.
 */
export function RequireRole({ roles, children }: { roles: AppRole[]; children: ReactNode }) {
  const { status, roles: userRoles } = useAuth()
  const navigate = useNavigate()
  const allowed = userRoles.some((r) => roles.includes(r))

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      navigate({ to: '/', replace: true })
    } else if (!allowed) {
      navigate({ to: roleHome(userRoles[0]), replace: true })
    }
  }, [status, allowed, userRoles, navigate])

  if (status !== 'authenticated' || !allowed) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">
        Chargement…
      </div>
    )
  }
  return <>{children}</>
}
