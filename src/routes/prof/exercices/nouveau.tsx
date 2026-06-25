import { useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
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
  Sparkles,
} from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { MathField } from '@/components/math-field'
import { MathText } from '@/components/math-text'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { spreadAvatar } from '@/lib/avatar'
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
import { useSubjects } from '@/hooks/use-catalog'
import { useGroups } from '@/hooks/use-groups'
import { useTeacherStudents } from '@/hooks/use-teacher'
import { assignmentsService, type AssignmentType } from '@/services/assignments'

export const Route = createFileRoute('/prof/exercices/nouveau')({
  component: ExerciceBuilder,
})

const difficulties: { value: 'facile' | 'moyen' | 'difficile'; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
]

/** Bouton + dialog d'insertion d'une formule (éditeur visuel MathLive → LaTeX). */
function MathInsertButton({ onInsert, compact }: { onInsert: (latex: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [latex, setLatex] = useState('')
  const confirm = () => {
    const v = latex.trim()
    if (v) onInsert(v)
    setLatex('')
    setOpen(false)
  }
  // Garde : ne pas fermer le dialog quand on interagit avec le clavier flottant
  // (posé sur <body>, donc « hors » du dialog).
  const keepOpenOnKeyboard = (e: Event) => {
    const t = e.target as HTMLElement | null
    if (t?.closest?.('.mlk-float, .ML__keyboard')) e.preventDefault()
  }
  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        {compact ? (
          <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" title="Insérer une formule" aria-label="Insérer une formule">
            <Sparkles className="size-4" />
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm">
            <Sparkles className="size-4" />
            Insérer une formule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onInteractOutside={keepOpenOnKeyboard} onPointerDownOutside={keepOpenOnKeyboard}>
        <DialogHeader>
          <DialogTitle>Insérer une formule</DialogTitle>
          <DialogDescription>Écris ta formule (clavier de symboles dispo) — elle s'insère dans le texte.</DialogDescription>
        </DialogHeader>
        <MathField value={latex} onChange={setLatex} placeholder="Ex : (a+b)/2" />
        {latex.trim() && (
          <div className="rounded-xl bg-secondary/60 py-3 text-center text-lg">
            <Maths expr={latex} display />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Annuler</Button>
          </DialogClose>
          <Button type="button" onClick={confirm} disabled={!latex.trim()}>Insérer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Brouillon de question composé dans le builder. */
type QDraft = {
  id: string
  prompt: string
  katex: string
  options: { id: string; label: string }[]
  correctId: string
  explanation: string
}

let qCounter = 1
function emptyQuestion(): QDraft {
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
  const qc = useQueryClient()
  const { data: subjects = [] } = useSubjects()
  const { data: groups = [] } = useGroups()
  const { data: students = [] } = useTeacherStudents()

  // Infos
  const [title, setTitle] = useState('')
  const [type, setType] = useState<AssignmentType>('devoir')
  const [durationMin, setDurationMin] = useState('15')
  const [subjectId, setSubjectId] = useState('')
  const [themeId, setThemeId] = useState('')
  const [difficulty, setDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen')
  const [dueDate, setDueDate] = useState('')

  // Questions
  const [questions, setQuestions] = useState<QDraft[]>([emptyQuestion()])
  const [activeIdx, setActiveIdx] = useState(0)

  // Assignation
  const [selGroups, setSelGroups] = useState<string[]>([])
  const [selStudents, setSelStudents] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const subject = subjects.find((s) => s.id === subjectId)
  const themes = subject?.themes ?? []

  function changeSubject(next: string) {
    setSubjectId(next)
    setThemeId('')
  }

  function patchQuestion(idx: number, patch: Partial<QDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }
  function patchOption(idx: number, optIdx: number, label: string) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === idx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? { ...o, label } : o)) } : q,
      ),
    )
  }

  // Refs des champs texte (énoncé + options), pour insérer une formule au curseur.
  const fieldRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map())
  const registerField = (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el) fieldRefs.current.set(key, el)
    else fieldRefs.current.delete(key)
  }
  function insertFormula(key: string, latex: string, current: string, apply: (v: string) => void) {
    const wrapped = `$${latex}$`
    const el = fieldRefs.current.get(key)
    if (!el) {
      apply(current ? `${current} ${wrapped}` : wrapped)
      return
    }
    const start = el.selectionStart ?? current.length
    const end = el.selectionEnd ?? current.length
    apply(current.slice(0, start) + wrapped + current.slice(end))
    requestAnimationFrame(() => {
      const caret = start + wrapped.length
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }
  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()])
    setActiveIdx(questions.length)
  }
  function duplicateQuestion(idx: number) {
    const src = questions[idx]
    qCounter += 1
    const copy: QDraft = { ...src, id: `nq${qCounter}`, options: src.options.map((o) => ({ ...o })) }
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
    if (selGroups.length) parts.push(`${selGroups.length} groupe${selGroups.length > 1 ? 's' : ''}`)
    if (selStudents.length) parts.push(`${selStudents.length} élève${selStudents.length > 1 ? 's' : ''}`)
    return parts.length ? parts.join(' · ') : 'aucune cible'
  }

  /** Valide + transforme les questions du builder pour l'API (filtre options vides). */
  function buildPayloadQuestions() {
    return questions.map((q) => {
      const kept = q.options.filter((o) => o.label.trim())
      return {
        prompt: q.prompt.trim(),
        katex: q.katex.trim() || null,
        themeId: themeId || null,
        explanation: q.explanation.trim() || null,
        options: kept.map((o) => ({ label: o.label.trim(), isCorrect: o.id === q.correctId })),
      }
    })
  }

  function validate(requireTargets: boolean): string | null {
    if (!title.trim()) return 'Donne un titre au devoir.'
    if (!subjectId) return 'Choisis une matière.'
    for (const q of questions) {
      if (!q.prompt.trim()) return 'Chaque question doit avoir un énoncé.'
      const kept = q.options.filter((o) => o.label.trim())
      if (kept.length < 2) return 'Chaque question doit avoir au moins 2 options.'
      if (!kept.some((o) => o.id === q.correctId)) return 'Désigne une bonne réponse parmi les options remplies.'
    }
    if (requireTargets && totalTargets === 0) return 'Sélectionne au moins un groupe ou un élève à assigner.'
    return null
  }

  async function run(asDraft: boolean) {
    const err = validate(!asDraft)
    if (err) {
      toast.error(err)
      return
    }
    setBusy(true)
    try {
      const created = await assignmentsService.create({
        title: title.trim(),
        type,
        subjectId,
        themeId: themeId || null,
        difficulty,
        durationMin: type === 'evaluation' ? Number(durationMin) || undefined : undefined,
        dueDate: dueDate || undefined,
        xpReward: 20,
        message: message.trim() || undefined,
      })
      await assignmentsService.attachQuestions(created.id, buildPayloadQuestions())
      if (!asDraft) {
        await assignmentsService.setTargets(created.id, { groupIds: selGroups, studentIds: selStudents })
        await assignmentsService.updateStatus(created.id, 'publie')
      }
      qc.invalidateQueries({ queryKey: ['assignments'] })
      const label = type === 'evaluation' ? 'Évaluation' : 'Devoir'
      toast.success(asDraft ? 'Brouillon enregistré' : `${label} publié`, {
        description: asDraft ? `« ${title} »` : `« ${title} » assigné à ${describeTarget()}.`,
      })
      navigate({ to: '/prof/exercices' })
    } catch {
      toast.error("Échec de l'enregistrement. Réessaie.")
    } finally {
      setBusy(false)
    }
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
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: subject?.color ?? 'var(--brand)' }}>
                  {subject?.name ?? 'Matière'}
                  {themes.find((t) => t.id === themeId)?.name ? ` · ${themes.find((t) => t.id === themeId)?.name}` : ''}
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed">
                  {current.prompt ? <MathText value={current.prompt} /> : 'Saisis un énoncé…'}
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
                        {opt.label ? <MathText value={opt.label} /> : <span className="text-muted-foreground">Option {letter}</span>}
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
                  {groups.length === 0 && <p className="text-xs text-muted-foreground">Aucun groupe.</p>}
                  {groups.map((g) => {
                    const on = selGroups.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggle(selGroups, setSelGroups, g.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                          on ? 'border-brand bg-brand text-white' : 'border-border bg-card text-muted-foreground hover:border-brand/40',
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
                  {students.length === 0 && <p className="text-xs text-muted-foreground">Aucun élève.</p>}
                  {students.map((s) => {
                    const on = selStudents.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(selStudents, setSelStudents, s.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                          on ? 'border-brand bg-brand text-white' : 'border-border bg-card text-muted-foreground hover:border-brand/40',
                        )}
                      >
                        <span>{spreadAvatar(s.avatar, s.pseudo)}</span>
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
              <Button variant="outline" className="w-full justify-start" disabled={busy} onClick={() => run(true)}>
                <Copy className="size-4" />
                Enregistrer comme brouillon
              </Button>
              <Button className="w-full justify-start" disabled={busy} onClick={() => run(false)}>
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
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Devoir maison — Les fractions" />
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
                      on ? 'border-brand bg-brand-soft text-brand' : 'border-border bg-card text-muted-foreground hover:border-brand/40',
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
              <Input id="duration" type="number" min={1} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} className="max-w-[160px]" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Matière</Label>
              <Select value={subjectId} onValueChange={changeSubject}>
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
              <Select value={themeId} onValueChange={setThemeId} disabled={!subjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optionnel" />
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
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Date limite
              </Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                  className={cn('cursor-pointer rounded-2xl border-2 p-4 transition', isActive ? 'border-brand bg-brand-soft/30' : 'border-border bg-card')}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-sm font-bold">Question {idx + 1}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Dupliquer"
                        onClick={(e) => { e.stopPropagation(); duplicateQuestion(idx) }}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        disabled={questions.length <= 1}
                        onClick={(e) => { e.stopPropagation(); removeQuestion(idx) }}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`prompt-${q.id}`}>Énoncé</Label>
                      <Textarea ref={registerField(`prompt-${q.id}`)} id={`prompt-${q.id}`} value={q.prompt} onChange={(e) => patchQuestion(idx, { prompt: e.target.value })} placeholder="Rédige la question… (insère des formules avec le bouton ci-dessous)" rows={2} />
                      <MathInsertButton onInsert={(latex) => insertFormula(`prompt-${q.id}`, latex, q.prompt, (v) => patchQuestion(idx, { prompt: v }))} />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Formule mathématique (optionnel)</Label>
                      <p className="text-xs text-muted-foreground">
                        Écris directement (fraction, racine, exposant…) — utilise le clavier de symboles. Aucun code à retenir.
                      </p>
                      <MathField
                        value={q.katex}
                        onChange={(latex) => patchQuestion(idx, { katex: latex })}
                        placeholder="Ex : (a+b)/2"
                      />
                      {q.katex && (
                        <div className="rounded-xl bg-secondary/60 py-3 text-center text-lg">
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Aperçu élève</p>
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
                              onClick={(e) => { e.stopPropagation(); patchQuestion(idx, { correctId: opt.id }) }}
                              className={cn(
                                'grid size-7 shrink-0 place-items-center rounded-full border-2 transition',
                                isAnswer ? 'border-success bg-success text-white' : 'border-border text-transparent hover:border-success/50',
                              )}
                            >
                              <Check className="size-4" />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-muted-foreground">{letter}</span>
                            <Input ref={registerField(`opt-${opt.id}`)} value={opt.label} onChange={(e) => patchOption(idx, oi, e.target.value)} placeholder={`Option ${letter}`} />
                            <MathInsertButton compact onInsert={(latex) => insertFormula(`opt-${opt.id}`, latex, opt.label, (v) => patchOption(idx, oi, v))} />
                          </div>
                        )
                      })}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`expl-${q.id}`}>Explication</Label>
                      <Input id={`expl-${q.id}`} value={q.explanation} onChange={(e) => patchQuestion(idx, { explanation: e.target.value })} placeholder="Justification affichée à la correction." />
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
