import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, MoreHorizontal, Pencil, EyeOff, Trash2, Video, FileText, CheckSquare } from '@/components/icons'
import type { LucideIcon } from '@/components/icons'
import { toast } from 'sonner'
import {
  subjects,
  subjectLabel,
  themesFor,
  themeLabel,
  type SubjectKey,
} from '@/lib/mock'
import { SubjectFilter, type SubjectFilterValue } from '@/components/student/subject-filter'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export const Route = createFileRoute('/admin/ressources')({
  component: AdminRessources,
})

type ResourceType = 'Vidéo' | 'PDF' | 'Examen blanc'
type ResourceStatus = 'Publié' | 'Brouillon'

type Resource = {
  id: string
  title: string
  type: ResourceType
  subject: SubjectKey
  theme: string
  status: ResourceStatus
  date: string
}

const resources: Resource[] = [
  { id: 'r1', title: 'Théorème de Pythagore', type: 'Vidéo', subject: 'maths', theme: 'geometrie', status: 'Publié', date: '12 juin 2026' },
  { id: 'r2', title: 'Résoudre une équation du 1er degré', type: 'Vidéo', subject: 'maths', theme: 'algebre', status: 'Publié', date: '10 juin 2026' },
  { id: 'r3', title: 'Fiche : les fractions', type: 'PDF', subject: 'maths', theme: 'nombres', status: 'Publié', date: '8 juin 2026' },
  { id: 'r4', title: 'Examen blanc — Géométrie n°3', type: 'Examen blanc', subject: 'maths', theme: 'geometrie', status: 'Brouillon', date: '6 juin 2026' },
  { id: 'r5', title: 'Lecture de graphiques', type: 'Vidéo', subject: 'maths', theme: 'statistiques', status: 'Publié', date: '4 juin 2026' },
  { id: 'r6', title: 'Fiche : périmètre et aire', type: 'PDF', subject: 'maths', theme: 'mesures', status: 'Brouillon', date: '2 juin 2026' },
  { id: 'r7', title: 'Examen blanc — Algèbre n°2', type: 'Examen blanc', subject: 'maths', theme: 'algebre', status: 'Publié', date: '30 mai 2026' },
  { id: 'r8', title: 'Calcul de pourcentages', type: 'Vidéo', subject: 'maths', theme: 'nombres', status: 'Brouillon', date: '28 mai 2026' },
]

const typeIcons: Record<ResourceType, LucideIcon> = {
  Vidéo: Video,
  PDF: FileText,
  'Examen blanc': CheckSquare,
}

function StatusBadge({ status }: { status: ResourceStatus }) {
  return status === 'Publié' ? (
    <Badge className="bg-success-soft text-success">Publié</Badge>
  ) : (
    <Badge className="bg-amber-soft text-amber-foreground">Brouillon</Badge>
  )
}

function AddResourceDialog() {
  const [subject, setSubject] = useState<SubjectKey>('maths')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Ajouter une ressource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une ressource</DialogTitle>
          <DialogDescription>
            Créez une vidéo, un PDF ou un examen blanc pour la bibliothèque.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="res-title">Titre</Label>
            <Input id="res-title" placeholder="Ex. : Théorème de Thalès" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="exam">Examen blanc</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => toast.success('Ressource ajoutée (démo)')}>
              Créer la ressource
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdminRessources() {
  const [allItems] = useState(resources)
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const items =
    subject === 'all' ? allItems : allItems.filter((r) => r.subject === subject)
  const published = items.filter((r) => r.status === 'Publié').length
  const drafts = items.length - published

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1700px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge className="bg-secondary text-foreground">{items.length} ressources</Badge>
          <Badge className="bg-success-soft text-success">{published} publiées</Badge>
          <Badge className="bg-amber-soft text-amber-foreground">{drafts} brouillons</Badge>
        </div>
        <AddResourceDialog />
      </div>

      <SubjectFilter value={subject} onChange={setSubject} />

      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Matière</th>
                <th className="px-5 py-3 font-semibold">Thème</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((res) => {
                const Icon = typeIcons[res.type]
                return (
                  <tr key={res.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{res.title}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className="gap-1.5">
                        <Icon className="size-3" />
                        {res.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{subjectLabel(res.subject)}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {themeLabel(res.theme, res.subject)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{res.date}</td>
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
                          <DropdownMenuItem onClick={() => toast('Ressource dépubliée (démo)')}>
                            <EyeOff className="size-4" />
                            Dépublier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => toast.error('Ressource supprimée (démo)')}
                          >
                            <Trash2 className="size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
