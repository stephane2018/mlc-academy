import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Crown,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  ShieldCheck,
  CircleHelp,
  ArrowRight,
  AlertCircle,
} from '@/components/icons'
import { SectionHeader, SoftIcon } from '@/components/student/parts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PageHero, RailLayout } from '@/components/blocks'
import { subscription, invoices } from '@/lib/mock'

export const Route = createFileRoute('/eleve/mon-abonnement')({
  component: MonAbonnementPage,
})

function MonAbonnementPage() {
  return (
    <div className="space-y-5 px-4 pb-6 pt-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1600px]">
      <PageHero
        variant="surface"
        eyebrow="Espace élève"
        title="Mon abonnement"
        subtitle="Gère ta formule, consulte tes factures et ton mode de paiement."
      />

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
                  <p className="text-sm font-semibold">{subscription.method}</p>
                  <p className="text-xs text-muted-foreground">Prélèvement mensuel via Mollie</p>
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
          <div className="flex flex-col gap-4 bg-gradient-to-br from-brand to-indigo-600 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15">
                <Crown className="size-6 text-amber-200" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Formule active
                </p>
                <p className="font-heading text-2xl font-extrabold">{subscription.plan}</p>
                <p className="text-sm text-white/80">{subscription.price}</p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
              <CheckCircle2 className="size-4" /> Actif
            </span>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-3">
            <InfoCell
              icon={<CreditCard className="size-4 text-brand" />}
              label="Paiement"
              value={subscription.method}
            />
            <InfoCell
              icon={<CalendarDays className="size-4 text-teal" />}
              label="Membre depuis"
              value={subscription.since}
            />
            <InfoCell
              icon={<CalendarDays className="size-4 text-amber" />}
              label="Prochaine facture"
              value={subscription.nextBilling}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-3 font-semibold">N° facture</th>
                  <th className="pb-2 pr-3 font-semibold">Date</th>
                  <th className="pb-2 pr-3 font-semibold">Montant</th>
                  <th className="pb-2 pr-3 font-semibold">Statut</th>
                  <th className="pb-2 text-right font-semibold">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium tabular-nums">{inv.id}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{inv.date}</td>
                    <td className="py-2.5 pr-3 font-semibold tabular-nums">{inv.amount}</td>
                    <td className="py-2.5 pr-3">
                      <Badge
                        variant={inv.status === 'payée' ? 'secondary' : 'outline'}
                        className={
                          inv.status === 'payée'
                            ? 'bg-success-soft text-success'
                            : 'text-muted-foreground'
                        }
                      >
                        {inv.status === 'payée' ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <CalendarDays className="size-3" />
                        )}
                        {inv.status === 'payée' ? 'Payée' : 'À venir'}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => toast.success(`Facture ${inv.id} téléchargée`)}
                      >
                        <Download className="size-4" />
                        <span className="sr-only sm:not-sr-only">Télécharger</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Résilier */}
        <Card className="flex-row items-center gap-3 border-destructive/20 bg-destructive/5 p-4 shadow-soft">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-destructive">
            <AlertCircle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Résilier mon abonnement</p>
            <p className="text-xs text-muted-foreground">
              Sans engagement. Tu gardes l'accès Premium jusqu'à la fin de la période payée.
            </p>
          </div>
          <CancelDialog />
        </Card>
      </RailLayout>
    </div>
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

function CancelDialog() {
  const [open, setOpen] = useState(false)

  function confirmCancel() {
    setOpen(false)
    toast.success('Abonnement résilié', {
      description: `Tu gardes l'accès jusqu'au ${subscription.nextBilling}.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10">
          Résilier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Résilier l'abonnement {subscription.plan} ?</DialogTitle>
          <DialogDescription>
            Tu garderas l'accès Premium jusqu'au{' '}
            <span className="font-semibold text-foreground">{subscription.nextBilling}</span>. Aucun
            nouveau prélèvement ne sera effectué.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Garder Premium
          </Button>
          <Button variant="destructive" onClick={confirmCancel}>
            Confirmer la résiliation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
