import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Settings } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/notifications'
import { notificationsFor, type Notification, type NotifKind } from '@/lib/mock'

export const Route = createFileRoute('/prof/notifications')({
  component: ProfNotifications,
})

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
  const [items, setItems] = useState<Notification[]>(() => notificationsFor('prof'))

  const open = (n: Notification) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    navigate({ to: routeFor(n.kind) })
  }
  const markAll = () => setItems((prev) => prev.map((x) => ({ ...x, read: true })))

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
      <NotificationCenter items={items} onOpen={open} onMarkAllRead={markAll} />
    </div>
  )
}
