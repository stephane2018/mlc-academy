import { useState } from 'react'
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Users,
  Percent,
  Activity,
  Target,
  Copy,
  RotateCcw,
  MessageSquare,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  CalendarDays,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from '@/components/icons'
import { toast } from 'sonner'
import { Meter, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
import { TYPE_META } from '@/components/student/resource-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  profGroups,
  profStudents,
  liveSessions,
  sharedResources,
  skills,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/groupes/$id')({
  component: GroupDetail,
})

const trendMeta = {
  up: { Icon: TrendingUp, cls: 'text-success', label: 'en progrès' },
  down: { Icon: TrendingDown, cls: 'text-destructive', label: 'en baisse' },
  flat: { Icon: Minus, cls: 'text-muted-foreground', label: 'stable' },
}

function GroupDetail() {
  const { id } = useParams({ from: '/prof/groupes/$id' })
  const navigate = useNavigate()
  const group = profGroups.find((g) => g.id === id)

  if (!group) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-heading text-xl font-bold">Groupe introuvable</p>
        <Button asChild>
          <Link to="/prof/groupes">Retour aux groupes</Link>
        </Button>
      </div>
    )
  }

  const roster = profStudents.filter((s) => s.group === group.name)
  const sessions = liveSessions.filter((s) => s.group.includes(group.name))
  const resources = sharedResources.filter((r) => r.groups.includes(group.name))

  const copyCode = () => {
    navigator.clipboard?.writeText(group.code).catch(() => {})
    toast.success('Code copié', { description: group.code })
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <Link
        to="/prof/groupes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Mes groupes
      </Link>

      <PageHero
        eyebrow={group.level}
        title={group.name}
        subtitle={`${group.students} élèves · code d'invitation ${group.code}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/prof/messages">
                <MessageSquare className="size-4" /> Message au groupe
              </Link>
            </Button>
            <EditGroupDialog name={group.name} level={group.level} />
          </>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Users} tone="brand" label="Élèves" value={group.students} />
        <StatTile icon={Percent} tone="teal" label="Score moyen" value={`${group.avgScore}%`} delta="+4 pts" trend="up" />
        <StatTile icon={Activity} tone="success" label="Taux d'activité" value={`${group.activityRate}%`} />
        <StatTile icon={Target} tone="amber" label="Point faible" value={group.weakSkill} />
      </div>

      <RailLayout
        rail={
          <>
            {/* Code d'invitation */}
            <Card className="gap-0 rounded-2xl p-4 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Code d'invitation
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="flex-1 font-mono text-xl font-extrabold tracking-wider">{group.code}</span>
                <Button size="sm" variant="outline" className="size-8 p-0" onClick={copyCode} aria-label="Copier">
                  <Copy className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-8 p-0"
                  onClick={() => toast.success('Code régénéré', { description: "L'ancien code n'est plus valide." })}
                  aria-label="Régénérer"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Donne ce code à tes élèves pour rejoindre le groupe.
              </p>
            </Card>

            {/* Ressources partagées */}
            <Card className="gap-0 rounded-2xl p-4 shadow-soft">
              <p className="mb-3 font-heading font-bold">Ressources partagées</p>
              {resources.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune ressource partagée avec ce groupe.</p>
              ) : (
                <ul className="space-y-1.5">
                  {resources.map((r) => {
                    const m = TYPE_META[r.type]
                    return (
                      <li key={r.id}>
                        <Link
                          to="/prof/ressources/$id"
                          params={{ id: r.id }}
                          className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-secondary"
                        >
                          <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', m.chip)}>
                            <m.Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.title}</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>

            {/* Actions */}
            <Card className="gap-0 rounded-2xl p-4 shadow-soft">
              <p className="mb-3 font-heading font-bold">Actions</p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/prof/exercices/nouveau">
                    <Pencil className="size-4" /> Créer / assigner un devoir
                  </Link>
                </Button>
                <DeleteGroupDialog
                  name={group.name}
                  onConfirm={() => {
                    toast.success(`Groupe « ${group.name} » supprimé`)
                    navigate({ to: '/prof/groupes' })
                  }}
                />
              </div>
            </Card>
          </>
        }
      >
        {/* Élèves */}
        <Card className="gap-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-lg font-bold">Élèves du groupe</p>
            <span className="text-sm text-muted-foreground">{roster.length} inscrits</span>
          </div>
          {roster.length === 0 ? (
            <p className="rounded-xl bg-secondary/60 px-3 py-6 text-center text-sm text-muted-foreground">
              Aucun élève n'a encore rejoint ce groupe. Partage le code {group.code}.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {roster.map((s) => {
                const tm = trendMeta[s.trend]
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-2 transition-colors hover:bg-secondary/40">
                    <Link
                      to="/prof/eleves/$id"
                      params={{ id: s.id }}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-lg">
                        {s.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{s.pseudo}</p>
                        <p className="text-xs text-muted-foreground">{s.lastSeen}</p>
                      </div>
                    </Link>
                    <div className="hidden w-28 items-center gap-2 sm:flex">
                      <Meter value={s.avgScore} color="auto" />
                      <span className="w-9 text-right text-xs font-bold tabular-nums">{s.avgScore}%</span>
                    </div>
                    <span className={cn('hidden items-center gap-1 text-xs font-medium md:flex', tm.cls)}>
                      <tm.Icon className="size-3.5" /> {tm.label}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => toast.success(`${s.pseudo} retiré du groupe`)}
                    >
                      <X className="size-3.5" />
                      <span className="hidden sm:inline">Retirer</span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Compétences du groupe */}
        <Card className="p-4 sm:p-5">
          <p className="mb-3 font-heading text-lg font-bold">Compétences du groupe</p>
          <ul className="space-y-3">
            {skills.map((sk) => {
              const weak = sk.label === group.weakSkill
              return (
                <li key={sk.key} className="flex items-center gap-3">
                  <span className={cn('w-24 shrink-0 text-sm', weak ? 'font-bold text-amber-foreground' : 'font-medium')}>
                    {sk.label}
                  </span>
                  <Meter value={sk.mastery} color="auto" />
                  <span className="w-9 shrink-0 text-right text-sm font-bold tabular-nums">{sk.mastery}%</span>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Séances */}
        <Card className="gap-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-lg font-bold">Séances du groupe</p>
            <Button asChild size="sm" variant="ghost">
              <Link to="/prof/planning">Planning <ChevronRight className="size-4" /></Link>
            </Button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune séance planifiée pour ce groupe.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <SoftIcon tone={s.status === 'replay' ? 'teal' : 'brand'} className="size-10 shrink-0">
                    <CalendarDays className="size-5" />
                  </SoftIcon>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{s.date} · {s.time}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {s.durationMin} min
                      </span>
                    </p>
                  </div>
                  <Badge variant="secondary" className={s.status === 'replay' ? 'bg-secondary text-muted-foreground' : 'bg-brand-soft text-brand'}>
                    {s.status === 'replay' ? 'Replay' : 'À venir'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </RailLayout>
    </div>
  )
}

/* ----------------------------- Dialogs -------------------------------- */

function EditGroupDialog({ name, level }: { name: string; level: string }) {
  const [open, setOpen] = useState(false)
  const [n, setN] = useState(name)
  const [l, setL] = useState(level)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="secondary" className="bg-white text-brand hover:bg-white/90" onClick={() => setOpen(true)}>
        <Pencil className="size-4" /> Modifier
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le groupe</DialogTitle>
          <DialogDescription>Mets à jour le nom et le niveau du groupe.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nom du groupe</Label>
            <Input id="edit-name" value={n} onChange={(e) => setN(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-level">Niveau</Label>
            <Select value={l} onValueChange={setL}>
              <SelectTrigger id="edit-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['CE1D', 'S1', 'S2', 'S3'].map((x) => (
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button onClick={() => { setOpen(false); toast.success('Groupe mis à jour') }}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteGroupDialog({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" /> Supprimer le groupe
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer « {name} » ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Les élèves ne seront pas supprimés mais perdront leur rattachement à ce groupe.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => { setOpen(false); onConfirm() }}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
