import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { BottomNav } from '@/components/student/bottom-nav'
import { StudentSideNav } from '@/components/student/side-nav'
import { RequireRole } from '@/components/auth/require-role'
import { useRealtimeSync } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/eleve')({
  component: () => (
    <RequireRole roles={['eleve']}>
      <EleveLayout />
    </RequireRole>
  ),
})

/** Flux focalisés (quiz, passation, salle live) : barre d'action propre → pas de bottom-nav. */
function isFocusedFlow(pathname: string): boolean {
  return (
    pathname === '/eleve/jeu' ||
    pathname.startsWith('/eleve/salle/') ||
    /^\/eleve\/(examens|devoirs)\/[^/]+$/.test(pathname)
  )
}

function EleveLayout() {
  useRealtimeSync()
  const { pathname } = useLocation()
  const focused = isFocusedFlow(pathname)

  return (
    <div className="flex min-h-dvh w-full bg-background">
      {/* Desktop : navigation latérale */}
      <StudentSideNav />

      {/* Colonne de contenu : pleine largeur */}
      <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col bg-background">
        <main
          className={cn(
            'w-full flex-1',
            // Marge basse pour la nav fixe (mobile/tablette), sauf en flux focalisé
            !focused && 'pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0',
          )}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile/tablette : navigation basse fixée (app-like) */}
      {!focused && <BottomNav />}
    </div>
  )
}
