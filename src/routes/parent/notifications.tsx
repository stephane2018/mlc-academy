import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Settings } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/blocks'
import { NotificationCenter } from '@/components/notifications'
import type { Notification, NotifKind } from '@/lib/mock'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'

export const Route = createFileRoute('/parent/notifications')({
  component: ParentNotifications,
})

const KNOWN_KINDS: NotifKind[] = ['devoir', 'rapport', 'resultat', 'live', 'inactivite', 'badge', 'message', 'systeme']
function toKind(kind: string): NotifKind {
  if (kind === 'retard') return 'devoir'
  return KNOWN_KINDS.includes(kind as NotifKind) ? (kind as NotifKind) : 'systeme'
}
const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function routeFor(kind: NotifKind) {
  switch (kind) {
    case 'rapport':
    case 'devoir':
    case 'resultat':
      return '/parent/devoirs' as const
    default:
      return '/parent' as const
  }
}

function ParentNotifications() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const items: Notification[] = data.map((n) => ({
    id: n.id,
    audience: 'parent',
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
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[900px]">
      <PageHero
        eyebrow="Espace Parent"
        title="Notifications"
        subtitle="Rapports, devoirs et cours de votre enfant."
        actions={
          <Button asChild variant="outline">
            <Link to="/parent/preferences">
              <Settings className="size-4" /> Préférences
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement des notifications…</p>
      ) : (
        <NotificationCenter items={items} onOpen={open} onMarkAllRead={markAll} />
      )}
    </div>
  )
}
