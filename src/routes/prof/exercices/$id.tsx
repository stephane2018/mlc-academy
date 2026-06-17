import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Users,
  Percent,
  Trophy,
  Clock,
  Send,
  FileDown,
  Zap,
  Check,
  X,
  RotateCcw,
  Lock,
  Award,
  AlertCircle,
  Target,
  Eye,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile, SparkBars } from '@/components/blocks'
import { Math as Maths } from '@/components/math'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  domainLabels,
  getAssignment,
  submissionsForAssignment,
  type Assignment,
  type Submission,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/exercices/$id')({
  component: AssignmentResults,
})

/* Méta des statuts de soumission (couleur + icône + libellé) */
const statusMeta = {
  rendu: {
    label: 'Rendu',
    cls: 'bg-success-soft text-success',
    Icon: Check,
  },
  'en cours': {
    label: 'En cours',
    cls: 'bg-secondary text-muted-foreground',
    Icon: Clock,
  },
  'à faire': {
    label: 'À faire',
    cls: 'bg-amber-soft text-amber-foreground',
    Icon: X,
  },
} as const

const typeMeta = {
  devoir: { label: 'Devoir maison', cls: 'bg-brand-soft text-brand' },
  evaluation: { label: 'Éval. surprise', cls: 'bg-amber-soft text-amber-foreground' },
} as const

const assignmentStatusMeta = {
  brouillon: { label: 'Brouillon', cls: 'bg-secondary text-muted-foreground' },
  publié: { label: 'Publié', cls: 'bg-info-soft text-info' },
  clôturé: { label: 'Clôturé', cls: 'bg-success-soft text-success' },
} as const

function NotFound() {
  return (
    <div className="2xl:mx-auto 2xl:max-w-[1700px]">
      <Card className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-soft">
        <SoftIcon tone="amber">
          <AlertCircle className="size-5" />
        </SoftIcon>
        <p className="font-heading text-lg font-bold">Devoir introuvable</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ce devoir n'existe pas ou a été supprimé. Retournez à la liste pour retrouver vos
          exercices.
        </p>
        <Button asChild variant="outline" className="mt-1">
          <Link to="/prof/exercices">
            <ArrowLeft className="size-4" />
            Retour aux devoirs
          </Link>
        </Button>
      </Card>
    </div>
  )
}

/* Dialog « Voir la copie » — correction des questions du devoir */
function CopyDialog({
  assignment,
  submission,
}: {
  assignment: Assignment
  submission: Submission
}) {
  const isDone = submission.status === 'rendu'
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="size-4" />
          Voir la copie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-secondary text-lg">
              {submission.avatar}
            </span>
            Copie de {submission.pseudo}
          </DialogTitle>
          <DialogDescription>
            {isDone ? (
              <>Réponses de l'élève simulées — la correction officielle figure ci-dessous.</>
            ) : (
              <>Copie non rendue : seul le corrigé est affiché.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Score en haut */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3">
          <span className="text-sm font-semibold text-muted-foreground">Score</span>
          {isDone && typeof submission.score === 'number' ? (
            <span className="flex items-center gap-3">
              <Meter value={submission.score} color="auto" className="w-28" />
              <span className="font-heading text-lg font-extrabold tabular-nums">
                {submission.score}%
              </span>
            </span>
          ) : (
            <span className="text-lg font-bold text-muted-foreground">—</span>
          )}
        </div>

        {/* Questions + correction */}
        <ol className="space-y-4">
          {assignment.questions.map((q, i) => {
            const correct = q.options.find((o) => o.id === q.correctId)
            return (
              <li key={q.id} className="rounded-2xl border border-border p-4">
                <p className="text-sm font-semibold">
                  <span className="text-muted-foreground">Q{i + 1}.</span> {q.prompt}
                </p>
                {q.katex && (
                  <div className="mt-2">
                    <Maths expr={q.katex} display />
                  </div>
                )}
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <div className="text-sm">
                    <span className="font-semibold text-success">Bonne réponse : </span>
                    <span className="font-semibold text-success">{correct?.label}</span>
                    {q.explanation && (
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-muted-foreground">
                        {q.explanation}
                        {q.explanationKatex && <Maths expr={q.explanationKatex} />}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </DialogContent>
    </Dialog>
  )
}

function AssignmentResults() {
  const { id } = useParams({ from: '/prof/exercices/$id' })
  const assignment = getAssignment(id)

  if (!assignment) return <NotFound />

  const subs = submissionsForAssignment(id)
  const total = subs.length
  const done = subs.filter((s) => s.status === 'rendu')
  const todo = subs.filter((s) => s.status !== 'rendu')
  const scores = done.map((s) => s.score ?? 0)
  const renderRate = total ? Math.round((done.length / total) * 100) : 0
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0
  const bestScore = scores.length ? Math.max(...scores) : 0

  // Distribution des scores des rendus en 4 tranches
  const buckets = [0, 0, 0, 0]
  for (const sc of scores) {
    const idx = sc >= 75 ? 3 : sc >= 50 ? 2 : sc >= 25 ? 1 : 0
    buckets[idx] += 1
  }

  const tMeta = typeMeta[assignment.type]
  const aStatus = assignmentStatusMeta[assignment.status]

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      {/* Lien retour */}
      <Link
        to="/prof/exercices"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Devoirs
      </Link>

      {/* En-tête */}
      <PageHero
        variant="surface"
        eyebrow="Résultats du devoir"
        title={assignment.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={tMeta.cls}>
              {tMeta.label}
            </Badge>
            <Badge variant="secondary" className="bg-secondary text-foreground">
              {domainLabels[assignment.domain]}
            </Badge>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Clock className="size-4" />
              À rendre le {assignment.dueDate}
            </span>
            <Badge variant="secondary" className={aStatus.cls}>
              {aStatus.label}
            </Badge>
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.info('Relance envoyée', {
                  description: `${todo.length} élève(s) non rendu(s) ont reçu un rappel.`,
                })
              }
            >
              <Send className="size-4" />
              Relancer les non-rendus
            </Button>
            <Button
              onClick={() =>
                toast.success('Devoir clôturé', {
                  description: 'Les scores sont figés et visibles par les élèves.',
                })
              }
            >
              <Lock className="size-4" />
              Clôturer
            </Button>
          </>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Percent} tone="brand" label="Taux de rendu" value={`${renderRate} %`} />
        <StatTile icon={Target} tone="info" label="Score moyen" value={`${avgScore} %`} />
        <StatTile icon={Trophy} tone="amber" label="Meilleur score" value={`${bestScore} %`} />
        <StatTile icon={Users} tone="teal" label="À faire" value={`${todo.length}`} />
      </div>

      <RailLayout
        rail={
          <>
            {/* Synthèse */}
            <Card className="gap-0 p-5">
              <SectionHeader title="Synthèse" />
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rendus</span>
                  <span className="font-bold tabular-nums">
                    {done.length} / {total}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">En attente</span>
                  <span className="font-bold tabular-nums">{todo.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-bold tabular-nums">{assignment.questions.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Publié le</span>
                  <span className="font-bold">{assignment.createdAt}</span>
                </li>
              </ul>
            </Card>

            {/* Encart XP / classement */}
            <Card className="gap-3 p-5">
              <div className="flex items-center gap-3">
                <SoftIcon tone="amber">
                  <Zap className="size-5" />
                </SoftIcon>
                <p className="font-heading text-base font-bold">XP & classement</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-amber-foreground">+{assignment.xpReward} XP</span>{' '}
                sont crédités à chaque élève qui rend le devoir, ce qui fait évoluer le classement du
                groupe.
              </p>
            </Card>

            {/* Actions groupées */}
            <Card className="gap-3 p-5">
              <p className="font-heading text-base font-bold">Actions groupées</p>
              <Button
                className="w-full justify-start"
                onClick={() =>
                  toast.success('Rapports envoyés', {
                    description: 'Visibles dans « Suivi & rapports » de chaque espace parent.',
                  })
                }
              >
                <Send className="size-4" />
                Envoyer tous les rapports
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  toast.info('Export en préparation', {
                    description: 'Le PDF des résultats sera disponible dans quelques instants.',
                  })
                }
              >
                <FileDown className="size-4" />
                Exporter les résultats PDF
              </Button>
            </Card>
          </>
        }
      >
        {/* Distribution des scores */}
        <section>
          <SectionHeader title="Distribution des scores" />
          <Card className="gap-4 p-5 shadow-soft">
            {scores.length ? (
              <>
                <SparkBars
                  data={buckets}
                  labels={['0–25', '25–50', '50–75', '75–100']}
                  color="var(--brand)"
                  height={80}
                />
                <p className="text-xs text-muted-foreground">
                  Répartition des {scores.length} copie(s) rendue(s) par tranche de score.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune copie rendue pour le moment.
              </p>
            )}
          </Card>
        </section>

        {/* Tableau des élèves */}
        <section>
          <SectionHeader title="Résultats des élèves" />
          <Card className="overflow-hidden p-0 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Élève</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="hidden px-4 py-3 md:table-cell">Rendu le</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => {
                    const sm = statusMeta[s.status]
                    const isDone = s.status === 'rendu'
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
                            <span className="font-semibold">{s.pseudo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={sm.cls}>
                            <sm.Icon className="size-3.5" />
                            {sm.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {isDone && typeof s.score === 'number' ? (
                            <div className="flex items-center gap-2">
                              <Meter value={s.score} color="auto" className="w-20" />
                              <span className="w-9 text-right text-xs font-bold tabular-nums">
                                {s.score}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {s.submittedAt ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <CopyDialog assignment={assignment} submission={s} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toast.success('Rapport envoyé au parent', {
                                  description: `Visible dans l'espace parent de ${s.pseudo} (Suivi & rapports).`,
                                })
                              }
                            >
                              <Send className="size-4" />
                              <span className="hidden sm:inline">Rapport parent</span>
                            </Button>
                            {!isDone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toast.info('Relance envoyée', {
                                    description: `${s.pseudo} a reçu un rappel.`,
                                  })
                                }
                              >
                                <RotateCcw className="size-4" />
                                <span className="hidden sm:inline">Relancer</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Rappel XP (mobile / contenu principal) */}
        <Card className="flex items-center gap-3 p-5 shadow-soft xl:hidden">
          <SoftIcon tone="amber">
            <Award className="size-5" />
          </SoftIcon>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-amber-foreground">+{assignment.xpReward} XP</span> par
            devoir rendu — le classement du groupe évolue à chaque copie.
          </p>
        </Card>
      </RailLayout>
    </div>
  )
}
