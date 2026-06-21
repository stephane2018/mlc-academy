import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle2,
  Eye,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SoftIcon, SectionHeader } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/classes')({
  component: AdminClasses,
})

/* ------------------------------------------------------------------ */
/* Types — reflètent `classes` + `class_subjects` (multi-classes)      */
/* ------------------------------------------------------------------ */

type ClassRow = {
  id: string
  code: string
  label: string
  ordre: number
  active: boolean
  groups: number
  students: number
}

type SubjectOption = {
  id: string
  code: string
  name: string
  color: string
}

/* ------------------------------------------------------------------ */
/* Mock cohérent                                                       */
/* ------------------------------------------------------------------ */

const initialClasses: ClassRow[] = [
  { id: 'cl-ce1d', code: 'CE1D', label: 'CE1D — Certificat du 1er degré', ordre: 1, active: true, groups: 6, students: 142 },
  { id: 'cl-s1', code: 'S1', label: '1re secondaire (S1)', ordre: 2, active: true, groups: 4, students: 96 },
  { id: 'cl-s2', code: 'S2', label: '2e secondaire (S2)', ordre: 3, active: true, groups: 3, students: 71 },
  { id: 'cl-s3', code: 'S3', label: '3e secondaire (S3)', ordre: 4, active: false, groups: 0, students: 0 },
]

const subjectCatalog: SubjectOption[] = [
  { id: 'sub-math', code: 'MATH', name: 'Mathématiques', color: '#4f46e5' },
  { id: 'sub-fr', code: 'FR', name: 'Français', color: '#db2777' },
  { id: 'sub-sci', code: 'SCI', name: 'Sciences', color: '#0d9488' },
  { id: 'sub-hist', code: 'HIST', name: 'Histoire-Géo', color: '#d97706' },
]

/** Mock `class_subjects` : matières ouvertes par classe (id classe -> ids matières). */
const initialClassSubjects: Record<string, string[]> = {
  'cl-ce1d': ['sub-math', 'sub-fr', 'sub-sci'],
  'cl-s1': ['sub-math', 'sub-fr', 'sub-sci', 'sub-hist'],
  'cl-s2': ['sub-math', 'sub-fr'],
  'cl-s3': ['sub-math'],
}

/* ------------------------------------------------------------------ */
/* Helpers d'affichage                                                 */
/* ------------------------------------------------------------------ */

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-success-soft text-success">Active</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  )
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
      <div className="overflow-x-auto">{children}</div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminClasses() {
  const [list, setList] = useState<ClassRow[]>(initialClasses)
  const [classSubjects, setClassSubjects] =
    useState<Record<string, string[]>>(initialClassSubjects)
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const rows = useMemo(() => [...list].sort((a, b) => a.ordre - b.ordre), [list])
  const selected = list.find((c) => c.id === openId) ?? null

  const kpi = useMemo(
    () => ({
      total: list.length,
      active: list.filter((c) => c.active).length,
      groups: list.reduce((a, c) => a + c.groups, 0),
      students: list.reduce((a, c) => a + c.students, 0),
    }),
    [list],
  )

  const toggleActive = (id: string) =>
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))

  const move = (id: string, dir: -1 | 1) =>
    setList((prev) => {
      const sorted = [...prev].sort((a, b) => a.ordre - b.ordre)
      const i = sorted.findIndex((c) => c.id === id)
      const j = i + dir
      if (j < 0 || j >= sorted.length) return prev
      const a = sorted[i]
      const b = sorted[j]
      return prev.map((c) => {
        if (c.id === a.id) return { ...c, ordre: b.ordre }
        if (c.id === b.id) return { ...c, ordre: a.ordre }
        return c
      })
    })

  const remove = (id: string) => {
    setList((prev) => prev.filter((c) => c.id !== id))
    setClassSubjects((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (openId === id) setOpenId(null)
  }

  const save = (next: Pick<ClassRow, 'id' | 'label' | 'code' | 'ordre' | 'active'>) =>
    setList((prev) =>
      prev.map((c) =>
        c.id === next.id
          ? { ...c, label: next.label, code: next.code, ordre: next.ordre, active: next.active }
          : c,
      ),
    )

  const create = (data: { code: string; label: string; ordre: number; active: boolean }) => {
    const id = `cl-${Date.now()}`
    setList((prev) => [
      ...prev,
      { id, code: data.code, label: data.label, ordre: data.ordre, active: data.active, groups: 0, students: 0 },
    ])
    setClassSubjects((prev) => ({ ...prev, [id]: [] }))
    setCreating(false)
  }

  const toggleSubject = (classId: string, subjectId: string) =>
    setClassSubjects((prev) => {
      const cur = prev[classId] ?? []
      const next = cur.includes(subjectId)
        ? cur.filter((s) => s !== subjectId)
        : [...cur, subjectId]
      return { ...prev, [classId]: next }
    })

  return (
    <TooltipProvider>
      <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
              Classes
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Crée, réordonne et active les classes du cursus. Une classe désactivée n'est pas
              supprimée : elle devient simplement inaccessible (aucun nouveau groupe, contenus
              masqués aux élèves). La suppression définitive n'est possible que sur une classe vide.
            </p>
          </div>
          <Button onClick={() => setCreating(true)} className="shrink-0">
            <Plus className="size-4" />
            Nouvelle classe
          </Button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile icon={GraduationCap} tone="brand" label="Classes" value={kpi.total} />
          <StatTile icon={CheckCircle2} tone="success" label="Actives" value={kpi.active} />
          <StatTile icon={Users} tone="teal" label="Groupes" value={kpi.groups} />
          <StatTile icon={Users} tone="info" label="Élèves" value={kpi.students} />
        </div>

        <TableCard>
          <table className="w-full min-w-[940px] text-sm">
            <thead>
              <tr className={THEAD}>
                <th className={cn(TH, 'w-24')}>Ordre</th>
                <th className={TH}>Classe</th>
                <th className={cn(TH, 'text-right')}>Matières</th>
                <th className={cn(TH, 'text-right')}>Groupes</th>
                <th className={cn(TH, 'text-right')}>Élèves</th>
                <th className={TH}>Disponible</th>
                <th className={cn(TH, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c, i) => {
                const empty = c.groups === 0 && c.students === 0
                const subjectsCount = (classSubjects[c.id] ?? []).length
                return (
                  <tr key={c.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Monter"
                          disabled={i === 0}
                          onClick={() => move(c.id, -1)}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Descendre"
                          disabled={i === rows.length - 1}
                          onClick={() => move(c.id, 1)}
                        >
                          <ArrowDown />
                        </Button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <SoftIcon tone="brand" className="size-8">
                          <GraduationCap className="size-4" />
                        </SoftIcon>
                        <div className="min-w-0">
                          <div className="font-medium">{c.label}</div>
                          <Badge variant="outline" className="mt-0.5 font-mono text-xs">
                            {c.code}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{subjectsCount}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{c.groups}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{c.students}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.active}
                          onCheckedChange={() => toggleActive(c.id)}
                          aria-label={`Activer la classe ${c.code}`}
                        />
                        <StatusBadge active={c.active} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Voir le détail"
                          onClick={() => setOpenId(c.id)}
                        >
                          <Eye />
                        </Button>
                        {empty ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Supprimer la classe"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(c.id)}
                          >
                            <Trash2 />
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Suppression impossible"
                                  disabled
                                >
                                  <Trash2 />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Classe non vide — désactive-la plutôt
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    Aucune classe. Crée-en une avec « Nouvelle classe ».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>

        <ClassSheet
          item={selected}
          subjects={subjectCatalog}
          openSubjects={selected ? (classSubjects[selected.id] ?? []) : []}
          onClose={() => setOpenId(null)}
          onToggleActive={toggleActive}
          onSave={save}
          onToggleSubject={toggleSubject}
        />

        <CreateClassSheet
          open={creating}
          nextOrdre={list.length + 1}
          onClose={() => setCreating(false)}
          onCreate={create}
        />
      </div>
    </TooltipProvider>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet création                                                      */
/* ------------------------------------------------------------------ */

function CreateClassSheet({
  open,
  nextOrdre,
  onClose,
  onCreate,
}: {
  open: boolean
  nextOrdre: number
  onClose: () => void
  onCreate: (data: { code: string; label: string; ordre: number; active: boolean }) => void
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {open && (
          <CreateClassForm key="create" nextOrdre={nextOrdre} onClose={onClose} onCreate={onCreate} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function CreateClassForm({
  nextOrdre,
  onClose,
  onCreate,
}: {
  nextOrdre: number
  onClose: () => void
  onCreate: (data: { code: string; label: string; ordre: number; active: boolean }) => void
}) {
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [ordre, setOrdre] = useState(nextOrdre)
  const [active, setActive] = useState(true)

  const valid = code.trim().length > 0 && label.trim().length > 0

  return (
    <>
      <SheetHeader className="border-b border-border">
        <SheetTitle className="text-lg">Nouvelle classe</SheetTitle>
        <SheetDescription>
          Définis le code, le libellé et la position dans le cursus.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label htmlFor="new-code">Code</Label>
          <Input
            id="new-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex. S4"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-label">Libellé affiché</Label>
          <Input
            id="new-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. 4e secondaire (S4)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-ordre">Ordre</Label>
          <Input
            id="new-ordre"
            type="number"
            min={1}
            value={ordre}
            onChange={(e) => setOrdre(Number(e.target.value) || 1)}
            className="w-28"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Classe disponible</span>
          </div>
          <Switch checked={active} onCheckedChange={setActive} aria-label="Disponibilité" />
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Annuler
        </Button>
        <Button
          className="flex-1"
          disabled={!valid}
          onClick={() =>
            onCreate({ code: code.trim(), label: label.trim(), ordre, active })
          }
        >
          Créer la classe
        </Button>
      </SheetFooter>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet édition                                                       */
/* ------------------------------------------------------------------ */

function ClassSheet({
  item,
  subjects,
  openSubjects,
  onClose,
  onToggleActive,
  onSave,
  onToggleSubject,
}: {
  item: ClassRow | null
  subjects: SubjectOption[]
  openSubjects: string[]
  onClose: () => void
  onToggleActive: (id: string) => void
  onSave: (next: Pick<ClassRow, 'id' | 'label' | 'code' | 'ordre' | 'active'>) => void
  onToggleSubject: (classId: string, subjectId: string) => void
}) {
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {item && (
          <ClassEditor
            key={item.id}
            item={item}
            subjects={subjects}
            openSubjects={openSubjects}
            onToggleActive={onToggleActive}
            onSave={onSave}
            onToggleSubject={onToggleSubject}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function ClassEditor({
  item,
  subjects,
  openSubjects,
  onToggleActive,
  onSave,
  onToggleSubject,
  onClose,
}: {
  item: ClassRow
  subjects: SubjectOption[]
  openSubjects: string[]
  onToggleActive: (id: string) => void
  onSave: (next: Pick<ClassRow, 'id' | 'label' | 'code' | 'ordre' | 'active'>) => void
  onToggleSubject: (classId: string, subjectId: string) => void
  onClose: () => void
}) {
  const [label, setLabel] = useState(item.label)
  const [code, setCode] = useState(item.code)
  const [ordre, setOrdre] = useState(item.ordre)

  const dirty =
    label.trim() !== item.label || code.trim() !== item.code || ordre !== item.ordre

  return (
    <>
      <SheetHeader className="border-b border-border">
        <div className="flex items-center gap-3">
          <SoftIcon tone="brand" className="size-12">
            <GraduationCap className="size-5" />
          </SoftIcon>
          <div className="min-w-0">
            <SheetTitle className="text-lg">{item.label}</SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {item.code}
              </Badge>
              <StatusBadge active={item.active} />
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-5 p-4">
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <Stat icon={Users} value={item.groups} label="Groupes" />
          <Stat icon={Users} value={item.students} label="Élèves" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-label">Libellé affiché</Label>
          <Input
            id="class-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. 1re secondaire (S1)"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="class-code">Code</Label>
            <Input
              id="class-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-ordre">Ordre</Label>
            <Input
              id="class-ordre"
              type="number"
              min={1}
              value={ordre}
              onChange={(e) => setOrdre(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Classe disponible</span>
          </div>
          <Switch
            checked={item.active}
            onCheckedChange={() => onToggleActive(item.id)}
            aria-label="Disponibilité de la classe"
          />
        </div>

        <div>
          <SectionHeader title="Matières ouvertes dans cette classe" />
          <div className="space-y-2">
            {subjects.map((s) => {
              const open = openSubjects.includes(s.id)
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="font-medium">{s.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {s.code}
                    </Badge>
                  </div>
                  <Switch
                    checked={open}
                    onCheckedChange={() => onToggleSubject(item.id, s.id)}
                    aria-label={`Ouvrir ${s.name} dans ${item.code}`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Fermer
        </Button>
        <Button
          className="flex-1"
          disabled={!dirty}
          onClick={() => {
            onSave({
              id: item.id,
              label: label.trim(),
              code: code.trim(),
              ordre,
              active: item.active,
            })
            onClose()
          }}
        >
          Enregistrer
        </Button>
      </SheetFooter>
    </>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users
  value: number
  label: string
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <Icon className="mx-auto size-4 text-muted-foreground" />
      <div className="mt-1 font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
