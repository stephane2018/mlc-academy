import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  CheckSquare,
  Lock,
  Quiz,
  Check,
  Loader,
} from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { StatTile } from '@/components/blocks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { cn } from '@/lib/utils'
import { useSubjects, useClasses } from '@/hooks/use-catalog'
import {
  useAdminExams,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
  useAttachExamQuestions,
} from '@/hooks/use-admin-exams'
import type {
  AdminExamListItem,
  ExamDifficulty,
  ComposedExamQuestion,
} from '@/services/admin-exams'

export const Route = createFileRoute('/admin/examens')({
  component: AdminExamens,
})

const difficulties: { value: ExamDifficulty; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
]

/** Valeur de Select pour « aucune sélection » (les Select ne tolèrent pas la valeur vide). */
const NONE = '__none__'

/** Brouillon de formulaire d'examen, partagé entre création et édition. */
type ExamForm = {
  title: string
  subjectId: string
  themeId: string
  classId: string
  durationMin: string
  premium: boolean
  difficulty: ExamDifficulty
}

function emptyForm(): ExamForm {
  return {
    title: '',
    subjectId: '',
    themeId: '',
    classId: '',
    durationMin: '30',
    premium: false,
    difficulty: 'moyen',
  }
}

/** Champs d'un formulaire d'examen, réutilisés par les dialogs créer/éditer. */
function ExamFields({ form, setForm }: { form: ExamForm; setForm: (f: ExamForm) => void }) {
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const subject = subjects.find((s) => s.id === form.subjectId)
  const themes = subject?.themes ?? []

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="exam-title">Titre</Label>
        <Input
          id="exam-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ex. : Examen blanc CE1D — Complet n°3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Matière</Label>
          <Select
            value={form.subjectId}
            onValueChange={(v) => setForm({ ...form, subjectId: v, themeId: '' })}
          >
            <SelectTrigger className="w-full">
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
            value={form.themeId || NONE}
            onValueChange={(v) => setForm({ ...form, themeId: v === NONE ? '' : v })}
            disabled={!form.subjectId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Optionnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Aucun</SelectItem>
              {themes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Classe</Label>
          <Select
            value={form.classId || NONE}
            onValueChange={(v) => setForm({ ...form, classId: v === NONE ? '' : v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Optionnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Aucune</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-duration">Durée (min)</Label>
          <Input
            id="exam-duration"
            type="number"
            min={5}
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
            placeholder="30"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Difficulté</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v) => setForm({ ...form, difficulty: v as ExamDifficulty })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-premium">Premium</Label>
          <div className="flex h-9 items-center gap-2">
            <Switch
              id="exam-premium"
              checked={form.premium}
              onCheckedChange={(v) => setForm({ ...form, premium: v })}
            />
            <span className="text-sm text-muted-foreground">
              {form.premium ? 'Réservé aux abonnés' : 'Accès gratuit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Dialog de création d'un examen. */
function CreateExamDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ExamForm>(emptyForm())
  const createExam = useCreateExam()

  function submit() {
    if (!form.title.trim()) {
      toast.error('Donne un titre à l’examen.')
      return
    }
    if (!form.subjectId) {
      toast.error('Choisis une matière.')
      return
    }
    createExam.mutate(
      {
        title: form.title.trim(),
        subjectId: form.subjectId,
        themeId: form.themeId || null,
        classId: form.classId || null,
        durationMin: Number(form.durationMin) || 30,
        premium: form.premium,
        difficulty: form.difficulty,
      },
      {
        onSuccess: () => {
          toast.success('Examen créé')
          setForm(emptyForm())
          setOpen(false)
        },
        onError: () => toast.error('Échec de la création. Réessaie.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Créer un examen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un examen blanc</DialogTitle>
          <DialogDescription>
            Renseigne les informations, puis compose les questions depuis le menu d’actions.
          </DialogDescription>
        </DialogHeader>
        <ExamFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={createExam.isPending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={createExam.isPending}>
            {createExam.isPending && <Loader className="size-4 animate-spin" />}
            Créer l’examen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Dialog d'édition d'un examen existant. */
function EditExamDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: AdminExamListItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [form, setForm] = useState<ExamForm>(() => ({
    title: exam.title,
    subjectId: exam.subjectId,
    themeId: exam.themeId ?? '',
    classId: exam.classId ?? '',
    durationMin: String(exam.durationMin),
    premium: exam.premium,
    difficulty: exam.difficulty ?? 'moyen',
  }))
  const updateExam = useUpdateExam()

  function submit() {
    if (!form.title.trim()) {
      toast.error('Donne un titre à l’examen.')
      return
    }
    if (!form.subjectId) {
      toast.error('Choisis une matière.')
      return
    }
    updateExam.mutate(
      {
        id: exam.id,
        input: {
          title: form.title.trim(),
          subjectId: form.subjectId,
          themeId: form.themeId || null,
          classId: form.classId || null,
          durationMin: Number(form.durationMin) || 30,
          premium: form.premium,
          difficulty: form.difficulty,
        },
      },
      {
        onSuccess: () => {
          toast.success('Examen mis à jour')
          onOpenChange(false)
        },
        onError: () => toast.error('Échec de la mise à jour. Réessaie.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l’examen</DialogTitle>
          <DialogDescription>Mets à jour les informations de l’épreuve.</DialogDescription>
        </DialogHeader>
        <ExamFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateExam.isPending}
          >
            Annuler
          </Button>
          <Button onClick={submit} disabled={updateExam.isPending}>
            {updateExam.isPending && <Loader className="size-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Brouillon de question QCM composée dans le builder. */
type QDraft = {
  id: string
  prompt: string
  katex: string
  explanation: string
  options: { id: string; label: string }[]
  correctId: string
}

let qCounter = 0
function emptyQuestion(): QDraft {
  qCounter += 1
  return {
    id: `nq${qCounter}`,
    prompt: '',
    katex: '',
    explanation: '',
    options: [
      { id: 'a', label: '' },
      { id: 'b', label: '' },
      { id: 'c', label: '' },
      { id: 'd', label: '' },
    ],
    correctId: 'a',
  }
}

/** Dialog de composition / attache de questions QCM (options A–D + bonne réponse). */
function ComposeQuestionsDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: AdminExamListItem
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [questions, setQuestions] = useState<QDraft[]>([emptyQuestion()])
  const attach = useAttachExamQuestions()

  function patchQuestion(idx: number, patch: Partial<QDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  function patchOption(idx: number, optIdx: number, label: string) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === idx
          ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? { ...o, label } : o)) }
          : q,
      ),
    )
  }
  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()])
  }
  function removeQuestion(idx: number) {
    if (questions.length <= 1) return
    setQuestions((qs) => qs.filter((_, i) => i !== idx))
  }

  /** Valide + transforme les questions du builder pour l'API (filtre options vides). */
  function buildPayload(): ComposedExamQuestion[] | string {
    const payload: ComposedExamQuestion[] = []
    for (const q of questions) {
      if (!q.prompt.trim()) return 'Chaque question doit avoir un énoncé.'
      const kept = q.options.filter((o) => o.label.trim())
      if (kept.length < 2) return 'Chaque question doit avoir au moins 2 options.'
      if (kept.length > 8) return 'Maximum 8 options par question.'
      if (!kept.some((o) => o.id === q.correctId))
        return 'Désigne une bonne réponse parmi les options remplies.'
      payload.push({
        prompt: q.prompt.trim(),
        katex: q.katex.trim() || null,
        themeId: exam.themeId,
        explanation: q.explanation.trim() || null,
        options: kept.map((o) => ({ label: o.label.trim(), isCorrect: o.id === q.correctId })),
      })
    }
    return payload
  }

  function submit() {
    const built = buildPayload()
    if (typeof built === 'string') {
      toast.error(built)
      return
    }
    attach.mutate(
      { id: exam.id, questions: built },
      {
        onSuccess: (res) => {
          toast.success(`${res.attached} question${res.attached > 1 ? 's' : ''} attachée${res.attached > 1 ? 's' : ''}`)
          setQuestions([emptyQuestion()])
          onOpenChange(false)
        },
        onError: () => toast.error('Échec de l’attache. Réessaie.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Composer des questions</DialogTitle>
          <DialogDescription>
            Ajoute des QCM à « {exam.title} » — 2 à 8 options, une seule bonne réponse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-2xl border-2 border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-sm font-bold">Question {idx + 1}</p>
                <button
                  type="button"
                  title="Supprimer"
                  disabled={questions.length <= 1}
                  onClick={() => removeQuestion(idx)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`prompt-${q.id}`}>Énoncé</Label>
                  <Textarea
                    id={`prompt-${q.id}`}
                    value={q.prompt}
                    onChange={(e) => patchQuestion(idx, { prompt: e.target.value })}
                    placeholder="Rédige la question…"
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`katex-${q.id}`}>Formule KaTeX (optionnel)</Label>
                  <Input
                    id={`katex-${q.id}`}
                    value={q.katex}
                    onChange={(e) => patchQuestion(idx, { katex: e.target.value })}
                    placeholder="Ex : \frac{3}{4} + \frac{1}{2}"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options · coche la bonne réponse</Label>
                  {q.options.map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi)
                    const isAnswer = opt.id === q.correctId
                    return (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Désigner comme bonne réponse"
                          onClick={() => patchQuestion(idx, { correctId: opt.id })}
                          className={cn(
                            'grid size-7 shrink-0 place-items-center rounded-full border-2 transition',
                            isAnswer
                              ? 'border-success bg-success text-white'
                              : 'border-border text-transparent hover:border-success/50',
                          )}
                        >
                          <Check className="size-4" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                          {letter}
                        </span>
                        <Input
                          value={opt.label}
                          onChange={(e) => patchOption(idx, oi, e.target.value)}
                          placeholder={`Option ${letter}`}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`expl-${q.id}`}>Explication (optionnel)</Label>
                  <Input
                    id={`expl-${q.id}`}
                    value={q.explanation}
                    onChange={(e) => patchQuestion(idx, { explanation: e.target.value })}
                    placeholder="Justification affichée à la correction."
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addQuestion}>
            <Plus className="size-4" />
            Ajouter une question
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={attach.isPending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={attach.isPending}>
            {attach.isPending && <Loader className="size-4 animate-spin" />}
            Attacher les questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminExamens() {
  const { data: exams, isLoading, isError } = useAdminExams()
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const deleteExam = useDeleteExam()

  // Dialogs ciblant un examen précis.
  const [editing, setEditing] = useState<AdminExamListItem | null>(null)
  const [composing, setComposing] = useState<AdminExamListItem | null>(null)

  const subjectName = useMemo(
    () => (id: string) => subjects.find((s) => s.id === id)?.name ?? '—',
    [subjects],
  )
  const className = useMemo(
    () => (id: string | null) => (id ? (classes.find((c) => c.id === id)?.label ?? '—') : '—'),
    [classes],
  )

  const items = exams ?? []
  const premiumCount = items.filter((e) => e.premium).length

  function confirmDelete(exam: AdminExamListItem) {
    if (!window.confirm(`Supprimer « ${exam.title} » ? Cette action est définitive.`)) return
    deleteExam.mutate(exam.id, {
      onSuccess: () => toast.success('Examen supprimé'),
      onError: () => toast.error('Échec de la suppression. Réessaie.'),
    })
  }

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Examens blancs CE1D</p>
        <CreateExamDialog />
      </div>

      {/* Synthèse — uniquement des données réellement renvoyées par le BFF */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile
          icon={CheckSquare}
          tone="brand"
          label="Examens publiés"
          value={`${items.length}`}
        />
        <StatTile icon={Lock} tone="amber" label="Examens premium" value={`${premiumCount}`} />
      </div>

      {/* Table de gestion */}
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Matière</th>
                <th className="px-5 py-3 font-semibold">Classe</th>
                <th className="px-5 py-3 font-semibold">Durée</th>
                <th className="px-5 py-3 font-semibold">Questions</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Loader className="mx-auto size-5 animate-spin" />
                    <p className="mt-2 text-sm">Chargement des examens…</p>
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-destructive">
                    Impossible de charger les examens. Réessaie plus tard.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">Aucun examen pour le moment.</p>
                    <p className="mt-1 text-xs">Crée un premier examen blanc pour démarrer.</p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                items.map((exam) => (
                  <tr key={exam.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{exam.title}</td>
                    <td className="px-5 py-3 text-muted-foreground">{subjectName(exam.subjectId)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{className(exam.classId)}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" />
                        {exam.durationMin} min
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">
                      {exam.questionCount}
                    </td>
                    <td className="px-5 py-3">
                      {exam.premium ? (
                        <Badge className="gap-1 bg-amber-soft text-amber-foreground">
                          <Lock className="size-3" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="bg-success-soft text-success">Gratuit</Badge>
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
                          <DropdownMenuItem onClick={() => setComposing(exam)}>
                            <Quiz className="size-4" />
                            Composer des questions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditing(exam)}>
                            <Pencil className="size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => confirmDelete(exam)}
                          >
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialogs montés à la demande (key pour réinitialiser l'état par examen) */}
      {editing && (
        <EditExamDialog
          key={`edit-${editing.id}`}
          exam={editing}
          open
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
      {composing && (
        <ComposeQuestionsDialog
          key={`compose-${composing.id}`}
          exam={composing}
          open
          onOpenChange={(v) => !v && setComposing(null)}
        />
      )}
    </div>
  )
}
