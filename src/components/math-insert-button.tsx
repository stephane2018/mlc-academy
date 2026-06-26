import { useState } from 'react'
import { Sparkles } from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { MathField } from '@/components/math-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

/**
 * Bouton + dialog d'insertion d'une formule (éditeur visuel MathLive → LaTeX).
 * La formule est insérée dans le champ texte appelant sous la forme `$latex$`.
 */
export function MathInsertButton({
  onInsert,
  compact,
}: {
  onInsert: (latex: string) => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [latex, setLatex] = useState('')

  const confirm = () => {
    const v = latex.trim()
    if (v) onInsert(v)
    setLatex('')
    setOpen(false)
  }

  // Garde : ne pas fermer le dialog quand on interagit avec le clavier flottant
  // (posé sur <body>, donc « hors » du dialog).
  const keepOpenOnKeyboard = (e: Event) => {
    const t = e.target as HTMLElement | null
    if (t?.closest?.('.mlk-float, .ML__keyboard')) e.preventDefault()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        {compact ? (
          <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" title="Insérer une formule" aria-label="Insérer une formule">
            <Sparkles className="size-4" />
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm">
            <Sparkles className="size-4" />
            Insérer une formule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onInteractOutside={keepOpenOnKeyboard} onPointerDownOutside={keepOpenOnKeyboard}>
        <DialogHeader>
          <DialogTitle>Insérer une formule</DialogTitle>
          <DialogDescription>Écris ta formule (clavier de symboles dispo) — elle s'insère dans le texte.</DialogDescription>
        </DialogHeader>
        <MathField value={latex} onChange={setLatex} placeholder="Ex : (a+b)/2" />
        {latex.trim() && (
          <div className="rounded-xl bg-secondary/60 py-3 text-center text-lg">
            <Maths expr={latex} display />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Annuler</Button>
          </DialogClose>
          <Button type="button" onClick={confirm} disabled={!latex.trim()}>Insérer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
