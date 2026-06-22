import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Video,
  FileText,
  CheckSquare,
  BookOpen,
  Crown,
  Loader,
} from '@/components/icons'
import type { LucideIcon } from '@/components/icons'
import { toast } from 'sonner'
import { useSubjects, useClasses } from '@/hooks/use-catalog'
import type { CatalogSubject } from '@/services/catalog'
import {
  useAdminResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from '@/hooks/use-admin-resources'
import type {
  AdminResource,
  CreateResourceInput,
  ResourceType,
} from '@/services/admin-resources'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/admin/ressources')({
  component: AdminRessources,
})

const TYPE_META: Record<ResourceType, { label: string; icon: LucideIcon }> = {
  video: { label: 'Vidéo', icon: Video },
  pdf: { label: 'PDF', icon: FileText },
  exercice: { label: 'Exercice', icon: CheckSquare },
  fiche: { label: 'Fiche', icon: BookOpen },
}

const TYPE_OPTIONS = Object.entries(TYPE_META).map(([value, meta]) => ({
  value: value as ResourceType,
  label: meta.label,
}))

const ALL = 'all'

type FormState = {
  title: string
  type: ResourceType
  subjectId: string
  themeId: string
  classId: string
  description: string
  chapter: string
  premium: boolean
  duration: string
  pages: string
  questionCount: string
  videoUrl: string
}

const EMPTY_FORM: FormState = {
  title: '',
  type: 'video',
  subjectId: '',
  themeId: '',
  classId: '',
  description: '',
  chapter: '',
  premium: false,
  duration: '',
  pages: '',
  questionCount: '',
  videoUrl: '',
}

function fromResource(r: AdminResource): FormState {
  return {
    title: r.title,
    type: r.type,
    subjectId: r.subjectId,
    themeId: r.themeId ?? '',
    classId: r.classId ?? '',
    description: r.description ?? '',
    chapter: r.chapter ?? '',
    premium: r.premium,
    duration: r.duration ?? '',
    pages: r.pages != null ? String(r.pages) : '',
    questionCount: r.questionCount != null ? String(r.questionCount) : '',
    videoUrl: r.videoUrl ?? '',
  }
}

function toInput(f: FormState): CreateResourceInput {
  const num = (v: string): number | null => {
    const n = Number(v)
    return v.trim() !== '' && Number.isFinite(n) ? n : null
  }
  return {
    title: f.title.trim(),
    type: f.type,
    subjectId: f.subjectId,
    themeId: f.themeId || null,
    classId: f.classId || null,
    description: f.description.trim() || null,
    chapter: f.chapter.trim() || null,
    premium: f.premium,
    duration: f.type === 'video' && f.duration.trim() ? f.duration.trim() : null,
    pages: f.type === 'pdf' || f.type === 'fiche' ? num(f.pages) : null,
    questionCount: f.type === 'exercice' ? num(f.questionCount) : null,
    videoUrl: f.type === 'video' && f.videoUrl.trim() ? f.videoUrl.trim() : null,
  }
}

function TypeBadge({ type }: { type: ResourceType }) {
  const meta = TYPE_META[type]
  const Icon = meta.icon
  return (
    <Badge variant="outline" className="gap-1.5">
      <Icon className="size-3" />
      {meta.label}
    </Badge>
  )
}

function ResourceDialog({
  open,
  onOpenChange,
  initial,
  subjects,
  classes,
  onSubmit,
  pending,
  mode,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: FormState
  subjects: CatalogSubject[]
  classes: { id: string; label: string }[]
  onSubmit: (input: CreateResourceInput) => void
  pending: boolean
  mode: 'create' | 'edit'
}) {
  const [form, setForm] = useState<FormState>(initial)

  // Réinitialise le formulaire à chaque (ré)ouverture.
  const [openedFor, setOpenedFor] = useState<string | null>(null)
  const initialKey = `${mode}:${initial.title}:${initial.subjectId}`
  if (open && openedFor !== initialKey) {
    setForm(initial)
    setOpenedFor(initialKey)
  }
  if (!open && openedFor !== null) setOpenedFor(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const themes = subjects.find((s) => s.id === form.subjectId)?.themes ?? []
  const canSubmit = form.title.trim() !== '' && form.subjectId !== '' && !pending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Ajouter une ressource' : 'Modifier la ressource'}
          </DialogTitle>
          <DialogDescription>
            Vidéo, PDF, fiche ou exercice pour la bibliothèque.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="res-title">Titre</Label>
            <Input
              id="res-title"
              placeholder="Ex. : Théorème de Thalès"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v as ResourceType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select
                value={form.subjectId}
                onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v, themeId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thème</Label>
              <Select
                value={form.themeId || undefined}
                onValueChange={(v) => set('themeId', v)}
                disabled={themes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={themes.length ? 'Choisir' : 'Aucun thème'} />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={form.classId || undefined} onValueChange={(v) => set('classId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-chapter">Chapitre</Label>
            <Input
              id="res-chapter"
              placeholder="Optionnel"
              value={form.chapter}
              onChange={(e) => set('chapter', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="res-desc">Description</Label>
            <Textarea
              id="res-desc"
              placeholder="Optionnel"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {form.type === 'video' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="res-video">URL vidéo</Label>
                <Input
                  id="res-video"
                  placeholder="https://…"
                  value={form.videoUrl}
                  onChange={(e) => set('videoUrl', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-duration">Durée</Label>
                <Input
                  id="res-duration"
                  placeholder="Ex. : 12:30"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                />
              </div>
            </div>
          )}

          {(form.type === 'pdf' || form.type === 'fiche') && (
            <div className="space-y-2">
              <Label htmlFor="res-pages">Nombre de pages</Label>
              <Input
                id="res-pages"
                type="number"
                min={0}
                value={form.pages}
                onChange={(e) => set('pages', e.target.value)}
              />
            </div>
          )}

          {form.type === 'exercice' && (
            <div className="space-y-2">
              <Label htmlFor="res-qcount">Nombre de questions</Label>
              <Input
                id="res-qcount"
                type="number"
                min={0}
                value={form.questionCount}
                onChange={(e) => set('questionCount', e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="res-premium">Premium</Label>
              <p className="text-xs text-muted-foreground">Réservé aux abonnés.</p>
            </div>
            <Switch
              id="res-premium"
              checked={form.premium}
              onCheckedChange={(v) => set('premium', v)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button disabled={!canSubmit} onClick={() => onSubmit(toInput(form))}>
            {pending && <Loader className="size-4 animate-spin" />}
            {mode === 'create' ? 'Créer la ressource' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminRessources() {
  const [typeFilter, setTypeFilter] = useState<ResourceType | typeof ALL>(ALL)
  const [subjectFilter, setSubjectFilter] = useState<string>(ALL)

  const subjectsQuery = useSubjects()
  const classesQuery = useClasses()
  const subjects = useMemo(() => subjectsQuery.data ?? [], [subjectsQuery.data])
  const classes = useMemo(() => classesQuery.data ?? [], [classesQuery.data])

  const resourcesQuery = useAdminResources({
    type: typeFilter === ALL ? undefined : typeFilter,
    subjectId: subjectFilter === ALL ? undefined : subjectFilter,
  })
  const items = resourcesQuery.data ?? []

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—'
  const className = (id: string | null) =>
    id ? (classes.find((c) => c.id === id)?.label ?? '—') : '—'

  const createMut = useCreateResource()
  const updateMut = useUpdateResource()
  const deleteMut = useDeleteResource()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminResource | null>(null)

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Badge className="bg-secondary text-foreground">{items.length} ressources</Badge>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Ajouter une ressource
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les matières</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as ResourceType | typeof ALL)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les types</SelectItem>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Matière</th>
                <th className="px-5 py-3 font-semibold">Classe</th>
                <th className="px-5 py-3 font-semibold">Premium</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resourcesQuery.isPending ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    <Loader className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : resourcesQuery.isError ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    Impossible de charger les ressources.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    Aucune ressource.
                  </td>
                </tr>
              ) : (
                items.map((res) => (
                  <tr key={res.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{res.title}</td>
                    <td className="px-5 py-3">
                      <TypeBadge type={res.type} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{subjectName(res.subjectId)}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{className(res.classId)}</td>
                    <td className="px-5 py-3">
                      {res.premium ? (
                        <Badge className="gap-1.5 bg-amber-soft text-amber-foreground">
                          <Crown className="size-3" />
                          Premium
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditTarget(res)}>
                            <Pencil className="size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              deleteMut.mutate(res.id, {
                                onSuccess: () => toast.success('Ressource supprimée'),
                                onError: () => toast.error('Échec de la suppression'),
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ResourceDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={EMPTY_FORM}
        subjects={subjects}
        classes={classes}
        pending={createMut.isPending}
        onSubmit={(input) =>
          createMut.mutate(input, {
            onSuccess: () => {
              toast.success('Ressource créée')
              setCreateOpen(false)
            },
            onError: () => toast.error('Échec de la création'),
          })
        }
      />

      {editTarget && (
        <ResourceDialog
          mode="edit"
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          initial={fromResource(editTarget)}
          subjects={subjects}
          classes={classes}
          pending={updateMut.isPending}
          onSubmit={(input) =>
            updateMut.mutate(
              { id: editTarget.id, input },
              {
                onSuccess: () => {
                  toast.success('Ressource mise à jour')
                  setEditTarget(null)
                },
                onError: () => toast.error('Échec de la mise à jour'),
              },
            )
          }
        />
      )}
    </div>
  )
}
