import { useState } from 'react'
import { toast } from 'sonner'
import { CloudUpload, X } from '@/components/icons'
import { SignedImage } from '@/components/signed-image'
import { uploadQuestionImage } from '@/services/resources'
import { cn } from '@/lib/utils'

/**
 * Upload + aperçu d'une image de QCM (énoncé ou option), stockée dans `resources`.
 * `value` = chemin storage (ou null) ; `onChange` reçoit le nouveau chemin / null.
 */
export function ImageUpload({
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
  const [busy, setBusy] = useState(false)
  async function pick(file: File) {
    setBusy(true)
    try {
      onChange(await uploadQuestionImage(file))
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
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand',
        className,
      )}
    >
      <CloudUpload className="size-4" />
      {busy ? 'Envoi…' : label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) pick(f)
          e.currentTarget.value = ''
        }}
      />
    </label>
  )
}
