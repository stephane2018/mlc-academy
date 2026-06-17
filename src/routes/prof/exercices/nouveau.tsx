import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Dumbbell,
  Clock,
  Users,
  GraduationCap,
  CalendarDays,
  Check,
  Send,
} from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { RailLayout } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  profGroups,
  profStudents,
  domainLabels,
  type AssignmentType,
  type AssignmentQuestion,
  type SkillKey,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/exercices/nouveau')({
  component: ExerciceBuilder,
})

const difficulties: { value: 'facile' | 'moyen' | 'difficile'; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
]

let qCounter = 1
function emptyQuestion(): AssignmentQuestion {
  qCounter += 1
  return {
    id: `nq${qCounter}`,
    prompt: '',
    katex: '',
    options: [
      { id: 'a', label: '' },
      { id: 'b', label: '' },
      { id: 'c', label: '' },
      { id: 'd', label: '' },
    ],
    correctId: 'a',
    explanation: '',
  }
}

function ExerciceBuilder() {
  const navigate = useNavigate()

  // Infos
  const [title, setTitle] = useState('')
  const [type, setType] = useState<AssignmentType>('devoir')
  const [durationMin, setDurationMin] = useState('15')
  const [domain, setDomain] = useState<SkillKey>('nombres')
  const [difficulty, setDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen')
  const [dueDate, setDueDate] = useState('')

  // Questions
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([emptyQuestion()])
  const [activeIdx, setActiveIdx] = useState(0)

  // Assignation
  const [selGroups, setSelGroups] = useState<string[]>([])
  const [selStudents, setSelStudents] = useState<string[]>([])
  const [message, setMessage] = useState('')

  function patchQuestion(idx: number, patch: Partial<AssignmentQuestion>) {
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
    setActiveIdx(questions.length)
  }

  function duplicateQuestion(idx: number) {
    const src = questions[idx]
    qCounter += 1
    const copy: AssignmentQuestion = {
      ...src,
      id: `nq${qCounter}`,
      options: src.options.map((o) => ({ ...o })),
    }
    setQuestions((qs) => [...qs.slice(0, idx + 1), copy, ...qs.slice(idx + 1)])
    setActiveIdx(idx + 1)
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 1) return
    setQuestions((qs) => qs.filter((_, i) => i !== idx))
    setActiveIdx((cur) => Math.max(0, cur >= idx ? cur - 1 : cur))
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const totalTargets = selGroups.length + selStudents.length

  function describeTarget() {
    const parts: string[] = []
    if (selGroups.length) parts.push(selGroups.join(', '))
    if (selStudents.length)
      parts.push(`${selStudents.length} élève${selStudents.length > 1 ? 's' : ''}`)
    return parts.length ? parts.join(' · ') : 'aucune cible'
  }

  function saveDraft() {
    toast.info('Brouillon enregistré', {
      description: `« ${title || 'Sans titre'} » · ${questions.length} question${
        questions.length > 1 ? 's' : ''
      }.`,
    })
    navigate({ to: '/prof/exercices' })
  }

  function publish() {
    if (totalTargets === 0) {
      toast.error('Sélectionne au moins un groupe ou un élève à assigner.')
      return
    }
    const label = type === 'evaluation' ? 'Évaluation surprise' : 'Devoir maison'
    toast.success(`${label} publié`, {
      description: `« ${title || 'Sans titre'} » assigné à ${describeTarget()}${
        type === 'evaluation' ? ` · ${durationMin} min` : ''
      }.`,
    })
    navigate({ to: '/prof/exercices' })
  }

  const current = questions[activeIdx] ?? questions[0]

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <Link
        to="/prof/exercices"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Devoirs
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Nouvel exercice</p>
        <h1 className="font-heading text-2xl font-extrabold lg:text-3xl xl:text-4xl">
          Créer un devoir ou une évaluation
        </h1>
      </div>

      <RailLayout
        rail={
          <>
            {/* Aperçu élève */}
            <Card className="gap-0 p-5">
              <p className="font-heading text-base font-bold">Aperçu élève</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Question {activeIdx + 1} · même principe que le quiz.
              </p>

              <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-brand">
                  {domainLabels[domain]}
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed">
                  {current.prompt || 'Saisis un énoncé…'}
                </p>
                {current.katex && (
                  <div className="mt-3 rounded-xl bg-secondary/60 py-3 text-lg">
                    <Maths expr={current.katex} display />
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {current.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i)
                  const isAnswer = opt.id === current.correctId
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 bg-card p-3 text-left',
                        isAnswer ? 'border-success bg-success-soft' : 'border-border',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold',
                          isAnswer ? 'bg-success text-white' : 'bg-secondary text-muted-foreground',
                        )}
                      >
                        {isAnswer ? <Check className="size-3.5" /> : letter}
                      </span>
                      <span className="text-sm font-semibold">
                        {opt.label || <span className="text-muted-foreground">Option {letter}</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Assignation */}
            <Card className="gap-0 p-5">
              <p className="font-heading text-base font-bold">Assignation</p>

              <div className="mt-3">
                <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  <Users className="size-3.5" /> Groupes
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profGroups.map((g) => {
                    const on = selGroups.includes(g.name)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggle(selGroups, setSelGroups, g.name)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                          on
                            ? 'border-brand bg-brand text-white'
                            : 'border-border bg-card text-muted-foreground hover:border-brand/40',
                        )}
                      >
                        {on && <Check className="size-3.5" />}
                        {g.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4">
                <Label className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  <GraduationCap className="size-3.5" /> Élèves
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profStudents.map((s) => {
                    const on = selStudents.includes(s.pseudo)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(selStudents, setSelStudents, s.pseudo)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                          on
                            ? 'border-brand bg-brand text-white'
                            : 'border-border bg-card text-muted-foreground hover:border-brand/40',
                        )}
                      >
                        <span>{s.avatar}</span>
                        {s.pseudo}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="message">Message d'accompagnement</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex : À rendre avant vendredi, soigne tes justifications."
                  rows={3}
                />
              </div>

              {totalTargets > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Cible : <span className="font-semibold text-foreground">{describeTarget()}</span>
                </p>
              )}
            </Card>

            {/* Publication */}
            <Card className="gap-3 p-5">
              <p className="font-heading text-base font-bold">Publication</p>
              <Button variant="outline" className="w-full justify-start" onClick={saveDraft}>
                <Copy className="size-4" />
                Enregistrer comme brouillon
              </Button>
              <Button className="w-full justify-start" onClick={publish}>
                <Send className="size-4" />
                Publier et assigner
              </Button>
            </Card>
          </>
        }
      >
        {/* Infos */}
        <Card className="gap-4 p-5">
          <p className="font-heading text-lg font-bold">Informations</p>

          <div className="space-y-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Devoir maison — Les fractions"
            />
          </div>

          {/* Type segment */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'devoir', label: 'Devoir maison', icon: Dumbbell },
                  { value: 'evaluation', label: 'Évaluation surprise', icon: Clock },
                ] as const
              ).map(({ value, label, icon: Icon }) => {
                const on = type === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition',
                      on
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-border bg-card text-muted-foreground hover:border-brand/40',
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {type === 'evaluation' && (
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="flex items-center gap-1.5">
                <Clock className="size-4" /> Durée (min)
              </Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="max-w-[160px]"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Domaine</Label>
              <Select value={domain} onValueChange={(v) => setDomain(v as SkillKey)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(domainLabels) as SkillKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {domainLabels[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Difficulté</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as typeof difficulty)}
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

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Date limite
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Questions */}
        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-bold">Questions</p>
            <span className="text-sm text-muted-foreground">{questions.length} au total</span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isActive = idx === activeIdx
              return (
                <div
                  key={q.id}
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    'cursor-pointer rounded-2xl border-2 p-4 transition',
                    isActive ? 'border-brand bg-brand-soft/30' : 'border-border bg-card',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-sm font-bold">Question {idx + 1}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Dupliquer"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateQuestion(idx)
                        }}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        disabled={questions.length <= 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeQuestion(idx)
                        }}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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
                        value={q.katex ?? ''}
                        onChange={(e) => patchQuestion(idx, { katex: e.target.value })}
                        placeholder="Ex : \frac{3}{4} + \frac{1}{2}"
                        className="font-mono"
                      />
                      {q.katex && (
                        <div className="rounded-xl bg-secondary/60 py-3 text-center text-lg">
                          <Maths expr={q.katex} display />
                        </div>
                      )}
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
                              onClick={(e) => {
                                e.stopPropagation()
                                patchQuestion(idx, { correctId: opt.id })
                              }}
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
                      <Label htmlFor={`expl-${q.id}`}>Explication</Label>
                      <Input
                        id={`expl-${q.id}`}
                        value={q.explanation ?? ''}
                        onChange={(e) => patchQuestion(idx, { explanation: e.target.value })}
                        placeholder="Justification affichée à la correction."
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button variant="outline" className="w-full" onClick={addQuestion}>
            <Plus className="size-4" />
            Ajouter une question
          </Button>
        </Card>
      </RailLayout>
    </div>
  )
}
