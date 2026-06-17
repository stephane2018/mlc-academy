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
import { parentChild, unreadCount } from '@/lib/mock'

export const Route = createFileRoute('/parent')({
  component: ParentLayout,
})

const tabs = [
  { to: '/parent', label: "Tableau de bord", exact: true },
  { to: '/parent/devoirs', label: 'Suivi & rapports', exact: false },
] as const

function ParentLayout() {
  const { pathname } = useLocation()
  const parentUnread = unreadCount('parent')

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card">
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
            <Select defaultValue={parentChild.pseudo}>
              <SelectTrigger className="h-9 w-auto gap-2 border-border">
                <span className="text-base">{parentChild.avatar}</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={parentChild.pseudo}>{parentChild.pseudo}</SelectItem>
                <SelectItem value="Léa">Léa</SelectItem>
              </SelectContent>
            </Select>
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
  )
}
