import { Link, useLocation } from '@tanstack/react-router'
import {
  Home,
  Gamepad2,
  Video,
  Library,
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
  Zap,
  MoreHorizontal,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme'
import { spreadAvatar } from '@/lib/avatar'
import { useStudentMe } from '@/hooks/use-student'
import { useNotifications } from '@/hooks/use-notifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Liens visibles directement dans la barre. */
const primary = [
  { href: '/eleve/dashboard', label: 'Accueil', icon: Home },
  { href: '/eleve/jeu', label: 'Jouer', icon: Gamepad2 },
  { href: '/eleve/devoirs', label: 'Devoirs', icon: Dumbbell },
  { href: '/eleve/examens', label: 'Examens', icon: CheckSquare },
  { href: '/eleve/live', label: 'Live', icon: Video },
  { href: '/eleve/bibliotheque', label: 'Bibliothèque', icon: Library },
  { href: '/eleve/classement', label: 'Classement', icon: Award },
] as const

/** Liens secondaires regroupés dans le menu « Plus ». */
const overflow = [
  { href: '/eleve/boutique', label: 'Boutique', icon: Store },
  { href: '/eleve/coach', label: 'Coach IA', icon: Sparkles },
  { href: '/eleve/badges', label: 'Badges', icon: Trophy },
  { href: '/eleve/abonnement', label: 'Abonnement', icon: Crown },
] as const

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

/** Barre de navigation horizontale — desktop uniquement (lg+). */
export function StudentTopNav() {
  const { pathname } = useLocation()
  const { data: me } = useStudentMe()
  const { data: notifs = [] } = useNotifications()

  const pseudo = me?.pseudo ?? '…'
  const avatar = spreadAvatar(me?.avatar, me?.pseudo ?? '')
  const level = me?.level ?? 1
  const xp = me?.xp ?? 0
  const streak = me?.streak ?? 0
  const unread = notifs.filter((n) => !n.read).length
  const overflowActive = overflow.some((i) => isActive(pathname, i.href))

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/95 backdrop-blur lg:block">
      <div className="flex h-16 w-full items-center gap-4 px-4 xl:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-brand-foreground">
            M
          </span>
          <span className="hidden font-heading text-base font-bold xl:inline">MLC Academy</span>
        </Link>

        {/* Liens principaux */}
        <nav className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {primary.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.3 : 2} />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Menu « Plus » */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-all duration-200',
                overflowActive
                  ? 'bg-brand-soft text-brand'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <MoreHorizontal className="size-[18px]" strokeWidth={2} />
              <span>Plus</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {overflow.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link
                    to={href}
                    className={cn('flex items-center gap-2.5', isActive(pathname, href) && 'text-brand')}
                  >
                    <Icon className="size-[18px]" strokeWidth={2} />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Cluster utilitaire */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Streak */}
          <span className="hidden items-center gap-1.5 rounded-xl border border-brand/25 bg-brand-soft px-2.5 py-1.5 text-sm font-bold text-brand xl:flex">
            <Flame className="size-4" />
            {streak}
          </span>
          {/* XP */}
          <span className="hidden items-center gap-1.5 rounded-xl border border-info/25 bg-info-soft px-2.5 py-1.5 text-sm font-bold text-info xl:flex">
            <Zap className="size-4" />
            {xp}
          </span>

          {/* Messages */}
          <Link
            to="/eleve/messages"
            aria-label="Messages"
            className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MessageSquare className="size-[18px]" strokeWidth={2} />
          </Link>

          {/* Notifications */}
          <Link
            to="/eleve/notifications"
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Bell className="size-[18px]" strokeWidth={2} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>

          <ThemeToggle className="size-9 rounded-xl border border-border" />

          {/* Profil */}
          <Link
            to="/eleve/profil"
            className="flex items-center gap-2 rounded-xl border border-border py-1 pl-1 pr-2.5 transition-colors hover:bg-secondary"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-base">{avatar}</span>
            <span className="hidden min-w-0 xl:block">
              <span className="block max-w-[8rem] truncate text-sm font-semibold leading-tight">{pseudo}</span>
              <span className="block text-[11px] leading-tight text-muted-foreground">Niv. {level}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
