import { useRef } from 'react'
import { Check } from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { MathField } from '@/components/math-field'
import { MathInsertButton } from '@/components/math-insert-button'
import { ImagePicker } from '@/components/image-picker'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type QuestionOptionDraft = { id: string; label: string; imagePath: string | null }

/** Brouillon d'une question QCM — modèle commun aux exercices ET aux examens. */
export type QuestionDraft = {
  id: string
  prompt: string
  katex: string
  imagePath: string | null
  options: QuestionOptionDraft[]
  correctId: string
  explanation: string
}

/**
 * Éditeur d'une question QCM (énoncé + formule + options + explication), avec
 * insertion de formules au curseur et images d'énoncé/options. Contrôlé : reçoit
 * un `QuestionDraft` et émet la nouvelle valeur via `onChange`.
 */
export function QuestionEditor({
  value,
  onChange,
}: {
  value: QuestionDraft
  onChange: (next: QuestionDraft) => void
}) {
  // Refs des champs texte (énoncé + options), pour insérer une formule au curseur.
  const fieldRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map())
  const register = (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el) fieldRefs.current.set(key, el)
    else fieldRefs.current.delete(key)
  }
  function insertAt(key: string, latex: string, current: string, apply: (v: string) => void) {
    const wrapped = `$${latex}$`
    const el = fieldRefs.current.get(key)
    if (!el) {
      apply(current ? `${current} ${wrapped}` : wrapped)
      return
    }
    const start = el.selectionStart ?? current.length
    const end = el.selectionEnd ?? current.length
    apply(current.slice(0, start) + wrapped + current.slice(end))
    requestAnimationFrame(() => {
      const caret = start + wrapped.length
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  const patch = (p: Partial<QuestionDraft>) => onChange({ ...value, ...p })
  const setOptionLabel = (oi: number, label: string) =>
    patch({ options: value.options.map((o, i) => (i === oi ? { ...o, label } : o)) })
  const setOptionImage = (oi: number, imagePath: string | null) =>
    patch({ options: value.options.map((o, i) => (i === oi ? { ...o, imagePath } : o)) })

  return (
    <div className="space-y-3">
      {/* Énoncé */}
      <div className="space-y-1.5">
        <Label htmlFor={`prompt-${value.id}`}>Énoncé</Label>
        <Textarea
          ref={register(`prompt-${value.id}`)}
          id={`prompt-${value.id}`}
          value={value.prompt}
          onChange={(e) => patch({ prompt: e.target.value })}
          placeholder="Rédige la question… (insère des formules avec le bouton ci-dessous)"
          rows={2}
        />
        <div className="flex flex-wrap items-center gap-2">
          <MathInsertButton onInsert={(latex) => insertAt(`prompt-${value.id}`, latex, value.prompt, (v) => patch({ prompt: v }))} />
          <ImagePicker value={value.imagePath} onChange={(p) => patch({ imagePath: p })} label="Image d'énoncé" />
        </div>
      </div>

      {/* Formule */}
      <div className="space-y-1.5">
        <Label>Formule mathématique (optionnel)</Label>
        <p className="text-xs text-muted-foreground">
          Écris directement (fraction, racine, exposant…) — utilise le clavier de symboles. Aucun code à retenir.
        </p>
        <MathField value={value.katex} onChange={(latex) => patch({ katex: latex })} placeholder="Ex : (a+b)/2" />
        {value.katex && (
          <div className="rounded-xl bg-secondary/60 py-3 text-center text-lg">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Aperçu élève</p>
            <Maths expr={value.katex} display />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        <Label>Options · coche la bonne réponse</Label>
        {value.options.map((opt, oi) => {
          const letter = String.fromCharCode(65 + oi)
          const isAnswer = opt.id === value.correctId
          return (
            <div key={opt.id} className="space-y-1.5 rounded-xl border border-border/60 p-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Désigner comme bonne réponse"
                  onClick={(e) => {
                    e.stopPropagation()
                    patch({ correctId: opt.id })
                  }}
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border-2 transition',
                    isAnswer ? 'border-success bg-success text-white' : 'border-border text-transparent hover:border-success/50',
                  )}
                >
                  <Check className="size-4" />
                </button>
                <span className="w-5 text-center text-sm font-bold text-muted-foreground">{letter}</span>
                <Input
                  ref={register(`opt-${opt.id}`)}
                  value={opt.label}
                  onChange={(e) => setOptionLabel(oi, e.target.value)}
                  placeholder={`Option ${letter} (texte ou image)`}
                />
                <MathInsertButton compact onInsert={(latex) => insertAt(`opt-${opt.id}`, latex, opt.label, (v) => setOptionLabel(oi, v))} />
              </div>
              <div className="pl-9">
                <ImagePicker value={opt.imagePath} onChange={(p) => setOptionImage(oi, p)} label="Image (option)" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Explication */}
      <div className="space-y-1.5">
        <Label htmlFor={`expl-${value.id}`}>Explication</Label>
        <Input
          id={`expl-${value.id}`}
          value={value.explanation}
          onChange={(e) => patch({ explanation: e.target.value })}
          placeholder="Justification affichée à la correction."
        />
      </div>
    </div>
  )
}
