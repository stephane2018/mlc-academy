import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  CircleHelp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Activity,
  Sparkles,
} from '@/components/icons'
import { toast } from 'sonner'
import {
  questionBank,
  subjects,
  subjectLabel,
  themesFor,
  themeLabel,
} from '@/lib/mock'
import type { BankQuestion, SubjectKey } from '@/lib/mock'
import { SubjectFilter, type SubjectFilterValue } from '@/components/student/subject-filter'
import { StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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

const difficultyMeta: Record<BankQuestion['difficulty'], { label: string; className: string }> = {
  facile: { label: 'Facile', className: 'bg-success-soft text-success' },
  moyen: { label: 'Moyen', className: 'bg-amber-soft text-amber-foreground' },
  difficile: { label: 'Difficile', className: 'bg-destructive/10 text-destructive' },
}

function DifficultyBadge({ difficulty }: { difficulty: BankQuestion['difficulty'] }) {
  const meta = difficultyMeta[difficulty]
  return <Badge className={meta.className}>{meta.label}</Badge>
}

function CreateQuestionDialog() {
  const [subject, setSubject] = useState<SubjectKey>('maths')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Créer une question
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une question</DialogTitle>
          <DialogDescription>
            Ajoutez une question à la banque. Associez-la à une matière, un thème et une difficulté.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={subject} onValueChange={(v) => setSubject(v as SubjectKey)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Thème</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {themesFor(subject).map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-type">Type</Label>
            <Input id="q-type" placeholder="Ex. : Équation" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-prompt">Énoncé</Label>
            <Textarea id="q-prompt" rows={3} placeholder="Ex. : Résous 2x + 5 = 17" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulté</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facile">Facile</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="difficile">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-answer">Bonne réponse</Label>
              <Input id="q-answer" placeholder="Ex. : x = 6" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success('Question créée (démo)')}>
              Créer la question
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminQuestions() {
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const [theme, setTheme] = useState<'all' | string>('all')
  const [search, setSearch] = useState('')

  const totalUses = useMemo(() => questionBank.reduce((sum, q) => sum + q.uses, 0), [])
  const coveredSubjects = useMemo(
    () => new Set(questionBank.map((q) => q.subject)).size,
    [],
  )

  // Thèmes disponibles selon la matière sélectionnée (cascade).
  const themeOptions = useMemo(
    () => (subject === 'all' ? [] : themesFor(subject)),
    [subject],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return questionBank.filter((q) => {
      const matchSubject = subject === 'all' || q.subject === subject
      const matchTheme = theme === 'all' || q.theme === theme
      const matchSearch = term === '' || q.prompt.toLowerCase().includes(term)
      return matchSubject && matchTheme && matchSearch
    })
  }, [subject, theme, search])

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={CircleHelp}
          tone="brand"
          label="Total de questions"
          value={questionBank.length}
        />
        <StatTile
          icon={Activity}
          tone="teal"
          label="Utilisations totales"
          value={totalUses.toLocaleString('fr-FR')}
        />
        <StatTile
          icon={Sparkles}
          tone="amber"
          label="Matières couvertes"
          value={`${coveredSubjects} / ${subjects.length}`}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <Filter className="size-4" />
            Matière :
          </span>
          <SubjectFilter
            value={subject}
            onChange={(v) => {
              setSubject(v)
              setTheme('all')
            }}
          />
          {subject !== 'all' && themeOptions.length > 0 && (
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Tous les thèmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les thèmes</SelectItem>
                {themeOptions.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
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
            <CreateQuestionDialog />
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
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Difficulté</th>
                <th className="px-5 py-3 font-semibold text-right">Utilisations</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{q.prompt}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline">{subjectLabel(q.subject)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {themeLabel(q.theme, q.subject)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{q.type}</td>
                  <td className="px-5 py-3">
                    <DifficultyBadge difficulty={q.difficulty} />
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                    {q.uses.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast('Édition (démo)')}>
                          <Pencil className="size-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success('Question dupliquée (démo)')}>
                          <Copy className="size-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => toast.error('Question supprimée (démo)')}
                        >
                          <Trash2 className="size-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <CircleHelp className="mx-auto mb-2 size-6 text-muted-foreground" />
                    Aucune question ne correspond à votre recherche.
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
