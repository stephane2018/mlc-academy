import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShoppingBag, Check, Sparkles } from '@/components/icons'
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
  productKindLabels,
  getSubject,
  formatPrice,
  type SubjectKey,
  type ProductKind,
} from '@/lib/mock'
import { useProducts } from '@/hooks/use-marketplace'
import { useCheckout } from '@/hooks/use-billing'
import { useSubjects, useClasses } from '@/hooks/use-catalog'

export const Route = createFileRoute('/eleve/boutique')({
  component: BoutiquePage,
})

/** Produit prêt pour le rendu (libellés/visuel résolus depuis le BFF). */
type BoutiqueView = {
  id: string
  title: string
  sellerName: string
  description: string
  kind: ProductKind
  subject: SubjectKey | null
  classCode: string | null
  priceCents: number
  emoji: string
}

const KIND_EMOJI: Record<string, string> = { ebook: '📘', fiche: '📄', pack: '📦', video: '🎬', autre: '🧩' }

function BoutiquePage() {
  const [subject, setSubject] = useState<SubjectFilterValue>('all')
  const [buying, setBuying] = useState<BoutiqueView | null>(null)
  const { data: products = [], isLoading } = useProducts()
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const checkout = useCheckout()

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const classById = new Map(classes.map((c) => [c.id, c]))

  const catalogue: BoutiqueView[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    sellerName: p.sellerName ?? 'MLC Academy',
    description: p.description ?? '',
    kind: p.kind as ProductKind,
    subject: (p.subjectId ? subjectById.get(p.subjectId)?.code : null) as SubjectKey | null,
    classCode: p.classId ? (classById.get(p.classId)?.code ?? null) : null,
    priceCents: p.priceCents,
    emoji: KIND_EMOJI[p.kind] ?? '🧩',
  }))

  const visible = catalogue.filter((p) => subject === 'all' || p.subject === subject)

  const subjectCounts: Partial<Record<SubjectFilterValue, number>> = { all: catalogue.length }
  for (const p of catalogue) {
    if (p.subject) subjectCounts[p.subject] = (subjectCounts[p.subject] ?? 0) + 1
  }

  const confirmPurchase = (p: BoutiqueView) => {
    checkout.mutate(p.id, {
      onError: () => toast.error("Le paiement n'a pas pu démarrer. Réessaie."),
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

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Chargement de la boutique…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucun produit disponible dans cette matière pour l'instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <BoutiqueCard key={p.id} product={p} onBuy={() => setBuying(p)} />
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
  onBuy,
}: {
  product: BoutiqueView
  onBuy: () => void
}) {
  const subject = p.subject ? getSubject(p.subject) : null
  const classLabel = p.classCode ?? 'Toutes classes'

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

      <Button className="mt-4 w-full" onClick={onBuy}>
        <ShoppingBag className="size-4" />
        {p.priceCents > 0 ? 'Acheter' : 'Obtenir'}
      </Button>
    </Card>
  )
}

function PurchaseDialog({
  product: p,
  onClose,
  onConfirm,
}: {
  product: BoutiqueView | null
  onClose: () => void
  onConfirm: (p: BoutiqueView) => void
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
