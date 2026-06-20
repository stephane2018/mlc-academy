import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FileText, Inbox, Trophy, CheckCircle2, AlertCircle, Dumbbell, Clock, Download } from '@/components/icons'
import { Meter, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
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
import { useChildren, useChildOverview, useChildAssignments } from '@/hooks/use-parent'
import { useReports, useReport, useMarkReportRead, useReportPdf } from '@/hooks/use-reports'
import { useSubjects } from '@/hooks/use-catalog'

export const Route = createFileRoute('/parent/devoirs')({
  component: ParentDevoirs,
})

const kindLabel: Record<string, string> = {
  devoir: 'Devoir',
  evaluation: 'Évaluation',
  mensuel: 'Bilan mensuel',
}

const typeBadge: Record<string, string> = {
  devoir: 'bg-brand-soft text-brand',
  evaluation: 'bg-amber-soft text-amber-foreground',
}

function ParentDevoirs() {
  const [openId, setOpenId] = useState<string | null>(null)
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const overview = useChildOverview(child?.id)
  const reportsQuery = useReports({ limit: 50 })
  const assignmentsQuery = useChildAssignments(child?.id)
  const subjectsQuery = useSubjects()

  const reports = reportsQuery.data ?? []
  const unread = reports.filter((r) => !r.read).length
  const avgScore = overview.data?.avgScore

  const assignments = assignmentsQuery.data ?? []
  const pending = assignments.filter((a) => a.status !== 'rendu').length

  const subjectName = (id: string) => subjectsQuery.data?.find((s) => s.id === id)?.name ?? '—'

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1300px]">
      <PageHero
        eyebrow="Espace Parent"
        title="Suivi & rapports"
        subtitle={child ? `Devoirs, évaluations et bulletins de ${child.pseudo}.` : 'Devoirs, évaluations et bulletins.'}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={Inbox} tone="brand" label="Rapports non lus" value={unread} />
        <StatTile icon={Dumbbell} tone="amber" label="Devoirs en attente" value={pending} />
        <StatTile icon={Trophy} tone="success" label="Score moyen" value={avgScore != null ? `${avgScore}%` : '—'} />
        <StatTile icon={CheckCircle2} tone="teal" label="Rapports reçus" value={reports.length} />
      </div>

      <RailLayout
        rail={
          <Card className="gap-0 rounded-2xl p-4 shadow-soft">
            <p className="mb-1 font-heading font-bold">Bon à savoir</p>
            <p className="text-sm text-muted-foreground">
              Vous recevez un rapport à chaque évaluation notée et un bilan régulier. L'espace parent
              est en <span className="font-semibold text-foreground">lecture seule</span>.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-info-soft p-3 text-xs text-info">
              <AlertCircle className="size-4 shrink-0" />
              Une alerte vous est envoyée en cas d'inactivité prolongée de votre enfant.
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

          {reportsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : reports.length === 0 ? (
            <p className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Aucun rapport pour l'instant.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {reports.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(r.id)}
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
                        {kindLabel[r.kind] ?? r.kind} ·{' '}
                        {new Date(r.createdAt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long' })}
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
          )}
        </Card>

        {/* Devoirs & évaluations */}
        <Card className="gap-0 p-4 sm:p-5">
          <p className="mb-3 font-heading text-lg font-bold">Devoirs & évaluations</p>
          {assignmentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : assignments.length === 0 ? (
            <p className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Aucun devoir assigné pour l'instant.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {assignments.map((a) => {
                const rendu = a.status === 'rendu'
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                    <SoftIcon tone={a.type === 'evaluation' ? 'amber' : 'brand'} className="size-10 shrink-0">
                      <Dumbbell className="size-5" />
                    </SoftIcon>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{a.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className={typeBadge[a.type] ?? ''}>
                          {kindLabel[a.type] ?? a.type}
                        </Badge>
                        <Badge variant="outline">{subjectName(a.subjectId)}</Badge>
                        {!rendu && a.dueDate && (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-foreground">
                            <Clock className="size-3" /> à rendre ·{' '}
                            {new Date(a.dueDate).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    {rendu ? (
                      <div className="hidden w-24 items-center gap-2 sm:flex">
                        <Meter value={a.score ?? 0} color="auto" />
                        <span className="w-9 text-right text-xs font-bold tabular-nums">{a.score ?? 0}%</span>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">
                        {a.status === 'en_cours' ? 'En cours' : 'À faire'}
                      </Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </RailLayout>

      <ReportDialog reportId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

/** Détail d'un rapport ; marque lu à l'ouverture, télécharge le PDF à la demande. */
function ReportDialog({ reportId, onClose }: { reportId: string | null; onClose: () => void }) {
  const { data: report, isLoading } = useReport(reportId ?? '')
  const markRead = useMarkReportRead()
  const pdf = useReportPdf()

  useEffect(() => {
    if (report && !report.read) markRead.mutate(report.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id])

  function downloadPdf() {
    if (!report) return
    pdf.mutate(report.id, {
      onSuccess: ({ url }) => window.open(url, '_blank', 'noopener'),
      onError: () => toast.error('PDF indisponible pour ce rapport.'),
    })
  }

  return (
    <Dialog open={!!reportId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {isLoading || !report ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <>
            <DialogHeader>
              <Badge variant="secondary" className="w-fit bg-brand-soft capitalize text-brand">
                {kindLabel[report.kind] ?? report.kind}
              </Badge>
              <DialogTitle>{report.title}</DialogTitle>
              <DialogDescription>
                {new Date(report.createdAt).toLocaleDateString('fr-BE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
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
            {report.summary && <p className="text-sm leading-relaxed text-foreground/80">{report.summary}</p>}
            {report.storagePath && (
              <Button onClick={downloadPdf} disabled={pdf.isPending} className="w-full">
                <Download className="size-4" /> {pdf.isPending ? 'Préparation…' : 'Télécharger le PDF'}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
