import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { NotificationPreferences } from '@/components/notification-prefs'
import { parentPrefs } from '@/lib/mock'

export const Route = createFileRoute('/parent/preferences')({
  component: ParentPreferences,
})

function ParentPreferences() {
  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[900px]">
      <Link
        to="/parent/notifications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Notifications
      </Link>
      <PageHero
        eyebrow="Espace Parent"
        title="Préférences de notifications"
        subtitle="Choisissez les canaux pour chaque type d'alerte. Les e-mails sont envoyés à votre adresse."
      />
      <NotificationPreferences prefs={parentPrefs} />
    </div>
  )
}
