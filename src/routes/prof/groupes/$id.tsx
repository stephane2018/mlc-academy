import { useState } from 'react'
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Users,
  Copy,
  RotateCcw,
  MessageSquare,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  CalendarDays,
  Clock,
} from '@/components/icons'
import { toast } from 'sonner'
import { SoftIcon } from '@/components/student/parts'
import { spreadAvatar } from '@/lib/avatar'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { QueryError } from '@/components/query-error'
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
import {
  useGroup,
  useRegenerateGroupCode,
  useUpdateGroup,
  useDeleteGroup,
  useRemoveGroupMember,
} from '@/hooks/use-groups'
import { useClasses } from '@/hooks/use-catalog'
import { useLiveSessions } from '@/hooks/use-live'

export const Route = createFileRoute('/prof/groupes/$id')({
  component: GroupDetail,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function GroupDetail() {
  const { id } = useParams({ from: '/prof/groupes/$id' })
  const navigate = useNavigate()
  const groupQ = useGroup(id)
  const { data: group, isLoading } = groupQ
  const { data: classes = [] } = useClasses()
  const { data: liveSessions = [] } = useLiveSessions()
  const regenerate = useRegenerateGroupCode()
  const removeMember = useRemoveGroupMember()

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chargement du groupe…</div>
  }

  if (groupQ.isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <QueryError onRetry={() => groupQ.refetch()} />
      </div>
    )
  }

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

  const classLabel = classes.find((c) => c.id === group.classId)?.label ?? '—'
  const sessions = liveSessions.filter((s) => s.groupId === group.id)
  const members = group.members

  const copyCode = () => {
    navigator.clipboard?.writeText(group.code).catch(() => {})
    toast.success('Code copié', { description: group.code })
  }
  const regenCode = () =>
    regenerate.mutate(group.id, {
      onSuccess: (r) => toast.success('Code régénéré', { description: `Nouveau code : ${r.code}` }),
      onError: () => toast.error('Échec de la régénération.'),
    })

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <Link
        to="/prof/groupes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Mes groupes
      </Link>

      <PageHero
        eyebrow={classLabel}
        title={group.name}
        subtitle={`${group.studentCount} élève${group.studentCount > 1 ? 's' : ''} · code d'invitation ${group.code}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/prof/messages">
                <MessageSquare className="size-4" /> Message au groupe
              </Link>
            </Button>
            <EditGroupDialog id={group.id} name={group.name} classId={group.classId} />
          </>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Users} tone="brand" label="Élèves" value={group.studentCount} />
        <StatTile icon={CalendarDays} tone="teal" label="Séances" value={sessions.length} />
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
                  disabled={regenerate.isPending}
                  onClick={regenCode}
                  aria-label="Régénérer"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Donne ce code à tes élèves pour rejoindre le groupe.
              </p>
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
                  id={group.id}
                  name={group.name}
                  onDeleted={() => navigate({ to: '/prof/groupes' })}
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
            <span className="text-sm text-muted-foreground">{members.length} inscrits</span>
          </div>
          {members.length === 0 ? (
            <p className="rounded-xl bg-secondary/60 px-3 py-6 text-center text-sm text-muted-foreground">
              Aucun élève n'a encore rejoint ce groupe. Partage le code {group.code}.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {members.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-2 transition-colors hover:bg-secondary/40">
                  <Link
                    to="/prof/eleves/$id"
                    params={{ id: s.id }}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-lg">
                      {spreadAvatar(s.avatar, s.pseudo)}
                    </span>
                    <p className="truncate text-sm font-semibold">{s.pseudo}</p>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={removeMember.isPending}
                    onClick={() =>
                      removeMember.mutate(
                        { id: group.id, studentId: s.id },
                        {
                          onSuccess: () => toast.success(`${s.pseudo} retiré du groupe`),
                          onError: () => toast.error('Échec du retrait.'),
                        },
                      )
                    }
                  >
                    <X className="size-3.5" />
                    <span className="hidden sm:inline">Retirer</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
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
              {sessions.map((s) => {
                const d = new Date(s.scheduledAt)
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <SoftIcon tone={s.status === 'replay' ? 'teal' : 'brand'} className="size-10 shrink-0">
                      <CalendarDays className="size-5" />
                    </SoftIcon>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.title}</p>
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{dateFmt.format(d)} · {timeFmt.format(d)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> {s.durationMin} min
                        </span>
                      </p>
                    </div>
                    <Badge variant="secondary" className={s.status === 'replay' ? 'bg-secondary text-muted-foreground' : 'bg-brand-soft text-brand'}>
                      {s.status === 'replay' ? 'Replay' : 'À venir'}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </RailLayout>
    </div>
  )
}

/* ----------------------------- Dialogs -------------------------------- */

function EditGroupDialog({ id, name, classId }: { id: string; name: string; classId: string }) {
  const [open, setOpen] = useState(false)
  const [n, setN] = useState(name)
  const [c, setC] = useState(classId)
  const { data: classes = [] } = useClasses()
  const update = useUpdateGroup()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="secondary" className="bg-white text-brand hover:bg-white/90" onClick={() => setOpen(true)}>
        <Pencil className="size-4" /> Modifier
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le groupe</DialogTitle>
          <DialogDescription>Mets à jour le nom et la classe du groupe.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nom du groupe</Label>
            <Input id="edit-name" value={n} onChange={(e) => setN(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-level">Classe</Label>
            <Select value={c} onValueChange={setC}>
              <SelectTrigger id="edit-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((x) => (
                  <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            disabled={!n.trim() || update.isPending}
            onClick={() =>
              update.mutate(
                { id, input: { name: n.trim(), classId: c } },
                {
                  onSuccess: () => {
                    setOpen(false)
                    toast.success('Groupe mis à jour')
                  },
                  onError: () => toast.error('Échec de la mise à jour.'),
                },
              )
            }
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteGroupDialog({ id, name, onDeleted }: { id: string; name: string; onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const remove = useDeleteGroup()
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
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(id, {
                onSuccess: () => {
                  setOpen(false)
                  toast.success(`Groupe « ${name} » supprimé`)
                  onDeleted()
                },
                onError: () => toast.error('Échec de la suppression.'),
              })
            }
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
