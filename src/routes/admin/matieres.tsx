import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  BookOpen,
  Library,
  GraduationCap,
  Users,
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
import { SectionHeader } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/matieres')({
  component: AdminMatieres,
})

/* ------------------------------------------------------------------ */
/* Types — `subjects` + `subject_themes`                               */
/* ------------------------------------------------------------------ */

type Theme = {
  id: string
  code: string
  name: string
  ordre: number
  active: boolean
}

type SubjectRow = {
  id: string
  code: string
  name: string
  color: string
  active: boolean
  classes: number
  teachers: number
  contentCount: number
  themes: Theme[]
}

/* ------------------------------------------------------------------ */
/* Mock cohérent                                                       */
/* ------------------------------------------------------------------ */

function theme(id: string, code: string, name: string, ordre: number, active = true): Theme {
  return { id, code, name, ordre, active }
}

const initialSubjects: SubjectRow[] = [
  {
    id: 'sub-math',
    code: 'MATH',
    name: 'Mathématiques',
    color: '#4f46e5',
    active: true,
    classes: 4,
    teachers: 3,
    contentCount: 128,
    themes: [
      theme('th-m1', 'NOMB', 'Nombres', 1),
      theme('th-m2', 'ALG', 'Algèbre', 2),
      theme('th-m3', 'GEO', 'Géométrie', 3),
      theme('th-m4', 'MES', 'Grandeurs & mesures', 4),
      theme('th-m5', 'STAT', 'Statistiques', 5),
    ],
  },
  {
    id: 'sub-fr',
    code: 'FR',
    name: 'Français',
    color: '#db2777',
    active: true,
    classes: 3,
    teachers: 2,
    contentCount: 74,
    themes: [
      theme('th-f1', 'GRAM', 'Grammaire', 1),
      theme('th-f2', 'CONJ', 'Conjugaison', 2),
      theme('th-f3', 'LECT', 'Lecture & compréhension', 3),
    ],
  },
  {
    id: 'sub-sci',
    code: 'SCI',
    name: 'Sciences',
    color: '#0d9488',
    active: false,
    classes: 0,
    teachers: 0,
    contentCount: 0,
    themes: [],
  },
]

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

function AdminMatieres() {
  const [list, setList] = useState<SubjectRow[]>(initialSubjects)
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const selected = list.find((s) => s.id === openId) ?? null

  const kpi = useMemo(
    () => ({
      total: list.length,
      active: list.filter((s) => s.active).length,
      themes: list.reduce((a, s) => a + s.themes.length, 0),
      teachers: list.reduce((a, s) => a + s.teachers, 0),
    }),
    [list],
  )

  const toggleActive = (id: string) =>
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))

  const remove = (id: string) => {
    setList((prev) => prev.filter((s) => s.id !== id))
    if (openId === id) setOpenId(null)
  }

  const save = (next: Pick<SubjectRow, 'id' | 'name' | 'code' | 'color' | 'active'>) =>
    setList((prev) =>
      prev.map((s) =>
        s.id === next.id
          ? { ...s, name: next.name, code: next.code, color: next.color, active: next.active }
          : s,
      ),
    )

  const create = (data: { code: string; name: string; color: string; active: boolean }) => {
    const id = `sub-${Date.now()}`
    setList((prev) => [
      ...prev,
      {
        id,
        code: data.code,
        name: data.name,
        color: data.color,
        active: data.active,
        classes: 0,
        teachers: 0,
        contentCount: 0,
        themes: [],
      },
    ])
    setCreating(false)
  }

  const updateThemes = (subjectId: string, themes: Theme[]) =>
    setList((prev) => prev.map((s) => (s.id === subjectId ? { ...s, themes } : s)))

  return (
    <TooltipProvider>
      <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
              Matières
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Crée et organise les matières et leurs thèmes (chapitres). Une matière désactivée
              n'est plus proposée dans les classes ni au ciblage des contenus, sans être supprimée.
              La suppression définitive est bloquée tant que la matière contient des contenus.
            </p>
          </div>
          <Button onClick={() => setCreating(true)} className="shrink-0">
            <Plus className="size-4" />
            Nouvelle matière
          </Button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile icon={BookOpen} tone="brand" label="Matières" value={kpi.total} />
          <StatTile icon={CheckCircle2} tone="success" label="Actives" value={kpi.active} />
          <StatTile icon={Library} tone="teal" label="Thèmes" value={kpi.themes} />
          <StatTile icon={GraduationCap} tone="info" label="Profs" value={kpi.teachers} />
        </div>

        <TableCard>
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className={THEAD}>
                <th className={TH}>Matière</th>
                <th className={cn(TH, 'text-right')}>Thèmes</th>
                <th className={cn(TH, 'text-right')}>Classes</th>
                <th className={TH}>Disponible</th>
                <th className={cn(TH, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((s) => {
                const locked = s.contentCount > 0
                return (
                  <tr key={s.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium">{s.name}</div>
                          <Badge variant="outline" className="mt-0.5 font-mono text-xs">
                            {s.code}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{s.themes.length}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{s.classes}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.active}
                          onCheckedChange={() => toggleActive(s.id)}
                          aria-label={`Activer la matière ${s.name}`}
                        />
                        <StatusBadge active={s.active} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Voir le détail"
                          onClick={() => setOpenId(s.id)}
                        >
                          <Eye />
                        </Button>
                        {locked ? (
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
                              Matière avec contenus — désactive-la plutôt
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Supprimer la matière"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(s.id)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Aucune matière. Crée-en une avec « Nouvelle matière ».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>

        <SubjectSheet
          item={selected}
          onClose={() => setOpenId(null)}
          onToggleActive={toggleActive}
          onSave={save}
          onUpdateThemes={updateThemes}
        />

        <CreateSubjectSheet
          open={creating}
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

const COLOR_CHOICES = ['#4f46e5', '#db2777', '#0d9488', '#d97706', '#7c3aed', '#dc2626']

function CreateSubjectSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (data: { code: string; name: string; color: string; active: boolean }) => void
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {open && <CreateSubjectForm key="create" onClose={onClose} onCreate={onCreate} />}
      </SheetContent>
    </Sheet>
  )
}

function CreateSubjectForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { code: string; name: string; color: string; active: boolean }) => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_CHOICES[0])
  const [active, setActive] = useState(true)

  const valid = code.trim().length > 0 && name.trim().length > 0

  return (
    <>
      <SheetHeader className="border-b border-border">
        <SheetTitle className="text-lg">Nouvelle matière</SheetTitle>
        <SheetDescription>Définis le nom, le code et la couleur d'affichage.</SheetDescription>
      </SheetHeader>

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label htmlFor="new-name">Nom</Label>
          <Input
            id="new-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Sciences"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-code">Code</Label>
          <Input
            id="new-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex. SCI"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label>Couleur</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Matière disponible</span>
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
          onClick={() => onCreate({ code: code.trim(), name: name.trim(), color, active })}
        >
          Créer la matière
        </Button>
      </SheetFooter>
    </>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_CHOICES.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Couleur ${c}`}
          onClick={() => onChange(c)}
          className={cn(
            'size-8 rounded-full ring-offset-2 ring-offset-card transition',
            value === c ? 'ring-2 ring-foreground' : 'ring-1 ring-border',
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet édition                                                       */
/* ------------------------------------------------------------------ */

function SubjectSheet({
  item,
  onClose,
  onToggleActive,
  onSave,
  onUpdateThemes,
}: {
  item: SubjectRow | null
  onClose: () => void
  onToggleActive: (id: string) => void
  onSave: (next: Pick<SubjectRow, 'id' | 'name' | 'code' | 'color' | 'active'>) => void
  onUpdateThemes: (subjectId: string, themes: Theme[]) => void
}) {
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {item && (
          <SubjectEditor
            key={item.id}
            item={item}
            onToggleActive={onToggleActive}
            onSave={onSave}
            onUpdateThemes={onUpdateThemes}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function SubjectEditor({
  item,
  onToggleActive,
  onSave,
  onUpdateThemes,
  onClose,
}: {
  item: SubjectRow
  onToggleActive: (id: string) => void
  onSave: (next: Pick<SubjectRow, 'id' | 'name' | 'code' | 'color' | 'active'>) => void
  onUpdateThemes: (subjectId: string, themes: Theme[]) => void
  onClose: () => void
}) {
  const [name, setName] = useState(item.name)
  const [code, setCode] = useState(item.code)
  const [color, setColor] = useState(item.color)
  const [newTheme, setNewTheme] = useState('')

  const dirty =
    name.trim() !== item.name || code.trim() !== item.code || color !== item.color

  const themes = useMemo(
    () => [...item.themes].sort((a, b) => a.ordre - b.ordre),
    [item.themes],
  )

  const addTheme = () => {
    const label = newTheme.trim()
    if (!label) return
    const maxOrdre = item.themes.reduce((m, t) => Math.max(m, t.ordre), 0)
    const t: Theme = {
      id: `th-${Date.now()}`,
      code: label.slice(0, 4).toUpperCase(),
      name: label,
      ordre: maxOrdre + 1,
      active: true,
    }
    onUpdateThemes(item.id, [...item.themes, t])
    setNewTheme('')
  }

  const removeTheme = (id: string) =>
    onUpdateThemes(item.id, item.themes.filter((t) => t.id !== id))

  const toggleTheme = (id: string) =>
    onUpdateThemes(
      item.id,
      item.themes.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    )

  const moveTheme = (id: string, dir: -1 | 1) => {
    const sorted = [...item.themes].sort((a, b) => a.ordre - b.ordre)
    const i = sorted.findIndex((t) => t.id === id)
    const j = i + dir
    if (j < 0 || j >= sorted.length) return
    const a = sorted[i]
    const b = sorted[j]
    onUpdateThemes(
      item.id,
      item.themes.map((t) => {
        if (t.id === a.id) return { ...t, ordre: b.ordre }
        if (t.id === b.id) return { ...t, ordre: a.ordre }
        return t
      }),
    )
  }

  return (
    <>
      <SheetHeader className="border-b border-border">
        <div className="flex items-center gap-3">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: `${color}1a` }}
          >
            <BookOpen className="size-5" style={{ color }} />
          </span>
          <div className="min-w-0">
            <SheetTitle className="text-lg">{item.name}</SheetTitle>
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
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <Stat icon={Library} value={item.classes} label="Classes" />
          <Stat icon={Users} value={item.teachers} label="Profs" />
          <Stat icon={BookOpen} value={item.contentCount} label="Contenus" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub-name">Nom</Label>
          <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="sub-code">Code</Label>
            <Input
              id="sub-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Couleur</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Matière disponible</span>
          </div>
          <Switch
            checked={item.active}
            onCheckedChange={() => onToggleActive(item.id)}
            aria-label="Disponibilité de la matière"
          />
        </div>

        <div>
          <SectionHeader title="Thèmes / chapitres" />

          <div className="mb-3 flex items-center gap-2">
            <Input
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTheme()
                }
              }}
              placeholder="Nouveau thème…"
            />
            <Button onClick={addTheme} disabled={!newTheme.trim()} className="shrink-0">
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>

          {themes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Aucun thème. Ajoute le premier chapitre ci-dessus.
            </p>
          ) : (
            <div className="space-y-2">
              {themes.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-xl border border-border p-2 pl-3"
                >
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Monter"
                      disabled={i === 0}
                      onClick={() => moveTheme(t.id, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Descendre"
                      disabled={i === themes.length - 1}
                      onClick={() => moveTheme(t.id, 1)}
                    >
                      <ArrowDown />
                    </Button>
                  </div>
                  <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                  <Switch
                    checked={t.active}
                    onCheckedChange={() => toggleTheme(t.id)}
                    aria-label={`Activer ${t.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Supprimer le thème"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeTheme(t.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
              name: name.trim(),
              code: code.trim(),
              color,
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
