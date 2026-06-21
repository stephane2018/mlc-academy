import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Users, Copy, RotateCcw, Target, ArrowRight } from '@/components/icons'
import { toast } from 'sonner'
import { Meter, SoftIcon } from '@/components/student/parts'
import { PageHero } from '@/components/blocks'
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
import {
  profGroups,
  getSubject,
  classes,
  subjects,
  type ProfGroup,
  type SubjectKey,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/groupes/')({
  component: ProfGroupes,
})

/** Classes proposées au prof = celles activées par l'admin (référentiel). */
const activeClasses = classes.filter((c) => c.active)

function ProfGroupes() {
  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Espace Prof"
        title="Mes groupes"
        subtitle="Crée des groupes, partage leur code d'invitation et suis leurs élèves."
        actions={<CreateGroupDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profGroups.map((g) => (
          <GroupCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  )
}

function GroupCard({ group }: { group: ProfGroup }) {
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
            <p className="text-xs text-muted-foreground">{group.students} élèves</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">
            {group.level}
          </Badge>
          <div className="flex flex-wrap justify-end gap-1">
            {group.subjects.map((k) => {
              const s = getSubject(k)
              return (
                <span
                  key={k}
                  title={s.label}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.label}
                </span>
              )
            })}
          </div>
        </div>
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <Meter value={group.avgScore} color="auto" />
        <span className="shrink-0 text-sm font-bold tabular-nums">{group.avgScore}%</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">Score moyen du groupe</p>

      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Target className="size-3.5 text-amber" />
        Point faible : <span className="font-semibold text-foreground">{group.weakSkill}</span>
      </p>

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
            onClick={() => toast.success('Code régénéré', { description: "L'ancien code n'est plus valide." })}
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
  const [level, setLevel] = useState('')
  const [subs, setSubs] = useState<SubjectKey[]>([])

  const genCode = () =>
    'MLC-' +
    Array.from({ length: 4 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32)),
    ).join('')

  const toggleSub = (k: SubjectKey) =>
    setSubs((prev) => (prev.includes(k) ? prev.filter((s) => s !== k) : [...prev, k]))

  const reset = () => {
    setName('')
    setLevel('')
    setSubs([])
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
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger id="group-level" className="w-full">
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {activeClasses.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Seules les classes activées par l'administration sont proposées.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Matières du groupe</Label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => {
                const active = subs.includes(s.key)
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleSub(s.key)}
                    style={active ? { backgroundColor: s.color, borderColor: s.color } : undefined}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border-transparent text-white'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {!active && (
                      <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                    )}
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            disabled={!name.trim() || !level || subs.length === 0}
            onClick={() => {
              const code = genCode()
              setOpen(false)
              toast.success('Groupe créé', { description: `Code d'invitation : ${code}` })
              reset()
            }}
          >
            Créer le groupe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
