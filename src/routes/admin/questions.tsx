import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  CircleHelp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
} from '@/components/icons'
import { toast } from 'sonner'
import { useSubjects } from '@/hooks/use-catalog'
import { useQuestions, useDeleteQuestion } from '@/hooks/use-questions'
import type { Question, QuestionDifficulty } from '@/services/questions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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

function DifficultyBadge({ difficulty }: { difficulty: QuestionDifficulty }) {
  const meta = difficultyMeta[difficulty]
  return <Badge className={meta.className}>{meta.label}</Badge>
}

function AdminQuestions() {
  const navigate = useNavigate()
  const [subjectId, setSubjectId] = useState<'all' | string>('all')
  const [themeId, setThemeId] = useState<'all' | string>('all')
  const [search, setSearch] = useState('')

  const subjectsQuery = useSubjects()
  const subjects = subjectsQuery.data ?? []

  const questionsQuery = useQuestions({
    subjectId: subjectId === 'all' ? undefined : subjectId,
    themeId: themeId === 'all' ? undefined : themeId,
  })
  const questions = questionsQuery.data ?? []

  const deleteMutation = useDeleteQuestion()

  // Résolution rapide des libellés matière/thème depuis le catalogue.
  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects])
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
          <Button asChild className="shrink-0">
            <Link to="/admin/questions/nouveau">
              <Plus className="size-4" />
              Créer une question
            </Link>
          </Button>
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
                  <tr
                    key={q.id}
                    className="cursor-pointer transition-colors hover:bg-secondary/40"
                    onClick={() => navigate({ to: '/admin/questions/$questionId', params: { questionId: q.id } })}
                  >
                    <td className="px-5 py-3 font-medium">{q.prompt || <span className="text-muted-foreground">(image)</span>}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{subjectById.get(q.subjectId)?.name ?? '—'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {q.themeId ? themeById.get(q.themeId) ?? '—' : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <DifficultyBadge difficulty={q.difficulty} />
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{q.optionsCount}</td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
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
    </div>
  )
}
