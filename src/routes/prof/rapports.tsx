import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FileText, Send, FileDown, Check } from '@/components/icons'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QueryError } from '@/components/query-error'
import { useTeacherStudents } from '@/hooks/use-teacher'
import { useReports, useSendReport, useReportPdf } from '@/hooks/use-reports'
import type { ReportKind } from '@/services/reports'

export const Route = createFileRoute('/prof/rapports')({
  component: ProfReports,
})

const KIND_LABEL: Record<ReportKind, string> = { devoir: 'Devoir', evaluation: 'Évaluation', mensuel: 'Bilan mensuel' }
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function ProfReports() {
  const { data: students = [] } = useTeacherStudents()
  const reportsQ = useReports()
  const reports = reportsQ.data ?? []
  const isLoading = reportsQ.isLoading
  const send = useSendReport()
  const pdf = useReportPdf()

  const [studentId, setStudentId] = useState('')
  const [kind, setKind] = useState<ReportKind>('mensuel')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [score, setScore] = useState('')

  const byId = new Map(students.map((s) => [s.id, s]))
  const sent = reports.length
  const read = reports.filter((r) => r.read).length

  function submit() {
    if (!studentId || !title.trim()) {
      toast.error('Choisis un élève et donne un titre.')
      return
    }
    const scoreNum = score.trim() ? Math.max(0, Math.min(100, Number(score))) : undefined
    send.mutate(
      { studentId, kind, title: title.trim(), summary: summary.trim() || undefined, score: scoreNum },
      {
        onSuccess: () => {
          toast.success('Rapport envoyé', { description: 'Le PDF est généré et visible par le parent.' })
          setTitle('')
          setSummary('')
          setScore('')
        },
        onError: () => toast.error("Échec de l'envoi du rapport."),
      },
    )
  }

  function openPdf(id: string) {
    pdf.mutate(id, {
      onSuccess: ({ url }) => {
        if (url) window.open(url, '_blank')
      },
      onError: () => toast.error('PDF indisponible.'),
    })
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        variant="surface"
        eyebrow="Suivi & rapports"
        title="Rapports aux parents"
        subtitle="Envoie un bilan à propos d'un élève — un PDF est généré et partagé à son parent."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile icon={FileText} tone="brand" label="Rapports envoyés" value={sent} />
        <StatTile icon={Check} tone="teal" label="Lus par le parent" value={read} />
      </div>

      <RailLayout
        rail={
          <Card className="gap-3 p-5">
            <p className="font-heading text-base font-bold">Nouveau rapport</p>
            <div className="space-y-1.5">
              <Label htmlFor="r-student">Élève</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger id="r-student" className="w-full">
                  <SelectValue placeholder="Choisir un élève" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.pseudo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-kind">Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as ReportKind)}>
                <SelectTrigger id="r-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['mensuel', 'devoir', 'evaluation'] as ReportKind[]).map((k) => (
                    <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-title">Titre</Label>
              <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Bilan du mois de juin" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-summary">Synthèse</Label>
              <Textarea id="r-summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Observations, progrès, points de vigilance…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-score">Score (optionnel, 0–100)</Label>
              <Input id="r-score" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} className="max-w-[140px]" />
            </div>
            <Button disabled={!studentId || !title.trim() || send.isPending} onClick={submit}>
              <Send className="size-4" />
              Envoyer le rapport
            </Button>
          </Card>
        }
      >
        <section className="space-y-3">
          <p className="font-heading text-lg font-bold">Historique des rapports</p>
          {isLoading ? (
            <Card className="py-10 text-center text-sm text-muted-foreground">Chargement…</Card>
          ) : reportsQ.isError ? (
            <QueryError onRetry={() => reportsQ.refetch()} />
          ) : reports.length === 0 ? (
            <Card className="py-10 text-center text-sm text-muted-foreground">Aucun rapport envoyé pour l'instant.</Card>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <Card key={r.id} className="flex-row items-center gap-3 p-4 shadow-soft">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold">{r.title}</p>
                      <Badge variant="secondary" className="bg-secondary text-muted-foreground">{KIND_LABEL[r.kind]}</Badge>
                      {r.read ? (
                        <Badge variant="secondary" className="bg-success-soft text-success"><Check className="size-3" /> Lu</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">Non lu</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {byId.get(r.studentId)?.pseudo ?? 'Élève'} · {dateFmt.format(new Date(r.createdAt))}
                      {typeof r.score === 'number' ? ` · ${r.score}%` : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled={pdf.isPending} onClick={() => openPdf(r.id)}>
                    <FileDown className="size-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </RailLayout>
    </div>
  )
}
