import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FileText, Inbox, Trophy, CheckCircle2, AlertCircle, Dumbbell } from '@/components/icons'
import { SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useChildren, useChildOverview } from '@/hooks/use-parent'
import { useReports, useReport, useMarkReportRead } from '@/hooks/use-reports'

export const Route = createFileRoute('/parent/devoirs')({
  component: ParentDevoirs,
})

const kindLabel: Record<string, string> = {
  devoir: 'Devoir',
  evaluation: 'Évaluation',
  mensuel: 'Bilan mensuel',
}

function ParentDevoirs() {
  const [openId, setOpenId] = useState<string | null>(null)
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const overview = useChildOverview(child?.id)
  const reportsQuery = useReports({ limit: 50 })

  const reports = reportsQuery.data ?? []
  const unread = reports.filter((r) => !r.read).length
  const avgScore = overview.data?.avgScore

  return (
    <div className="space-y-5 2xl:mx-auto 2xl:max-w-[1300px]">
      <PageHero
        eyebrow="Espace Parent"
        title="Suivi & rapports"
        subtitle={child ? `Bulletins et évaluations de ${child.pseudo}.` : 'Bulletins et évaluations.'}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile icon={Inbox} tone="brand" label="Rapports non lus" value={unread} />
        <StatTile icon={Trophy} tone="success" label="Score moyen" value={avgScore != null ? `${avgScore}%` : '—'} />
        <StatTile
          icon={CheckCircle2}
          tone="teal"
          label="Rapports reçus"
          value={reports.length}
          className="col-span-2 lg:col-span-1"
        />
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
              Aucun rapport pour l'instant. Les rapports envoyés par les enseignants apparaîtront ici.
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

        {/* Devoirs & évaluations — endpoint parent à venir côté backend */}
        <Card className="flex-row items-start gap-3 rounded-2xl border-0 bg-secondary/50 p-4">
          <SoftIcon tone="amber" className="size-10 shrink-0">
            <Dumbbell className="size-5" />
          </SoftIcon>
          <div>
            <p className="font-heading font-bold">Suivi des devoirs</p>
            <p className="text-sm text-muted-foreground">
              Le détail des devoirs et évaluations de votre enfant arrivera prochainement ici.
            </p>
          </div>
        </Card>
      </RailLayout>

      <ReportDialog reportId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

/** Détail d'un rapport ; marque le rapport comme lu à l'ouverture. */
function ReportDialog({ reportId, onClose }: { reportId: string | null; onClose: () => void }) {
  const { data: report, isLoading } = useReport(reportId ?? '')
  const markRead = useMarkReportRead()

  useEffect(() => {
    if (report && !report.read) markRead.mutate(report.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id])

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
            {report.summary && (
              <p className="text-sm leading-relaxed text-foreground/80">{report.summary}</p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
