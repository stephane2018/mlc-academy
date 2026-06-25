import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Crown,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  ShieldCheck,
  CircleHelp,
  ArrowRight,
} from '@/components/icons'
import { SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHero, RailLayout } from '@/components/blocks'
import { formatPrice } from '@/lib/mock'
import { useMySubscription, useInvoices } from '@/hooks/use-billing'
import type { Invoice } from '@/services/billing'

export const Route = createFileRoute('/eleve/mon-abonnement')({
  component: MonAbonnementPage,
})

/** Formate une date ISO en français lisible (ou « — » si absente). */
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Statuts de facture considérés comme réglés. */
const PAID_STATUSES = new Set(['paid', 'payée', 'payee'])

function MonAbonnementPage() {
  const { data: subscription, isLoading } = useMySubscription()
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices()

  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="Espace élève"
        title="Mon abonnement"
        subtitle="Gère ta formule, consulte tes factures et ton mode de paiement."
      />

      {isLoading ? (
        <Card className="py-10 text-center text-sm text-muted-foreground shadow-soft">
          Chargement de ton abonnement…
        </Card>
      ) : !subscription ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center shadow-soft">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Crown className="size-7" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold">Aucun abonnement actif</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choisis une formule pour débloquer tout le contenu Premium.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/eleve/abonnement">
              Voir les formules <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Card>
      ) : (
        <RailLayout
          rail={
            <>
              {/* Méthode de paiement */}
              <Card className="gap-0 p-4 shadow-soft">
                <SectionHeader title="Mode de paiement" />
                <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
                  <SoftIcon tone="brand">
                    <CreditCard className="size-5" />
                  </SoftIcon>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{subscription.method ?? 'Carte / Bancontact'}</p>
                    <p className="text-xs text-muted-foreground">Prélèvement géré via Stripe</p>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-success" /> Paiement sécurisé, géré par le parent.
                </p>
              </Card>

              {/* Aide */}
              <Card className="gap-0 p-4 shadow-soft">
                <SectionHeader title="Besoin d'aide ?" />
                <p className="text-sm text-muted-foreground">
                  Une question sur ta facturation ou ton abonnement ?
                </p>
                <Button variant="outline" className="mt-3 w-full rounded-xl">
                  <CircleHelp className="size-4" /> Contacter le support
                </Button>
              </Card>
            </>
          }
        >
          {/* Abonnement actif */}
          <Card className="gap-0 overflow-hidden p-0 shadow-soft">
            <div className="flex flex-col gap-4 bg-brand-gradient p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
                  <Crown className="size-6 text-amber-200" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Formule active
                  </p>
                  <p className="font-heading text-2xl font-extrabold">{subscription.plan.name}</p>
                  <p className="text-sm text-white/80">
                    {formatPrice(subscription.plan.priceCents)}
                    {subscription.plan.period && (
                      <span className="text-white/70"> /{subscription.plan.period}</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
                <CheckCircle2 className="size-4" /> {subscription.status}
              </span>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-3">
              <InfoCell
                icon={<CreditCard className="size-4 text-brand" />}
                label="Paiement"
                value={subscription.method ?? '—'}
              />
              <InfoCell
                icon={<CalendarDays className="size-4 text-info" />}
                label="Membre depuis"
                value={formatDate(subscription.since)}
              />
              <InfoCell
                icon={<CalendarDays className="size-4 text-amber" />}
                label={subscription.cancelAtPeriodEnd ? "Fin d'accès" : 'Prochaine facture'}
                value={formatDate(subscription.nextBilling)}
              />
            </div>

            <div className="flex flex-col gap-2 p-4 sm:flex-row sm:justify-end">
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/eleve/abonnement">
                  Changer de formule <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Historique de facturation */}
          <Card className="p-5 shadow-soft">
            <SectionHeader title="Historique de facturation" />
            {invoicesLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chargement des factures…</p>
            ) : invoices.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune facture pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 pr-3 font-semibold">Date</th>
                      <th className="pb-2 pr-3 font-semibold">Montant</th>
                      <th className="pb-2 pr-3 font-semibold">Statut</th>
                      <th className="pb-2 text-right font-semibold">Reçu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <InvoiceRow key={inv.id} invoice={inv} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </RailLayout>
      )}
    </div>
  )
}

function InvoiceRow({ invoice: inv }: { invoice: Invoice }) {
  const paid = PAID_STATUSES.has(inv.status.toLowerCase())
  const receiptUrl = inv.pdfUrl ?? inv.hostedInvoiceUrl

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2.5 pr-3 text-muted-foreground">{formatDate(inv.issuedAt)}</td>
      <td className="py-2.5 pr-3 font-semibold tabular-nums">{formatPrice(inv.amountCents)}</td>
      <td className="py-2.5 pr-3">
        <Badge
          variant={paid ? 'secondary' : 'outline'}
          className={paid ? 'bg-success-soft text-success' : 'text-muted-foreground'}
        >
          {paid ? <CheckCircle2 className="size-3" /> : <CalendarDays className="size-3" />}
          {paid ? 'Payée' : inv.status}
        </Badge>
      </td>
      <td className="py-2.5 text-right">
        {receiptUrl ? (
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <a href={receiptUrl} target="_blank" rel="noreferrer">
              <Download className="size-4" />
              <span className="sr-only sm:not-sr-only">Télécharger</span>
            </a>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-1 font-heading text-base font-bold">{value}</p>
    </div>
  )
}
