import { Outlet, createFileRoute } from '@tanstack/react-router'
import { BottomNav } from '@/components/student/bottom-nav'
import { StudentSideNav } from '@/components/student/side-nav'

export const Route = createFileRoute('/eleve')({
  component: EleveLayout,
})

function EleveLayout() {
  return (
    <div className="flex min-h-dvh w-full bg-background">
      {/* Desktop : navigation latérale */}
      <StudentSideNav />

      {/* Colonne de contenu : pleine largeur */}
      <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col bg-background">
        <main className="w-full flex-1">
          <Outlet />
        </main>
        {/* Mobile/tablette : navigation basse */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
