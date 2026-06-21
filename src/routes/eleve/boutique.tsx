import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShoppingBag, Download, Check, FileIcon, Sparkles } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { SubjectFilter, type SubjectFilterValue } from '@/components/student/subject-filter'
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
  products,
  productKindLabels,
  subjects,
  getSubject,
  classes,
  formatPrice,
  type MarketProduct,
} from '@/lib/mock'

export const Route = createFileRoute('/eleve/boutique')({
  component: BoutiquePage,
})

/** Catalogue = produits publiés uniquement. */
const catalogue = products.filter((p) => p.status === 'publie')

function BoutiquePage() {
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [buying, setBuying] = useState<MarketProduct | null>(null)

  const visible = catalogue.filter((p) => subject === 'all' || p.subject === subject)

  const subjectCounts: Partial<Record<SubjectFilterValue, number>> = { all: catalogue.length }
  for (const s of subjects) {
    subjectCounts[s.key] = catalogue.filter((p) => p.subject === s.key).length
  }

  const confirmPurchase = (p: MarketProduct) => {
    setOwned((prev) => new Set(prev).add(p.id))
    setBuying(null)
    toast.success('Achat confirmé', {
      description: `« ${p.title} » est maintenant disponible dans ta bibliothèque.`,
    })
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-[1500px]">
      <PageHero
        eyebrow="Boutique"
        title="Contenus premium"
        subtitle="Des e-books, fiches et packs d'exercices proposés par tes profs pour aller plus loin."
      />

      <SubjectFilter value={subject} onChange={setSubject} counts={subjectCounts} />

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucun produit disponible dans cette matière pour l'instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <BoutiqueCard
              key={p.id}
              product={p}
              owned={owned.has(p.id)}
              onBuy={() => setBuying(p)}
            />
          ))}
        </div>
      )}

      <PurchaseDialog
        product={buying}
        onClose={() => setBuying(null)}
        onConfirm={confirmPurchase}
      />
    </div>
  )
}

function BoutiqueCard({
  product: p,
  owned,
  onBuy,
}: {
  product: MarketProduct
  owned: boolean
  onBuy: () => void
}) {
  const subject = p.subject ? getSubject(p.subject) : null
  const classLabel = p.classCode
    ? (classes.find((c) => c.code === p.classCode)?.label ?? p.classCode)
    : 'Toutes classes'

  return (
    <Card className="card-hover gap-0 p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-12 place-items-center rounded-xl bg-secondary text-2xl">
          {p.emoji}
        </span>
        <span className="font-heading text-lg font-extrabold tabular-nums">
          {p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}
        </span>
      </div>

      <p className="mt-3 font-heading text-base font-bold leading-tight">{p.title}</p>
      <p className="text-xs text-muted-foreground">par {p.sellerName}</p>

      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.description}</p>

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
          {productKindLabels[p.kind]}
        </Badge>
        <Badge variant="secondary" className="bg-secondary text-muted-foreground">
          {classLabel}
        </Badge>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {p.files.length} fichier(s) · {p.sales} achat(s)
      </p>

      {owned ? (
        <Button
          variant="secondary"
          className="mt-4 w-full bg-teal-soft text-teal-foreground hover:bg-teal-soft/80"
          onClick={() => toast.success('Téléchargement', { description: p.title })}
        >
          <Download className="size-4" />
          Télécharger
        </Button>
      ) : (
        <Button className="mt-4 w-full" onClick={onBuy}>
          <ShoppingBag className="size-4" />
          {p.priceCents > 0 ? 'Acheter' : 'Obtenir'}
        </Button>
      )}
    </Card>
  )
}

function PurchaseDialog({
  product: p,
  onClose,
  onConfirm,
}: {
  product: MarketProduct | null
  onClose: () => void
  onConfirm: (p: MarketProduct) => void
}) {
  const subject = p?.subject ? getSubject(p.subject) : null

  return (
    <Dialog open={p !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {p && (
          <>
            <DialogHeader>
              <DialogTitle>Confirmer l'achat</DialogTitle>
              <DialogDescription>
                Le contenu sera ajouté à ta bibliothèque dès le paiement validé.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
              <span className="grid size-14 place-items-center rounded-xl bg-card text-3xl">
                {p.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-base font-bold">{p.title}</p>
                <p className="text-xs text-muted-foreground">par {p.sellerName}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {subject && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: subject.color }}
                    >
                      {subject.label}
                    </span>
                  )}
                  <Badge variant="secondary" className="bg-card text-muted-foreground">
                    {productKindLabels[p.kind]}
                  </Badge>
                </div>
              </div>
              <span className="shrink-0 font-heading text-xl font-extrabold tabular-nums">
                {p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}
              </span>
            </div>

            <ul className="space-y-1.5">
              {p.files.map((f) => (
                <li key={f.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileIcon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-xs">{f.size}</span>
                </li>
              ))}
            </ul>

            <p className="flex items-center gap-1.5 rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand">
              <Sparkles className="size-3.5 shrink-0" />
              Paiement sécurisé — un adulte peut être requis pour valider l'achat.
            </p>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Annuler</Button>
              </DialogClose>
              <Button onClick={() => onConfirm(p)}>
                <Check className="size-4" />
                {p.priceCents > 0 ? `Payer ${formatPrice(p.priceCents)}` : 'Obtenir gratuitement'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
