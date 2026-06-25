import { useEffect, useRef, useState } from 'react'
import { CloudUpload, FileIcon, Loader, Check, X } from '@/components/icons'
import { cn } from '@/lib/utils'

/**
 * Zone d'import de fichier réutilisable (glisser-déposer + parcourir).
 *
 * - Sans `onUpload` : progression **simulée** (aucun envoi réel) — utile pour les
 *   maquettes.
 * - Avec `onUpload` : l'envoi réel est délégué au parent (ex. upload storage
 *   signé). La zone affiche un état indéterminé pendant la promesse, puis « done ».
 */
export type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; progress?: number; name: string; size: string }
  | { phase: 'done'; name: string; size: string }

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} Mo`
  return `${Math.max(1, Math.round(bytes / 1000))} Ko`
}

export function UploadZone({
  state,
  onChange,
  accept = '.pdf,.mp4,.jpg,.jpeg,.png',
  hint = 'PDF, MP4, JPG, PNG — 100 Mo max.',
  onUpload,
  onRemove,
}: {
  state: UploadState
  onChange: (s: UploadState) => void
  accept?: string
  hint?: string
  /** Envoi réel du fichier ; si fourni, remplace la simulation. Rejette → retour à « idle ». */
  onUpload?: (file: File) => Promise<void>
  /** Appelé quand l'utilisateur retire le fichier (pour nettoyer le chemin côté parent). */
  onRemove?: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current)
    },
    [],
  )

  const startImport = (file: File) => {
    if (timer.current) clearInterval(timer.current)
    const size = formatSize(file.size || 0)
    const name = file.name

    // Envoi réel délégué au parent → état indéterminé jusqu'à résolution.
    if (onUpload) {
      onChange({ phase: 'uploading', name, size })
      onUpload(file)
        .then(() => onChange({ phase: 'done', name, size }))
        .catch(() => onChange({ phase: 'idle' }))
      return
    }

    // Simulation (aucun envoi réel).
    onChange({ phase: 'uploading', progress: 0, name, size })
    let p = 0
    timer.current = setInterval(() => {
      p += Math.random() * 12 + 6
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current)
        onChange({ phase: 'done', name, size })
      } else {
        onChange({ phase: 'uploading', progress: Math.round(p), name, size })
      }
    }, 60)
  }

  const onFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    startImport(f)
  }

  const reset = () => {
    if (timer.current) clearInterval(timer.current)
    onChange({ phase: 'idle' })
    onRemove?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  if (state.phase === 'done') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success-soft/60 p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-brand shadow-soft">
          <FileIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{state.name}</p>
          <p className="text-xs text-muted-foreground">{state.size}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-success">
          <Check className="size-4" /> Importé
        </span>
        <button
          type="button"
          onClick={reset}
          aria-label="Retirer le fichier"
          className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  if (state.phase === 'uploading') {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand/50 bg-brand-soft/40 p-6 text-center">
        <Loader className="size-9 animate-spin text-brand" />
        <p className="text-sm font-semibold text-foreground">
          Importation…{state.progress != null ? ` ${state.progress} %` : ''}
        </p>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
          {state.progress != null ? (
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-75 ease-out"
              style={{ width: `${state.progress}%` }}
            />
          ) : (
            <div className="h-full w-1/3 animate-pulse rounded-full bg-brand" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{state.name}</p>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setIsDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        onFiles(e.dataTransfer.files)
      }}
      className={cn(
        'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all outline-none focus-visible:ring-4 focus-visible:ring-brand/20',
        isDragging
          ? 'scale-[1.02] border-brand bg-brand-soft ring-4 ring-brand/20'
          : 'border-border bg-secondary/40 hover:border-brand/40 hover:bg-secondary/70',
      )}
    >
      <CloudUpload
        className={cn('size-10 text-brand transition-transform', isDragging && 'animate-bounce')}
      />
      <p className="text-sm font-semibold text-foreground">
        {isDragging ? (
          'Dépose ton fichier ici'
        ) : (
          <>
            Glisse-dépose un fichier ou <span className="text-brand underline">clique pour parcourir</span>
          </>
        )}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <input ref={inputRef} type="file" hidden onChange={(e) => onFiles(e.target.files)} accept={accept} />
    </div>
  )
}
