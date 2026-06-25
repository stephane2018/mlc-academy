import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Plus, Boxes, Check, FileText, ArrowRight, Users, CloudUpload, X, Download } from '@/components/icons'
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
import { QueryError } from '@/components/query-error'
import { cn } from '@/lib/utils'
import { productKindLabels, formatPrice, type ProductKind } from '@/lib/mock'
import { useMyProducts, usePublishProduct } from '@/hooks/use-marketplace'
import { uploadProductCover, uploadProductContent, marketplaceService } from '@/services/marketplace'
import { useSubjects, useClasses } from '@/hooks/use-catalog'

export const Route = createFileRoute('/prof/produits/')({
  component: ProfProduits,
})

const KIND_EMOJI: Record<string, string> = { ebook: '📘', fiche: '📄', pack: '📦', video: '🎬', autre: '🧩' }
const STATUS_LABEL: Record<string, string> = {
  en_attente: 'En attente',
  publie: 'Publié',
  rejete: 'Rejeté',
  brouillon: 'Brouillon',
  archive: 'Archivé',
}
const STATUS_TONE: Record<string, string> = {
  en_attente: 'bg-amber-soft text-amber-foreground',
  publie: 'bg-teal-soft text-teal-foreground',
  rejete: 'bg-destructive/10 text-destructive',
  brouillon: 'bg-secondary text-muted-foreground',
  archive: 'bg-secondary text-muted-foreground',
}

function ProfProduits() {
  const productsQ = useMyProducts()
  const products = productsQ.data ?? []
  const isLoading = productsQ.isLoading
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()

  const subjectById = new Map(subjects.map((s) => [s.id, s]))
  const classById = new Map(classes.map((c) => [c.id, c]))

  const published = products.filter((p) => p.status === 'publie').length
  const pending = products.filter((p) => p.status === 'en_attente').length

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Espace Prof"
        title="Ma boutique"
        subtitle="Publie tes contenus vendables (e-books, fiches, packs, vidéos) sur la marketplace."
        actions={<CreateProductDialog />}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatTile icon={Boxes} tone="brand" label="Produits" value={products.length} />
        <StatTile icon={Check} tone="teal" label="Publiés" value={published} />
        <StatTile icon={FileText} tone="amber" label="En modération" value={pending} />
      </div>

      <p className="rounded-xl bg-secondary px-4 py-2.5 text-xs text-muted-foreground">
        Chaque produit passe en modération avant publication par l'administration.
      </p>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Chargement de tes produits…</p>
      ) : productsQ.isError ? (
        <QueryError onRetry={() => productsQ.refetch()} />
      ) : products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
          Aucun produit pour l'instant. Publie ton premier contenu vendable.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const subj = p.subjectId ? subjectById.get(p.subjectId) : null
            const classLabel = p.classId ? (classById.get(p.classId)?.label ?? null) : 'Toutes les classes'
            return (
              <Card key={p.id} className="card-hover gap-0 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-secondary text-2xl">{KIND_EMOJI[p.kind] ?? '🧩'}</span>
                    <p className="font-heading text-base font-bold">{p.title}</p>
                  </div>
                  <Badge variant="secondary" className={cn('shrink-0', STATUS_TONE[p.status])}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                </div>

                {p.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {subj ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: subj.color ?? 'var(--brand)' }}>
                      {subj.name}
                    </span>
                  ) : (
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground">Transversal</Badge>
                  )}
                  {classLabel && <Badge variant="secondary" className="bg-secondary text-muted-foreground">{classLabel}</Badge>}
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground">{productKindLabels[p.kind as ProductKind] ?? p.kind}</Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="font-heading text-lg font-extrabold tabular-nums">
                    {p.priceCents > 0 ? formatPrice(p.priceCents) : 'Gratuit'}
                  </span>
                  {p.hasContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const { url } = await marketplaceService.contentUrl(p.id)
                          window.open(url, '_blank', 'noopener')
                        } catch {
                          toast.error('Téléchargement indisponible.')
                        }
                      }}
                    >
                      <Download className="size-4" /> Fichier
                    </Button>
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
                      Détail du produit
                    </span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

const TRANSVERSAL = '__transversal__'
const ALL_CLASSES = '__all__'

/** Zone d'upload (dropzone) réutilisée pour la couverture et le fichier de contenu. */
function UploadZone({ label, accept, onPick }: { label: string; accept?: string; onPick: (f: File) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-5 text-center transition-colors hover:border-brand/50 hover:bg-secondary/50">
      <CloudUpload className="size-5 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
        }}
      />
    </label>
  )
}

/** Aperçu d'un fichier sélectionné avec bouton de retrait. */
function FilePill({ name, size, onRemove }: { name: string; size: number; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
      <FileText className="size-4 shrink-0 text-brand" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{(size / 1024).toFixed(0)} Ko</p>
      </div>
      <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={onRemove} aria-label="Retirer le fichier">
        <X className="size-4" />
      </Button>
    </div>
  )
}

function CreateProductDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState<ProductKind>('ebook')
  const [subjectId, setSubjectId] = useState<string>(TRANSVERSAL)
  const [classId, setClassId] = useState<string>(ALL_CLASSES)
  const [priceEuros, setPriceEuros] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [content, setContent] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const publish = usePublishProduct()

  const reset = () => {
    setTitle('')
    setDescription('')
    setKind('ebook')
    setSubjectId(TRANSVERSAL)
    setClassId(ALL_CLASSES)
    setPriceEuros('')
    setCover(null)
    setContent(null)
  }

  const euros = Number.parseFloat(priceEuros.replace(',', '.'))
  const priceCents = Number.isFinite(euros) && euros > 0 ? Math.round(euros * 100) : 0
  const busy = uploading || publish.isPending

  async function submit() {
    if (!title.trim()) return
    let coverPath: string | null = null
    let uploaded: { storagePath: string; fileName: string } | null = null
    if (cover || content) {
      setUploading(true)
      try {
        if (cover) coverPath = await uploadProductCover(cover)
        if (content) uploaded = await uploadProductContent(content)
      } catch (e) {
        setUploading(false)
        toast.error("Échec de l'envoi des fichiers.", { description: e instanceof Error ? e.message : undefined })
        return
      }
      setUploading(false)
    }
    publish.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        kind,
        subjectId: subjectId === TRANSVERSAL ? null : subjectId,
        classId: classId === ALL_CLASSES ? null : classId,
        priceCents,
        coverPath,
        contentPath: uploaded?.storagePath ?? null,
        contentFileName: uploaded?.fileName ?? null,
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
          toast.success('Produit soumis à modération', { description: "Il sera visible après validation par l'administration." })
        },
        onError: () => toast.error('Échec de la publication.'),
      },
    )
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publier un produit</DialogTitle>
          <DialogDescription>Ton produit passera en modération avant publication.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="product-title">Titre</Label>
            <Input id="product-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Réussir le CE1D Maths" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-desc">Description</Label>
            <Textarea id="product-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décris le contenu et ce qu'il apporte aux élèves." rows={3} />
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
                    <SelectItem key={k} value={k}>{productKindLabels[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-subject">Matière</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="product-subject" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TRANSVERSAL}>Transversal</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-class">Classe</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger id="product-class" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CLASSES}>Toutes les classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-price">Prix (€)</Label>
              <Input id="product-price" type="number" min={0} step="0.01" value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} placeholder="0 = gratuit" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Aperçu prix : <span className="font-semibold text-foreground">{priceCents > 0 ? formatPrice(priceCents) : 'Gratuit'}</span></p>

          <div className="space-y-1.5">
            <Label>Couverture (image, optionnel)</Label>
            {cover ? (
              <FilePill name={cover.name} size={cover.size} onRemove={() => setCover(null)} />
            ) : (
              <UploadZone label="Ajouter une image de couverture" accept="image/*" onPick={setCover} />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Fichier du produit (optionnel)</Label>
            <p className="text-xs text-muted-foreground">Téléchargeable uniquement par les acheteurs (et toi).</p>
            {content ? (
              <FilePill name={content.name} size={content.size} onRemove={() => setContent(null)} />
            ) : (
              <UploadZone label="Ajouter le fichier vendu" onPick={setContent} />
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button disabled={!title.trim() || busy} onClick={submit}>
            {uploading ? 'Envoi des fichiers…' : publish.isPending ? 'Soumission…' : 'Soumettre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
