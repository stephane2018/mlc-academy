import { Outlet, Link, useLocation, createFileRoute } from '@tanstack/react-router'
import { GraduationCap } from '@/components/icons'
import { BellBadge } from '@/components/notifications'
import { ThemeToggle } from '@/components/theme'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RequireRole } from '@/components/auth/require-role'
import { ParentChildProvider, useSelectedChild } from '@/lib/parent-child'
import { useRealtimeSync } from '@/hooks/use-realtime'
import { useNotifications } from '@/hooks/use-notifications'

export const Route = createFileRoute('/parent')({
  component: () => (
    <RequireRole roles={['parent']}>
      <ParentLayout />
    </RequireRole>
  ),
})

const tabs = [
  { to: '/parent', label: "Tableau de bord", exact: true },
  { to: '/parent/devoirs', label: 'Suivi & rapports', exact: false },
  { to: '/parent/boutique', label: 'Boutique', exact: false },
] as const

/** Sélecteur d'enfant (header) — partagé via le contexte ParentChild. */
function ChildSelect() {
  const { kids, selected, setSelectedId } = useSelectedChild()
  if (kids.length === 0) return null
  return (
    <Select value={selected?.id ?? ''} onValueChange={setSelectedId}>
      <SelectTrigger className="h-9 w-auto gap-2 border-border">
        <span className="text-base">{selected?.avatar}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {kids.map((k) => (
          <SelectItem key={k.id} value={k.id}>
            {k.pseudo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ParentLayout() {
  useRealtimeSync()
  const { pathname } = useLocation()
  const { data: notifs = [] } = useNotifications()
  const parentUnread = notifs.filter((n) => !n.read).length

  return (
    <ParentChildProvider>
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-brand text-white">
              <GraduationCap className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="font-heading text-sm font-extrabold tracking-tight">MLC Academy</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Espace Parent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle className="shrink-0" />
            <Button asChild variant="ghost" size="sm" className="shrink-0" aria-label="Notifications">
              <Link to="/parent/notifications">
                <BellBadge count={parentUnread} />
              </Link>
            </Button>
            <ChildSelect />
          </div>
        </div>

        {/* Onglets */}
        <nav className="flex w-full gap-1 px-4 sm:px-6 lg:px-8">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to)
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  '-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="w-full px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <Outlet />
      </main>
    </div>
    </ParentChildProvider>
  )
}
