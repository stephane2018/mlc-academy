import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Loader } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuestionEditor, type QuestionDraft } from '@/components/question-editor'
import { useSubjects } from '@/hooks/use-catalog'
import { useCreateQuestion, useUpdateQuestion } from '@/hooks/use-questions'
import type { Question, QuestionDifficulty, QuestionOptionInput } from '@/services/questions'

const DIFFICULTIES: { value: QuestionDifficulty; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
]

type FormState = {
  subjectId: string
  themeId: string
  difficulty: QuestionDifficulty
  draft: QuestionDraft
}

function emptyDraft(): QuestionDraft {
  return {
    id: 'new',
    prompt: '',
    katex: '',
    imagePath: null,
    options: [
      { id: 'a', label: '', imagePath: null },
      { id: 'b', label: '', imagePath: null },
      { id: 'c', label: '', imagePath: null },
      { id: 'd', label: '', imagePath: null },
    ],
    correctId: 'a',
    explanation: '',
  }
}

function formFromQuestion(q: Question): FormState {
  const sorted = [...q.options].sort((a, b) => a.position - b.position)
  const options = sorted.map((o) => ({ id: o.id, label: o.label, imagePath: o.imagePath }))
  while (options.length < 4) options.push({ id: `extra-${options.length}`, label: '', imagePath: null })
  const correct = sorted.find((o) => o.isCorrect)
  return {
    subjectId: q.subjectId,
    themeId: q.themeId ?? '',
    difficulty: q.difficulty,
    draft: {
      id: q.id,
      prompt: q.prompt,
      katex: q.katex ?? '',
      imagePath: q.imagePath ?? null,
      options,
      correctId: correct?.id ?? options[0]!.id,
      explanation: q.explanation ?? '',
    },
  }
}

/** Page de création / édition d'une question de la banque (quiz). */
export function QuestionFormPage({ question }: { question?: Question | null }) {
  const navigate = useNavigate()
  const { data: subjects = [] } = useSubjects()
  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()
  const pending = createMutation.isPending || updateMutation.isPending
  const isEdit = Boolean(question)

  const [form, setForm] = useState<FormState>(() => (question ? formFromQuestion(question) : emptyForm()))

  const themes = useMemo(
    () => subjects.find((s) => s.id === form.subjectId)?.themes ?? [],
    [subjects, form.subjectId],
  )

  async function submit() {
    if (!form.subjectId) return toast.error('Choisis une matière.')
    const d = form.draft
    if (!d.prompt.trim() && !d.imagePath) return toast.error('Renseigne un énoncé ou une image.')
    const filled = d.options.filter((o) => o.label.trim() || o.imagePath)
    if (filled.length < 2) return toast.error('Ajoute au moins 2 options (texte ou image).')
    if (!filled.some((o) => o.id === d.correctId))
      return toast.error('La bonne réponse doit être une option renseignée.')

    const options: QuestionOptionInput[] = filled.map((o, position) => ({
      label: o.label.trim(),
      isCorrect: o.id === d.correctId,
      position,
      imagePath: o.imagePath,
    }))

    const input = {
      prompt: d.prompt.trim(),
      katex: d.katex.trim() || null,
      imagePath: d.imagePath,
      subjectId: form.subjectId,
      themeId: form.themeId || null,
      difficulty: form.difficulty,
      explanation: d.explanation.trim() || null,
      options,
    }

    try {
      if (question) {
        await updateMutation.mutateAsync({ id: question.id, input })
        toast.success('Question mise à jour.')
      } else {
        await createMutation.mutateAsync(input)
        toast.success('Question créée.')
      }
      navigate({ to: '/admin/questions' })
    } catch {
      toast.error("Échec de l'enregistrement.")
    }
  }

  return (
    <div className="space-y-5 pb-28 2xl:mx-auto 2xl:max-w-[900px]">
      <div className="space-y-1">
        <Link to="/admin/questions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Retour aux questions
        </Link>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          {isEdit ? 'Modifier la question' : 'Créer une question'}
        </h1>
      </div>

      {/* Métadonnées */}
      <Card className="rounded-2xl p-5 shadow-soft">
        <h2 className="mb-3 font-heading text-base font-bold">Classement</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Matière</Label>
            <Select
              value={form.subjectId}
              onValueChange={(v) => setForm((prev) => ({ ...prev, subjectId: v, themeId: '' }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Thème</Label>
            <Select
              value={form.themeId}
              onValueChange={(v) => setForm((prev) => ({ ...prev, themeId: v }))}
              disabled={themes.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={themes.length ? 'Choisir' : 'Aucun thème'} />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Difficulté</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => setForm((prev) => ({ ...prev, difficulty: v as QuestionDifficulty }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Contenu de la question */}
      <Card className="rounded-2xl p-5 shadow-soft">
        <h2 className="mb-3 font-heading text-base font-bold">Question</h2>
        <QuestionEditor value={form.draft} onChange={(next) => setForm((prev) => ({ ...prev, draft: next }))} />
      </Card>

      {/* Barre d'actions fixe */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[900px] items-center justify-end gap-2 px-4 py-3">
          <Button variant="outline" onClick={() => navigate({ to: '/admin/questions' })} disabled={pending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader className="size-4 animate-spin" />}
            {isEdit ? 'Enregistrer' : 'Créer la question'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function emptyForm(): FormState {
  return { subjectId: '', themeId: '', difficulty: 'moyen', draft: emptyDraft() }
}
