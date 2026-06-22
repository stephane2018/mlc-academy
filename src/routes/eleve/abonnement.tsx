import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Check,
  Coffee,
  Users,
  CreditCard,
  ArrowRight,
  Settings,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/mock'
import { usePlans, useSubscribeSelf } from '@/hooks/use-billing'
import type { Plan } from '@/services/billing'

export const Route = createFileRoute('/eleve/abonnement')({
  component: AbonnementPage,
})

/** Normalise le champ `features` (unknown côté API) en liste de chaînes. */
function planFeatures(features: unknown): string[] {
  if (!Array.isArray(features)) return []
  return features.filter((f): f is string => typeof f === 'string')
}

function AbonnementPage() {
  const { data: plans = [], isLoading, isError } = usePlans()
  const subscribe = useSubscribeSelf()

  function doSubscribe(planId: string) {
    subscribe.mutate(
      { planId },
      { onError: () => toast.error("Le paiement n'a pas pu démarrer. Réessaie.") },
    )
  }

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="Abonnement"
        title="Passe au niveau supérieur"
        subtitle="Débloque tout le jeu, les vidéos et les examens blancs pour réussir le CE1D."
      />

      {isLoading ? (
        <Card className="py-10 text-center text-sm text-muted-foreground shadow-soft">
          Chargement des formules…
        </Card>
      ) : isError ? (
        <Card className="py-10 text-center text-sm text-muted-foreground shadow-soft">
          Impossible de charger les formules pour le moment. Réessaie plus tard.
        </Card>
      ) : plans.length === 0 ? (
        <Card className="py-10 text-center text-sm text-muted-foreground shadow-soft">
          Aucune formule disponible pour le moment.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              pending={subscribe.isPending}
              onChoose={() => doSubscribe(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Argument parent */}
      <Card className="flex-row items-center gap-3 border-0 bg-violet-soft p-4 shadow-soft">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-violet">
          <Coffee className="size-5" />
        </span>
        <p className="text-sm text-foreground">
          <span className="font-semibold">Pour le prix d'un café par semaine</span>, votre enfant
          révise les maths toute l'année, à son rythme.
        </p>
      </Card>

      {/* Formule famille */}
      <Card className="flex-row items-center gap-3 p-4 shadow-soft">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Users className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          Plusieurs enfants ? La formule{' '}
          <span className="font-semibold text-foreground">Famille</span> couvre jusqu'à 3 accès
          Premium avec un tableau de bord parent unifié.
        </p>
      </Card>

      {/* Gérer l'abonnement existant */}
      <Link to="/eleve/mon-abonnement" className="block">
        <Card className="card-hover flex-row items-center gap-3 p-4 shadow-soft">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
            <Settings className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Gérer mon abonnement</p>
            <p className="text-xs text-muted-foreground">
              Factures, mode de paiement et résiliation.
            </p>
          </div>
          <ArrowRight className="size-5 text-muted-foreground" />
        </Card>
      </Link>

      <p className="px-2 text-center text-[11px] text-muted-foreground">
        Sans engagement · Résiliable à tout moment · Paiement géré par le parent.
      </p>
    </div>
  )
}

function PlanCard({
  plan,
  pending,
  onChoose,
}: {
  plan: Plan
  pending: boolean
  onChoose: () => void
}) {
  const features = planFeatures(plan.features)

  return (
    <Card className={cn('card-hover relative gap-0 p-5 shadow-soft border-border')}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-xl font-extrabold">{plan.name}</h2>
        <div className="text-right">
          <span className="font-heading text-2xl font-extrabold tabular-nums">
            {formatPrice(plan.priceCents)}
          </span>
          {plan.period && (
            <span className="text-sm font-medium text-muted-foreground"> /{plan.period}</span>
          )}
        </div>
      </div>

      {features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        size="lg"
        className="mt-5 w-full rounded-xl text-base"
        disabled={pending}
        onClick={onChoose}
      >
        <CreditCard className="size-4" /> S'abonner
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Paiement sécurisé Bancontact · Carte
      </p>
    </Card>
  )
}
