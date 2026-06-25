import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShoppingBag, Check, CreditCard, Crown } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { spreadAvatar } from '@/lib/avatar'
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
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { productKindLabels, formatPrice, type ProductKind } from '@/lib/mock'
import { usePlans, useSubscribe, useCheckout } from '@/hooks/use-billing'
import { useProducts } from '@/hooks/use-marketplace'
import { useChildren } from '@/hooks/use-parent'
import { useSubjects } from '@/hooks/use-catalog'
import type { Product } from '@/services/marketplace'

export const Route = createFileRoute('/parent/boutique')({
  component: ParentBoutique,
})

const KIND_EMOJI: Record<string, string> = { ebook: '📘', fiche: '📄', pack: '📦', video: '🎬', autre: '🧩' }

function ParentBoutique() {
  const { data: plans = [] } = usePlans()
  const { data: children = [] } = useChildren()
  const { data: products = [], isLoading } = useProducts()
  const { data: subjects = [] } = useSubjects()
  const subscribe = useSubscribe()
  const checkout = useCheckout()

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const [planChild, setPlanChild] = useState<Record<string, string>>({})

  function doSubscribe(planId: string) {
    const studentId = planChild[planId] ?? children[0]?.id
    if (!studentId) {
      toast.error("Ajoute d'abord un enfant à ton compte.")
      return
    }
    subscribe.mutate(
      { planId, studentId },
      { onError: () => toast.error("Le paiement n'a pas pu démarrer. Réessaie.") },
    )
  }

  const catalogue = products // déjà filtré « publié » côté BFF

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Boutique"
        title="Abonnement & contenus"
        subtitle="Choisis une formule pour ton enfant et accède aux contenus premium des profs."
      />

      {/* Abonnement (D1) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="size-5 text-amber" />
          <h2 className="font-heading text-lg font-bold">Formules d'abonnement</h2>
        </div>
        {plans.length === 0 ? (
          <Card className="py-8 text-center text-sm text-muted-foreground">Aucune formule disponible pour le moment.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id} className="gap-0 p-5 shadow-soft">
                <p className="font-heading text-base font-bold">{p.name}</p>
                <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums">
                  {formatPrice(p.priceCents)}
                  {p.period && <span className="text-sm font-medium text-muted-foreground"> /{p.period}</span>}
                </p>
                {children.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Pour quel enfant ?</label>
                    <Select value={planChild[p.id] ?? children[0]?.id} onValueChange={(v) => setPlanChild((s) => ({ ...s, [p.id]: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{spreadAvatar(c.avatar, c.pseudo)} {c.pseudo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button className="mt-4 w-full" disabled={subscribe.isPending || children.length === 0} onClick={() => doSubscribe(p.id)}>
                  <CreditCard className="size-4" /> S'abonner
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Contenus premium (marketplace) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-5 text-brand" />
          <h2 className="font-heading text-lg font-bold">Contenus premium</h2>
        </div>
        {isLoading ? (
          <Card className="py-8 text-center text-sm text-muted-foreground">Chargement…</Card>
        ) : catalogue.length === 0 ? (
          <Card className="py-8 text-center text-sm text-muted-foreground">Aucun contenu disponible pour le moment.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogue.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                subjectName={p.subjectId ? subjectById.get(p.subjectId)?.name ?? null : null}
                subjectColor={p.subjectId ? subjectById.get(p.subjectId)?.color ?? null : null}
                pending={checkout.isPending}
                onBuy={() => checkout.mutate(p.id, { onError: () => toast.error("Le paiement n'a pas pu démarrer.") })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProductCard({
  product: p,
  subjectName,
  subjectColor,
  pending,
  onBuy,
}: {
  product: Product
  subjectName: string | null
  subjectColor: string | null
  pending: boolean
  onBuy: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="card-hover gap-0 p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-12 place-items-center rounded-xl bg-secondary text-2xl">{KIND_EMOJI[p.kind] ?? '🧩'}</span>
        <span className="font-heading text-lg font-extrabold tabular-nums">{p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}</span>
      </div>
      <p className="mt-3 font-heading text-base font-bold leading-tight">{p.title}</p>
      {p.sellerName && <p className="text-xs text-muted-foreground">par {p.sellerName}</p>}
      {p.description && <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.description}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {subjectName ? (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: subjectColor ?? 'var(--brand)' }}>
            {subjectName}
          </span>
        ) : (
          <Badge variant="secondary" className="bg-secondary text-muted-foreground">Transversal</Badge>
        )}
        <Badge variant="secondary" className="bg-secondary text-muted-foreground">{productKindLabels[p.kind as ProductKind] ?? p.kind}</Badge>
      </div>
      <Button className="mt-4 w-full" onClick={() => setOpen(true)}>
        <ShoppingBag className="size-4" /> {p.priceCents > 0 ? 'Acheter' : 'Obtenir'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
            <DialogDescription>Paiement sécurisé via Stripe — facture disponible dans votre espace.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
            <span className="grid size-14 place-items-center rounded-xl bg-card text-3xl">{KIND_EMOJI[p.kind] ?? '🧩'}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base font-bold">{p.title}</p>
              {p.sellerName && <p className="text-xs text-muted-foreground">par {p.sellerName}</p>}
            </div>
            <span className={cn('shrink-0 font-heading text-xl font-extrabold tabular-nums')}>{p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}</span>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Annuler</Button>
            </DialogClose>
            <Button disabled={pending} onClick={onBuy}>
              <Check className="size-4" /> {p.priceCents > 0 ? `Payer ${formatPrice(p.priceCents)}` : 'Obtenir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
