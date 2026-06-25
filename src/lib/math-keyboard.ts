/**
 * Fenêtre flottante pour le clavier MathLive : déplaçable, réductible, fermable.
 * MathLive monte son clavier dans le conteneur qu'on lui désigne
 * (`mathVirtualKeyboard.container`) ; on l'enveloppe d'une barre de titre maison.
 * Le CSS (.mlk-float) remet le clavier en flux (position relative) tout en gardant
 * sa hauteur calculée (var(--_keyboard-height)) — sinon le cadre s'effondre.
 */
let installed = false
let frameEl: HTMLDivElement | null = null

/** Ouvre la fenêtre (révèle le cadre + demande l'affichage à MathLive). */
export function showFloatingMathKeyboard() {
  setupFloatingMathKeyboard()
  if (typeof window === 'undefined') return
  const kb = window.mathVirtualKeyboard
  if (!kb) return
  frameEl?.classList.remove('is-min')
  frameEl?.classList.add('is-visible')
  kb.show()
}

export function setupFloatingMathKeyboard() {
  if (installed || typeof window === 'undefined') return
  const kb = window.mathVirtualKeyboard
  if (!kb) return
  installed = true

  // Retire la disposition « symboles » : on garde numérique (fractions, racines,
  // exposants, opérateurs), lettres (variables) et grec (π, θ…).
  kb.layouts = ['numeric', 'alphabetic', 'greek'] as const

  const mkBtn = (label: string, glyph: string) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mlk-float__btn'
    b.setAttribute('aria-label', label)
    b.textContent = glyph
    return b
  }

  const frame = document.createElement('div')
  frame.className = 'mlk-float'

  const bar = document.createElement('div')
  bar.className = 'mlk-float__bar'
  const title = document.createElement('span')
  title.className = 'mlk-float__title'
  title.textContent = 'Clavier maths'
  const actions = document.createElement('div')
  actions.className = 'mlk-float__actions'
  const minBtn = mkBtn('Réduire', '⌄')
  const closeBtn = mkBtn('Fermer', '✕')
  actions.append(minBtn, closeBtn)
  bar.append(title, actions)

  const body = document.createElement('div')
  body.className = 'mlk-float__body'

  frame.append(bar, body)
  document.body.appendChild(frame)
  frameEl = frame
  kb.container = body

  // Visibilité pilotée par MathLive (toggle / hide via la croix).
  const sync = () => frame.classList.toggle('is-visible', kb.visible)
  kb.addEventListener('virtual-keyboard-toggle', sync)

  minBtn.addEventListener('click', () => {
    const min = frame.classList.toggle('is-min')
    minBtn.textContent = min ? '⌃' : '⌄'
    minBtn.setAttribute('aria-label', min ? 'Agrandir' : 'Réduire')
  })
  closeBtn.addEventListener('click', () => kb.hide())

  // Déplacement via la barre de titre.
  let startX = 0
  let startY = 0
  let originX = 0
  let originY = 0
  let dragging = false
  bar.addEventListener('pointerdown', (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragging = true
    const r = frame.getBoundingClientRect()
    originX = r.left
    originY = r.top
    startX = e.clientX
    startY = e.clientY
    frame.style.right = 'auto'
    frame.style.bottom = 'auto'
    frame.style.left = `${originX}px`
    frame.style.top = `${originY}px`
    bar.setPointerCapture(e.pointerId)
  })
  bar.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) return
    const maxX = Math.max(0, window.innerWidth - frame.offsetWidth)
    const maxY = Math.max(0, window.innerHeight - frame.offsetHeight)
    frame.style.left = `${Math.min(Math.max(0, originX + e.clientX - startX), maxX)}px`
    frame.style.top = `${Math.min(Math.max(0, originY + e.clientY - startY), maxY)}px`
  })
  const endDrag = (e: PointerEvent) => {
    dragging = false
    if (bar.hasPointerCapture(e.pointerId)) bar.releasePointerCapture(e.pointerId)
  }
  bar.addEventListener('pointerup', endDrag)
  bar.addEventListener('pointercancel', endDrag)
}
