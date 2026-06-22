import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  BookOpen,
  Library,
  Plus,
  Pencil,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SectionHeader } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { useSubjects } from '@/hooks/use-catalog'
import type { CatalogSubject, CatalogTheme } from '@/services/catalog'
import {
  useCreateSubject,
  useUpdateSubject,
  useAddTheme,
  useUpdateTheme,
} from '@/hooks/use-content'

export const Route = createFileRoute('/admin/matieres')({
  component: AdminMatieres,
})

const COLOR_CHOICES = ['#4f46e5', '#db2777', '#0d9488', '#d97706', '#7c3aed', '#dc2626']
const DEFAULT_COLOR = COLOR_CHOICES[0]

/* ------------------------------------------------------------------ */
/* Helpers d'affichage                                                 */
/* ------------------------------------------------------------------ */

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
      <div className="overflow-x-auto">{children}</div>
    </Card>
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
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminMatieres() {
  const { data, isLoading } = useSubjects()
  const createMut = useCreateSubject()
  const updateMut = useUpdateSubject()

  const [editing, setEditing] = useState<CatalogSubject | null>(null)
  const [creating, setCreating] = useState(false)

  const rows = data ?? []
  const selected = editing ? (rows.find((s) => s.id === editing.id) ?? null) : null

  const kpi = useMemo(
    () => ({
      total: rows.length,
      themes: rows.reduce((a, s) => a + s.themes.length, 0),
    }),
    [rows],
  )

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
            Matières
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Crée et organise les matières et leurs thèmes (chapitres). Chaque matière porte un
            code, un nom et une couleur d'affichage utilisée dans toute l'application.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-4" />
          Nouvelle matière
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatTile icon={BookOpen} tone="brand" label="Matières" value={kpi.total} />
        <StatTile icon={Library} tone="teal" label="Thèmes" value={kpi.themes} />
      </div>

      <TableCard>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className={THEAD}>
              <th className={TH}>Matière</th>
              <th className={cn(TH, 'text-right')}>Thèmes</th>
              <th className={cn(TH, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                  Chargement des matières…
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color ?? DEFAULT_COLOR }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium">{s.name}</div>
                        <Badge variant="outline" className="mt-0.5 font-mono text-xs">
                          {s.code}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {s.themes.length}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Éditer la matière"
                        onClick={() => setEditing(s)}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                  Aucune matière. Crée-en une avec « Nouvelle matière ».
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>

      <CreateSubjectSheet
        open={creating}
        pending={createMut.isPending}
        onClose={() => setCreating(false)}
        onSubmit={(payload) =>
          createMut.mutate(payload, {
            onSuccess: () => {
              toast.success('Matière créée')
              setCreating(false)
            },
            onError: () => toast.error('Création impossible'),
          })
        }
      />

      <SubjectSheet
        item={selected}
        updating={updateMut.isPending}
        onClose={() => setEditing(null)}
        onSave={(id, patch) =>
          updateMut.mutate(
            { id, patch },
            {
              onSuccess: () => toast.success('Matière mise à jour'),
              onError: () => toast.error('Mise à jour impossible'),
            },
          )
        }
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet création matière                                              */
/* ------------------------------------------------------------------ */

type SubjectPayload = { code: string; name: string; color: string }

function CreateSubjectSheet({
  open,
  pending,
  onClose,
  onSubmit,
}: {
  open: boolean
  pending: boolean
  onClose: () => void
  onSubmit: (payload: SubjectPayload) => void
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {open && (
          <CreateSubjectForm key="create" pending={pending} onClose={onClose} onSubmit={onSubmit} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function CreateSubjectForm({
  pending,
  onClose,
  onSubmit,
}: {
  pending: boolean
  onClose: () => void
  onSubmit: (payload: SubjectPayload) => void
}) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)

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
      </div>

      <SheetFooter className="flex-row gap-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={pending}>
          Annuler
        </Button>
        <Button
          className="flex-1"
          disabled={!valid || pending}
          onClick={() => onSubmit({ code: code.trim(), name: name.trim(), color })}
        >
          Créer la matière
        </Button>
      </SheetFooter>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet édition matière + thèmes                                      */
/* ------------------------------------------------------------------ */

function SubjectSheet({
  item,
  updating,
  onClose,
  onSave,
}: {
  item: CatalogSubject | null
  updating: boolean
  onClose: () => void
  onSave: (id: string, patch: { name?: string; color?: string }) => void
}) {
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {item && (
          <SubjectEditor key={item.id} item={item} updating={updating} onClose={onClose} onSave={onSave} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function SubjectEditor({
  item,
  updating,
  onClose,
  onSave,
}: {
  item: CatalogSubject
  updating: boolean
  onClose: () => void
  onSave: (id: string, patch: { name?: string; color?: string }) => void
}) {
  const [name, setName] = useState(item.name)
  const [color, setColor] = useState(item.color ?? DEFAULT_COLOR)

  const addThemeMut = useAddTheme()
  const updateThemeMut = useUpdateTheme()

  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')

  const dirty = name.trim() !== item.name || color !== (item.color ?? DEFAULT_COLOR)
  const valid = name.trim().length > 0

  const addTheme = () => {
    const themeName = newName.trim()
    const code = (newCode.trim() || themeName.slice(0, 4)).toUpperCase()
    if (!themeName || !code) return
    addThemeMut.mutate(
      { subjectId: item.id, input: { code, name: themeName } },
      {
        onSuccess: () => {
          toast.success('Thème ajouté')
          setNewName('')
          setNewCode('')
        },
        onError: () => toast.error('Ajout du thème impossible'),
      },
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
            <SheetDescription>
              <Badge variant="outline" className="font-mono text-xs">
                {item.code}
              </Badge>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label htmlFor="sub-name">Nom</Label>
          <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Couleur</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <Button
          className="w-full"
          disabled={!dirty || !valid || updating}
          onClick={() => onSave(item.id, { name: name.trim(), color })}
        >
          Enregistrer la matière
        </Button>

        <div>
          <SectionHeader title="Thèmes / chapitres" />

          <div className="mb-3 flex items-center gap-2">
            <Input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="Code"
              className="w-24 font-mono"
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTheme()
                }
              }}
              placeholder="Nouveau thème…"
            />
            <Button
              onClick={addTheme}
              disabled={!newName.trim() || addThemeMut.isPending}
              className="shrink-0"
            >
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>

          {item.themes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Aucun thème. Ajoute le premier chapitre ci-dessus.
            </p>
          ) : (
            <div className="space-y-2">
              {item.themes.map((t) => (
                <ThemeRow
                  key={t.id}
                  theme={t}
                  pending={updateThemeMut.isPending}
                  onRename={(newLabel) =>
                    updateThemeMut.mutate(
                      { id: t.id, patch: { name: newLabel } },
                      {
                        onSuccess: () => toast.success('Thème mis à jour'),
                        onError: () => toast.error('Mise à jour impossible'),
                      },
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Fermer
        </Button>
      </SheetFooter>
    </>
  )
}

function ThemeRow({
  theme,
  pending,
  onRename,
}: {
  theme: CatalogTheme
  pending: boolean
  onRename: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(theme.name)

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border p-2 pl-3">
        <Input
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (name.trim()) onRename(name.trim())
              setEditing(false)
            }
            if (e.key === 'Escape') {
              setName(theme.name)
              setEditing(false)
            }
          }}
        />
        <Button
          size="sm"
          disabled={!name.trim() || pending}
          onClick={() => {
            if (name.trim()) onRename(name.trim())
            setEditing(false)
          }}
        >
          OK
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border p-2 pl-3">
      <Badge variant="outline" className="font-mono text-xs">
        {theme.code}
      </Badge>
      <span className="min-w-0 flex-1 truncate font-medium">{theme.name}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Renommer le thème"
        onClick={() => {
          setName(theme.name)
          setEditing(true)
        }}
      >
        <Pencil />
      </Button>
    </div>
  )
}
