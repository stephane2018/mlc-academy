import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Users, Copy, RotateCcw, ArrowRight } from '@/components/icons'
import { toast } from 'sonner'
import { SoftIcon } from '@/components/student/parts'
import { PageHero } from '@/components/blocks'
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
import { useGroups, useCreateGroup, useRegenerateGroupCode } from '@/hooks/use-groups'
import { useClasses } from '@/hooks/use-catalog'
import type { Group } from '@/services/groups'

export const Route = createFileRoute('/prof/groupes/')({
  component: ProfGroupes,
})

function ProfGroupes() {
  const groupsQ = useGroups()
  const classesQ = useClasses()
  const groups = groupsQ.data ?? []
  const classes = classesQ.data ?? []
  const isLoading = groupsQ.isLoading
  const isError = groupsQ.isError || classesQ.isError
  const classLabel = (id: string) => classes.find((c) => c.id === id)?.label ?? '—'

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Espace Prof"
        title="Mes groupes"
        subtitle="Crée des groupes, partage leur code d'invitation et suis leurs élèves."
        actions={<CreateGroupDialog />}
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement de tes groupes…</p>
      ) : isError ? (
        <QueryError onRetry={() => { groupsQ.refetch(); classesQ.refetch() }} />
      ) : groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucun groupe pour l'instant. Crée ton premier groupe et partage son code.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} classLabel={classLabel(g.classId)} />
          ))}
        </div>
      )}
    </div>
  )
}

function GroupCard({ group, classLabel }: { group: Group; classLabel: string }) {
  const regenerate = useRegenerateGroupCode()
  const copyCode = () => {
    navigator.clipboard?.writeText(group.code).catch(() => {})
    toast.success('Code copié', { description: group.code })
  }

  return (
    <Card className="card-hover gap-0 p-5">
      <Link
        to="/prof/groupes/$id"
        params={{ id: group.id }}
        className="flex items-start justify-between gap-2"
      >
        <div className="flex items-center gap-3">
          <SoftIcon tone="brand" className="size-11">
            <Users className="size-5" />
          </SoftIcon>
          <div className="leading-tight">
            <p className="font-heading text-base font-bold">{group.name}</p>
            <p className="text-xs text-muted-foreground">
              {group.studentCount} élève{group.studentCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">
          {classLabel}
        </Badge>
      </Link>

      {/* Code d'invitation */}
      <div className="mt-4 rounded-xl bg-secondary p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Code d'invitation
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="flex-1 font-mono text-lg font-extrabold tracking-wider text-foreground">
            {group.code}
          </span>
          <Button size="sm" variant="outline" className="size-8 p-0" onClick={copyCode} aria-label="Copier le code">
            <Copy className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="size-8 p-0"
            disabled={regenerate.isPending}
            onClick={() =>
              regenerate.mutate(group.id, {
                onSuccess: (r) => toast.success('Code régénéré', { description: `Nouveau code : ${r.code}` }),
                onError: () => toast.error('Échec de la régénération.'),
              })
            }
            aria-label="Régénérer le code"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <Button asChild variant="ghost" className="mt-4 w-full justify-between">
        <Link to="/prof/groupes/$id" params={{ id: group.id }}>
          Voir le détail du groupe
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  )
}

function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [classId, setClassId] = useState('')
  const { data: classes = [] } = useClasses()
  const createGroup = useCreateGroup()

  const reset = () => {
    setName('')
    setClassId('')
  }

  function submit() {
    if (!name.trim() || !classId) return
    createGroup.mutate(
      { name: name.trim(), classId },
      {
        onSuccess: (g) => {
          setOpen(false)
          reset()
          toast.success('Groupe créé', { description: `Code d'invitation : ${g.code}` })
        },
        onError: () => toast.error('Échec de la création du groupe.'),
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-white text-brand hover:bg-white/90">
          <Plus className="size-4" />
          Créer un groupe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un groupe</DialogTitle>
          <DialogDescription>Un code d'invitation sera généré automatiquement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Nom du groupe</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Groupe du soir"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group-level">Classe</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="group-level" className="w-full">
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Seules les classes activées par l'administration sont proposées.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button disabled={!name.trim() || !classId || createGroup.isPending} onClick={submit}>
            Créer le groupe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
