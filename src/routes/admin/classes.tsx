import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  GraduationCap,
  CheckCircle2,
  Plus,
  Trash2,
  BookOpen,
  Pencil,
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
import { SoftIcon } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { useClasses } from '@/hooks/use-catalog'
import type { CatalogClass } from '@/services/catalog'
import {
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from '@/hooks/use-content'

export const Route = createFileRoute('/admin/classes')({
  component: AdminClasses,
})

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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminClasses() {
  const { data, isLoading } = useClasses()
  const createMut = useCreateClass()
  const updateMut = useUpdateClass()
  const deleteMut = useDeleteClass()

  const [editing, setEditing] = useState<CatalogClass | null>(null)
  const [creating, setCreating] = useState(false)

  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.ordre - b.ordre),
    [data],
  )

  const kpi = useMemo(
    () => ({
      total: rows.length,
      maxOrdre: rows.reduce((m, c) => Math.max(m, c.ordre), 0),
    }),
    [rows],
  )

  const remove = (c: CatalogClass) => {
    if (!window.confirm(`Supprimer la classe « ${c.label} » ?`)) return
    deleteMut.mutate(c.id, {
      onSuccess: () => toast.success('Classe supprimée'),
      onError: () => toast.error('Suppression impossible'),
    })
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
            Classes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Crée, réordonne et active les classes du cursus. Une classe désactivée n'est pas
            supprimée : elle devient simplement inaccessible. La suppression définitive n'est
            possible que sur une classe vide.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-4" />
          Nouvelle classe
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatTile icon={GraduationCap} tone="brand" label="Classes" value={kpi.total} />
        <StatTile icon={CheckCircle2} tone="success" label="Ordre max" value={kpi.maxOrdre} />
      </div>

      <TableCard>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className={THEAD}>
              <th className={cn(TH, 'w-24')}>Ordre</th>
              <th className={TH}>Classe</th>
              <th className={cn(TH, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                  Chargement des classes…
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3 font-semibold tabular-nums">{c.ordre}</td>
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
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Éditer la classe"
                        onClick={() => setEditing(c)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Supprimer la classe"
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMut.isPending}
                        onClick={() => remove(c)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                  Aucune classe. Crée-en une avec « Nouvelle classe ».
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>

      <ClassSheet
        mode="create"
        open={creating}
        nextOrdre={kpi.maxOrdre + 1}
        pending={createMut.isPending}
        onClose={() => setCreating(false)}
        onSubmit={(payload) =>
          createMut.mutate(payload, {
            onSuccess: () => {
              toast.success('Classe créée')
              setCreating(false)
            },
            onError: () => toast.error('Création impossible'),
          })
        }
      />

      <ClassSheet
        mode="edit"
        open={!!editing}
        item={editing}
        pending={updateMut.isPending}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => {
          if (!editing) return
          updateMut.mutate(
            {
              id: editing.id,
              patch: { label: payload.label, ordre: payload.ordre, active: payload.active },
            },
            {
              onSuccess: () => {
                toast.success('Classe mise à jour')
                setEditing(null)
              },
              onError: () => toast.error('Mise à jour impossible'),
            },
          )
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet création / édition                                            */
/* ------------------------------------------------------------------ */

type ClassPayload = { code: string; label: string; ordre: number; active: boolean }

function ClassSheet(props: {
  mode: 'create' | 'edit'
  open: boolean
  item?: CatalogClass | null
  nextOrdre?: number
  pending: boolean
  onClose: () => void
  onSubmit: (payload: ClassPayload) => void
}) {
  const { open, onClose } = props
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {open && <ClassForm key={props.item?.id ?? 'create'} {...props} />}
      </SheetContent>
    </Sheet>
  )
}

function ClassForm({
  mode,
  item,
  nextOrdre,
  pending,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  item?: CatalogClass | null
  nextOrdre?: number
  pending: boolean
  onClose: () => void
  onSubmit: (payload: ClassPayload) => void
}) {
  const [code, setCode] = useState(item?.code ?? '')
  const [label, setLabel] = useState(item?.label ?? '')
  const [ordre, setOrdre] = useState(item?.ordre ?? nextOrdre ?? 1)
  const [active, setActive] = useState(true)

  const valid = code.trim().length > 0 && label.trim().length > 0
  const isEdit = mode === 'edit'

  return (
    <>
      <SheetHeader className="border-b border-border">
        <SheetTitle className="text-lg">
          {isEdit ? 'Modifier la classe' : 'Nouvelle classe'}
        </SheetTitle>
        <SheetDescription>
          Définis le code, le libellé et la position dans le cursus.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label htmlFor="class-code">Code</Label>
          <Input
            id="class-code"
            value={code}
            disabled={isEdit}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex. S4"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-label">Libellé affiché</Label>
          <Input
            id="class-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. 4e secondaire (S4)"
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
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={pending}>
          Annuler
        </Button>
        <Button
          className="flex-1"
          disabled={!valid || pending}
          onClick={() => onSubmit({ code: code.trim(), label: label.trim(), ordre, active })}
        >
          {isEdit ? 'Enregistrer' : 'Créer la classe'}
        </Button>
      </SheetFooter>
    </>
  )
}
