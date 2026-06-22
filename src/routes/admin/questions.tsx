import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  CircleHelp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader,
} from '@/components/icons'
import { toast } from 'sonner'
import { useSubjects } from '@/hooks/use-catalog'
import type { CatalogSubject } from '@/services/catalog'
import {
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from '@/hooks/use-questions'
import type {
  Question,
  QuestionDifficulty,
  QuestionOptionInput,
} from '@/services/questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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

export const Route = createFileRoute('/admin/questions')({
  component: AdminQuestions,
})

// ── Métadonnées de difficulté (libellés FR + styles) ─────────────────────────
const difficultyMeta: Record<QuestionDifficulty, { label: string; className: string }> = {
  facile: { label: 'Facile', className: 'bg-success-soft text-success' },
  moyen: { label: 'Moyen', className: 'bg-amber-soft text-amber-foreground' },
  difficile: { label: 'Difficile', className: 'bg-destructive/10 text-destructive' },
}

const difficultyOrder: QuestionDifficulty[] = ['facile', 'moyen', 'difficile']

function DifficultyBadge({ difficulty }: { difficulty: QuestionDifficulty }) {
  const meta = difficultyMeta[difficulty]
  return <Badge className={meta.className}>{meta.label}</Badge>
}

// Étiquettes par défaut des options (A, B, C, D…).
const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/** Valeurs du formulaire de question (création + édition). */
type QuestionFormState = {
  prompt: string
  subjectId: string
  themeId: string
  difficulty: QuestionDifficulty
  explanation: string
  options: string[]
  correctIndex: number
}

function emptyForm(): QuestionFormState {
  return {
    prompt: '',
    subjectId: '',
    themeId: '',
    difficulty: 'moyen',
    explanation: '',
    options: ['', '', '', ''],
    correctIndex: 0,
  }
}

function formFromQuestion(q: Question): QuestionFormState {
  const sorted = [...q.options].sort((a, b) => a.position - b.position)
  const correctIndex = Math.max(
    sorted.findIndex((o) => o.isCorrect),
    0,
  )
  // Toujours afficher au moins 4 champs d'option pour conserver la grille A–D.
  const labels = sorted.map((o) => o.label)
  while (labels.length < 4) labels.push('')
  return {
    prompt: q.prompt,
    subjectId: q.subjectId,
    themeId: q.themeId ?? '',
    difficulty: q.difficulty,
    explanation: q.explanation ?? '',
    options: labels,
    correctIndex,
  }
}

/**
 * Dialog de création/édition d'une question.
 * - `question` absent → création ; présent → édition (PATCH remplace les options).
 */
function QuestionDialog({
  open,
  onOpenChange,
  subjects,
  question,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjects: CatalogSubject[]
  question: Question | null
}) {
  const isEdit = Boolean(question)
  const [form, setForm] = useState<QuestionFormState>(emptyForm)
  // Identifiant de la question en cours d'édition, pour réinitialiser le form.
  const [hydratedFor, setHydratedFor] = useState<string | null>(null)

  // (Ré)hydrate le formulaire à l'ouverture / au changement de cible.
  const targetKey = question?.id ?? 'create'
  if (open && hydratedFor !== targetKey) {
    setForm(question ? formFromQuestion(question) : emptyForm())
    setHydratedFor(targetKey)
  }
  if (!open && hydratedFor !== null) setHydratedFor(null)

  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()
  const pending = createMutation.isPending || updateMutation.isPending

  const themes = useMemo(
    () => subjects.find((s) => s.id === form.subjectId)?.themes ?? [],
    [subjects, form.subjectId],
  )

  function setField<K extends keyof QuestionFormState>(key: K, value: QuestionFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setOption(index: number, value: string) {
    setForm((prev) => {
      const options = [...prev.options]
      options[index] = value
      return { ...prev, options }
    })
  }

  async function submit() {
    const prompt = form.prompt.trim()
    if (!prompt) {
      toast.error('Renseigne un énoncé.')
      return
    }
    if (!form.subjectId) {
      toast.error('Choisis une matière.')
      return
    }
    // On ne conserve que les options renseignées (le backend exige 2 à 8 options).
    const filled = form.options
      .map((label, index) => ({ label: label.trim(), index }))
      .filter((o) => o.label !== '')
    if (filled.length < 2) {
      toast.error('Ajoute au moins 2 options.')
      return
    }
    const correctIsFilled = filled.some((o) => o.index === form.correctIndex)
    if (!correctIsFilled) {
      toast.error('La bonne réponse doit être une option renseignée.')
      return
    }

    const options: QuestionOptionInput[] = filled.map((o, position) => ({
      label: o.label,
      isCorrect: o.index === form.correctIndex,
      position,
    }))

    const themeId = form.themeId || null
    const explanation = form.explanation.trim() || null

    try {
      if (question) {
        await updateMutation.mutateAsync({
          id: question.id,
          input: {
            prompt,
            subjectId: form.subjectId,
            themeId,
            difficulty: form.difficulty,
            explanation,
            options,
          },
        })
        toast.success('Question mise à jour.')
      } else {
        await createMutation.mutateAsync({
          prompt,
          subjectId: form.subjectId,
          themeId,
          difficulty: form.difficulty,
          explanation,
          options,
        })
        toast.success('Question créée.')
      }
      onOpenChange(false)
    } catch {
      toast.error("Échec de l'enregistrement.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier la question' : 'Créer une question'}</DialogTitle>
          <DialogDescription>
            Associez la question à une matière, un thème et une difficulté, puis indiquez la bonne réponse.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select
                value={form.subjectId}
                onValueChange={(v) => setForm((prev) => ({ ...prev, subjectId: v, themeId: '' }))}
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
            <div className="space-y-2">
              <Label>Thème</Label>
              <Select
                value={form.themeId}
                onValueChange={(v) => setField('themeId', v)}
                disabled={themes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-prompt">Énoncé</Label>
            <Textarea
              id="q-prompt"
              rows={3}
              placeholder="Ex. : Résous 2x + 5 = 17"
              value={form.prompt}
              onChange={(e) => setField('prompt', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Difficulté</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => setField('difficulty', v as QuestionDifficulty)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {difficultyOrder.map((d) => (
                  <SelectItem key={d} value={d}>
                    {difficultyMeta[d].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Options (cochez la bonne réponse)</Label>
            <div className="space-y-2">
              {form.options.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="q-correct"
                    aria-label={`Bonne réponse : option ${optionLetters[index]}`}
                    checked={form.correctIndex === index}
                    onChange={() => setField('correctIndex', index)}
                    className="size-4 accent-foreground"
                  />
                  <span className="w-5 text-sm font-medium text-muted-foreground">
                    {optionLetters[index]}
                  </span>
                  <Input
                    placeholder={`Option ${optionLetters[index]}`}
                    value={value}
                    onChange={(e) => setOption(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-explanation">Explication (facultatif)</Label>
            <Textarea
              id="q-explanation"
              rows={2}
              placeholder="Justification de la bonne réponse…"
              value={form.explanation}
              onChange={(e) => setField('explanation', e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader className="size-4 animate-spin" />}
            {isEdit ? 'Enregistrer' : 'Créer la question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminQuestions() {
  const [subjectId, setSubjectId] = useState<'all' | string>('all')
  const [themeId, setThemeId] = useState<'all' | string>('all')
  const [search, setSearch] = useState('')

  // État du dialog création/édition.
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)

  const subjectsQuery = useSubjects()
  const subjects = subjectsQuery.data ?? []

  const questionsQuery = useQuestions({
    subjectId: subjectId === 'all' ? undefined : subjectId,
    themeId: themeId === 'all' ? undefined : themeId,
  })
  const questions = questionsQuery.data ?? []

  const deleteMutation = useDeleteQuestion()

  // Résolution rapide des libellés matière/thème depuis le catalogue.
  const subjectById = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  )
  const themeById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of subjects) for (const t of s.themes) map.set(t.id, t.name)
    return map
  }, [subjects])

  // Thèmes disponibles selon la matière sélectionnée (cascade du filtre).
  const themeOptions = useMemo(
    () => (subjectId === 'all' ? [] : subjectById.get(subjectId)?.themes ?? []),
    [subjectId, subjectById],
  )

  // Recherche locale sur l'énoncé (le filtrage matière/thème est côté BFF).
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (term === '') return questions
    return questions.filter((q) => q.prompt.toLowerCase().includes(term))
  }, [questions, search])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(question: Question) {
    setEditing(question)
    setDialogOpen(true)
  }

  async function remove(question: Question) {
    try {
      await deleteMutation.mutateAsync(question.id)
      toast.success('Question supprimée.')
    } catch {
      toast.error('Échec de la suppression.')
    }
  }

  const loading = questionsQuery.isLoading

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <Filter className="size-4" />
            Matière :
          </span>
          <Select
            value={subjectId}
            onValueChange={(v) => {
              setSubjectId(v)
              setThemeId('all')
            }}
          >
            <SelectTrigger className="h-9 w-48">
              <SelectValue placeholder="Toutes les matières" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {subjectId !== 'all' && themeOptions.length > 0 && (
            <Select value={themeId} onValueChange={setThemeId}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Tous les thèmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les thèmes</SelectItem>
                {themeOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un énoncé…"
              className="pl-9"
            />
          </div>
          <div className="shrink-0">
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Créer une question
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Énoncé</th>
                <th className="px-5 py-3 font-semibold">Matière</th>
                <th className="px-5 py-3 font-semibold">Thème</th>
                <th className="px-5 py-3 font-semibold">Difficulté</th>
                <th className="px-5 py-3 font-semibold text-right">Options</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3" colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                filtered.map((q) => (
                  <tr key={q.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{q.prompt}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">
                        {subjectById.get(q.subjectId)?.name ?? '—'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {q.themeId ? themeById.get(q.themeId) ?? '—' : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <DifficultyBadge difficulty={q.difficulty} />
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {q.optionsCount}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(q)}>
                            <Pencil className="size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => remove(q)}
                          >
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <CircleHelp className="mx-auto mb-2 size-6 text-muted-foreground" />
                    {questions.length === 0
                      ? 'Aucune question dans la banque pour ce filtre.'
                      : 'Aucune question ne correspond à votre recherche.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <QuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subjects={subjects}
        question={editing}
      />
    </div>
  )
}
