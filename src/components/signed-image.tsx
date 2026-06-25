import { useEffect, useState } from 'react'
import { getResourceDownloadUrl } from '@/services/resources'
import { cn } from '@/lib/utils'

/** Affiche une image stockée dans le bucket `resources` via une URL signée. */
export function SignedImage({ path, alt = '', className }: { path: string; alt?: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    getResourceDownloadUrl(path)
      .then((u) => alive && setUrl(u))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [path])
  if (!url) return <div className={cn('animate-pulse rounded-lg bg-secondary', className)} />
  return <img src={url} alt={alt} className={className} />
}
