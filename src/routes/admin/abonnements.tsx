import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CreditCard, Users, Tag, Plus, Pencil, Trash2, CalendarDays } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SectionHeader } from '@/components/student/parts'
import { StatTile } from '@/components/blocks'
import { cn } from '@/lib/utils'
import {
  useAdminPlans,
  useAdminSubscriptions,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from '@/hooks/use-admin-billing'
import type { AdminPlan, SubscriptionStatus } from '@/services/admin-billing'

export const Route = createFileRoute('/admin/abonnements')({
  component: AdminAbonnements,
})

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const priceFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function formatPrice(priceCents: number): string {
  return priceFmt.format(priceCents / 100)
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d)
}

/* ------------------------------------------------------------------ */
/* Statut d'abonnement                                                 */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trialing: 'Essai',
  active: 'Actif',
  past_due: 'Impayé',
  canceled: 'Annulé',
  incomplete: 'Incomplet',
  unpaid: 'Non payé',
}

const STATUS_TONE: Record<SubscriptionStatus, string> = {
  trialing: 'bg-info-soft text-info',
  active: 'bg-success-soft text-success',
  past_due: 'bg-amber-soft text-amber-foreground',
  canceled: 'bg-destructive/10 text-destructive',
  incomplete: 'bg-secondary text-muted-foreground',
  unpaid: 'bg-destructive/10 text-destructive',
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge className={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}

/* ------------------------------------------------------------------ */
/* Petits composants                                                   */
/* ------------------------------------------------------------------ */

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
      <div className="overflow-x-auto">{children}</div>
    </Card>
  )
}

const TH = 'px-5 py-3 font-semibold'
const THEAD =
  'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground'

/* ------------------------------------------------------------------ */
/* Dialog : créer / éditer une formule                                 */
/* ------------------------------------------------------------------ */

function PlanDialog({
  open,
  plan,
  onClose,
}: {
  open: boolean
  plan: AdminPlan | null
  onClose: () => void
}) {
  const create = useCreatePlan()
  const update = useUpdatePlan()
  const pending = create.isPending || update.isPending
  const isEdit = plan !== null

  const [name, setName] = useState(plan?.name ?? '')
  const [priceEuros, setPriceEuros] = useState(plan ? String(plan.priceCents / 100) : '')
  const [period, setPeriod] = useState(plan?.period ?? '')

  const submit = () => {
    const trimmedName = name.trim()
    const euros = Number(priceEuros.replace(',', '.'))
    if (!trimmedName || !Number.isFinite(euros) || euros < 0) {
      toast.error('Renseigne un nom et un prix valide.')
      return
    }
    const priceCents = Math.round(euros * 100)
    const periodValue = period.trim() || null

    if (isEdit && plan) {
      update.mutate(
        { id: plan.id, body: { name: trimmedName, priceCents, period: periodValue } },
        {
          onSuccess: () => {
            toast.success('Formule mise à jour')
            onClose()
          },
          onError: () => toast.error('Impossible de mettre à jour la formule'),
        },
      )
    } else {
      create.mutate(
        { name: trimmedName, priceCents, period: periodValue },
        {
          onSuccess: () => {
            toast.success('Formule créée')
            onClose()
          },
          onError: () => toast.error('Impossible de créer la formule'),
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier la formule' : 'Nouvelle formule'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Mets à jour le nom, le prix et la période.' : 'Crée une nouvelle formule d’abonnement.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="plan-name">Nom</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-price">Prix (€)</Label>
            <Input
              id="plan-price"
              type="number"
              min={0}
              step="0.01"
              value={priceEuros}
              onChange={(e) => setPriceEuros(e.target.value)}
              placeholder="9.90"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-period">Période</Label>
            <Input
              id="plan-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="/ mois"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={pending}>
            {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Dialog : supprimer une formule                                      */
/* ------------------------------------------------------------------ */

function DeletePlanDialog({
  plan,
  onClose,
}: {
  plan: AdminPlan | null
  onClose: () => void
}) {
  const del = useDeletePlan()

  const submit = () => {
    if (!plan) return
    del.mutate(plan.id, {
      onSuccess: () => {
        toast.success('Formule supprimée')
        onClose()
      },
      onError: () => toast.error('Impossible de supprimer la formule'),
    })
  }

  return (
    <Dialog open={!!plan} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {plan && (
          <>
            <DialogHeader>
              <DialogTitle>Supprimer la formule</DialogTitle>
              <DialogDescription>Supprimer définitivement « {plan.name} » ?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={del.isPending}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={submit} disabled={del.isPending}>
                <Trash2 className="size-4" />
                Supprimer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* États de table                                                      */
/* ------------------------------------------------------------------ */

const COLSPAN = 5

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          <td colSpan={COLSPAN} className="px-5 py-3">
            <Skeleton className="h-6 w-full" />
          </td>
        </tr>
      ))}
    </>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={COLSPAN} className="px-5 py-10 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminAbonnements() {
  const plansQuery = useAdminPlans()
  const subsQuery = useAdminSubscriptions()

  const plans = plansQuery.data ?? []
  const subscriptions = subsQuery.data ?? []

  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<AdminPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPlan | null>(null)

  const planNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of plans) map.set(p.id, p.name)
    return map
  }, [plans])

  const activeCount = subscriptions.filter((s) => s.status === 'active').length

  const openCreate = () => {
    setEditPlan(null)
    setPlanDialogOpen(true)
  }
  const openEdit = (plan: AdminPlan) => {
    setEditPlan(plan)
    setPlanDialogOpen(true)
  }
  const closePlanDialog = () => {
    setPlanDialogOpen(false)
    setEditPlan(null)
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
          Abonnements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gère les formules et suis les abonnements des familles.
        </p>
      </div>

      {/* Synthèse (données réelles) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Tag} tone="brand" label="Formules" value={plans.length} />
        <StatTile icon={CreditCard} tone="teal" label="Abonnements" value={subscriptions.length} />
        <StatTile icon={Users} tone="success" label="Abonnements actifs" value={activeCount} />
      </div>

      {/* Formules */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Formules" />
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Nouvelle formule
          </Button>
        </div>

        {plansQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : plansQuery.isError ? (
          <Card className="rounded-2xl p-8 text-center text-muted-foreground shadow-soft">
            Impossible de charger les formules.
          </Card>
        ) : plans.length === 0 ? (
          <Card className="rounded-2xl p-8 text-center text-muted-foreground shadow-soft">
            Aucune formule pour le moment.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="card-hover gap-3 rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(plan)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(plan)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="font-heading text-2xl font-extrabold">
                  {formatPrice(plan.priceCents)}
                  {plan.period ? (
                    <span className="text-sm font-medium text-muted-foreground"> {plan.period}</span>
                  ) : null}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Abonnements */}
      <section>
        <SectionHeader title="Abonnements" />
        <TableCard>
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className={THEAD}>
                <th className={TH}>Formule</th>
                <th className={TH}>Statut</th>
                <th className={TH}>Méthode</th>
                <th className={TH}>Début</th>
                <th className={cn(TH, 'text-right')}>Fin de période</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subsQuery.isLoading ? (
                <LoadingRows />
              ) : subsQuery.isError ? (
                <EmptyRow message="Impossible de charger les abonnements." />
              ) : subscriptions.length === 0 ? (
                <EmptyRow message="Aucun abonnement pour le moment." />
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <Badge variant="outline">
                        {sub.planId ? planNameById.get(sub.planId) ?? sub.planId : '—'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{sub.method ?? '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">
                      {formatDate(sub.startedAt)}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">
                      <span className="inline-flex items-center justify-end gap-1.5">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {formatDate(sub.currentPeriodEnd)}
                        {sub.cancelAtPeriodEnd ? (
                          <Badge className="bg-amber-soft text-amber-foreground">Résiliation</Badge>
                        ) : null}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableCard>
      </section>

      <PlanDialog
        key={editPlan?.id ?? 'new'}
        open={planDialogOpen}
        plan={editPlan}
        onClose={closePlanDialog}
      />
      <DeletePlanDialog plan={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
