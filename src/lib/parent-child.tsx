import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useChildren } from '@/hooks/use-parent'
import type { Child } from '@/services/parent'

type ParentChildValue = {
  kids: Child[]
  selected: Child | null
  selectedId: string | null
  setSelectedId: (id: string) => void
  isLoading: boolean
}

const Ctx = createContext<ParentChildValue | null>(null)

/**
 * Fournit la liste des enfants + l'enfant SÉLECTIONNÉ à tout l'espace parent.
 * Monté dans le layout `/parent` → le sélecteur du header et les écrans
 * (dashboard, suivi) partagent le même enfant courant.
 */
export function ParentChildProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useChildren()
  const kids = data ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Sélectionne le 1er enfant dès qu'ils sont chargés (ou si l'enfant courant disparaît).
  useEffect(() => {
    if (kids.length > 0 && !kids.some((k) => k.id === selectedId)) {
      setSelectedId(kids[0]!.id)
    }
  }, [kids, selectedId])

  const selected = kids.find((k) => k.id === selectedId) ?? null

  return (
    <Ctx.Provider value={{ kids, selected, selectedId: selected?.id ?? null, setSelectedId, isLoading }}>
      {children}
    </Ctx.Provider>
  )
}

/** Enfant sélectionné + sélecteur, partagés dans l'espace parent. */
export function useSelectedChild(): ParentChildValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSelectedChild doit être utilisé dans <ParentChildProvider>')
  return ctx
}
