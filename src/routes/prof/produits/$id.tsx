import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  ArrowLeft,
  FileIcon,
  Download,
  ShoppingBag,
  Tag,
  Users,
  Percent,
  Pencil,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatTile } from '@/components/blocks'
import { avatarTint } from '@/components/student/parts'
import { cn } from '@/lib/utils'
import {
  products,
  productKindLabels,
  productStatusLabels,
  getSubject,
  classes,
  marketplaceSettings,
  formatPrice,
  buyersFor,
  type ProductStatus,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/produits/$id')({
  component: ProductDetail,
})

const STATUS_TONE: Record<ProductStatus, string> = {
  en_attente: 'bg-amber-soft text-amber-foreground',
  publie: 'bg-teal-soft text-teal-foreground',
  rejete: 'bg-destructive/10 text-destructive',
  brouillon: 'bg-secondary text-muted-foreground',
  archive: 'bg-secondary text-muted-foreground',
}

function netFromGross(grossCents: number): number {
  if (marketplaceSettings.payoutMode === 'academie') return 0
  return Math.round(grossCents * (1 - marketplaceSettings.commissionRate / 100))
}

function ProductDetail() {
  const { id } = Route.useParams()
  const p = products.find((x) => x.id === id)

  if (!p) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[1700px]">
        <BackLink />
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Produit introuvable.
        </Card>
      </div>
    )
  }

  const subject = p.subject ? getSubject(p.subject) : null
  const classLabel = p.classCode
    ? (classes.find((c) => c.code === p.classCode)?.label ?? p.classCode)
    : 'Toutes les classes'

  const buyers = buyersFor(p.id)
  const gross = p.priceCents * p.sales
  const commission = gross - netFromGross(gross)
  const net = netFromGross(gross)

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <BackLink />

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Aperçu acheteur + livrables */}
        <div className="space-y-4">
          <Card className="gap-0 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-4xl">
                {p.emoji}
              </span>
              <Badge variant="secondary" className={cn('shrink-0', STATUS_TONE[p.status])}>
                {productStatusLabels[p.status]}
              </Badge>
            </div>
            <p className="mt-3 font-heading text-lg font-bold">{p.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {subject ? (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.label}
                </span>
              ) : (
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                  Transversal
                </Badge>
              )}
              <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                {classLabel}
              </Badge>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                {productKindLabels[p.kind]}
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="font-heading text-2xl font-extrabold tabular-nums">
                {p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}
              </span>
              <Button size="sm" variant="outline" onClick={() => toast('Édition à venir (maquette)')}>
                <Pencil className="size-4" />
                Modifier
              </Button>
            </div>
          </Card>

          {/* Livrables */}
          <Card className="gap-0 p-5">
            <h2 className="font-heading text-sm font-bold">Fichiers du produit</h2>
            {p.files.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Aucun fichier joint.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {p.files.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
                  >
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{f.size}</span>
                    <button
                      type="button"
                      onClick={() => toast.success('Téléchargement', { description: f.name })}
                      className="text-muted-foreground hover:text-brand"
                      aria-label="Télécharger"
                    >
                      <Download className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Stats + acheteurs */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatTile icon={ShoppingBag} tone="amber" label="Ventes" value={p.sales} />
            <StatTile icon={Tag} tone="brand" label="CA brut" value={formatPrice(gross)} />
            <StatTile icon={Percent} tone="info" label={`Commission ${marketplaceSettings.commissionRate}%`} value={formatPrice(commission)} />
            <StatTile icon={Tag} tone="teal" label="Revenu net" value={formatPrice(net)} />
          </div>

          {marketplaceSettings.payoutMode === 'academie' && (
            <p className="rounded-xl bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
              Mode « académie » : les ventes sont intégralement reversées à l'académie.
            </p>
          )}

          <Card className="gap-0 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-5 text-brand" />
              <h2 className="font-heading text-base font-bold">Acheteurs</h2>
              <span className="text-sm text-muted-foreground">
                · {p.sales} achat(s){buyers.length < p.sales ? ' — derniers affichés' : ''}
              </span>
            </div>

            {buyers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun acheteur pour l'instant.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {buyers.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold',
                        avatarTint(b.name),
                      )}
                    >
                      {b.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.date}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'shrink-0',
                        b.role === 'parent'
                          ? 'bg-info-soft text-info'
                          : 'bg-brand-soft text-brand',
                      )}
                    >
                      {b.role === 'parent' ? 'Parent' : 'Élève'}
                    </Badge>
                    <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">
                      {formatPrice(b.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
      <Link to="/prof/produits">
        <ArrowLeft className="size-4" />
        Retour à la boutique
      </Link>
    </Button>
  )
}
