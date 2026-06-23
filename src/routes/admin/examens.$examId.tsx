import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Check, Loader } from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ExamFields, emptyExamForm, type ExamForm } from '@/components/admin/exam-fields'
import { useAdminExam, useUpdateExam, useSetExamQuestions } from '@/hooks/use-admin-exams'
import type { ComposedExamQuestion, ExamStatus } from '@/services/admin-exams'

export const Route = createFileRoute('/admin/examens/$examId')({
  component: ComposeExamPage,
})

/** Brouillon de question QCM dans le builder. */
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
  const id = `nq${qCounter}`
  return {
    id,
    prompt: '',
    katex: '',
    explanation: '',
    options: [
      { id: `${id}-a`, label: '' },
      { id: `${id}-b`, label: '' },
      { id: `${id}-c`, label: '' },
      { id: `${id}-d`, label: '' },
    ],
    correctId: `${id}-a`,
  }
}

function ComposeExamPage() {
  const { examId } = Route.useParams()
  const navigate = useNavigate()
  const { data: exam, isLoading, isError } = useAdminExam(examId)
  const updateExam = useUpdateExam()
  const setQuestions = useSetExamQuestions()

  const [form, setForm] = useState<ExamForm>(emptyExamForm())
  const [questions, setQuestionsState] = useState<QDraft[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate le formulaire + le builder depuis le détail (une seule fois).
  useEffect(() => {
    if (!exam || hydrated) return
    setForm({
      title: exam.title,
      subjectId: exam.subjectId,
      themeId: exam.themeId ?? '',
      classId: exam.classId ?? '',
      durationMin: String(exam.durationMin),
      premium: exam.premium,
      difficulty: exam.difficulty ?? 'moyen',
    })
    setQuestionsState(
      exam.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        katex: q.katex ?? '',
        explanation: q.explanation ?? '',
        options: q.options.map((o) => ({ id: o.id, label: o.label })),
        correctId: q.correctOptionId ?? q.options[0]?.id ?? '',
      })),
    )
    setHydrated(true)
  }, [exam, hydrated])

  function patchQuestion(idx: number, patch: Partial<QDraft>) {
    setQuestionsState((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  function patchOption(idx: number, optIdx: number, label: string) {
    setQuestionsState((qs) =>
      qs.map((q, i) =>
        i === idx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? { ...o, label } : o)) } : q,
      ),
    )
  }
  const addQuestion = () => setQuestionsState((qs) => [...qs, emptyQuestion()])
  const removeQuestion = (idx: number) => setQuestionsState((qs) => qs.filter((_, i) => i !== idx))

  /** Valide + transforme les questions remplies pour l'API (ignore les cartes vides). */
  function buildPayload(): ComposedExamQuestion[] | string {
    const payload: ComposedExamQuestion[] = []
    for (const q of questions) {
      const labels = q.options.filter((o) => o.label.trim())
      const isEmpty = !q.prompt.trim() && labels.length === 0
      if (isEmpty) continue // carte non remplie → ignorée (utile en brouillon)
      if (!q.prompt.trim()) return 'Chaque question doit avoir un énoncé.'
      if (labels.length < 2) return 'Chaque question doit avoir au moins 2 options.'
      if (labels.length > 8) return 'Maximum 8 options par question.'
      if (!labels.some((o) => o.id === q.correctId))
        return 'Désigne une bonne réponse parmi les options remplies.'
      payload.push({
        prompt: q.prompt.trim(),
        katex: q.katex.trim() || null,
        themeId: form.themeId || null,
        explanation: q.explanation.trim() || null,
        options: labels.map((o) => ({ label: o.label.trim(), isCorrect: o.id === q.correctId })),
      })
    }
    return payload
  }

  const pending = updateExam.isPending || setQuestions.isPending

  async function save(nextStatus: ExamStatus) {
    if (!form.title.trim()) return toast.error('Donne un titre à l’examen.')
    if (!form.subjectId) return toast.error('Choisis une matière.')
    const built = buildPayload()
    if (typeof built === 'string') return toast.error(built)
    if (nextStatus === 'publie' && built.length === 0)
      return toast.error('Ajoute au moins une question pour publier.')

    try {
      // 1) méta (sans le statut) → 2) questions (recale question_count) → 3) statut.
      await updateExam.mutateAsync({
        id: examId,
        input: {
          title: form.title.trim(),
          subjectId: form.subjectId,
          themeId: form.themeId || null,
          classId: form.classId || null,
          durationMin: Number(form.durationMin) || 30,
          premium: form.premium,
          difficulty: form.difficulty,
        },
      })
      await setQuestions.mutateAsync({ id: examId, questions: built })
      await updateExam.mutateAsync({ id: examId, input: { status: nextStatus } })
      toast.success(nextStatus === 'publie' ? 'Examen publié' : 'Brouillon enregistré')
      if (nextStatus === 'publie') navigate({ to: '/admin/examens' })
    } catch {
      toast.error('Échec de l’enregistrement. Réessaie.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        <Loader className="mr-2 size-5 animate-spin" /> Chargement de l’examen…
      </div>
    )
  }
  if (isError || !exam) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">Examen introuvable.</p>
        <Link to="/admin/examens" className="text-sm font-semibold text-brand hover:underline">
          ← Retour aux examens
        </Link>
      </div>
    )
  }

  const isDraft = exam.status === 'brouillon'

  return (
    <div className="space-y-5 pb-28 2xl:mx-auto 2xl:max-w-[1100px]">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Link to="/admin/examens" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Retour aux examens
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">
              {form.title || 'Examen sans titre'}
            </h1>
            {isDraft ? (
              <Badge className="bg-amber-soft text-amber-foreground">Brouillon</Badge>
            ) : (
              <Badge className="bg-success-soft text-success">Publié</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Méta */}
      <Card className="rounded-2xl p-5 shadow-soft">
        <h2 className="mb-1 font-heading text-base font-bold">Informations</h2>
        <ExamFields form={form} setForm={setForm} />
      </Card>

      {/* Questions */}
      <Card className="rounded-2xl p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-bold">
            Questions <span className="text-muted-foreground">({questions.length})</span>
          </h2>
        </div>

        <div className="space-y-4">
          {questions.length === 0 && (
            <p className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune question. Ajoute-en une pour composer l’épreuve (tu peux enregistrer en brouillon à tout moment).
            </p>
          )}

          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-2xl border-2 border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-sm font-bold">Question {idx + 1}</p>
                <button
                  type="button"
                  title="Supprimer"
                  onClick={() => removeQuestion(idx)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
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
                        <span className="w-5 text-center text-sm font-bold text-muted-foreground">{letter}</span>
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
      </Card>

      {/* Barre d'actions fixe */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-end gap-2 px-4 py-3">
          <Button variant="outline" onClick={() => save('brouillon')} disabled={pending}>
            {pending && <Loader className="size-4 animate-spin" />}
            Enregistrer le brouillon
          </Button>
          {isDraft ? (
            <Button onClick={() => save('publie')} disabled={pending}>
              {pending && <Loader className="size-4 animate-spin" />}
              Publier
            </Button>
          ) : (
            <Button onClick={() => save('publie')} disabled={pending}>
              {pending && <Loader className="size-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
