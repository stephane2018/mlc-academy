import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QueryError } from '@/components/query-error'
import { cn } from '@/lib/utils'
import { productKindLabels, formatPrice, type ProductKind } from '@/lib/mock'
import { useMyProducts } from '@/hooks/use-marketplace'
import { useSubjects, useClasses } from '@/hooks/use-catalog'

export const Route = createFileRoute('/prof/produits/$id')({
  component: ProductDetail,
})

const KIND_EMOJI: Record<string, string> = { ebook: '📘', fiche: '📄', pack: '📦', video: '🎬', autre: '🧩' }
const STATUS_LABEL: Record<string, string> = { en_attente: 'En attente', publie: 'Publié', rejete: 'Rejeté', brouillon: 'Brouillon', archive: 'Archivé' }
const STATUS_TONE: Record<string, string> = {
  en_attente: 'bg-amber-soft text-amber-foreground',
  publie: 'bg-teal-soft text-teal-foreground',
  rejete: 'bg-destructive/10 text-destructive',
  brouillon: 'bg-secondary text-muted-foreground',
  archive: 'bg-secondary text-muted-foreground',
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

function ProductDetail() {
  const { id } = Route.useParams()
  const productsQ = useMyProducts()
  const products = productsQ.data ?? []
  const isLoading = productsQ.isLoading
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const p = products.find((x) => x.id === id)

  if (isLoading) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[1700px]">
        <BackLink />
        <Card className="py-12 text-center text-sm text-muted-foreground">Chargement…</Card>
      </div>
    )
  }
  if (productsQ.isError) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[1700px]">
        <BackLink />
        <QueryError onRetry={() => productsQ.refetch()} />
      </div>
    )
  }
  if (!p) {
    return (
      <div className="space-y-4 2xl:mx-auto 2xl:max-w-[1700px]">
        <BackLink />
        <Card className="py-12 text-center text-sm text-muted-foreground">Produit introuvable.</Card>
      </div>
    )
  }

  const subject = p.subjectId ? subjects.find((s) => s.id === p.subjectId) : null
  const classLabel = p.classId ? (classes.find((c) => c.id === p.classId)?.label ?? null) : 'Toutes les classes'

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[900px]">
      <BackLink />

      <Card className="gap-0 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-4xl">{KIND_EMOJI[p.kind] ?? '🧩'}</span>
          <Badge variant="secondary" className={cn('shrink-0', STATUS_TONE[p.status])}>
            {STATUS_LABEL[p.status] ?? p.status}
          </Badge>
        </div>
        <p className="mt-3 font-heading text-xl font-bold">{p.title}</p>
        {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {subject ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: subject.color ?? 'var(--brand)' }}>
              {subject.name}
            </span>
          ) : (
            <Badge variant="secondary" className="bg-secondary text-muted-foreground">Transversal</Badge>
          )}
          {classLabel && <Badge variant="secondary" className="bg-secondary text-muted-foreground">{classLabel}</Badge>}
          <Badge variant="secondary" className="bg-secondary text-muted-foreground">{productKindLabels[p.kind as ProductKind] ?? p.kind}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-heading text-2xl font-extrabold tabular-nums">
            {p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}
          </span>
        </div>

        {p.status === 'rejete' && p.reviewNote && (
          <div className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span className="font-semibold">Motif du rejet : </span>
            {p.reviewNote}
          </div>
        )}
        {p.status === 'en_attente' && (
          <p className="mt-3 rounded-xl bg-amber-soft px-3 py-2 text-sm text-amber-foreground">
            En attente de validation par l'administration.
          </p>
        )}
      </Card>
    </div>
  )
}
