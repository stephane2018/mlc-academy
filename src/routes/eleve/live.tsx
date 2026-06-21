import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Video,
  CalendarDays,
  Clock,
  Users,
  GraduationCap,
  Play,
  RotateCcw,
} from '@/components/icons'
import { SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PageHero } from '@/components/blocks'
import { useLiveSessions, useConfirmAttendance } from '@/hooks/use-live'
import type { LiveSession } from '@/services/live'

export const Route = createFileRoute('/eleve/live')({
  component: LivePage,
})

const timeline = [
  { label: 'Lancement', min: '0–5 min' },
  { label: 'Quiz révision', min: '5–15 min' },
  { label: 'Nouveau contenu', min: '15–35 min' },
  { label: 'Exercices', min: '35–55 min' },
  { label: 'Clôture', min: '55–60 min' },
]

/** Session live prête pour le rendu (libellés résolus depuis le BFF). */
type LiveView = {
  id: string
  title: string
  status: string
  date: string
  time: string
  durationMin: number
  group: string
  teacher: string
  confirmed: boolean
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function toView(s: LiveSession): LiveView {
  const d = new Date(s.scheduledAt)
  return {
    id: s.id,
    title: s.title,
    status: s.status,
    date: dateFmt.format(d),
    time: timeFmt.format(d),
    durationMin: s.durationMin,
    group: s.groupName ?? 'Ton groupe',
    teacher: s.teacherName ?? 'Ton professeur',
    confirmed: s.confirmed,
  }
}

function LivePage() {
  const { data: sessions = [], isLoading } = useLiveSessions()
  const views = sessions.map(toView)
  const upcoming = views.filter((s) => s.status === 'upcoming' || s.status === 'live')
  const replays = views.filter((s) => s.status === 'replay')
  const featured = upcoming[0]
  const others = upcoming.slice(1)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-sm text-muted-foreground">
        Chargement des cours live…
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="En direct"
        title="Cours live"
        subtitle="60 minutes en direct avec ton prof, chaque semaine."
      />

      {/* Carte vedette */}
      {featured && (
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              Prochain cours
            </span>
          </div>
          <h2 className="mt-2 font-heading text-2xl font-extrabold">{featured.title}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {featured.date} · {featured.time}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {featured.durationMin} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> {featured.group}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-4" /> {featured.teacher}
            </span>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-4 w-full rounded-xl bg-white text-success hover:bg-white/90"
          >
            <Link to="/eleve/salle/$id" params={{ id: featured.id }}>
              <Video className="size-5" /> Rejoindre le cours
            </Link>
          </Button>
        </Card>
      )}

      {/* Sections secondaires : 2 colonnes sur lg */}
      <div className="grid gap-5 lg:grid-cols-2">
      {/* Autres séances */}
      {others.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="À venir" />
          {others.map((s) => (
            <UpcomingRow key={s.id} session={s} />
          ))}
        </section>
      )}

      {/* Replays */}
      {replays.length > 0 && (
        <section className="space-y-3">
          <SectionHeader title="Replays disponibles" />
          {replays.map((s) => (
            <Card
              key={s.id}
              className="card-hover flex-row items-center gap-3 p-3.5 shadow-soft"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                <Play className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  {s.date} · {s.durationMin} min
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full">
                <RotateCcw className="size-4" /> Revoir
              </Button>
            </Card>
          ))}
        </section>
      )}

      {/* Structure du cours */}
      <section>
        <SectionHeader title="Le déroulé d'une heure" />
        <Card className="gap-0 p-4 shadow-soft">
          <ol className="space-y-0">
            {timeline.map((t, i) => (
              <li key={t.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-[11px] font-bold text-success">
                    {i + 1}
                  </span>
                  {i < timeline.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-semibold leading-tight">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.min}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>
      </div>
    </div>
  )
}

function UpcomingRow({ session }: { session: LiveView }) {
  const confirmAttendance = useConfirmAttendance()
  const [confirmed, setConfirmed] = useState(session.confirmed)

  function toggle(v: boolean) {
    setConfirmed(v)
    // Le backend ne gère que la confirmation (pas l'annulation).
    if (v && !session.confirmed) {
      confirmAttendance.mutate(session.id, { onError: () => setConfirmed(false) })
    }
  }

  return (
    <Card className="gap-3 p-3.5 shadow-soft">
      <div className="flex items-start gap-3">
        <SoftIcon tone="success">
          <Video className="size-5" />
        </SoftIcon>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{session.title}</p>
          <p className="text-xs text-muted-foreground">
            {session.date} · {session.time} · {session.durationMin} min
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{session.teacher}</p>
        </div>
      </div>
      <label className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
        <span className="text-sm font-medium">
          {confirmed ? 'Je serai là 👍' : 'Je serai là'}
        </span>
        <Switch checked={confirmed} onCheckedChange={toggle} />
      </label>
    </Card>
  )
}
