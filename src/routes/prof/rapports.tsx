import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  FileText,
  FileDown,
  Download,
  Users,
  User,
  CalendarDays,
  Percent,
  Clock,
  Zap,
  TrendingUp,
  Send,
  Sparkles,
  CheckCircle2,
} from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile, SparkBars } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getStudentDetail,
  profGroups,
  profStudents,
  skills,
  weeklyActivity,
  type SkillKey,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/rapports')({
  component: ProfReports,
})

/* ------------------------------------------------------------------ */
/* Métadonnées & données locales à l'écran                             */
/* ------------------------------------------------------------------ */

type ReportType = 'eleve' | 'groupe'
type Period = 'semaine' | 'mois' | 'trimestre'

const periodMeta: Record<Period, { label: string; days: string }> = {
  semaine: { label: 'Cette semaine', days: '7 derniers jours' },
  mois: { label: 'Ce mois', days: '30 derniers jours' },
  trimestre: { label: 'Ce trimestre', days: '90 derniers jours' },
}

/* Heures de travail mockées (déterministes par cible et période) */
const periodFactor: Record<Period, number> = { semaine: 1, mois: 4.1, trimestre: 12.3 }

/* Historique local des rapports déjà générés (mock) */
type HistoryEntry = { id: number; target: string; type: ReportType; period: Period; at: string }
const initialHistory: HistoryEntry[] = [
  { id: 3, target: 'Léa_2012', type: 'eleve', period: 'mois', at: '14 juin · 09:12' },
  { id: 2, target: 'Groupe A', type: 'groupe', period: 'trimestre', at: '12 juin · 17:40' },
  { id: 1, target: 'NoaMath', type: 'eleve', period: 'semaine', at: '9 juin · 08:55' },
]

/* ------------------------------------------------------------------ */
/* Agrégats : on construit une synthèse uniforme pour élève OU groupe   */
/* ------------------------------------------------------------------ */

type Synthesis = {
  title: string
  subtitle: string
  emoji: string
  avgScore: number
  workMinutes: number
  attendance: number
  xp: number
  mastery: { key: SkillKey; label: string; mastery: number }[]
}

function buildStudentSynthesis(studentId: string, period: Period): Synthesis | null {
  const d = getStudentDetail(studentId)
  if (!d) return null
  const weekMinutes = weeklyActivity.reduce((a, c) => a + c.minutes, 0)
  return {
    title: d.pseudo,
    subtitle: `${d.group} · Élève`,
    emoji: d.avatar,
    avgScore: d.avgScore,
    workMinutes: Math.round(weekMinutes * periodFactor[period]),
    attendance: d.attendanceRate,
    xp: Math.round(d.xp * (period === 'semaine' ? 0.18 : period === 'mois' ? 0.6 : 1)),
    mastery: d.domainMastery,
  }
}

function buildGroupSynthesis(groupId: string, period: Period): Synthesis | null {
  const g = profGroups.find((x) => x.id === groupId)
  if (!g) return null
  const members = profStudents.filter((s) => s.group === g.name)
  const details = members.map((m) => getStudentDetail(m.id)).filter((x): x is NonNullable<typeof x> => !!x)
  const denom = details.length || 1
  const attendance = Math.round(details.reduce((a, d) => a + d.attendanceRate, 0) / denom) || g.activityRate
  const xp = details.reduce((a, d) => a + d.xp, 0)
  const weekMinutes = weeklyActivity.reduce((a, c) => a + c.minutes, 0)
  // Maîtrise par domaine = moyenne des élèves (sinon repli sur skills globaux)
  const mastery = skills.map((s) => {
    const vals = details.map((d) => d.domainMastery.find((m) => m.key === s.key)?.mastery ?? s.mastery)
    const avg = vals.length ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length) : s.mastery
    return { key: s.key, label: s.label, mastery: avg }
  })
  return {
    title: g.name,
    subtitle: `${g.level} · ${g.students} élèves`,
    emoji: '👥',
    avgScore: g.avgScore,
    workMinutes: Math.round(weekMinutes * denom * periodFactor[period]),
    attendance,
    xp: Math.round(xp * (period === 'semaine' ? 0.18 : period === 'mois' ? 0.6 : 1)),
    mastery,
  }
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

function ProfReports() {
  const [type, setType] = useState<ReportType>('eleve')
  const [studentId, setStudentId] = useState<string>(profStudents[0].id)
  const [groupId, setGroupId] = useState<string>(profGroups[0].id)
  const [period, setPeriod] = useState<Period>('semaine')

  // Options d'export (rail)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeComment, setIncludeComment] = useState(true)
  const [format, setFormat] = useState<'a4' | 'compact'>('a4')

  const [comment, setComment] = useState(
    'Élève sérieux et régulier. Les progrès en algèbre sont nets ce mois-ci. Point de vigilance sur les statistiques : à retravailler avec des exercices ciblés avant les examens blancs.',
  )

  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const synthesis = useMemo<Synthesis | null>(() => {
    return type === 'eleve'
      ? buildStudentSynthesis(studentId, period)
      : buildGroupSynthesis(groupId, period)
  }, [type, studentId, groupId, period])

  const targetLabel = synthesis?.title ?? '—'
  const editionDate = '17 juin 2026'

  function handleGenerate() {
    setGeneratedAt(`${editionDate} · ${periodMeta[period].label}`)
    setHistory((h) => [
      {
        id: (h[0]?.id ?? 0) + 1,
        target: targetLabel,
        type,
        period,
        at: '17 juin · 03:10',
      },
      ...h,
    ])
    toast.success('Rapport généré', {
      description: `${targetLabel} — ${periodMeta[period].label}.`,
    })
  }

  function handleExport() {
    toast.success('Export PDF lancé', {
      description: `« Rapport ${targetLabel} » (${format === 'a4' ? 'A4' : 'compact'}) en préparation.`,
    })
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Espace Prof"
        title="Générateur de rapports"
        subtitle="Composez un bilan de progression — élève ou groupe — puis exportez-le en PDF."
        actions={
          <>
            <Button variant="outline" onClick={handleGenerate}>
              <FileText className="size-4" />
              Générer
            </Button>
            <Button onClick={handleExport}>
              <FileDown className="size-4" />
              Exporter en PDF
            </Button>
          </>
        }
      >
        {/* Barre de configuration */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ConfigField icon={FileText} label="Type de rapport">
            <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eleve">Élève</SelectItem>
                <SelectItem value="groupe">Groupe</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>

          <ConfigField icon={type === 'eleve' ? User : Users} label="Cible">
            {type === 'eleve' ? (
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un élève" />
                </SelectTrigger>
                <SelectContent>
                  {profStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.avatar} {s.pseudo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un groupe" />
                </SelectTrigger>
                <SelectContent>
                  {profGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} · {g.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </ConfigField>

          <ConfigField icon={CalendarDays} label="Période">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semaine">Semaine</SelectItem>
                <SelectItem value="mois">Mois</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>

          <div className="flex items-end">
            <Button className="w-full" onClick={handleGenerate}>
              <Sparkles className="size-4" />
              Générer l'aperçu
            </Button>
          </div>
        </div>
      </PageHero>

      <RailLayout
        rail={
          <>
            {/* Options d'export */}
            <Card className="gap-4 p-5">
              <p className="font-heading text-base font-bold">Options d'export</p>

              <div className="space-y-1.5">
                <Label htmlFor="export-format">Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as 'a4' | 'compact')}>
                  <SelectTrigger id="export-format" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 — document complet</SelectItem>
                    <SelectItem value="compact">Compact — 1 page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ExportToggle
                label="Inclure les graphiques"
                checked={includeCharts}
                onChange={setIncludeCharts}
              />
              <ExportToggle
                label="Inclure l'appréciation"
                checked={includeComment}
                onChange={setIncludeComment}
              />

              <Separator />

              <Button className="w-full justify-start" onClick={handleExport}>
                <Download className="size-4" />
                Télécharger le PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  toast.success('Rapport envoyé', {
                    description: `Le bilan de ${targetLabel} a été transmis au parent.`,
                  })
                }
              >
                <Send className="size-4" />
                Envoyer au parent
              </Button>
            </Card>

            {/* Historique des rapports générés */}
            <Card className="gap-0 p-5">
              <SectionHeader title="Rapports générés" />
              <ul className="space-y-2.5">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-secondary/50"
                  >
                    <SoftIcon tone={h.type === 'eleve' ? 'brand' : 'teal'}>
                      {h.type === 'eleve' ? (
                        <User className="size-4" />
                      ) : (
                        <Users className="size-4" />
                      )}
                    </SoftIcon>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-sm font-semibold">{h.target}</p>
                      <p className="text-xs text-muted-foreground">
                        {periodMeta[h.period].label} · {h.at}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() =>
                        toast.success('Téléchargement', {
                          description: `Rapport de ${h.target} (${periodMeta[h.period].label}).`,
                        })
                      }
                    >
                      <FileDown className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        }
      >
        {synthesis ? (
          <ReportPreview
            synthesis={synthesis}
            type={type}
            period={period}
            editionDate={editionDate}
            generatedAt={generatedAt}
            includeCharts={includeCharts}
            includeComment={includeComment}
            comment={comment}
            onCommentChange={setComment}
          />
        ) : (
          <Card className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-soft">
            <SoftIcon tone="amber">
              <FileText className="size-5" />
            </SoftIcon>
            <p className="font-heading text-lg font-bold">Aucune cible sélectionnée</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Choisissez un élève ou un groupe dans la barre de configuration pour composer le
              rapport.
            </p>
          </Card>
        )}
      </RailLayout>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */

function ConfigField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof FileText
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </Label>
      {children}
    </div>
  )
}

function ExportToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

function ReportPreview({
  synthesis,
  type,
  period,
  editionDate,
  generatedAt,
  includeCharts,
  includeComment,
  comment,
  onCommentChange,
}: {
  synthesis: Synthesis
  type: ReportType
  period: Period
  editionDate: string
  generatedAt: string | null
  includeCharts: boolean
  includeComment: boolean
  comment: string
  onCommentChange: (v: string) => void
}) {
  const activityMinutes = weeklyActivity.map((d) => d.minutes)
  const activityScores = weeklyActivity.map((d) => d.score)
  const activityLabels = weeklyActivity.map((d) => d.label)
  const masteryValues = synthesis.mastery.map((m) => m.mastery)
  const masteryLabels = synthesis.mastery.map((m) => m.label.slice(0, 3))

  return (
    <Card className="overflow-hidden rounded-2xl bg-card p-0 shadow-float">
      {/* Bandeau d'état (hors document) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/40 px-5 py-2.5 sm:px-8">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <FileText className="size-3.5" />
          Aperçu du document
        </span>
        {generatedAt ? (
          <Badge variant="secondary" className="bg-success-soft text-success">
            <CheckCircle2 className="size-3.5" /> Généré · {generatedAt}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-info-soft text-info">
            <Clock className="size-3.5" /> Brouillon
          </Badge>
        )}
      </div>

      {/* Document */}
      <div className="space-y-7 p-6 sm:p-8 lg:p-10">
        {/* En-tête du document */}
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-brand font-heading text-xl font-extrabold text-white shadow-brand-glow">
              M
            </span>
            <div className="leading-tight">
              <p className="font-heading text-lg font-extrabold tracking-tight">MLC Academy</p>
              <p className="text-sm text-muted-foreground">Rapport de progression</p>
            </div>
          </div>
          <div className="space-y-1 text-sm sm:text-right">
            <p className="flex items-center gap-1.5 font-semibold sm:justify-end">
              <span className="text-xl">{synthesis.emoji}</span>
              {synthesis.title}
            </p>
            <p className="text-xs text-muted-foreground">{synthesis.subtitle}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
              <CalendarDays className="size-3.5" />
              {periodMeta[period].label} · {periodMeta[period].days}
            </p>
            <p className="text-xs text-muted-foreground">Édité le {editionDate}</p>
          </div>
        </header>

        {/* Synthèse */}
        <section className="space-y-3">
          <SectionHeader title="Synthèse" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              icon={TrendingUp}
              tone="brand"
              label="Score moyen"
              value={`${synthesis.avgScore} %`}
            />
            <StatTile
              icon={Clock}
              tone="teal"
              label="Temps de travail"
              value={formatHours(synthesis.workMinutes)}
            />
            <StatTile
              icon={Percent}
              tone="success"
              label="Assiduité"
              value={`${synthesis.attendance} %`}
            />
            <StatTile
              icon={Zap}
              tone="amber"
              label="XP gagnés"
              value={synthesis.xp.toLocaleString('fr-FR')}
            />
          </div>
        </section>

        {/* Progression par domaine */}
        <section className="space-y-3">
          <SectionHeader title="Progression par domaine" />
          <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
            <ul className="space-y-3.5">
              {synthesis.mastery.map((m) => (
                <li key={m.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{m.label}</span>
                    <span className="font-bold tabular-nums">{m.mastery} %</span>
                  </div>
                  <Meter value={m.mastery} color="auto" />
                </li>
              ))}
            </ul>
            {includeCharts && (
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Maîtrise par domaine
                </p>
                <SparkBars
                  data={masteryValues}
                  labels={masteryLabels}
                  color="var(--brand)"
                  height={92}
                />
              </div>
            )}
          </div>
        </section>

        {/* Activité */}
        {includeCharts && (
          <section className="space-y-3">
            <SectionHeader title="Activité" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Temps de travail (min/jour)
                </p>
                <SparkBars
                  data={activityMinutes}
                  labels={activityLabels}
                  color="var(--teal)"
                  height={92}
                />
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Réussite (%/jour)
                </p>
                <SparkBars
                  data={activityScores}
                  labels={activityLabels}
                  color="var(--brand)"
                  height={92}
                />
              </div>
            </div>
          </section>
        )}

        {/* Commentaire du professeur */}
        {includeComment && (
          <section className="space-y-3">
            <SectionHeader title="Appréciation générale" />
            <Textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={4}
              placeholder={
                type === 'eleve'
                  ? "Rédigez l'appréciation de l'élève pour cette période…"
                  : "Rédigez l'appréciation du groupe pour cette période…"
              }
              className="resize-none bg-card"
            />
            <p className="text-xs text-muted-foreground">
              Ce commentaire apparaîtra au bas du rapport exporté.
            </p>
          </section>
        )}

        {/* Pied de page */}
        <footer className="border-t border-border pt-5 text-center text-xs text-muted-foreground">
          Document généré automatiquement · confidentiel · MLC Academy
        </footer>
      </div>
    </Card>
  )
}
