import {
  Dumbbell,
  FileText,
  Trophy,
  Radio,
  AlertCircle,
  Award,
  MessageSquare,
  Sparkles,
  Check,
  Bell,
  type IconComponent,
} from '@/components/icons'
import { SoftIcon } from '@/components/student/parts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Notification, NotifKind } from '@/lib/mock'

type Tone = 'brand' | 'teal' | 'amber' | 'success' | 'info'

export const KIND_META: Record<NotifKind, { Icon: IconComponent; tone: Tone }> = {
  devoir: { Icon: Dumbbell, tone: 'amber' },
  rapport: { Icon: FileText, tone: 'brand' },
  resultat: { Icon: Trophy, tone: 'success' },
  live: { Icon: Radio, tone: 'teal' },
  inactivite: { Icon: AlertCircle, tone: 'amber' },
  badge: { Icon: Award, tone: 'amber' },
  message: { Icon: MessageSquare, tone: 'brand' },
  systeme: { Icon: Sparkles, tone: 'info' },
}

export function NotificationCenter({
  items,
  onOpen,
  onMarkAllRead,
}: {
  items: Notification[]
  onOpen: (n: Notification) => void
  onMarkAllRead: () => void
}) {
  const unread = items.filter((n) => !n.read).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
        </p>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
            <Check className="size-4" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Bell className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">Aucune notification.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const m = KIND_META[n.kind]
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onOpen(n)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    n.read
                      ? 'border-border bg-card hover:bg-secondary/40'
                      : 'border-brand/20 bg-brand-soft/40 hover:bg-brand-soft/60',
                  )}
                >
                  <SoftIcon tone={m.tone} className="size-10 shrink-0">
                    <m.Icon className="size-5" />
                  </SoftIcon>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('truncate text-sm', n.read ? 'font-semibold' : 'font-bold')}>
                        {n.title}
                      </p>
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">{n.time}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** Cloche avec pastille de non-lus (à envelopper dans un Link par l'appelant). */
export function BellBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('relative inline-grid place-items-center', className)}>
      <Bell className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </span>
  )
}
