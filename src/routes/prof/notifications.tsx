import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Settings } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/notifications'
import type { Notification, NotifKind } from '@/lib/mock'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'

export const Route = createFileRoute('/prof/notifications')({
  component: ProfNotifications,
})

const KNOWN_KINDS: NotifKind[] = ['devoir', 'rapport', 'resultat', 'live', 'inactivite', 'badge', 'message', 'systeme']
function toKind(kind: string): NotifKind {
  if (kind === 'retard') return 'devoir'
  return KNOWN_KINDS.includes(kind as NotifKind) ? (kind as NotifKind) : 'systeme'
}

const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function routeFor(kind: NotifKind) {
  switch (kind) {
    case 'resultat':
    case 'devoir':
    case 'rapport':
      return '/prof/exercices' as const
    case 'inactivite':
      return '/prof/eleves' as const
    case 'message':
      return '/prof/messages' as const
    case 'live':
      return '/prof/planning' as const
    default:
      return '/prof' as const
  }
}

function ProfNotifications() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const items: Notification[] = data.map((n) => ({
    id: n.id,
    audience: 'prof',
    kind: toKind(n.kind),
    title: n.title,
    body: n.body ?? '',
    time: dateTime.format(new Date(n.createdAt)),
    read: n.read,
  }))

  const open = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id)
    navigate({ to: routeFor(n.kind) })
  }
  const markAll = () => markAllRead.mutate()

  return (
    <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Rendus, questions, présences et alertes.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/prof/preferences">
            <Settings className="size-4" /> Préférences
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement des notifications…</p>
      ) : (
        <NotificationCenter items={items} onOpen={open} onMarkAllRead={markAll} />
      )}
    </div>
  )
}
