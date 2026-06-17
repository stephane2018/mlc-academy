import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  CheckSquare,
  Trophy,
  Lock,
} from '@/components/icons'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatTile } from '@/components/blocks'
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
import { exams } from '@/lib/mock'

export const Route = createFileRoute('/admin/examens')({
  component: AdminExamens,
})

function CreateExamDialog() {
  return (
    <Dialog>
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
            Assemblez une épreuve CE1D à partir de la banque de questions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Titre</Label>
            <Input id="exam-title" placeholder="Ex. : Examen blanc CE1D — Complet n°3" />
          </div>
          <div className="space-y-2">
            <Label>Thème</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tout">Tout le programme</SelectItem>
                <SelectItem value="nombres">Nombres</SelectItem>
                <SelectItem value="algebre">Algèbre</SelectItem>
                <SelectItem value="geometrie">Géométrie</SelectItem>
                <SelectItem value="mesures">Mesures</SelectItem>
                <SelectItem value="statistiques">Statistiques</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-duration">Durée (min)</Label>
              <Input id="exam-duration" type="number" min={5} placeholder="50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-count">Nb questions</Label>
              <Input id="exam-count" type="number" min={1} placeholder="20" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success('Examen blanc créé (démo)')}>Créer l'examen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminExamens() {
  const [items] = useState(exams)
  const premiumCount = items.filter((e) => e.premium).length
  const attempted = items.filter((e) => e.bestScore !== null)
  const avgBest =
    attempted.length > 0
      ? Math.round(attempted.reduce((s, e) => s + (e.bestScore ?? 0), 0) / attempted.length)
      : 0

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Examens blancs CE1D et résultats</p>
        <CreateExamDialog />
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={CheckSquare} tone="brand" label="Examens publiés" value={`${items.length}`} />
        <StatTile icon={Lock} tone="amber" label="Examens premium" value={`${premiumCount}`} />
        <StatTile
          icon={Trophy}
          tone="success"
          label="Taux de réussite moyen"
          value={attempted.length > 0 ? `${avgBest}%` : '—'}
        />
      </div>

      {/* Table de gestion */}
      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Thème</th>
                <th className="px-5 py-3 font-semibold">Durée</th>
                <th className="px-5 py-3 font-semibold">Questions</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Meilleur taux</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((exam) => (
                <tr key={exam.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3 font-medium">{exam.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{exam.theme}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      {exam.durationMin} min
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{exam.questionCount}</td>
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
                  <td className="px-5 py-3 font-semibold tabular-nums">
                    {exam.bestScore !== null ? `${exam.bestScore}%` : '—'}
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
                        <DropdownMenuItem onClick={() => toast('Résultats consultés (démo)')}>
                          <Trophy className="size-4" />
                          Voir les résultats
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => toast.error('Examen supprimé (démo)')}
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
    </div>
  )
}
