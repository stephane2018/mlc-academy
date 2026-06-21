import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Plus,
  Boxes,
  Check,
  ShoppingBag,
  Tag,
  CloudUpload,
  FileIcon,
  Trash2,
  ArrowRight,
  Users,
} from '@/components/icons'
import { PageHero, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  products,
  productKindLabels,
  productStatusLabels,
  subjects,
  getSubject,
  classes,
  marketplaceSettings,
  formatPrice,
  type MarketProduct,
  type ProductFile,
  type ProductKind,
  type ProductStatus,
  type SubjectKey,
} from '@/lib/mock'

export const Route = createFileRoute('/prof/produits/')({
  component: ProfProduits,
})

/** Le prof courant (simulé). */
const SELLER = 'M. Minko'

/** Classes proposées au prof = celles activées par l'admin. */
const activeClasses = classes.filter((c) => c.active)

/** Émojis de couverture proposés (mock — cover_path = image en BD). */
const COVER_EMOJIS = ['📦', '📘', '📕', '📐', '🧮', '✍️', '🔬', '🎧', '🎬', '⭐']

const STATUS_TONE: Record<ProductStatus, string> = {
  en_attente: 'bg-amber-soft text-amber-foreground',
  publie: 'bg-teal-soft text-teal-foreground',
  rejete: 'bg-destructive/10 text-destructive',
  brouillon: 'bg-secondary text-muted-foreground',
  archive: 'bg-secondary text-muted-foreground',
}

/** Net estimé selon le mode de reversement de l'académie. */
function netFromGross(grossCents: number): number {
  if (marketplaceSettings.payoutMode === 'academie') return 0
  return Math.round(grossCents * (1 - marketplaceSettings.commissionRate / 100))
}

/** Octets → libellé court (ex. « 8,4 Mo »). */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  const ko = bytes / 1024
  if (ko < 1024) return `${ko.toFixed(0)} Ko`
  return `${(ko / 1024).toFixed(1).replace('.', ',')} Mo`
}

function ProfProduits() {
  const [mine, setMine] = useState<MarketProduct[]>(() =>
    products.filter((p) => p.sellerName === SELLER),
  )

  const addProduct = (p: MarketProduct) => setMine((prev) => [p, ...prev])

  const published = mine.filter((p) => p.status === 'publie')
  const totalSales = mine.reduce((a, p) => a + p.sales, 0)
  const grossPublished = published.reduce((a, p) => a + p.priceCents * p.sales, 0)
  const netRevenue = netFromGross(grossPublished)

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Espace Prof"
        title="Ma boutique"
        subtitle="Publie tes contenus vendables (e-books, fiches, packs, vidéos) et suis tes ventes sur la marketplace."
        actions={<CreateProductDialog onCreate={addProduct} />}
      />

      {/* Bandeau stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Boxes} tone="brand" label="Produits" value={mine.length} />
        <StatTile icon={Check} tone="teal" label="Publiés" value={published.length} />
        <StatTile icon={ShoppingBag} tone="amber" label="Ventes" value={totalSales} />
        <StatTile
          icon={Tag}
          tone="brand"
          label="Revenu net estimé"
          value={formatPrice(netRevenue)}
        />
      </div>

      <p className="rounded-xl bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
        {marketplaceSettings.payoutMode === 'academie' ? (
          <>Les ventes sont reversées à l'académie : aucun revenu direct pour le prof.</>
        ) : (
          <>
            L'académie retient {marketplaceSettings.commissionRate}% de commission sur chaque vente.
            Le revenu net affiché est une estimation sur tes produits publiés.
          </>
        )}
      </p>

      {/* Liste */}
      {mine.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucun produit pour l'instant. Publie ton premier contenu vendable.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mine.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product: p }: { product: MarketProduct }) {
  const subject = p.subject ? getSubject(p.subject) : null
  const classLabel = p.classCode
    ? (classes.find((c) => c.code === p.classCode)?.label ?? p.classCode)
    : 'Toutes les classes'
  const productNet = netFromGross(p.priceCents * p.sales)

  return (
    <Card className="card-hover gap-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-secondary text-2xl">
            {p.emoji}
          </span>
          <div className="leading-tight">
            <p className="font-heading text-base font-bold">{p.title}</p>
            <p className="text-xs text-muted-foreground">
              {p.sales} vente(s) · {p.files.length} fichier(s)
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={cn('shrink-0', STATUS_TONE[p.status])}>
          {productStatusLabels[p.status]}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {subject ? (
          <span
            title={subject.label}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
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
        <span className="font-heading text-lg font-extrabold tabular-nums">
          {p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}
        </span>
        {p.status === 'publie' && p.priceCents > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-foreground">
            <Tag className="size-3.5" />
            Net : {formatPrice(productNet)}
          </span>
        )}
      </div>

      {p.status === 'rejete' && p.reviewNote && (
        <div className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <span className="font-semibold">Motif du rejet : </span>
          {p.reviewNote}
        </div>
      )}

      <Button asChild variant="ghost" className="mt-4 w-full justify-between">
        <Link to="/prof/produits/$id" params={{ id: p.id }}>
          <span className="inline-flex items-center gap-2">
            <Users className="size-4" />
            Aperçu, ventes & acheteurs
          </span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  )
}

const TRANSVERSAL = '__transversal__'
const ALL_CLASSES = '__all__'

function CreateProductDialog({ onCreate }: { onCreate: (p: MarketProduct) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState<ProductKind>('ebook')
  const [subject, setSubject] = useState<string>(TRANSVERSAL)
  const [classCode, setClassCode] = useState<string>(ALL_CLASSES)
  const [priceEuros, setPriceEuros] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [files, setFiles] = useState<ProductFile[]>([])

  const reset = () => {
    setTitle('')
    setDescription('')
    setKind('ebook')
    setSubject(TRANSVERSAL)
    setClassCode(ALL_CLASSES)
    setPriceEuros('')
    setEmoji('📦')
    setFiles([])
  }

  const onPickFiles = (list: FileList | null) => {
    if (!list) return
    const picked: ProductFile[] = Array.from(list).map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
    }))
    setFiles((prev) => [...prev, ...picked])
  }

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const euros = Number.parseFloat(priceEuros.replace(',', '.'))
  const priceCents = Number.isFinite(euros) && euros > 0 ? Math.round(euros * 100) : 0
  const previewSubject = subject === TRANSVERSAL ? null : getSubject(subject as SubjectKey)

  const submit = () => {
    const status: ProductStatus = marketplaceSettings.requireReview ? 'en_attente' : 'publie'
    const product: MarketProduct = {
      id: `p-new-${title.trim().toLowerCase().replace(/\s+/g, '-')}`,
      sellerName: SELLER,
      title: title.trim(),
      description: description.trim(),
      kind,
      subject: subject === TRANSVERSAL ? null : (subject as SubjectKey),
      classCode: classCode === ALL_CLASSES ? null : classCode,
      priceCents,
      status,
      emoji,
      files,
      sales: 0,
      createdAt: '2026-06-19',
    }

    onCreate(product)
    setOpen(false)
    reset()
    toast.success('Produit soumis à modération', {
      description: marketplaceSettings.requireReview
        ? "Il sera visible après validation par l'administration."
        : 'Ton produit est désormais publié.',
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-white text-brand hover:bg-white/90">
          <Plus className="size-4" />
          Publier un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publier un produit</DialogTitle>
          <DialogDescription>
            {marketplaceSettings.requireReview
              ? 'Ton produit passera en modération avant publication.'
              : 'Ton produit sera publié immédiatement.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-1 lg:grid-cols-[1fr_18rem]">
          {/* Colonne formulaire */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-title">Titre</Label>
              <Input
                id="product-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Réussir le CE1D Maths"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-desc">Description</Label>
              <Textarea
                id="product-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décris le contenu et ce qu'il apporte aux élèves."
                rows={3}
              />
            </div>

            {/* Couverture */}
            <div className="space-y-1.5">
              <Label>Couverture</Label>
              <div className="flex flex-wrap gap-1.5">
                {COVER_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    aria-pressed={emoji === e}
                    onClick={() => setEmoji(e)}
                    className={cn(
                      'grid size-10 place-items-center rounded-xl border text-xl transition-colors',
                      emoji === e
                        ? 'border-brand bg-brand-soft'
                        : 'border-border bg-card hover:border-brand/40',
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Livrables */}
            <div className="space-y-1.5">
              <Label>Fichiers du produit</Label>
              <label
                htmlFor="product-files"
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-center transition-colors hover:border-brand/40"
              >
                <CloudUpload className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium">Glisse tes fichiers ou clique pour parcourir</span>
                <span className="text-xs text-muted-foreground">PDF, ZIP, MP4… (livrable téléchargé après achat)</span>
                <input
                  id="product-files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </label>
              {files.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
                    >
                      <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{f.size}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Retirer le fichier"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="product-kind">Type</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as ProductKind)}>
                  <SelectTrigger id="product-kind" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(productKindLabels) as ProductKind[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {productKindLabels[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-subject">Matière</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="product-subject" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TRANSVERSAL}>Transversal</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="product-class">Classe</Label>
                <Select value={classCode} onValueChange={setClassCode}>
                  <SelectTrigger id="product-class" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CLASSES}>Toutes les classes</SelectItem>
                    {activeClasses.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-price">Prix (€)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={priceEuros}
                  onChange={(e) => setPriceEuros(e.target.value)}
                  placeholder="0 = gratuit"
                />
              </div>
            </div>
          </div>

          {/* Colonne aperçu (ce que verra l'acheteur) */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Aperçu acheteur
            </Label>
            <Card className="gap-0 p-4">
              <span className="grid size-14 place-items-center rounded-xl bg-secondary text-3xl">
                {emoji}
              </span>
              <p className="mt-3 font-heading text-base font-bold">
                {title.trim() || 'Titre du produit'}
              </p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                {description.trim() || 'La description apparaîtra ici.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {previewSubject ? (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: previewSubject.color }}
                  >
                    {previewSubject.label}
                  </span>
                ) : (
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                    Transversal
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                  {productKindLabels[kind]}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-heading text-lg font-extrabold tabular-nums">
                  {priceCents > 0 ? formatPrice(priceCents) : 'Gratuit'}
                </span>
                <span className="text-xs text-muted-foreground">{files.length} fichier(s)</span>
              </div>
            </Card>
            {priceCents > 0 && marketplaceSettings.payoutMode !== 'academie' && (
              <p className="text-xs text-muted-foreground">
                Net par vente : <span className="font-semibold text-foreground">{formatPrice(netFromGross(priceCents))}</span>{' '}
                (après {marketplaceSettings.commissionRate}% de commission)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button disabled={!title.trim() || files.length === 0} onClick={submit}>
            Soumettre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
