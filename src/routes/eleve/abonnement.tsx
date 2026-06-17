import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Check,
  Coffee,
  Users,
  CreditCard,
  Bank,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Settings,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHero } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { plans, type Plan } from '@/lib/mock'

export const Route = createFileRoute('/eleve/abonnement')({
  component: AbonnementPage,
})

function AbonnementPage() {
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="Abonnement"
        title="Passe au niveau supérieur"
        subtitle="Débloque tout le jeu, les vidéos et les examens blancs pour réussir le CE1D."
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onChoose={() => setCheckoutPlan(plan)} />
        ))}
      </div>

      {/* Argument parent */}
      <Card className="flex-row items-center gap-3 border-0 bg-teal-soft p-4 shadow-soft">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-teal">
          <Coffee className="size-5" />
        </span>
        <p className="text-sm text-teal-foreground">
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

      <CheckoutDialog plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
    </div>
  )
}

function PlanCard({ plan, onChoose }: { plan: Plan; onChoose: () => void }) {
  const highlighted = !!plan.highlight
  const isFree = plan.price === 'Gratuit'

  return (
    <Card
      className={cn(
        'card-hover relative gap-0 p-5 shadow-soft',
        highlighted ? 'border-2 border-brand bg-brand-soft/40' : 'border-border',
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
          {plan.badge}
        </span>
      )}

      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-xl font-extrabold">{plan.name}</h2>
        <div className="text-right">
          <span className="font-heading text-2xl font-extrabold">{plan.price}</span>
          {plan.period && (
            <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
          )}
        </div>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">{plan.tagline}</p>

      <ul className="mt-4 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        variant={highlighted ? 'default' : 'outline'}
        className="mt-5 w-full rounded-xl text-base"
        onClick={onChoose}
      >
        {plan.cta}
      </Button>
      {!isFree && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Paiement sécurisé Bancontact · Carte
        </p>
      )}
    </Card>
  )
}

/* --------------------------------------------------------------------- */
/* Tunnel de paiement (mock Mollie)                                       */
/* --------------------------------------------------------------------- */

type Step = 'recap' | 'method' | 'confirm' | 'success'
type Method = 'bancontact' | 'card'

function CheckoutDialog({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const [step, setStep] = useState<Step>('recap')
  const [method, setMethod] = useState<Method>('bancontact')

  function reset() {
    setStep('recap')
    setMethod('bancontact')
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      onClose()
      // Réinitialise après la fermeture de l'animation.
      setTimeout(reset, 200)
    }
  }

  function startPayment() {
    setStep('confirm')
    setTimeout(() => {
      setStep('success')
      toast.success('Paiement réussi', {
        description: `Bienvenue dans ${plan?.name} 🎉`,
      })
    }, 1600)
  }

  if (!plan) return null
  const isFree = plan.price === 'Gratuit'

  return (
    <Dialog open={!!plan} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'recap' && (
          <>
            <DialogHeader>
              <DialogTitle>Récapitulatif</DialogTitle>
              <DialogDescription>Vérifie ta formule avant de payer.</DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-heading text-lg font-bold">{plan.name}</span>
                <span className="font-heading text-xl font-extrabold">
                  {plan.price}
                  {plan.period && (
                    <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
                  )}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> Sans engagement, résiliable à tout
              moment.
            </p>
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={() => (isFree ? startPayment() : setStep('method'))}
            >
              {isFree ? 'Activer la formule' : 'Continuer vers le paiement'}
            </Button>
          </>
        )}

        {step === 'method' && (
          <>
            <DialogHeader>
              <DialogTitle>Méthode de paiement</DialogTitle>
              <DialogDescription>Choisis comment régler {plan.name}.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <MethodTile
                active={method === 'bancontact'}
                onClick={() => setMethod('bancontact')}
                icon={<Bank className="size-6" />}
                label="Bancontact"
              />
              <MethodTile
                active={method === 'card'}
                onClick={() => setMethod('card')}
                icon={<CreditCard className="size-6" />}
                label="Carte bancaire"
              />
            </div>

            {method === 'card' && (
              <div className="space-y-3 rounded-2xl border border-border p-4">
                <div className="space-y-1">
                  <Label htmlFor="card-number" className="text-xs">
                    Numéro de carte
                  </Label>
                  <Input
                    id="card-number"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242 4242 4242 4242"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="card-exp" className="text-xs">
                      Expiration
                    </Label>
                    <Input id="card-exp" placeholder="MM/AA" defaultValue="06/29" disabled />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="card-cvc" className="text-xs">
                      CVC
                    </Label>
                    <Input id="card-cvc" placeholder="123" defaultValue="123" disabled />
                  </div>
                </div>
              </div>
            )}

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> Paiement sécurisé via Mollie.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="rounded-xl sm:flex-1" onClick={() => setStep('recap')}>
                Retour
              </Button>
              <Button className="rounded-xl sm:flex-1" onClick={startPayment}>
                Payer {plan.price}
                {plan.period}
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="size-12 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
            <div>
              <p className="font-heading text-base font-bold">Paiement en cours…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Connexion sécurisée à {method === 'bancontact' ? 'Bancontact' : 'ta banque'}.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-9" />
            </span>
            <div>
              <DialogTitle className="text-lg">Paiement réussi</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Ta formule <span className="font-semibold text-foreground">{plan.name}</span> est
                active. Bon courage pour le CE1D !
              </p>
            </div>
            <Button asChild size="lg" className="w-full rounded-xl">
              <Link to="/eleve/dashboard">Accéder à Premium</Link>
            </Button>
            <Link
              to="/eleve/mon-abonnement"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Voir mon abonnement
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function MethodTile({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition-colors',
        active
          ? 'border-brand bg-brand-soft/50 text-brand'
          : 'border-border text-foreground hover:border-brand/40',
      )}
    >
      <span
        className={cn(
          'grid size-10 place-items-center rounded-xl',
          active ? 'bg-brand text-white' : 'bg-secondary text-muted-foreground',
        )}
      >
        {icon}
      </span>
      {label}
      {active && <Check className="size-4" />}
    </button>
  )
}
