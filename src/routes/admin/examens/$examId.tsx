import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader } from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuestionEditor, type QuestionDraft } from '@/components/question-editor'
import { ExamFields, emptyExamForm, type ExamForm } from '@/components/admin/exam-fields'
import { useAdminExam, useUpdateExam, useSetExamQuestions } from '@/hooks/use-admin-exams'
import type { ComposedExamQuestion, ExamStatus } from '@/services/admin-exams'

export const Route = createFileRoute('/admin/examens/$examId')({
  component: ComposeExamPage,
})

/** Brouillon de question QCM dans le builder (modèle commun avec les exercices). */
type QDraft = QuestionDraft

let qCounter = 0
function emptyQuestion(): QDraft {
  qCounter += 1
  const id = `nq${qCounter}`
  return {
    id,
    prompt: '',
    katex: '',
    imagePath: null,
    explanation: '',
    options: [
      { id: `${id}-a`, label: '', imagePath: null },
      { id: `${id}-b`, label: '', imagePath: null },
      { id: `${id}-c`, label: '', imagePath: null },
      { id: `${id}-d`, label: '', imagePath: null },
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
        imagePath: q.imagePath ?? null,
        explanation: q.explanation ?? '',
        options: q.options.map((o) => ({ id: o.id, label: o.label, imagePath: o.imagePath ?? null })),
        correctId: q.correctOptionId ?? q.options[0]?.id ?? '',
      })),
    )
    setHydrated(true)
  }, [exam, hydrated])

  const addQuestion = () => setQuestionsState((qs) => [...qs, emptyQuestion()])
  const removeQuestion = (idx: number) => setQuestionsState((qs) => qs.filter((_, i) => i !== idx))

  /** Valide + transforme les questions remplies pour l'API (ignore les cartes vides). */
  function buildPayload(): ComposedExamQuestion[] | string {
    const payload: ComposedExamQuestion[] = []
    for (const q of questions) {
      const filled = q.options.filter((o) => o.label.trim() || o.imagePath)
      const isEmpty = !q.prompt.trim() && !q.imagePath && filled.length === 0
      if (isEmpty) continue // carte non remplie → ignorée (utile en brouillon)
      if (!q.prompt.trim() && !q.imagePath) return 'Chaque question doit avoir un énoncé ou une image.'
      if (filled.length < 2) return 'Chaque question doit avoir au moins 2 options (texte ou image).'
      if (filled.length > 8) return 'Maximum 8 options par question.'
      if (!filled.some((o) => o.id === q.correctId))
        return 'Désigne une bonne réponse parmi les options remplies.'
      payload.push({
        prompt: q.prompt.trim(),
        katex: q.katex.trim() || null,
        imagePath: q.imagePath,
        themeId: form.themeId || null,
        explanation: q.explanation.trim() || null,
        options: filled.map((o) => ({ label: o.label.trim(), isCorrect: o.id === q.correctId, imagePath: o.imagePath })),
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

              <div className="mt-3">
                <QuestionEditor
                  value={q}
                  onChange={(next) => setQuestionsState((qs) => qs.map((x, i) => (i === idx ? next : x)))}
                />
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
