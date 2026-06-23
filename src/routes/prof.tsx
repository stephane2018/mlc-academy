import { Outlet, Link, useLocation, useNavigate, createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard, CalendarDays, Users, Search, Bell, GraduationCap, Library, Boxes, MessageSquare, FileText, Dumbbell, Store, LogOut } from '@/components/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from '@/components/icons'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme'
import { RequireRole } from '@/components/auth/require-role'
import { useAuth } from '@/lib/auth'
import { useRealtimeSync } from '@/hooks/use-realtime'
import { useNotifications } from '@/hooks/use-notifications'

export const Route = createFileRoute('/prof')({
  component: () => (
    <RequireRole roles={['prof']}>
      <ProfLayout />
    </RequireRole>
  ),
})

const navItems = [
  { to: '/prof', label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { to: '/prof/planning', label: 'Planning', icon: CalendarDays, exact: false },
  { to: '/prof/exercices', label: 'Devoirs', icon: Dumbbell, exact: false },
  { to: '/prof/eleves', label: 'Annuaire', icon: Users, exact: false },
  { to: '/prof/groupes', label: 'Groupes', icon: Boxes, exact: false },
  { to: '/prof/ressources', label: 'Ressources', icon: Library, exact: false },
  { to: '/prof/produits', label: 'Boutique', icon: Store, exact: false },
  { to: '/prof/messages', label: 'Messages', icon: MessageSquare, exact: false },
  { to: '/prof/rapports', label: 'Rapports', icon: FileText, exact: false },
] as const

const pageTitles: Record<string, string> = {
  '/prof': "Vue d'ensemble",
  '/prof/planning': 'Planning',
  '/prof/exercices': 'Devoirs & évaluations',
  '/prof/eleves': 'Annuaire des élèves',
  '/prof/groupes': 'Mes groupes',
  '/prof/ressources': 'Ressources',
  '/prof/produits': 'Boutique — mes produits',
  '/prof/messages': 'Messagerie',
  '/prof/rapports': 'Rapports',
  '/prof/notifications': 'Notifications',
  '/prof/preferences': 'Préférences',
}

function NavLinks({
  pathname,
  onNavigate,
  rail = false,
}: {
  pathname: string
  onNavigate?: () => void
  rail?: boolean
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={rail ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              rail && 'justify-center px-0',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Icon className="size-5 shrink-0" />
            {!rail && <span>{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({
  pathname,
  onNavigate,
  rail = false,
}: {
  pathname: string
  onNavigate?: () => void
  rail?: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-2.5 px-2 py-1', rail && 'justify-center px-0')}>
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
          <GraduationCap className="size-5" />
        </div>
        {!rail && (
          <div className="leading-tight">
            <p className="font-heading text-sm font-extrabold tracking-tight">MLC Academy</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Espace Prof</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex-1">
        <NavLinks pathname={pathname} onNavigate={onNavigate} rail={rail} />
      </div>

      <div
        className={cn(
          'mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3',
          rail && 'justify-center border-0 bg-transparent p-0',
        )}
      >
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-brand-soft text-sm font-bold text-brand">HD</AvatarFallback>
        </Avatar>
        {!rail && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold">Prof. Hibou</p>
            <p className="truncate text-xs text-muted-foreground">m.dupont@athénée.be</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfLayout() {
  useRealtimeSync()
  const pathname = useLocation().pathname
  const title = pageTitles[pathname] ?? 'Espace Prof'
  const { data: notifs = [] } = useNotifications()
  const profUnread = notifs.filter((n) => !n.read).length
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate({ to: '/', replace: true })
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh w-full">
        {/* Rail d'icônes — tablette (md → lg) */}
        <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 border-r border-border bg-card p-3 md:block lg:hidden">
          <SidebarContent pathname={pathname} rail />
        </aside>

        {/* Sidebar pleine — desktop (lg+) */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-card p-4 lg:block">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Zone contenu */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:gap-3 md:px-6">
            {/* Trigger mobile (<md) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-1.5 shrink-0 md:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-card p-4">
                <SidebarContent pathname={pathname} />
              </SheetContent>
            </Sheet>

            <h1 className="truncate font-heading text-base font-bold tracking-tight sm:text-lg">
              {title}
            </h1>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher…" className="h-9 w-40 pl-9 lg:w-56" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 sm:hidden"
                aria-label="Rechercher"
              >
                <Search className="size-5" />
              </Button>
              <ThemeToggle className="shrink-0" />
              <Button asChild variant="ghost" size="sm" className="relative shrink-0" aria-label="Notifications">
                <Link to="/prof/notifications">
                  <Bell className="size-5" />
                  {profUnread > 0 && (
                    <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white">
                      {profUnread}
                    </span>
                  )}
                </Link>
              </Button>
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
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
