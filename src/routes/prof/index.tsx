import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Users,
  TrendingUp,
  Radio,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  FileDown,
  Clock,
} from '@/components/icons'
import { toast } from 'sonner'
import { Meter, SectionHeader } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile, SparkArea, SparkBars } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { profGroups, profStudents } from '@/lib/mock'

export const Route = createFileRoute('/prof/')({
  component: ProfOverview,
})

/* Données de tendance mockées (locales à l'écran) */
const followedTrend = [52, 55, 58, 60, 63, 65, 68]
const progressTrend = [56, 60, 58, 62, 61, 64, 64]
const weakSpots = [
  { label: 'Géométrie', value: 38, color: 'amber' as const },
  { label: 'Statistiques', value: 52, color: 'brand' as const },
  { label: 'Nombres', value: 81, color: 'success' as const },
]

const trendMeta = {
  up: { Icon: ArrowUpRight, cls: 'text-success' },
  down: { Icon: ArrowDownRight, cls: 'text-destructive' },
  flat: { Icon: Minus, cls: 'text-muted-foreground' },
} as const

function AssignDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start">
          <Target className="size-4" />
          Assigner un exercice ciblé
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner un exercice ciblé</DialogTitle>
          <DialogDescription>
            Assignation rapide par consigne, ou crée un devoir interactif complet.
          </DialogDescription>
        </DialogHeader>
        <Link
          to="/prof/exercices/nouveau"
          className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-soft p-3 text-sm transition-colors hover:bg-brand-soft/70"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-white">
            <Target className="size-4" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-brand">Créer un devoir interactif</span>
            <span className="block text-xs text-muted-foreground">Questions, correction auto, XP — répondu dans l'app</span>
          </span>
          <span className="text-brand">→</span>
        </Link>
        <div className="relative my-1 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
          ou assignation rapide
        </div>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="assign-student">Élève</Label>
            <Select>
              <SelectTrigger id="assign-student" className="w-full">
                <SelectValue placeholder="Sélectionner un élève" />
              </SelectTrigger>
              <SelectContent>
                {profStudents.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.avatar} {s.pseudo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assign-domain">Domaine</Label>
            <Select>
              <SelectTrigger id="assign-domain" className="w-full">
                <SelectValue placeholder="Sélectionner un domaine" />
              </SelectTrigger>
              <SelectContent>
                {['Nombres', 'Algèbre', 'Géométrie', 'Mesures', 'Statistiques'].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assign-note">Consigne</Label>
            <Textarea
              id="assign-note"
              placeholder="Ex : 10 exercices sur les aires de figures composées avant vendredi."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button
            onClick={() => {
              setOpen(false)
              toast.success('Exercice assigné', {
                description: "L'élève recevra une notification.",
              })
            }}
          >
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProfOverview() {
  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      {/* Bandeau d'accueil léger — la topbar porte déjà le titre de page */}
      <PageHero
        eyebrow="Espace Prof"
        title="Bonjour, Prof. Hibou 👋"
        subtitle="Voici l'état de vos groupes et la prochaine échéance."
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Users}
          tone="brand"
          label="Élèves suivis"
          value="68"
          delta="+5"
          trend="up"
          spark={<SparkArea data={followedTrend} color="var(--brand)" />}
        />
        <StatTile
          icon={TrendingUp}
          tone="info"
          label="Progression moyenne"
          value="64 %"
          delta="+4 pts"
          trend="up"
          spark={<SparkBars data={progressTrend} color="var(--brand)" height={56} />}
        />
        <StatTile
          icon={Radio}
          tone="teal"
          label="Prochaine séance live"
          value="Auj. 18:30"
          spark={
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal/60" />
                <span className="relative inline-flex size-2 rounded-full bg-teal" />
              </span>
              Groupe A · Fractions & proportions
            </span>
          }
        />
      </div>

      <RailLayout
        rail={
          <>
            {/* Points faibles du groupe */}
            <Card className="gap-0 p-5">
              <SectionHeader title="Points faibles du groupe" />
              <ul className="space-y-4">
                {weakSpots.map((w) => (
                  <li key={w.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{w.label}</span>
                      <span className="font-bold tabular-nums">{w.value}%</span>
                    </div>
                    <Meter value={w.value} color={w.color} />
                  </li>
                ))}
              </ul>
            </Card>

            {/* Prochaine séance */}
            <Card className="gap-0 p-5">
              <p className="font-heading text-base font-bold">Prochaine séance</p>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-teal-soft p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal text-white">
                  <Radio className="size-5" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-bold">Fractions & proportions</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> Aujourd'hui · 18:30 · Groupe A
                  </p>
                </div>
              </div>
              <Button className="mt-3 w-full">Démarrer la séance</Button>
            </Card>

            {/* Actions rapides */}
            <Card className="gap-3 p-5">
              <p className="font-heading text-base font-bold">Actions rapides</p>
              <AssignDialog />
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  toast.info('Rapport en préparation', {
                    description: 'Le PDF sera disponible dans quelques instants.',
                  })
                }
              >
                <FileDown className="size-4" />
                Exporter le rapport PDF
              </Button>
            </Card>
          </>
        }
      >
        {/* Mes groupes */}
        <section>
          <SectionHeader title="Mes groupes" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profGroups.map((g) => (
              <Card key={g.id} className="card-hover gap-0 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading text-base font-bold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.students} élèves</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">
                    {g.level}
                  </Badge>
                </div>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  Code :{' '}
                  <span className="font-mono font-bold text-foreground">
                    {g.id.toUpperCase()}-{g.level}
                  </span>
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Meter value={g.avgScore} color="auto" />
                  <span className="shrink-0 text-sm font-bold tabular-nums">{g.avgScore}%</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">Progression moyenne</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Suivi des élèves */}
        <section>
          <SectionHeader title="Suivi des élèves" />
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Élève</th>
                    <th className="px-4 py-3">Progression</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Série</th>
                    <th className="hidden px-4 py-3 md:table-cell">Dernière activité</th>
                    <th className="px-4 py-3">État</th>
                  </tr>
                </thead>
                <tbody>
                  {profStudents.map((s, i) => {
                    const { Icon, cls } = trendMeta[s.trend]
                    const watch = s.trend === 'down'
                    const streak = 12 - i * 2
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-9 place-items-center rounded-xl bg-secondary text-lg">
                              {s.avatar}
                            </span>
                            <div className="leading-tight">
                              <p className="font-semibold">{s.pseudo}</p>
                              <p className="text-xs text-muted-foreground">{s.group}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Meter value={s.avgScore} color="auto" className="w-24" />
                            <span className="w-9 text-right text-xs font-bold tabular-nums">
                              {s.avgScore}%
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            {streak} <Flame className="size-4 text-amber" />
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {s.lastSeen}
                        </td>
                        <td className="px-4 py-3">
                          {watch ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-soft text-amber-foreground"
                            >
                              <Icon className={`size-3.5 ${cls}`} /> À surveiller
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-success-soft text-success">
                              <Icon className={`size-3.5 ${cls}`} /> Actif
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </RailLayout>
    </div>
  )
}
