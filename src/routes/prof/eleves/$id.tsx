import { useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  Flame,
  Percent,
  Zap,
  Target,
  MessageSquare,
  FileDown,
  AlertCircle,
  CheckCircle2,
  EyeOff,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile, SparkBars } from '@/components/blocks'
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
import { domainLabels, getStudentDetail } from '@/lib/mock'

export const Route = createFileRoute('/prof/eleves/$id')({
  component: ProfStudentDetail,
})

const trendMeta = {
  up: { Icon: ArrowUpRight, cls: 'text-success', label: 'En hausse', delta: '+6 pts' as const },
  down: { Icon: ArrowDownRight, cls: 'text-destructive', label: 'En baisse', delta: '-4 pts' as const },
  flat: { Icon: Minus, cls: 'text-muted-foreground', label: 'Stable', delta: '0 pt' as const },
} as const

function NotFound() {
  return (
    <div className="2xl:mx-auto 2xl:max-w-[1700px]">
      <Card className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-soft">
        <SoftIcon tone="amber">
          <AlertCircle className="size-5" />
        </SoftIcon>
        <p className="font-heading text-lg font-bold">Élève introuvable</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Cette fiche n'existe pas ou a été supprimée. Retournez à l'annuaire pour retrouver vos
          élèves.
        </p>
        <Button asChild variant="outline" className="mt-1">
          <Link to="/prof/eleves">
            <ArrowLeft className="size-4" />
            Retour à l'annuaire
          </Link>
        </Button>
      </Card>
    </div>
  )
}

function AssignDialog({ pseudo }: { pseudo: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start">
          <Target className="size-4" />
          Assigner un exercice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner un exercice à {pseudo}</DialogTitle>
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
        <div className="my-1 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
          ou assignation rapide
        </div>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="assign-domain">Domaine</Label>
            <Select>
              <SelectTrigger id="assign-domain" className="w-full">
                <SelectValue placeholder="Sélectionner un domaine" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(domainLabels).map((d) => (
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
                description: `${pseudo} recevra une notification.`,
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

function ProfStudentDetail() {
  const { id } = useParams({ from: '/prof/eleves/$id' })
  const detail = getStudentDetail(id)
  const [note, setNote] = useState(detail?.note ?? '')

  if (!detail) return <NotFound />

  const trend = trendMeta[detail.trend]

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      {/* Lien retour */}
      <Link
        to="/prof/eleves"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Annuaire
      </Link>

      {/* En-tête */}
      <PageHero
        eyebrow="Fiche élève"
        title={
          <span className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-2xl">
              {detail.avatar}
            </span>
            {detail.pseudo}
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-brand-soft text-brand">
              {detail.group}
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Zap className="size-4 text-amber" />
              Niveau {detail.level} · {detail.xp} XP
            </span>
          </span>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={TrendingUp}
          tone="brand"
          label="Score moyen"
          value={`${detail.avgScore} %`}
          delta={trend.delta}
          trend={detail.trend === 'down' ? 'down' : 'up'}
        />
        <StatTile
          icon={Flame}
          tone="amber"
          label="Série en cours"
          value={`${detail.streak} j`}
        />
        <StatTile
          icon={Percent}
          tone="teal"
          label="Taux de présence"
          value={`${detail.attendanceRate} %`}
        />
        <StatTile icon={Zap} tone="info" label="Expérience" value={`${detail.xp} XP`} />
      </div>

      <RailLayout
        rail={
          <>
            {/* Notes privées */}
            <Card className="gap-3 p-5">
              <div>
                <p className="font-heading text-base font-bold">Notes privées</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <EyeOff className="size-3.5" />
                  Visible par vous seul
                </p>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Observations, points de vigilance, objectifs…"
                rows={5}
              />
              <Button
                className="w-full"
                onClick={() =>
                  toast.success('Note enregistrée', {
                    description: 'Votre note privée a été sauvegardée.',
                  })
                }
              >
                Enregistrer
              </Button>
            </Card>

            {/* Actions */}
            <Card className="gap-3 p-5">
              <p className="font-heading text-base font-bold">Actions</p>
              <AssignDialog pseudo={detail.pseudo} />
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/prof/messages">
                  <MessageSquare className="size-4" />
                  Envoyer un message
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  toast.info('Export en préparation', {
                    description: 'La fiche PDF sera disponible dans quelques instants.',
                  })
                }
              >
                <FileDown className="size-4" />
                Exporter la fiche PDF
              </Button>
            </Card>
          </>
        }
      >
        {/* Progression par domaine */}
        <section>
          <SectionHeader title="Progression par domaine" />
          <Card className="gap-4 p-5 shadow-soft">
            <ul className="space-y-4">
              {detail.domainMastery.map((d) => (
                <li key={d.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.label}</span>
                    <span className="font-bold tabular-nums">{d.mastery}%</span>
                  </div>
                  <Meter value={d.mastery} color="auto" />
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vue d'ensemble
              </p>
              <SparkBars
                data={detail.domainMastery.map((d) => d.mastery)}
                labels={detail.domainMastery.map((d) => d.label)}
                color="var(--brand)"
                height={72}
              />
            </div>
          </Card>
        </section>

        {/* Historique d'activité */}
        <section>
          <SectionHeader title="Historique d'activité" />
          <Card className="p-5 shadow-soft">
            <ol className="relative space-y-5 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
              {detail.history.map((h, i) => (
                <li key={i} className="relative flex items-start gap-3 pl-6">
                  <span className="absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-brand bg-card" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{h.label}</p>
                      {typeof h.score === 'number' ? (
                        <Badge variant="secondary" className="bg-success-soft text-success">
                          <CheckCircle2 className="size-3.5" />
                          {h.score}%
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{h.date}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* Erreurs récurrentes */}
        <section>
          <SectionHeader title="Erreurs récurrentes" />
          <Card className="gap-3 p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">
              Notions à retravailler en priorité, classées par fréquence d'erreur.
            </p>
            <ul className="space-y-2.5">
              {detail.errors.map((e, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-3.5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <SoftIcon tone="amber">
                      <AlertCircle className="size-5" />
                    </SoftIcon>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{e.topic}</p>
                      <Badge variant="secondary" className="mt-1 bg-brand-soft text-brand">
                        {domainLabels[e.domain]}
                      </Badge>
                    </div>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-sm font-bold tabular-nums text-destructive">
                    {e.count}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </RailLayout>
    </div>
  )
}
