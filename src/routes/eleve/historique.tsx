import { createFileRoute } from '@tanstack/react-router'
import { Trophy, Zap, Check, Percent, CheckCircle2 } from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { Meter, SoftIcon } from '@/components/student/parts'
import { PageHero } from '@/components/blocks'
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
import { cn } from '@/lib/utils'
import {
  studentHistory,
  domainLabels,
  type Assignment,
  type Submission,
} from '@/lib/mock'

export const Route = createFileRoute('/eleve/historique')({
  component: HistoriquePage,
})

const STUDENT_ID = 's1'
const PASS_THRESHOLD = 50

function HistoriquePage() {
  const history = studentHistory(STUDENT_ID).filter((h) => h.submission.status === 'rendu')

  const count = history.length
  const avg =
    count > 0
      ? Math.round(history.reduce((s, h) => s + (h.submission.score ?? 0), 0) / count)
      : 0
  // XP indicatif : XP du devoir si validé (≥ 50 %).
  const totalXp = history.reduce(
    (s, h) => s + ((h.submission.score ?? 0) >= PASS_THRESHOLD ? h.assignment.xpReward : 0),
    0,
  )

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 2xl:max-w-4xl">
      <PageHero
        variant="surface"
        eyebrow="Tes résultats"
        title="Historique des évaluations"
        subtitle="Tes devoirs et évaluations rendus, avec la correction détaillée."
      />

      {/* Récap */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RecapTile
          tone="brand"
          icon={<CheckCircle2 className="size-5" />}
          label="Évaluations faites"
          value={`${count}`}
        />
        <RecapTile
          tone="teal"
          icon={<Percent className="size-5" />}
          label="Score moyen"
          value={`${avg}%`}
        />
        <RecapTile
          tone="amber"
          icon={<Zap className="size-5" />}
          label="XP gagné (indicatif)"
          value={`+${totalXp}`}
        />
      </section>
      <p className="-mt-3 text-xs text-muted-foreground">
        Ces résultats comptent dans ton XP et le classement.
      </p>

      {/* Liste */}
      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-10 text-center text-sm text-muted-foreground">
          Tu n'as encore rien rendu.
        </div>
      ) : (
        <section className="space-y-3">
          {history.map(({ submission, assignment }) => (
            <HistoryCard key={submission.id} submission={submission} assignment={assignment} />
          ))}
        </section>
      )}
    </div>
  )
}

function RecapTile({
  tone,
  icon,
  label,
  value,
}: {
  tone: 'brand' | 'teal' | 'amber'
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <SoftIcon tone={tone}>{icon}</SoftIcon>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-heading text-xl font-extrabold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function HistoryCard({
  submission: s,
  assignment: a,
}: {
  submission: Submission
  assignment: Assignment
}) {
  const score = s.score ?? 0
  const validated = score >= PASS_THRESHOLD
  const xp = validated ? a.xpReward : 0

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {a.type === 'evaluation' ? 'Évaluation' : 'Devoir maison'}
        </Badge>
        <Badge variant="outline">{domainLabels[a.domain]}</Badge>
        <span className="text-xs text-muted-foreground">rendu le {s.submittedAt}</span>
      </div>

      <h3 className="mt-2 font-heading text-base font-bold leading-snug">{a.title}</h3>

      <div className="mt-3 flex items-center gap-3">
        <Meter value={score} color="auto" className="flex-1" />
        <span className="w-12 text-right font-heading text-sm font-bold tabular-nums">
          {score}%
        </span>
        {validated && (
          <Badge className="bg-success text-white">
            <Check className="size-3" /> Validé
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-sm font-bold text-amber-foreground">
          <Zap className="size-4 fill-amber text-amber" /> +{xp} XP
        </span>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-xl">
              Détails
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">{a.title}</DialogTitle>
              <DialogDescription>
                {domainLabels[a.domain]} · rendu le {s.submittedAt} · score {score}%
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
              <Trophy className={cn('size-5', validated ? 'text-success' : 'text-amber')} />
              <span className="text-sm font-semibold">
                {validated ? `Validé · +${xp} XP gagnés` : 'Non validé (< 50 %)'}
              </span>
            </div>

            <div className="space-y-3">
              {a.questions.map((q, i) => {
                const correctLabel = q.options.find((o) => o.id === q.correctId)?.label
                return (
                  <div key={q.id} className="rounded-2xl border border-border p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Question {i + 1}/{a.questions.length}
                    </p>
                    <p className="mt-1 text-sm font-medium">{q.prompt}</p>
                    {q.katex && (
                      <div className="mt-2 text-base">
                        <Maths expr={q.katex} display />
                      </div>
                    )}
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-success">
                      <Check className="size-4" /> Bonne réponse : {correctLabel}
                    </p>
                    {q.explanation && (
                      <p className="mt-1 text-sm text-foreground/80">
                        {q.explanation}{' '}
                        {q.explanationKatex && (
                          <Maths expr={q.explanationKatex} className="font-medium" />
                        )}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
