import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  Clock,
  Users,
  Plus,
  Radio,
  Play,
  UserPlus,
  Check,
  ChevronLeft,
  ChevronRight,
} from '@/components/icons'
import { toast } from 'sonner'
import { SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MonthCalendar, MONTH_NAMES } from '@/components/prof/month-calendar'
import { cn } from '@/lib/utils'
import { liveSessions, profGroups, profStudents, type LiveSession } from '@/lib/mock'

export const Route = createFileRoute('/prof/planning')({
  component: ProfPlanning,
})

/* Référentiel : juin 2026 (aujourd'hui = 17 juin) */
const YEAR = 2026
const MONTH = 5 // juin
const TODAY = 17

/* Jour du mois pour chaque séance (mock) */
const sessionDay: Record<string, number> = { l1: 17, l2: 19, l3: 9 }
const markedDays = Object.values(sessionDay)

const statusMeta: Record<string, { label: string; cls: string }> = {
  upcoming: { label: 'À venir', cls: 'bg-brand-soft text-brand' },
  live: { label: 'En direct', cls: 'bg-destructive/10 text-destructive' },
  replay: { label: 'Replay', cls: 'bg-secondary text-muted-foreground' },
}

const weekStrip: { day: string; date: number; today?: boolean }[] = [
  { day: 'Lun', date: 15 },
  { day: 'Mar', date: 16 },
  { day: 'Mer', date: 17, today: true },
  { day: 'Jeu', date: 18 },
  { day: 'Ven', date: 19 },
  { day: 'Sam', date: 20 },
  { day: 'Dim', date: 21 },
]

function ProfPlanning() {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [selected, setSelected] = useState<LiveSession | null>(null)
  const [cal, setCal] = useState({ y: YEAR, m: MONTH })
  const isRefMonth = cal.y === YEAR && cal.m === MONTH

  const shiftMonth = (delta: number) =>
    setCal(({ y, m }) => {
      const total = y * 12 + m + delta
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 }
    })

  const openDay = (day: number) => {
    const s = liveSessions.find((x) => sessionDay[x.id] === day)
    if (s) setSelected(s)
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader title="Séances planifiées" />
        <CreateSessionDialog />
      </div>

      {/* Calendrier : bascule semaine / mois */}
      <Card className="gap-0 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold capitalize">
            <CalendarDays className="size-4 text-brand" />
            {view === 'week' ? (
              'Semaine du 15 juin'
            ) : (
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="w-28 text-center">
                  {MONTH_NAMES[cal.m]} {cal.y}
                </span>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label="Mois suivant"
                >
                  <ChevronRight className="size-4" />
                </button>
              </span>
            )}
          </div>
          {/* Switch */}
          <div className="flex rounded-full bg-secondary p-0.5 text-xs font-semibold">
            {(['week', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  'rounded-full px-3 py-1 transition-colors',
                  view === v ? 'bg-card text-brand shadow-sm' : 'text-muted-foreground',
                )}
              >
                {v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>

        {view === 'week' ? (
          <div className="grid grid-cols-7 gap-2">
            {weekStrip.map((d) => {
              const s = liveSessions.find((x) => sessionDay[x.id] === d.date)
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => s && setSelected(s)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-colors',
                    d.today ? 'border-brand bg-brand-soft' : 'border-border bg-card',
                    s && 'cursor-pointer hover:border-brand/50',
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {d.day}
                  </span>
                  <span className={cn('font-heading text-sm font-bold', d.today && 'text-brand')}>
                    {d.date}
                  </span>
                  <span className={cn('size-1.5 rounded-full', s ? 'bg-brand' : 'bg-transparent')} />
                </button>
              )
            })}
          </div>
        ) : (
          <MonthCalendar
            year={cal.y}
            month={cal.m}
            today={isRefMonth ? TODAY : undefined}
            markedDays={isRefMonth ? markedDays : []}
            onPickDay={isRefMonth ? openDay : undefined}
          />
        )}
      </Card>

      {/* Cartes de séances — cliquables */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {liveSessions.map((s) => {
          const st = statusMeta[s.status]
          const replay = s.status === 'replay'
          return (
            <Card
              key={s.id}
              onClick={() => setSelected(s)}
              className="card-hover cursor-pointer gap-0 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <SoftIcon tone={replay ? 'teal' : 'brand'} className="size-11 shrink-0">
                  <Radio className="size-5" />
                </SoftIcon>
                <Badge variant="secondary" className={cn('shrink-0', st.cls)}>
                  {st.label}
                </Badge>
              </div>
              <p className="mt-3 font-heading text-base font-bold">{s.title}</p>
              <div className="mt-2 flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> {s.date} · {s.time}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" /> {s.group}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {s.durationMin} min
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Voir les détails →
              </span>
            </Card>
          )
        })}
      </div>

      <SessionDetailDialog session={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

/* ------------------------- Détail d'une séance ------------------------- */

function SessionDetailDialog({
  session,
  onClose,
}: {
  session: LiveSession | null
  onClose: () => void
}) {
  // Présence des élèves (mock local)
  const [present, setPresent] = useState<Record<string, boolean>>({})
  const roster = profStudents

  if (!session) return null
  const replay = session.status === 'replay'
  const confirmedCount = roster.filter((s) => present[s.id]).length

  return (
    <Dialog open={!!session} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <Badge variant="secondary" className={cn('w-fit', statusMeta[session.status].cls)}>
            {statusMeta[session.status].label}
          </Badge>
          <DialogTitle className="text-xl">{session.title}</DialogTitle>
          <DialogDescription>
            {session.date} · {session.time} — animé par {session.teacher}
          </DialogDescription>
        </DialogHeader>

        {/* Méta */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: Clock, label: 'Durée', value: `${session.durationMin} min` },
            { icon: Users, label: 'Groupe', value: session.group.replace('CE1D — ', '') },
            { icon: Check, label: 'Présents', value: `${confirmedCount}/${roster.length}` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-secondary/60 py-2.5">
              <m.icon className="mx-auto size-4 text-brand" />
              <p className="mt-1 font-heading text-sm font-bold">{m.value}</p>
              <p className="text-[11px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Liste des élèves */}
        <div className="mt-1">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-heading text-sm font-bold">Élèves du groupe</p>
            <span className="text-xs text-muted-foreground">{roster.length} inscrits</span>
          </div>
          <ul className="space-y-1.5">
            {roster.map((s) => {
              const ok = !!present[s.id]
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-2"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-lg">
                    {s.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.pseudo}</p>
                    <p className="text-xs text-muted-foreground">{s.lastSeen}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={ok ? 'default' : 'outline'}
                    onClick={() => setPresent((p) => ({ ...p, [s.id]: !p[s.id] }))}
                    className="h-8 rounded-full"
                  >
                    {ok ? (
                      <>
                        <Check className="size-3.5" /> Présent
                      </>
                    ) : (
                      'Marquer présent'
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => toast.success('Élève ajouté à la séance')}
          >
            <UserPlus className="size-4" /> Ajouter un élève
          </Button>
          <Button>
            <Play className="size-4" />
            {replay ? 'Revoir le replay' : 'Démarrer la séance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------- Création de séance ------------------------- */

function CreateSessionDialog() {
  const [open, setOpen] = useState(false)
  const [days, setDays] = useState<number[]>([])

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setDays([])
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Créer une séance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une séance live</DialogTitle>
          <DialogDescription>
            Choisis le groupe, puis les jours du mois où placer la séance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="session-group">Groupe</Label>
            <Select>
              <SelectTrigger id="session-group" className="w-full">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {profGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name} · {g.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sélection des jours du mois courant */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="capitalize">
                {MONTH_NAMES[MONTH]} {YEAR}
              </Label>
              <span className="text-xs text-muted-foreground">
                {days.length > 0
                  ? `${days.length} jour${days.length > 1 ? 's' : ''} sélectionné${days.length > 1 ? 's' : ''}`
                  : 'Clique sur les jours'}
              </span>
            </div>
            <div className="rounded-2xl border border-border p-3">
              <MonthCalendar
                year={YEAR}
                month={MONTH}
                today={TODAY}
                markedDays={markedDays}
                selectedDays={days}
                onPickDay={toggleDay}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="session-time">Heure</Label>
              <Input id="session-time" type="time" defaultValue="18:00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-duration">Durée</Label>
              <Select defaultValue="60">
                <SelectTrigger id="session-duration" className="w-full">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent>
                  {['60', '75', '90'].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            disabled={days.length === 0}
            onClick={() => {
              setOpen(false)
              toast.success(
                days.length > 1 ? `${days.length} séances créées` : 'Séance créée',
                { description: `Jours : ${days.sort((a, b) => a - b).join(', ')} ${MONTH_NAMES[MONTH]}. Les élèves seront prévenus.` },
              )
              setDays([])
            }}
          >
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
