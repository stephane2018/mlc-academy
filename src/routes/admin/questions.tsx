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
import { questionBank, domainLabels } from '@/lib/mock'
import type { BankQuestion } from '@/lib/mock'
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

type DomainKey = keyof typeof domainLabels
type DomainFilter = 'all' | DomainKey

const domainKeys = Object.keys(domainLabels) as DomainKey[]

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
            Ajoutez une question à la banque du jeu CE1D. Associez-la à un domaine et une difficulté.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domaine</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {domainKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {domainLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-type">Type</Label>
              <Input id="q-type" placeholder="Ex. : Équation" />
            </div>
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
  const [domain, setDomain] = useState<DomainFilter>('all')
  const [search, setSearch] = useState('')

  const totalUses = useMemo(() => questionBank.reduce((sum, q) => sum + q.uses, 0), [])
  const coveredDomains = useMemo(
    () => new Set(questionBank.map((q) => q.domain)).size,
    [],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return questionBank.filter((q) => {
      const matchDomain = domain === 'all' || q.domain === domain
      const matchSearch = term === '' || q.prompt.toLowerCase().includes(term)
      return matchDomain && matchSearch
    })
  }, [domain, search])

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
          label="Domaines couverts"
          value={`${coveredDomains} / ${domainKeys.length}`}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <Filter className="size-4" />
            Domaine :
          </span>
          <Button
            variant={domain === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setDomain('all')}
          >
            Tout
          </Button>
          {domainKeys.map((key) => (
            <Button
              key={key}
              variant={domain === key ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => setDomain(key)}
            >
              {domainLabels[key]}
            </Button>
          ))}
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
                <th className="px-5 py-3 font-semibold">Domaine</th>
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
                    <Badge variant="outline">{domainLabels[q.domain]}</Badge>
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
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
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
