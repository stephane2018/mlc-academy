import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from '@/components/icons'
import { NotificationPreferences } from '@/components/notification-prefs'
import { profPrefs } from '@/lib/mock'

export const Route = createFileRoute('/prof/preferences')({
  component: ProfPreferences,
})

function ProfPreferences() {
  return (
    <div className="space-y-4 2xl:mx-auto 2xl:max-w-[900px]">
      <Link
        to="/prof/notifications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Notifications
      </Link>
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight">Préférences de notifications</h1>
        <p className="text-sm text-muted-foreground">
          Choisis comment être prévenu pour chaque type d'alerte. Les e-mails arrivent sur ton adresse pro.
        </p>
      </div>
      <NotificationPreferences prefs={profPrefs} />
    </div>
  )
}
