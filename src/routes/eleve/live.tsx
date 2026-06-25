import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'
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

/** La salle ouvre ce délai avant l'heure de début. */
const JOIN_BEFORE_MS = 10 * 60 * 1000

/** Session live prête pour le rendu (libellés résolus depuis le BFF). */
type LiveView = {
  id: string
  title: string
  status: string
  scheduledAt: string
  date: string
  time: string
  durationMin: number
  group: string
  teacher: string
  confirmed: boolean
  replayUrl: string | null
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function toView(s: LiveSession): LiveView {
  const d = new Date(s.scheduledAt)
  return {
    id: s.id,
    title: s.title,
    status: s.status,
    scheduledAt: s.scheduledAt,
    date: dateFmt.format(d),
    time: timeFmt.format(d),
    durationMin: s.durationMin,
    group: s.groupName ?? 'Ton groupe',
    teacher: s.teacherName ?? 'Ton professeur',
    confirmed: s.confirmed,
    replayUrl: s.replayUrl,
  }
}

/** Horloge partagée : se rafraîchit chaque seconde pour les comptes à rebours. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/** État de jonction d'une séance à l'instant `now`. */
function joinState(session: LiveView, now: number) {
  const start = new Date(session.scheduledAt).getTime()
  const end = start + session.durationMin * 60_000
  const isLive = session.status === 'live'
  const joinable = isLive || (now >= start - JOIN_BEFORE_MS && now <= end)
  return { start, end, isLive, joinable, msToStart: start - now }
}

function formatCountdown(ms: number): string | null {
  if (ms <= 0) return null
  const totalMin = Math.floor(ms / 60_000)
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const mins = totalMin % 60
  if (days >= 1) return `dans ${days} j`
  if (hours >= 1) return `dans ${hours} h ${String(mins).padStart(2, '0')}`
  if (mins >= 1) return `dans ${mins} min`
  return "dans moins d'une minute"
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

      {/* Vedette ou état vide */}
      {featured ? <FeaturedCard session={featured} /> : <EmptyLive />}

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
                {s.replayUrl ? (
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <a href={s.replayUrl} target="_blank" rel="noreferrer">
                      <RotateCcw className="size-4" /> Revoir
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-full" disabled>
                    Bientôt dispo
                  </Button>
                )}
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

/** Frise pédagogique « comment se déroule une heure » — affichée seulement dans l'état vide. */
function CourseTimeline() {
  return (
    <div className="mx-auto mt-6 w-full max-w-xs text-left">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Comment se déroule une heure
      </p>
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
    </div>
  )
}

/** Aucune séance à venir → message clair (+ frise pédagogique) plutôt qu'une page vide. */
function EmptyLive() {
  return (
    <Card className="items-center gap-2 border-dashed py-10 text-center shadow-none">
      <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Video className="size-6" />
      </span>
      <h2 className="font-heading text-lg font-bold">Aucun cours live programmé</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ton prof n'a pas encore planifié de séance. Tu seras notifié dès qu'un cours est ajouté —
        en attendant, voici comment se déroule une heure type.
      </p>
      <CourseTimeline />
    </Card>
  )
}

/** Carte vedette : prochain cours, avec gating réel selon le statut. */
function FeaturedCard({ session }: { session: LiveView }) {
  const now = useNow()
  const { isLive, joinable, msToStart } = joinState(session, now)
  const countdown = formatCountdown(msToStart)

  return (
    <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-soft">
      <div className="flex items-center gap-2">
        {isLive ? (
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
            En direct
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            <CalendarDays className="size-3" />
            Prochain cours{countdown ? ` · ${countdown}` : ''}
          </span>
        )}
      </div>
      <h2 className="mt-2 font-heading text-2xl font-extrabold">{session.title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/90">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" /> {session.date} · {session.time}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" /> {session.durationMin} min
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-4" /> {session.group}
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap className="size-4" /> {session.teacher}
        </span>
      </div>

      {joinable ? (
        <Button
          asChild
          size="lg"
          className="mt-4 w-full rounded-xl bg-white text-success hover:bg-white/90"
        >
          <Link to="/eleve/salle/$id" params={{ id: session.id }}>
            <Video className="size-5" /> Rejoindre le cours
          </Link>
        </Button>
      ) : (
        <div className="mt-4 space-y-2">
          <AttendanceToggle session={session} className="bg-white/15" />
          <p className="text-center text-xs text-white/75">
            La salle ouvre 10 min avant le début.
          </p>
        </div>
      )}
    </Card>
  )
}

/** Ligne « À venir » : confirme la présence, ou propose de rejoindre si la salle est ouverte. */
function UpcomingRow({ session }: { session: LiveView }) {
  const now = useNow()
  const { isLive, joinable } = joinState(session, now)

  return (
    <Card className="gap-3 p-3.5 shadow-soft">
      <div className="flex items-start gap-3">
        <SoftIcon tone="success">
          <Video className="size-5" />
        </SoftIcon>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-semibold">
            {session.title}
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-destructive">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                Live
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {session.date} · {session.time} · {session.durationMin} min
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{session.teacher}</p>
        </div>
      </div>
      {joinable ? (
        <Button asChild size="sm" className="w-full rounded-xl">
          <Link to="/eleve/salle/$id" params={{ id: session.id }}>
            <Video className="size-4" /> Rejoindre le cours
          </Link>
        </Button>
      ) : (
        <AttendanceToggle session={session} className="bg-secondary/50" />
      )}
    </Card>
  )
}

/** Interrupteur « Je serai là » — la confirmation est définitive (pas d'annulation côté backend). */
function AttendanceToggle({ session, className }: { session: LiveView; className?: string }) {
  const confirmAttendance = useConfirmAttendance()
  const [confirmed, setConfirmed] = useState(session.confirmed)

  function toggle(v: boolean) {
    // Une fois confirmé, on ne peut plus se rétracter : interrupteur verrouillé.
    if (session.confirmed || confirmed) return
    setConfirmed(v)
    if (v) confirmAttendance.mutate(session.id, { onError: () => setConfirmed(false) })
  }

  const locked = confirmed || session.confirmed

  return (
    <label className={cn('flex items-center justify-between rounded-xl px-3 py-2', className)}>
      <span className="text-sm font-medium">{locked ? 'Je serai là 👍' : 'Je serai là'}</span>
      <Switch checked={confirmed} onCheckedChange={toggle} disabled={locked} />
    </label>
  )
}
