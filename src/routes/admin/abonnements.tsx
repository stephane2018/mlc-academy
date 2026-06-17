import { createFileRoute } from '@tanstack/react-router'
import { Euro, Users, Percent, Check } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/student/parts'
import { StatTile, SparkArea } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { plans, adminStats } from '@/lib/mock'

export const Route = createFileRoute('/admin/abonnements')({
  component: AdminAbonnements,
})

/* Tendances locales mockées (~7 points) */
const trendMrr = [980, 1020, 1010, 1080, 1100, 1140, 1180]
const trendSubscribers = [30, 31, 33, 34, 35, 36, 37]
const trendConversion = [55, 58, 57, 60, 62, 63, 64]

type SubStatus = 'Actif' | 'Essai' | 'Annulé'

type Subscriber = {
  id: string
  pseudo: string
  avatar: string
  plan: string
  status: SubStatus
  since: string
  amount: string
}

const subscribers: Subscriber[] = [
  { id: 's1', pseudo: 'MaxLeBg', avatar: '🤖', plan: 'Premium', status: 'Actif', since: 'Mars 2026', amount: '9,90 €' },
  { id: 's2', pseudo: 'Léa_2012', avatar: '🦊', plan: 'Famille', status: 'Actif', since: 'Janv. 2026', amount: '14,90 €' },
  { id: 's3', pseudo: 'NoaMath', avatar: '🚀', plan: 'Premium', status: 'Essai', since: 'Juin 2026', amount: '0,00 €' },
  { id: 's4', pseudo: 'Zoé★', avatar: '🐱', plan: 'Découverte', status: 'Actif', since: 'Juin 2026', amount: '0,00 €' },
  { id: 's5', pseudo: 'TomTom', avatar: '🐼', plan: 'Premium', status: 'Actif', since: 'Févr. 2026', amount: '9,90 €' },
  { id: 's6', pseudo: 'Inès.M', avatar: '🐧', plan: 'Premium', status: 'Annulé', since: 'Avr. 2026', amount: '9,90 €' },
]

function SubStatusBadge({ status }: { status: SubStatus }) {
  if (status === 'Actif') return <Badge className="bg-success-soft text-success">Actif</Badge>
  if (status === 'Essai') return <Badge className="bg-info-soft text-info">Essai</Badge>
  return <Badge className="bg-destructive/10 text-destructive">Annulé</Badge>
}

function AdminAbonnements() {
  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      {/* Synthèse */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={Euro}
          tone="brand"
          label="MRR — revenu mensuel récurrent"
          value={`${adminStats.mrr.toLocaleString('fr-FR')} €`}
          delta="+120 € ce mois"
          trend="up"
          spark={<SparkArea data={trendMrr} color="var(--brand)" height={44} />}
        />
        <StatTile
          icon={Users}
          tone="teal"
          label="Abonnés actifs (sur 42 élèves)"
          value="37"
          delta="+3 ce mois"
          trend="up"
          spark={<SparkArea data={trendSubscribers} color="var(--teal)" height={44} />}
        />
        <StatTile
          icon={Percent}
          tone="success"
          label="Conversion essai → payant"
          value="64 %"
          delta="+2 pts"
          trend="up"
          spark={<SparkArea data={trendConversion} color="var(--success)" height={44} />}
        />
      </div>

      {/* Rappel des formules */}
      <section>
        <SectionHeader title="Formules" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'card-hover gap-3 rounded-2xl p-5 shadow-soft',
                plan.highlight && 'border-brand ring-1 ring-brand/30',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                {plan.badge ? (
                  <Badge className="bg-brand-soft text-brand">{plan.badge}</Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              <p className="font-heading text-2xl font-extrabold">
                {plan.price}
                <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="space-y-1.5">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Tableau des abonnés */}
      <section>
        <SectionHeader title="Abonnés" />
        <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Élève</th>
                  <th className="px-5 py-3 font-semibold">Formule</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">Depuis</th>
                  <th className="px-5 py-3 font-semibold text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-lg bg-secondary text-lg">
                          {sub.avatar}
                        </span>
                        <span className="font-medium">{sub.pseudo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline">{sub.plan}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <SubStatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{sub.since}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{sub.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}
