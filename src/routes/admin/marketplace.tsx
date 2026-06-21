import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Store,
  Clock,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  X,
  EyeOff,
  RotateCcw,
} from '@/components/icons'
import {
  products as initialProducts,
  productKindLabels,
  productStatusLabels,
  marketplaceSettings,
  payoutModeLabels,
  formatPrice,
  getSubject,
  classes,
  type MarketProduct,
  type ProductStatus,
  type PayoutMode,
} from '@/lib/mock'
import { PageHero } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/marketplace')({
  component: AdminMarketplace,
})

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const statusBadgeClass: Record<ProductStatus, string> = {
  en_attente: 'bg-amber-soft text-amber-foreground',
  publie: 'bg-success-soft text-success',
  rejete: 'bg-destructive/10 text-destructive',
  brouillon: 'bg-secondary text-muted-foreground',
  archive: 'bg-secondary text-muted-foreground',
}

const PAYOUT_MODES = Object.keys(payoutModeLabels) as PayoutMode[]
const STATUSES = Object.keys(productStatusLabels) as ProductStatus[]

function StatusBadge({ status }: { status: ProductStatus }) {
  return <Badge className={statusBadgeClass[status]}>{productStatusLabels[status]}</Badge>
}

function classLabel(code: string | null): string {
  if (!code) return 'Toutes classes'
  return classes.find((c) => c.code === code)?.code ?? code
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminMarketplace() {
  const [list, setList] = useState<MarketProduct[]>(initialProducts)
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all')

  // Réglages boutique
  const [payoutMode, setPayoutMode] = useState<PayoutMode>(marketplaceSettings.payoutMode)
  const [commissionRate, setCommissionRate] = useState<number>(marketplaceSettings.commissionRate)
  const [requireReview, setRequireReview] = useState<boolean>(marketplaceSettings.requireReview)

  // Rejet
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const stats = useMemo(() => {
    const published = list.filter((p) => p.status === 'publie').length
    const pending = list.filter((p) => p.status === 'en_attente').length
    const sales = list.reduce((a, p) => a + p.sales, 0)
    const revenue = list.reduce((a, p) => a + p.priceCents * p.sales, 0)
    return { published, pending, sales, revenue }
  }, [list])

  const counts = useMemo(() => {
    const map = { all: list.length } as Record<ProductStatus | 'all', number>
    for (const s of STATUSES) map[s] = list.filter((p) => p.status === s).length
    return map
  }, [list])

  const visible = filter === 'all' ? list : list.filter((p) => p.status === filter)

  const setStatus = (id: string, status: ProductStatus, note?: string) =>
    setList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status, reviewNote: status === 'rejete' ? note : undefined }
          : p,
      ),
    )

  const approve = (p: MarketProduct) => {
    setStatus(p.id, 'publie')
    toast.success(`« ${p.title} » publié`)
  }
  const unpublish = (p: MarketProduct) => {
    setStatus(p.id, 'archive')
    toast(`« ${p.title} » dépublié`)
  }
  const republish = (p: MarketProduct) => {
    setStatus(p.id, 'publie')
    toast.success(`« ${p.title} » re-publié`)
  }

  const openReject = (id: string) => {
    setRejectId(id)
    setRejectNote('')
  }
  const confirmReject = () => {
    if (!rejectId) return
    const note = rejectNote.trim()
    setStatus(rejectId, 'rejete', note.length ? note : undefined)
    setRejectId(null)
    toast.error('Produit rejeté')
  }

  const rejectTarget = list.find((p) => p.id === rejectId) ?? null

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Super admin"
        title="Marketplace"
        subtitle="Modère les produits vendables publiés par les profs et règle le modèle économique de la boutique."
      />

      {/* Réglages de la boutique */}
      <Card className="space-y-5 rounded-2xl p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-2">
          <Store className="size-5 text-muted-foreground" />
          <h2 className="font-heading text-lg font-bold">Réglages de la boutique</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Mode de reversement</Label>
            <Select value={payoutMode} onValueChange={(v) => setPayoutMode(v as PayoutMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYOUT_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {payoutModeLabels[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Commission (%)</Label>
            <Input
              id="commission"
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              disabled={payoutMode === 'academie'}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
            />
            {payoutMode === 'academie' && (
              <p className="text-xs text-muted-foreground">
                Aucun reversement : la commission ne s'applique pas.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Devise</Label>
            <div className="flex h-9 items-center rounded-md border border-border bg-secondary/40 px-3 text-sm font-medium uppercase">
              {marketplaceSettings.currency}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-3">
          <div>
            <div className="text-sm font-medium">Modération avant publication</div>
            <p className="text-xs text-muted-foreground">
              Les produits des profs passent en file d'attente avant d'être visibles.
            </p>
          </div>
          <Switch
            checked={requireReview}
            onCheckedChange={setRequireReview}
            aria-label="Modération avant publication"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => toast.success('Réglages enregistrés (démo)')}>Enregistrer</Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Store} label="Produits publiés" value={stats.published} />
        <StatTile icon={Clock} label="En attente" value={stats.pending} />
        <StatTile icon={ShoppingBag} label="Ventes totales" value={stats.sales} />
        <StatTile icon={TrendingUp} label="CA estimé" value={formatPrice(stats.revenue)} />
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="Toutes"
          count={counts.all}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={productStatusLabels[s]}
            count={counts[s]}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {/* Liste */}
      {visible.length === 0 ? (
        <Card className="rounded-2xl p-10 text-center text-sm text-muted-foreground shadow-soft">
          Aucun produit pour ce statut.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onApprove={() => approve(p)}
              onReject={() => openReject(p.id)}
              onUnpublish={() => unpublish(p)}
              onRepublish={() => republish(p)}
            />
          ))}
        </div>
      )}

      {/* Dialog motif de rejet */}
      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le produit</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `Indique au vendeur (${rejectTarget.sellerName}) le motif du rejet.`
                : 'Indique le motif du rejet.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-note">Motif</Label>
            <Textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Ex. : qualité audio insuffisante, merci de réuploader."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store
  label: string
  value: string | number
}) {
  return (
    <Card className="flex items-center gap-3 rounded-2xl p-4 shadow-soft">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="truncate font-heading text-xl font-extrabold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        active
          ? 'border-transparent bg-brand text-white shadow-soft'
          : 'border-border bg-card text-muted-foreground hover:bg-secondary/60',
      )}
    >
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 text-xs tabular-nums',
          active ? 'bg-white/20' : 'bg-secondary',
        )}
      >
        {count}
      </span>
    </button>
  )
}

function ProductCard({
  product,
  onApprove,
  onReject,
  onUnpublish,
  onRepublish,
}: {
  product: MarketProduct
  onApprove: () => void
  onReject: () => void
  onUnpublish: () => void
  onRepublish: () => void
}) {
  const subjectColor = product.subject ? getSubject(product.subject).color : null

  return (
    <Card className="flex flex-col gap-3 rounded-2xl p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-3xl">
          {product.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-semibold leading-tight">{product.title}</h3>
            <StatusBadge status={product.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">par {product.sellerName}</p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {product.subject ? (
          <Badge variant="outline" className="gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: subjectColor ?? undefined }}
            />
            {getSubject(product.subject).label}
          </Badge>
        ) : (
          <Badge variant="outline">Transversal</Badge>
        )}
        <Badge variant="outline">{classLabel(product.classCode)}</Badge>
        <Badge variant="outline">{productKindLabels[product.kind]}</Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-heading text-lg font-extrabold">
          {product.priceCents === 0 ? 'Gratuit' : formatPrice(product.priceCents)}
        </span>
        <span className="text-muted-foreground tabular-nums">{product.sales} ventes</span>
      </div>

      {product.status === 'rejete' && product.reviewNote && (
        <p className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          Motif : {product.reviewNote}
        </p>
      )}

      {/* Actions de modération */}
      {product.status === 'en_attente' && (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onApprove}>
            <CheckCircle2 className="size-4" />
            Valider
          </Button>
          <Button variant="outline" className="flex-1" onClick={onReject}>
            <X className="size-4" />
            Rejeter
          </Button>
        </div>
      )}
      {product.status === 'publie' && (
        <Button variant="outline" onClick={onUnpublish}>
          <EyeOff className="size-4" />
          Dépublier
        </Button>
      )}
      {product.status === 'rejete' && (
        <Button variant="outline" onClick={onRepublish}>
          <RotateCcw className="size-4" />
          Re-publier
        </Button>
      )}
    </Card>
  )
}
