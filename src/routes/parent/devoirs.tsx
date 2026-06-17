import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  FileText,
  Download,
  Dumbbell,
  Clock,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Inbox,
} from '@/components/icons'
import { toast } from 'sonner'
import { Meter, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
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
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  parentReports,
  childAssignments,
  parentChild,
  domainLabels,
  type Assignment,
  type ParentReport,
} from '@/lib/mock'

export const Route = createFileRoute('/parent/devoirs')({
  component: ParentDevoirs,
})

const CHILD_ID = 's1'
const CHILD_GROUP = 'Groupe A'

const typeBadge: Record<string, { label: string; cls: string }> = {
  devoir: { label: 'Devoir maison', cls: 'bg-brand-soft text-brand' },
  evaluation: { label: 'Éval. surprise', cls: 'bg-amber-soft text-amber-foreground' },
}

function ParentDevoirs() {
  const [openReport, setOpenReport] = useState<ParentReport | null>(null)
  const [openExam, setOpenExam] = useState<Assignment | null>(null)

  const items = childAssignments(CHILD_ID, CHILD_GROUP, parentChild.pseudo)
  const unread = parentReports.filter((r) => !r.read).length
  const pending = items.filter((i) => i.submission?.status !== 'rendu').length
  const done = items.filter((i) => i.submission?.status === 'rendu')
  const avg = done.length
    ? Math.round(done.reduce((s, i) => s + (i.submission?.score ?? 0), 0) / done.length)
    : 0

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1300px]">
      <PageHero
        eyebrow="Espace Parent"
        title="Suivi & rapports"
        subtitle={`Devoirs, évaluations et bulletins de ${parentChild.pseudo}.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Inbox} tone="brand" label="Rapports non lus" value={unread} />
        <StatTile icon={Dumbbell} tone="amber" label="Devoirs en attente" value={pending} />
        <StatTile icon={Trophy} tone="success" label="Score moyen" value={`${avg}%`} />
        <StatTile icon={CheckCircle2} tone="teal" label="Devoirs rendus" value={done.length} />
      </div>

      <RailLayout
        rail={
          <Card className="gap-0 rounded-2xl p-4 shadow-soft">
            <p className="mb-1 font-heading font-bold">Bon à savoir</p>
            <p className="text-sm text-muted-foreground">
              Vous recevez un rapport à chaque évaluation notée et un bulletin chaque mois. L'espace
              parent est en <span className="font-semibold text-foreground">lecture seule</span>.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-info-soft p-3 text-xs text-info">
              <AlertCircle className="size-4 shrink-0" />
              Une alerte vous est envoyée si un devoir n'est pas rendu à temps.
            </div>
          </Card>
        }
      >
        {/* Rapports reçus */}
        <Card className="gap-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-lg font-bold">Rapports reçus</p>
            {unread > 0 && (
              <Badge variant="secondary" className="bg-brand-soft text-brand">
                {unread} non lu{unread > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <ul className="space-y-2.5">
            {parentReports.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenReport(r)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <SoftIcon tone={r.kind === 'mensuel' ? 'teal' : 'brand'} className="size-10 shrink-0">
                    <FileText className="size-5" />
                  </SoftIcon>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{r.title}</p>
                      {!r.read && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.teacher} · {r.date}
                    </p>
                  </div>
                  {r.score != null && (
                    <Badge
                      variant="secondary"
                      className={r.score >= 50 ? 'bg-success-soft text-success' : 'bg-destructive/10 text-destructive'}
                    >
                      {r.score}%
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Devoirs & évaluations */}
        <Card className="gap-0 p-4 sm:p-5">
          <p className="mb-3 font-heading text-lg font-bold">Devoirs & évaluations</p>
          <ul className="space-y-2.5">
            {items.map(({ assignment: a, submission: sub }) => {
              const tb = typeBadge[a.type]
              const rendu = sub?.status === 'rendu'
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                >
                  <SoftIcon tone={a.type === 'evaluation' ? 'amber' : 'brand'} className="size-10 shrink-0">
                    <Dumbbell className="size-5" />
                  </SoftIcon>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className={tb.cls}>{tb.label}</Badge>
                      <span>{domainLabels[a.domain]}</span>
                      {!rendu && (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-foreground">
                          <Clock className="size-3" /> à rendre · {a.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  {rendu ? (
                    <div className="flex items-center gap-3">
                      <div className="hidden w-24 items-center gap-2 sm:flex">
                        <Meter value={sub!.score ?? 0} color="auto" />
                        <span className="w-9 text-right text-xs font-bold tabular-nums">{sub!.score}%</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setOpenExam(a)}>
                        Détail
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">
                      À faire
                    </Badge>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      </RailLayout>

      <ReportDialog report={openReport} onClose={() => setOpenReport(null)} />
      <ExamDetailDialog
        assignment={openExam}
        score={openExam ? items.find((i) => i.assignment.id === openExam.id)?.submission?.score : undefined}
        onClose={() => setOpenExam(null)}
      />
    </div>
  )
}

function ReportDialog({ report, onClose }: { report: ParentReport | null; onClose: () => void }) {
  if (!report) return null
  return (
    <Dialog open={!!report} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <Badge variant="secondary" className="w-fit bg-brand-soft capitalize text-brand">
            {report.kind}
          </Badge>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>
            {report.teacher} · {report.date}
          </DialogDescription>
        </DialogHeader>
        {report.score != null && (
          <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
            <Trophy className="size-6 text-amber" />
            <div>
              <p className="font-heading text-xl font-bold">{report.score}%</p>
              <p className="text-xs text-muted-foreground">Résultat de l'enfant</p>
            </div>
          </div>
        )}
        <p className="text-sm leading-relaxed text-foreground/80">{report.summary}</p>
        <Button onClick={() => toast.success('Rapport téléchargé (PDF)')} className="w-full">
          <Download className="size-4" /> Télécharger le PDF
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function ExamDetailDialog({
  assignment,
  score,
  onClose,
}: {
  assignment: Assignment | null
  score?: number
  onClose: () => void
}) {
  if (!assignment) return null
  return (
    <Dialog open={!!assignment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            {domainLabels[assignment.domain]} · {assignment.questions.length} questions
          </DialogDescription>
        </DialogHeader>
        {score != null && (
          <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
            <span className={cn('font-heading text-2xl font-extrabold', score >= 50 ? 'text-success' : 'text-destructive')}>
              {score}%
            </span>
            <span className="text-sm text-muted-foreground">
              {score >= 50 ? 'Validé' : 'Non validé'} · résultat de {parentChild.pseudo}
            </span>
          </div>
        )}
        <ol className="space-y-3">
          {assignment.questions.map((q, i) => {
            const correct = q.options.find((o) => o.id === q.correctId)
            return (
              <li key={q.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">
                  {i + 1}. {q.prompt}
                </p>
                {q.katex && (
                  <div className="my-2">
                    <Maths expr={q.katex} display />
                  </div>
                )}
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <Check className="size-4" /> Bonne réponse : {correct?.label}
                </p>
              </li>
            )
          })}
        </ol>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <X className="size-3.5" /> Espace parent en lecture seule — vous ne pouvez pas répondre à la place de l'enfant.
        </p>
      </DialogContent>
    </Dialog>
  )
}
