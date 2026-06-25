import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CalendarDays, Clock, Plus, Radio, Video, Link2 } from '@/components/icons'
import { SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DatePicker, TimePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { QueryError } from '@/components/query-error'
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
import { useLiveSessions, useCreateLiveSession } from '@/hooks/use-live'
import { useGroups } from '@/hooks/use-groups'
import type { LiveSession } from '@/services/live'

export const Route = createFileRoute('/prof/planning')({
  component: ProfPlanning,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const STATUS_META: Record<string, { label: string; cls: string }> = {
  upcoming: { label: 'À venir', cls: 'bg-brand-soft text-brand' },
  live: { label: 'En direct', cls: 'bg-destructive/10 text-destructive' },
  replay: { label: 'Replay', cls: 'bg-secondary text-muted-foreground' },
}

function SessionRow({ session: s, groupName }: { session: LiveSession; groupName: string | null }) {
  const d = new Date(s.scheduledAt)
  const meta = STATUS_META[s.status] ?? STATUS_META.upcoming
  return (
    <Card className="flex-row items-center gap-3 p-4 shadow-soft">
      <SoftIcon tone={s.status === 'replay' ? 'teal' : 'brand'} className="size-11 shrink-0">
        {s.status === 'replay' ? <Video className="size-5" /> : <Radio className="size-5" />}
      </SoftIcon>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{s.title}</p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="capitalize">{dateFmt.format(d)} · {timeFmt.format(d)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {s.durationMin} min</span>
          {groupName && <span>· {groupName}</span>}
        </p>
      </div>
      {s.meetUrl && s.status !== 'replay' && (
        <Button asChild size="sm" variant="outline">
          <a href={s.meetUrl} target="_blank" rel="noreferrer">
            <Link2 className="size-4" /> Lien
          </a>
        </Button>
      )}
      <Badge variant="secondary" className={meta.cls}>{meta.label}</Badge>
    </Card>
  )
}

function ProfPlanning() {
  const sessionsQ = useLiveSessions()
  const groupsQ = useGroups()
  const sessions = sessionsQ.data ?? []
  const groups = groupsQ.data ?? []
  const isLoading = sessionsQ.isLoading
  const isError = sessionsQ.isError || groupsQ.isError
  const groupName = (id: string | null) => (id ? groups.find((g) => g.id === id)?.name : null) ?? null

  const upcoming = sessions
    .filter((s) => s.status === 'upcoming' || s.status === 'live')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const replays = sessions.filter((s) => s.status === 'replay')

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader title="Séances planifiées" />
        <CreateSessionDialog />
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-sm text-muted-foreground">Chargement…</Card>
      ) : isError ? (
        <QueryError onRetry={() => { sessionsQ.refetch(); groupsQ.refetch() }} />
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-brand" />
              <h2 className="font-heading text-lg font-bold">À venir</h2>
              <Badge variant="secondary">{upcoming.length}</Badge>
            </div>
            {upcoming.length === 0 ? (
              <Card className="py-8 text-center text-sm text-muted-foreground">Aucune séance à venir. Planifie-en une.</Card>
            ) : (
              <div className="space-y-2">
                {upcoming.map((s) => (
                  <SessionRow key={s.id} session={s} groupName={groupName(s.groupId)} />
                ))}
              </div>
            )}
          </section>

          {replays.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="size-4 text-teal" />
                <h2 className="font-heading text-lg font-bold">Replays</h2>
                <Badge variant="secondary">{replays.length}</Badge>
              </div>
              <div className="space-y-2">
                {replays.map((s) => (
                  <SessionRow key={s.id} session={s} groupName={groupName(s.groupId)} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function CreateSessionDialog() {
  const [open, setOpen] = useState(false)
  const [groupId, setGroupId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [durationMin, setDurationMin] = useState('60')
  const [meetUrl, setMeetUrl] = useState('')
  const { data: groups = [] } = useGroups()
  const create = useCreateLiveSession()

  const reset = () => {
    setGroupId('')
    setTitle('')
    setDate('')
    setTime('18:00')
    setDurationMin('60')
    setMeetUrl('')
  }

  function submit() {
    if (!groupId || !title.trim() || !date) {
      toast.error('Groupe, titre et date sont requis.')
      return
    }
    const scheduledAt = new Date(`${date}T${time || '18:00'}`).toISOString()
    create.mutate(
      { groupId, title: title.trim(), scheduledAt, durationMin: Number(durationMin) || 60, meetUrl: meetUrl.trim() || undefined },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
          toast.success('Séance planifiée')
        },
        onError: () => toast.error('Échec de la planification.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Planifier une séance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Planifier une séance live</DialogTitle>
          <DialogDescription>Choisis le groupe, la date et l'heure.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="session-group">Groupe</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="session-group" className="w-full">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="session-title">Titre</Label>
            <Input id="session-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Fractions & proportions" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="session-date">Date</Label>
              <DatePicker id="session-date" value={date} onChange={setDate} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-time">Heure</Label>
              <TimePicker id="session-time" value={time} onChange={setTime} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-duration">Durée</Label>
              <Select value={durationMin} onValueChange={setDurationMin}>
                <SelectTrigger id="session-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['30', '45', '60', '90'].map((d) => (
                    <SelectItem key={d} value={d}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="session-meet">Lien de visio (optionnel)</Label>
            <Input id="session-meet" value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)} placeholder="https://meet…" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button disabled={!groupId || !title.trim() || !date || create.isPending} onClick={submit}>Planifier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
