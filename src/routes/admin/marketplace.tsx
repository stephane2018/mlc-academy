import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Store, CheckCircle2, X, EyeOff, Loader } from '@/components/icons'
import {
  useModerationProducts,
  useModerateProduct,
} from '@/hooks/use-admin'
import type { ModeratedProduct, ProductStatus } from '@/services/content'
import { PageHero } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const PRODUCT_STATUSES: ProductStatus[] = [
  'brouillon',
  'en_attente',
  'publie',
  'rejete',
  'archive',
]

const statusLabels: Record<ProductStatus, string> = {
  brouillon: 'Brouillon',
  en_attente: 'En attente',
  publie: 'Publié',
  rejete: 'Rejeté',
  archive: 'Archivé',
}

const statusBadgeClass: Record<ProductStatus, string> = {
  en_attente: 'bg-amber-soft text-amber-foreground',
  publie: 'bg-success-soft text-success',
  rejete: 'bg-destructive/10 text-destructive',
  brouillon: 'bg-secondary text-muted-foreground',
  archive: 'bg-secondary text-muted-foreground',
}

function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as string[]).includes(value)
}

function statusLabel(status: string): string {
  return isProductStatus(status) ? statusLabels[status] : status
}

function StatusBadge({ status }: { status: string }) {
  const className = isProductStatus(status)
    ? statusBadgeClass[status]
    : 'bg-secondary text-muted-foreground'
  return <Badge className={className}>{statusLabel(status)}</Badge>
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function AdminMarketplace() {
  const [filter, setFilter] = useState<ProductStatus>('en_attente')

  const { data, isLoading, isError } = useModerationProducts(filter)
  const moderate = useModerateProduct()

  const products = useMemo<ModeratedProduct[]>(() => data ?? [], [data])

  // Rejet
  const [rejectTarget, setRejectTarget] = useState<ModeratedProduct | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const pendingId =
    moderate.isPending && typeof moderate.variables?.id === 'string'
      ? moderate.variables.id
      : null

  const publish = (p: ModeratedProduct) => {
    moderate.mutate(
      { id: p.id, input: { action: 'publie' } },
      { onSuccess: () => toast.success(`« ${p.title} » publié`) },
    )
  }

  const archive = (p: ModeratedProduct) => {
    moderate.mutate(
      { id: p.id, input: { action: 'archive' } },
      { onSuccess: () => toast(`« ${p.title} » archivé`) },
    )
  }

  const openReject = (p: ModeratedProduct) => {
    setRejectTarget(p)
    setRejectNote('')
  }

  const confirmReject = () => {
    if (!rejectTarget) return
    const note = rejectNote.trim()
    const target = rejectTarget
    moderate.mutate(
      {
        id: target.id,
        input: { action: 'rejete', reviewNote: note.length ? note : undefined },
      },
      {
        onSuccess: () => {
          toast.error(`« ${target.title} » rejeté`)
          setRejectTarget(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Super admin"
        title="Marketplace"
        subtitle="Modère les produits vendables publiés par les profs : valide, rejette ou archive."
      />

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2">
        {PRODUCT_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={statusLabels[s]}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <Card className="flex items-center justify-center gap-2 rounded-2xl p-10 text-sm text-muted-foreground shadow-soft">
          <Loader className="size-4 animate-spin" />
          Chargement des produits…
        </Card>
      ) : isError ? (
        <Card className="rounded-2xl p-10 text-center text-sm text-destructive shadow-soft">
          Impossible de charger les produits. Réessaie plus tard.
        </Card>
      ) : products.length === 0 ? (
        <Card className="rounded-2xl p-10 text-center text-sm text-muted-foreground shadow-soft">
          Aucun produit pour ce statut.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              busy={pendingId === p.id}
              onApprove={() => publish(p)}
              onReject={() => openReject(p)}
              onArchive={() => archive(p)}
            />
          ))}
        </div>
      )}

      {/* Dialog motif de rejet */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && !moderate.isPending && setRejectTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le produit</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `Indique le motif du rejet de « ${rejectTarget.title} ».`
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
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={moderate.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={moderate.isPending}
            >
              {moderate.isPending && <Loader className="size-4 animate-spin" />}
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

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
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
    </button>
  )
}

function ProductCard({
  product,
  busy,
  onApprove,
  onReject,
  onArchive,
}: {
  product: ModeratedProduct
  busy: boolean
  onApprove: () => void
  onReject: () => void
  onArchive: () => void
}) {
  return (
    <Card className="flex flex-col gap-3 rounded-2xl p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
          <Store className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-semibold leading-tight">{product.title}</h3>
            <StatusBadge status={product.status} />
          </div>
        </div>
      </div>

      {product.status === 'rejete' && product.reviewNote && (
        <p className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          Motif : {product.reviewNote}
        </p>
      )}

      {/* Actions de modération */}
      <div className="flex flex-wrap gap-2">
        {product.status !== 'publie' && (
          <Button className="flex-1" onClick={onApprove} disabled={busy}>
            {busy ? <Loader className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Publier
          </Button>
        )}
        {product.status !== 'rejete' && (
          <Button variant="outline" className="flex-1" onClick={onReject} disabled={busy}>
            <X className="size-4" />
            Rejeter
          </Button>
        )}
        {product.status !== 'archive' && (
          <Button variant="outline" className="flex-1" onClick={onArchive} disabled={busy}>
            <EyeOff className="size-4" />
            Archiver
          </Button>
        )}
      </div>
    </Card>
  )
}
