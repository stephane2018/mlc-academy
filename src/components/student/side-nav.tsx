import { Link, useLocation } from '@tanstack/react-router'
import {
  Home,
  Gamepad2,
  Video,
  Library,
  User,
  Trophy,
  Crown,
  Flame,
  CheckSquare,
  MessageSquare,
  Award,
  Sparkles,
  Dumbbell,
  Bell,
  Store,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme'
import { useStudentMe } from '@/hooks/use-student'
import { useNotifications } from '@/hooks/use-notifications'

const items = [
  { href: '/eleve/dashboard', label: 'Accueil', icon: Home },
  { href: '/eleve/jeu', label: 'Jouer', icon: Gamepad2 },
  { href: '/eleve/devoirs', label: 'Devoirs', icon: Dumbbell },
  { href: '/eleve/examens', label: 'Examens blancs', icon: CheckSquare },
  { href: '/eleve/live', label: 'Cours live', icon: Video },
  { href: '/eleve/bibliotheque', label: 'Bibliothèque', icon: Library },
  { href: '/eleve/boutique', label: 'Boutique', icon: Store },
  { href: '/eleve/classement', label: 'Classement', icon: Award },
  { href: '/eleve/coach', label: 'Coach IA', icon: Sparkles },
  { href: '/eleve/messages', label: 'Messages', icon: MessageSquare },
  { href: '/eleve/notifications', label: 'Notifications', icon: Bell },
  { href: '/eleve/badges', label: 'Badges', icon: Trophy },
  { href: '/eleve/abonnement', label: 'Abonnement', icon: Crown },
  { href: '/eleve/profil', label: 'Profil', icon: User },
] as const

/** Navigation latérale — affichée uniquement sur grand écran (lg+). */
export function StudentSideNav() {
  const { pathname } = useLocation()
  const { data: me } = useStudentMe()
  const { data: notifs = [] } = useNotifications()

  const pseudo = me?.pseudo ?? '…'
  const avatar = me?.avatar ?? '🙂'
  const level = me?.level ?? 1
  const xp = me?.xp ?? 0
  const streak = me?.streak ?? 0
  const xpForNextLevel = me?.xpForNextLevel ?? null
  const xpPct = xpForNextLevel && xpForNextLevel > 0 ? Math.min(100, Math.round((xp / xpForNextLevel) * 100)) : 100
  const eleveUnread = notifs.filter((n) => !n.read).length

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
      <Link to="/" className="mb-5 flex items-center gap-2.5 px-2">
        <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-white">
          M
        </span>
        <span className="font-heading text-lg font-bold">MLC Academy</span>
      </Link>

      {/* Mini-carte joueur */}
      <Link
        to="/eleve/profil"
        className="mb-5 block rounded-2xl bg-gradient-to-br from-brand to-indigo-500 p-3 text-white shadow-soft transition-transform hover:scale-[1.01]"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-xl">
            {avatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold">{pseudo}</p>
            <p className="text-[11px] text-white/70">Niveau {level}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold">
            <Flame className="size-3.5 text-amber-200" />
            {streak}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${xpPct}%` }} />
        </div>
        <p className="mt-1 text-[10px] font-medium text-white/70">
          {xp} / {xpForNextLevel ?? xp} XP
        </p>
      </Link>

      <nav className="flex-1">
        <ul className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  to={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-brand-soft text-brand shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.3 : 2} />
                  <span className="flex-1">{label}</span>
                  {href === '/eleve/notifications' && eleveUnread > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                      {eleveUnread}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-border px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Apparence</span>
        <ThemeToggle className="size-8" />
      </div>

      <Link
        to="/eleve/profil"
        className="mt-3 flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-secondary"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-lg">
          {avatar}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{pseudo}</p>
          <p className="text-xs text-muted-foreground">Niv. {level}</p>
        </div>
      </Link>
    </aside>
  )
}
