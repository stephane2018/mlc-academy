import { useState } from 'react'
import { toast } from 'sonner'
import { CloudUpload, X, Trash2, Boxes } from '@/components/icons'
import { SignedImage } from '@/components/signed-image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { uploadQuestionImage } from '@/services/resources'
import { useTeacherImages, useRegisterImage, useDeleteTeacherImage } from '@/hooks/use-teacher-images'
import { cn } from '@/lib/utils'

/**
 * Sélecteur d'image de QCM : uploader un nouveau fichier (ajouté à la banque)
 * OU réutiliser une image de la banque du prof. Renvoie un chemin Storage.
 */
export function ImagePicker({
  value,
  onChange,
  label = 'Ajouter une image',
  className,
}: {
  value: string | null
  onChange: (path: string | null) => void
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'upload' | 'bank'>('upload')
  const [busy, setBusy] = useState(false)
  const imagesQ = useTeacherImages()
  const register = useRegisterImage()
  const removeImg = useDeleteTeacherImage()

  async function onUpload(file: File) {
    setBusy(true)
    try {
      const path = await uploadQuestionImage(file)
      // Ajoute à la banque pour réutilisation (non bloquant pour la sélection).
      register.mutate({ storagePath: path, fileName: file.name })
      onChange(path)
      setOpen(false)
    } catch (e) {
      toast.error("Échec de l'envoi de l'image.", { description: e instanceof Error ? e.message : undefined })
    } finally {
      setBusy(false)
    }
  }

  if (value) {
    return (
      <div className={cn('relative inline-block', className)}>
        <SignedImage path={value} className="h-24 w-auto rounded-lg border border-border object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-white shadow"
          aria-label="Retirer l'image"
        >
          <X className="size-3.5" />
        </button>
      </div>
    )
  }

  const images = imagesQ.data ?? []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('rounded-lg border-dashed', className)}
        >
          <CloudUpload className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Image</DialogTitle>
          <DialogDescription>Uploade une image ou réutilise-en une de ta banque.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
          {(
            [
              ['upload', 'Uploader'],
              ['bank', 'Ma banque'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              className={cn(
                'rounded-lg py-2 text-sm font-semibold transition-colors',
                tab === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === 'upload' ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center transition-colors hover:border-brand/50 hover:bg-secondary/50">
            <CloudUpload className="size-7 text-muted-foreground" />
            <span className="text-sm font-medium">{busy ? 'Envoi…' : 'Choisir une image'}</span>
            <span className="text-xs text-muted-foreground">JPG, PNG… (ajoutée à ta banque)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onUpload(f)
                e.currentTarget.value = ''
              }}
            />
          </label>
        ) : imagesQ.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Chargement de ta banque…</p>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <Boxes className="size-7" />
            <p className="text-sm">Ta banque est vide. Uploade une image, elle sera réutilisable ici.</p>
          </div>
        ) : (
          <div className="grid max-h-72 grid-cols-3 gap-3 overflow-y-auto p-1">
            {images.map((img) => (
              <div key={img.id} className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    onChange(img.storagePath)
                    setOpen(false)
                  }}
                  className="block w-full overflow-hidden rounded-lg border border-border transition hover:border-brand"
                >
                  <SignedImage path={img.storagePath} className="aspect-square w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImg.mutate(img.id)}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-destructive/90 text-white opacity-0 shadow transition group-hover:opacity-100"
                  aria-label="Supprimer de la banque"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
