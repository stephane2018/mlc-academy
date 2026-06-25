import { useEffect, useRef } from 'react'
import type { MathfieldElement } from 'mathlive'
import { cn } from '@/lib/utils'
import { showFloatingMathKeyboard } from '@/lib/math-keyboard'

type MathFieldProps = {
  /** Valeur LaTeX (contrôlée). */
  value: string
  /** Appelé à chaque frappe avec le LaTeX généré. */
  onChange: (latex: string) => void
  placeholder?: string
  className?: string
}

/**
 * Éditeur de maths visuel (WYSIWYG) basé sur MathLive.
 * Le prof écrit comme sur une calculatrice (fraction, racine, exposant…) + clavier
 * de symboles ; la sortie est du LaTeX rendu côté élève par KaTeX (composant `Math`).
 *
 * Montage impératif + import dynamique → MathLive ne tourne JAMAIS au SSR
 * (il touche `window`/`customElements`), et on évite le typage JSX du web-component.
 */
export function MathField({ value, onChange, placeholder, className }: MathFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<MathfieldElement | null>(null)
  // Réf vers le dernier onChange pour ne pas re-monter le champ à chaque rendu.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    let cancelled = false
    let el: MathfieldElement | null = null
    let handler: (() => void) | null = null
    let showKb: (() => void) | null = null

    void (async () => {
      const { MathfieldElement } = await import('mathlive')
      if (cancelled || !hostRef.current) return
      el = new MathfieldElement()
      if (placeholder) el.setAttribute('placeholder', placeholder)
      el.value = value
      el.style.width = '100%'
      // On pilote l'ouverture (sur desktop MathLive n'ouvre jamais le clavier
      // automatiquement). La fermeture se fait via la croix de la fenêtre.
      el.mathVirtualKeyboardPolicy = 'manual'
      handler = () => onChangeRef.current(el?.value ?? '')
      el.addEventListener('input', handler)
      showKb = () => showFloatingMathKeyboard()
      el.addEventListener('focusin', showKb)
      hostRef.current.appendChild(el)
      fieldRef.current = el
    })()

    return () => {
      cancelled = true
      if (el && handler) el.removeEventListener('input', handler)
      if (el && showKb) el.removeEventListener('focusin', showKb)
      el?.remove()
      fieldRef.current = null
    }
    // Montage unique : la synchro de `value` est gérée par l'effet ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Synchronise une valeur entrante (reset, duplication…) sans casser la frappe.
  useEffect(() => {
    const el = fieldRef.current
    if (el && el.value !== value) el.value = value
  }, [value])

  return (
    <div
      ref={hostRef}
      className={cn(
        'flex min-h-11 items-center rounded-lg border border-input bg-card px-2 text-lg transition-shadow',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30',
        '[&_math-field]:w-full [&_math-field]:outline-none',
        className,
      )}
    />
  )
}
