import { Link } from '@tanstack/react-router'
import {
  LayoutGrid,
  Video,
  CircleHelp,
  CheckSquare,
  Users,
  MessageSquare,
} from '@/components/icons'
import type { LucideIcon } from '@/components/icons'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Pilotage',
    items: [{ to: '/admin', label: "Vue d'ensemble", icon: LayoutGrid }],
  },
  {
    title: 'Contenu',
    items: [
      { to: '/admin/ressources', label: 'Ressources', icon: Video },
      { to: '/admin/questions', label: 'Questions de quiz', icon: CircleHelp },
      { to: '/admin/examens', label: 'Examens blancs', icon: CheckSquare },
    ],
  },
  {
    title: 'Business',
    items: [{ to: '/admin/abonnements', label: 'Abonnements', icon: Users }],
  },
  {
    title: 'Support',
    items: [
      { to: '/admin/support', label: 'Questions / support', icon: MessageSquare, badge: 5 },
    ],
  },
]

export const pageTitles: Record<string, string> = {
  '/admin': "Vue d'ensemble",
  '/admin/ressources': 'Ressources',
  '/admin/questions': 'Questions de quiz',
  '/admin/examens': 'Examens blancs',
  '/admin/abonnements': 'Abonnements',
  '/admin/support': 'Questions / support',
}

export function isActive(pathname: string, to: string): boolean {
  return to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)
}

/** Lien partagé entre la version "rail" (icônes) et la version étendue. */
export function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  /** true = rail md (icône seule, libellé masqué) */
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={[
        'group relative flex items-center rounded-lg border-l-2 text-sm font-medium transition-colors duration-150',
        collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
        active
          ? 'border-sidebar-primary bg-sidebar-accent text-white'
          : 'border-transparent text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white',
      ].join(' ')}
    >
      <Icon
        className={[
          'size-5 shrink-0 transition-colors',
          active ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-white',
        ].join(' ')}
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {item.badge ? (
        collapsed ? (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-amber ring-2 ring-sidebar" />
        ) : (
          <span className="inline-flex items-center justify-center rounded-full bg-amber px-2 py-0.5 text-[11px] font-bold text-amber-foreground">
            {item.badge}
          </span>
        )
      ) : null}
    </Link>
  )
}
