import { useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Users,
  Percent,
  Trophy,
  Clock,
  CheckSquare,
  Zap,
  Check,
  Lock,
  Award,
  AlertCircle,
  Target,
  Eye,
  Pencil,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { spreadAvatar } from '@/lib/avatar'
import { PageHero, RailLayout, StatTile, SparkBars } from '@/components/blocks'
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
} from '@/components/ui/dialog'
import { QueryError } from '@/components/query-error'
import {
  useAssignment,
  useAssignmentSubmissions,
  useGradeSubmission,
  useUpdateAssignmentStatus,
} from '@/hooks/use-assignments'
import { assignmentsService, type AssignmentSubmissionRow } from '@/services/assignments'
import { useSubjects } from '@/hooks/use-catalog'

export const Route = createFileRoute('/prof/exercices/$id')({
  component: AssignmentResults,
})

const typeMeta: Record<string, { label: string; cls: string }> = {
  devoir: { label: 'Devoir maison', cls: 'bg-brand-soft text-brand' },
  evaluation: { label: 'Éval. surprise', cls: 'bg-amber-soft text-amber-foreground' },
}
const aStatusMeta: Record<string, { label: string; cls: string }> = {
  brouillon: { label: 'Brouillon', cls: 'bg-secondary text-muted-foreground' },
  publie: { label: 'Publié', cls: 'bg-info-soft text-info' },
  cloture: { label: 'Clôturé', cls: 'bg-success-soft text-success' },
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const fmtDate = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : '—')

function NotFoundCard() {
  return (
    <div className="2xl:mx-auto 2xl:max-w-[1700px]">
      <Card className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-soft">
        <SoftIcon tone="amber">
          <AlertCircle className="size-5" />
        </SoftIcon>
        <p className="font-heading text-lg font-bold">Devoir introuvable</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ce devoir n'existe pas ou a été supprimé.
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

function AssignmentResults() {
  const { id } = useParams({ from: '/prof/exercices/$id' })
  const assignmentQ = useAssignment(id)
  const { data: assignment, isLoading } = assignmentQ
  const { data: subs = [] } = useAssignmentSubmissions(id)
  const { data: subjects = [] } = useSubjects()
  const updateStatus = useUpdateAssignmentStatus()
  const [grading, setGrading] = useState<AssignmentSubmissionRow | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)

  async function viewFile(row: AssignmentSubmissionRow) {
    if (viewingId) return
    setViewingId(row.studentId)
    try {
      const { url } = await assignmentsService.submissionFileUrl(id, row.studentId)
      window.open(url, '_blank', 'noopener')
    } catch {
      toast.error("Impossible d'ouvrir la copie.")
    } finally {
      setViewingId(null)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chargement…</div>
  }
  if (assignmentQ.isError) {
    return (
      <div className="2xl:mx-auto 2xl:max-w-[1700px]">
        <QueryError onRetry={() => assignmentQ.refetch()} />
      </div>
    )
  }
  if (!assignment) return <NotFoundCard />

  const subject = subjects.find((s) => s.id === assignment.subjectId)
  const themeName = assignment.themeId ? subjects.flatMap((s) => s.themes).find((t) => t.id === assignment.themeId)?.name : null

  const done = subs.filter((s) => s.status === 'rendu')
  const scores = done.map((s) => s.score ?? 0)
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const bestScore = scores.length ? Math.max(...scores) : 0

  const buckets = [0, 0, 0, 0]
  for (const sc of scores) buckets[sc >= 75 ? 3 : sc >= 50 ? 2 : sc >= 25 ? 1 : 0] += 1

  const tMeta = typeMeta[assignment.type] ?? typeMeta.devoir
  const aStatus = aStatusMeta[assignment.status] ?? aStatusMeta.brouillon

  function close() {
    updateStatus.mutate(
      { id, status: 'cloture' },
      {
        onSuccess: () => toast.success('Devoir clôturé', { description: 'Les scores sont figés.' }),
        onError: () => toast.error('Échec de la clôture.'),
      },
    )
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <Link
        to="/prof/exercices"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Devoirs
      </Link>

      <PageHero
        variant="surface"
        eyebrow="Résultats du devoir"
        title={assignment.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={tMeta.cls}>{tMeta.label}</Badge>
            {subject && (
              <Badge variant="secondary" className="border-transparent text-white" style={{ backgroundColor: subject.color ?? 'var(--brand)' }}>
                {subject.name}
              </Badge>
            )}
            {themeName && <Badge variant="secondary" className="bg-secondary text-foreground">{themeName}</Badge>}
            {assignment.dueDate && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <Clock className="size-4" />
                À rendre le {assignment.dueDate}
              </span>
            )}
            <Badge variant="secondary" className={aStatus.cls}>{aStatus.label}</Badge>
          </span>
        }
        actions={
          assignment.status !== 'cloture' ? (
            <Button onClick={close} disabled={updateStatus.isPending}>
              <Lock className="size-4" />
              Clôturer
            </Button>
          ) : undefined
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Users} tone="brand" label="Copies rendues" value={done.length} />
        <StatTile icon={Percent} tone="info" label="Score moyen" value={`${avgScore} %`} />
        <StatTile icon={Trophy} tone="amber" label="Meilleur score" value={`${bestScore} %`} />
        <StatTile icon={CheckSquare} tone="teal" label="Questions" value={assignment.questionCount} />
      </div>

      <RailLayout
        rail={
          <>
            <Card className="gap-0 p-5">
              <SectionHeader title="Synthèse" />
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Copies rendues</span>
                  <span className="font-bold tabular-nums">{done.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-bold tabular-nums">{assignment.questionCount}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Récompense</span>
                  <span className="font-bold tabular-nums">+{assignment.xpReward} XP</span>
                </li>
              </ul>
            </Card>

            <Card className="gap-3 p-5">
              <div className="flex items-center gap-3">
                <SoftIcon tone="amber">
                  <Zap className="size-5" />
                </SoftIcon>
                <p className="font-heading text-base font-bold">XP & classement</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-amber-foreground">+{assignment.xpReward} XP</span> sont crédités à
                chaque élève qui rend le devoir, ce qui fait évoluer le classement du groupe.
              </p>
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
                <SparkBars data={buckets} labels={['0–25', '25–50', '50–75', '75–100']} color="var(--brand)" height={80} />
                <p className="text-xs text-muted-foreground">
                  Répartition des {scores.length} copie(s) rendue(s) par tranche de score.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune copie rendue pour le moment.</p>
            )}
          </Card>
        </section>

        {/* Tableau des élèves */}
        <section>
          <SectionHeader title="Résultats des élèves" />
          <Card className="overflow-hidden p-0 shadow-soft">
            {subs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
                  <Target className="size-6 text-muted-foreground" />
                </span>
                <p className="text-sm text-muted-foreground">Aucune copie rendue pour l'instant.</p>
              </div>
            ) : (
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
                    {subs.map((s) => (
                      <tr key={s.studentId} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-9 place-items-center rounded-xl bg-secondary text-lg">{spreadAvatar(s.avatar, s.pseudo)}</span>
                            <span className="font-semibold">{s.pseudo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {s.hasFile && s.score === null ? (
                            <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">
                              <AlertCircle className="size-3.5" />
                              À corriger
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-success-soft text-success">
                              <Check className="size-3.5" />
                              Rendu
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {typeof s.score === 'number' ? (
                            <div className="flex items-center gap-2">
                              <Meter value={s.score} color="auto" className="w-20" />
                              <span className="w-12 text-right text-xs font-bold tabular-nums">{s.score}/100</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{fmtDate(s.submittedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {s.hasFile && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                disabled={viewingId === s.studentId}
                                onClick={() => viewFile(s)}
                              >
                                <Eye className="size-4" />
                                Voir la copie
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="rounded-lg"
                              onClick={() => setGrading(s)}
                            >
                              <Pencil className="size-4" />
                              Noter
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        <Card className="flex items-center gap-3 p-5 shadow-soft xl:hidden">
          <SoftIcon tone="amber">
            <Award className="size-5" />
          </SoftIcon>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-amber-foreground">+{assignment.xpReward} XP</span> par devoir rendu.
          </p>
        </Card>
      </RailLayout>

      <GradeDialog assignmentId={id} row={grading} onClose={() => setGrading(null)} />
    </div>
  )
}

function GradeDialog({
  assignmentId,
  row,
  onClose,
}: {
  assignmentId: string
  row: AssignmentSubmissionRow | null
  onClose: () => void
}) {
  const grade = useGradeSubmission()
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')

  // Re-synchronise les champs à chaque ouverture sur une nouvelle copie.
  const [lastId, setLastId] = useState<string | null>(null)
  if (row && row.studentId !== lastId) {
    setLastId(row.studentId)
    setScore(row.score === null ? '' : String(row.score))
    setFeedback(row.feedback ?? '')
  }

  function save() {
    if (!row) return
    const parsed = Number(score)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      toast.error('La note doit être un entier entre 0 et 100.')
      return
    }
    grade.mutate(
      { id: assignmentId, studentId: row.studentId, score: parsed, feedback: feedback.trim() || null },
      {
        onSuccess: () => {
          toast.success('Note enregistrée.')
          onClose()
        },
        onError: () => toast.error("Échec de l'enregistrement de la note."),
      },
    )
  }

  return (
    <Dialog open={row !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Noter la copie</DialogTitle>
          <DialogDescription>{row ? `Copie de ${row.pseudo}.` : ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="grade-score">Note (sur 100)</Label>
            <Input
              id="grade-score"
              type="number"
              min={0}
              max={100}
              step={1}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0 à 100"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grade-feedback">Récap de correction</Label>
            <Textarea
              id="grade-feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Points forts, erreurs à revoir…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={grade.isPending}>
            Annuler
          </Button>
          <Button type="button" onClick={save} disabled={grade.isPending}>
            {grade.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
