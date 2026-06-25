import { Outlet, Link, useLocation, useNavigate, createFileRoute } from '@tanstack/react-router'
import { GraduationCap, LogOut, UserPlus } from '@/components/icons'
import { BellBadge } from '@/components/notifications'
import { ThemeToggle } from '@/components/theme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spreadAvatar } from '@/lib/avatar'
import { RequireRole } from '@/components/auth/require-role'
import { ParentChildProvider, useSelectedChild } from '@/lib/parent-child'
import { LinkChildDialog } from '@/components/parent/link-child-dialog'
import { useAuth } from '@/lib/auth'
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

/** Switcher d'enfant (header) — pastilles d'avatars cliquables, partagé via le contexte. */
function ChildSwitcher() {
  const { kids, selectedId, setSelectedId } = useSelectedChild()
  if (kids.length === 0) return null

  const addButton = (
    <LinkChildDialog
      trigger={
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-xl"
          aria-label="Ajouter un enfant"
          title="Ajouter un enfant"
        >
          <UserPlus className="size-4" />
        </Button>
      }
    />
  )

  // Un seul enfant → simple pastille (rien à switcher) + ajout.
  if (kids.length === 1) {
    const k = kids[0]!
    return (
      <div className="flex items-center gap-1.5">
        <span className="flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold">
          <span className="text-base">{spreadAvatar(k.avatar, k.pseudo)}</span>
          <span className="hidden max-w-[8rem] truncate sm:inline">{k.pseudo}</span>
        </span>
        {addButton}
      </div>
    )
  }

  // Plusieurs enfants → segmenté, défilable si nombreux.
  return (
    <div className="flex items-center gap-1.5">
      <div
        role="tablist"
        aria-label="Changer d'enfant"
        className="no-scrollbar flex max-w-[55vw] items-center gap-1 overflow-x-auto rounded-xl bg-secondary p-1 lg:max-w-none"
      >
        {kids.map((k) => {
          const active = k.id === selectedId
          return (
            <button
              key={k.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(k.id)}
              title={k.pseudo}
              className={cn(
                'flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="text-base leading-none">{spreadAvatar(k.avatar, k.pseudo)}</span>
              <span className={cn('max-w-[7rem] truncate', active ? 'inline' : 'hidden sm:inline')}>
                {k.pseudo}
              </span>
            </button>
          )
        })}
      </div>
      {addButton}
    </div>
  )
}

function ParentLayout() {
  useRealtimeSync()
  const { pathname } = useLocation()
  const { data: notifs = [] } = useNotifications()
  const parentUnread = notifs.filter((n) => !n.read).length
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate({ to: '/', replace: true })
  }

  return (
    <ParentChildProvider>
    <div className="theme-parent min-h-dvh bg-background text-foreground">
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
            <ChildSwitcher />
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              aria-label="Se déconnecter"
              title="Se déconnecter"
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
            </Button>
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
