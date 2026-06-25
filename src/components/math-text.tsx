import { Fragment, type ReactNode } from 'react'
import { Math as Maths } from '@/components/math'

/**
 * Affiche un texte mêlant prose et formules : les portions entre `$…$` (inline)
 * ou `$$…$$` (centré) sont rendues via KaTeX, le reste en texte (sauts de ligne
 * préservés). Utilisé partout où un énoncé / une option s'affiche (élève + prof).
 */
const TOKEN = /\$\$([^$]+)\$\$|\$([^$]+)\$/g

function TextRun({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  )
}

export function MathText({ value, className }: { value: string | null | undefined; className?: string }) {
  if (!value) return null

  const parts: ReactNode[] = []
  let last = 0
  let i = 0
  TOKEN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN.exec(value)) !== null) {
    if (m.index > last) parts.push(<TextRun key={`t${i}`} text={value.slice(last, m.index)} />)
    const display = m[1] !== undefined
    const expr = m[1] ?? m[2] ?? ''
    parts.push(<Maths key={`m${i}`} expr={expr} display={display} />)
    last = m.index + m[0].length
    i += 1
  }
  if (last < value.length) parts.push(<TextRun key={`t${i}`} text={value.slice(last)} />)

  return <span className={className}>{parts}</span>
}
