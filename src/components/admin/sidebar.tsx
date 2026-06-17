import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { navSections, isActive, NavLink } from './nav'

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-3 py-5', collapsed ? 'justify-center' : 'px-5')}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand font-heading text-xl font-extrabold text-white">
        M
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold text-white">MLC Academy</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Administration
          </p>
        </div>
      )}
    </div>
  )
}

function UserCard({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={cn('border-t border-sidebar-border', collapsed ? 'p-3' : 'p-4')}>
      <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
        <div className="relative shrink-0">
          <Avatar className="size-9">
            <AvatarFallback className="bg-sidebar-accent text-sm font-bold text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-sidebar" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Admin</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Super-admin</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children, collapsed }: { children: string; collapsed?: boolean }) {
  if (collapsed) return <div className="mx-auto my-2 h-px w-6 bg-sidebar-border" />
  return (
    <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
      {children}
    </p>
  )
}

/**
 * Sidebar admin.
 * - variant "expanded" : libellés visibles (desktop lg + drawer mobile)
 * - variant "rail" : icônes seules + tooltips (tablette md)
 */
export function AdminSidebar({
  pathname,
  variant = 'expanded',
  onNavigate,
  className,
}: {
  pathname: string
  variant?: 'expanded' | 'rail'
  onNavigate?: () => void
  className?: string
}) {
  const collapsed = variant === 'rail'

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-sidebar text-sidebar-foreground',
        collapsed ? 'w-[72px]' : 'w-64',
        className,
      )}
    >
      <Brand collapsed={collapsed} />

      <TooltipProvider delayDuration={0}>
        <nav className={cn('flex-1 overflow-y-auto pb-2', collapsed ? 'px-2' : 'px-3')}>
          {navSections.map((section) => (
            <div key={section.title}>
              <SectionLabel collapsed={collapsed}>{section.title}</SectionLabel>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.to)
                  if (collapsed) {
                    return (
                      <Tooltip key={item.to}>
                        <TooltipTrigger asChild>
                          <span className="block">
                            <NavLink item={item} active={active} collapsed onNavigate={onNavigate} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    )
                  }
                  return (
                    <NavLink key={item.to} item={item} active={active} onNavigate={onNavigate} />
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </TooltipProvider>

      <UserCard collapsed={collapsed} />
    </div>
  )
}
