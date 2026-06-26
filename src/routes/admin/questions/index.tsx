import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  CircleHelp,
  Plus,
  Search,
  ArrowRight,
  Check,
  Target,
  Camera,
  MoreHorizontal,
  Pencil,
  Trash2,
} from '@/components/icons'
import { toast } from 'sonner'
import { SubjectFilter, type SubjectFilterValue } from '@/components/student/subject-filter'
import { PageHero, StatTile } from '@/components/blocks'
import { MathText } from '@/components/math-text'
import { SignedImage } from '@/components/signed-image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { SubjectKey } from '@/lib/mock'
import { useSubjects } from '@/hooks/use-catalog'
import { useQuestions, useDeleteQuestion } from '@/hooks/use-questions'
import type { Question, QuestionDifficulty } from '@/services/questions'

export const Route = createFileRoute('/admin/questions/')({
  component: AdminQuestions,
})

type DiffFilter = 'tout' | QuestionDifficulty

const diffFilters: { key: DiffFilter; label: string }[] = [
  { key: 'tout', label: 'Toutes' },
  { key: 'facile', label: 'Faciles' },
  { key: 'moyen', label: 'Moyennes' },
  { key: 'difficile', label: 'Difficiles' },
]

const difficultyColor: Record<QuestionDifficulty, string> = {
  facile: 'text-success',
  moyen: 'text-amber-foreground',
  difficile: 'text-destructive',
}

function AdminQuestions() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const [diff, setDiff] = useState<DiffFilter>('tout')
  const [search, setSearch] = useState('')

  const { data: subjects = [] } = useSubjects()
  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const subjectCode = (id: string) => (subjectById.get(id)?.code ?? '') as SubjectKey
  const themeName = (id: string | null) =>
    (id && subjects.flatMap((s) => s.themes).find((t) => t.id === id)?.name) || null

  const questionsQuery = useQuestions()
  const questions = questionsQuery.data ?? []
  const deleteMutation = useDeleteQuestion()

  const total = questions.length
  const faciles = questions.filter((q) => q.difficulty === 'facile').length
  const difficiles = questions.filter((q) => q.difficulty === 'difficile').length

  const term = search.trim().toLowerCase()
  const visible = questions.filter(
    (q) =>
      (subject === 'all' || subjectCode(q.subjectId) === subject) &&
      (diff === 'tout' || q.difficulty === diff) &&
      (term === '' || q.prompt.toLowerCase().includes(term)),
  )

  async function remove(question: Question) {
    try {
      await deleteMutation.mutateAsync(question.id)
      toast.success('Question supprimée.')
    } catch {
      toast.error('Échec de la suppression.')
    }
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        variant="surface"
        eyebrow="Banque de questions"
        title="Questions de quiz"
        subtitle="Crée et organise les questions piochées dans les quiz d'entraînement des élèves — formules et images prises en charge."
        actions={
          <Button asChild>
            <Link to="/admin/questions/nouveau">
              <Plus className="size-4" />
              Créer une question
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={CircleHelp} tone="brand" label="Questions au total" value={total} />
        <StatTile icon={Check} tone="success" label="Faciles" value={faciles} />
        <StatTile icon={Target} tone="amber" label="Difficiles" value={difficiles} />
      </div>

      {/* Filtre par matière */}
      <SubjectFilter value={subject} onChange={setSubject} />

      {/* Filtres difficulté + recherche */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {diffFilters.map((f) => {
            const active = diff === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setDiff(f.key)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-semibold transition',
                  active
                    ? 'border-brand bg-brand text-white shadow-soft'
                    : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un énoncé…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Cartes */}
      {questionsQuery.isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chargement des questions…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visible.map((q) => {
            const subj = subjectById.get(q.subjectId)
            const theme = themeName(q.themeId)
            return (
              <div
                key={q.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate({ to: '/admin/questions/$questionId', params: { questionId: q.id } })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate({ to: '/admin/questions/$questionId', params: { questionId: q.id } })
                }}
                className="card-hover block cursor-pointer rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
              >
                <Card className="h-full gap-0 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn('text-xs font-bold uppercase tracking-wide', difficultyColor[q.difficulty])}>
                      {q.difficulty}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-8" aria-label="Actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/questions/$questionId" params={{ questionId: q.id }}>
                              <Pencil className="size-4" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => remove(q)}>
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-3 font-heading text-base font-bold leading-snug">
                    {q.prompt ? (
                      <MathText value={q.prompt} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Camera className="size-4" /> Question illustrée
                      </span>
                    )}
                  </p>

                  {q.imagePath && (
                    <SignedImage path={q.imagePath} className="mt-3 max-h-28 w-auto rounded-xl border border-border object-contain" />
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {subj && (
                      <Badge variant="secondary" className="border-transparent text-white" style={{ backgroundColor: subj.color ?? 'var(--brand)' }}>
                        {subj.name}
                      </Badge>
                    )}
                    {theme && <span className="font-medium text-foreground">{theme}</span>}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CircleHelp className="size-3.5" />
                      {q.optionsCount} option{q.optionsCount > 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                      Modifier
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Card>
              </div>
            )
          })}

          {visible.length === 0 && (
            <Card className="col-span-full items-center gap-3 p-10 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
                <CircleHelp className="size-6 text-muted-foreground" />
              </span>
              <p className="text-sm text-muted-foreground">
                {questions.length === 0
                  ? 'Aucune question dans la banque. Crée la première !'
                  : 'Aucune question ne correspond à ces filtres.'}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
