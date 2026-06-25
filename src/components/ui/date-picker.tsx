"use client"

import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "@/components/icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ *
 * Helpers date — locaux, sans dépendance. Valeur = chaîne ISO courte.
 *  - DatePicker : `YYYY-MM-DD`
 *  - TimePicker : `HH:MM`
 * ------------------------------------------------------------------ */

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"]

const pad = (n: number) => String(n).padStart(2, "0")
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

function parseISO(value?: string | null): { y: number; m: number; d: number } | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2]) - 1
  const d = Number(match[3])
  if (m < 0 || m > 11 || d < 1 || d > 31) return null
  return { y, m, d }
}

const formatLong = (p: { y: number; m: number; d: number }) => `${p.d} ${MONTHS[p.m]} ${p.y}`

/** Style commun aux déclencheurs — aligné sur Input / Select. */
const triggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-input bg-card px-3 text-sm shadow-xs outline-none transition-colors hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export interface DatePickerProps {
  value?: string | null
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Choisir une date",
  disabled,
  className,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseISO(value)

  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  // Mois affiché : celui de la valeur, sinon le mois courant.
  const [view, setView] = React.useState(() => ({
    y: selected?.y ?? today.getFullYear(),
    m: selected?.m ?? today.getMonth(),
  }))

  // Recale la vue sur la valeur à l'ouverture.
  React.useEffect(() => {
    if (open && selected) setView({ y: selected.y, m: selected.m })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7 // 0 = lundi
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()

  const prevMonth = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))
  const nextMonth = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(triggerClass, className)}
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? formatLong(selected) : placeholder}
          </span>
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        {/* En-tête mois */}
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mois précédent"
            className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold capitalize">
            {MONTHS[view.m]} {view.y}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mois suivant"
            className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="mb-1 grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="grid h-7 place-items-center text-[11px] font-medium text-muted-foreground">
              {w}
            </span>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const iso = toISO(view.y, view.m, day)
            const isSelected = value === iso
            const isToday = iso === todayISO
            return (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  onChange(iso)
                  setOpen(false)
                }}
                className={cn(
                  "grid size-9 place-items-center rounded-lg text-sm tabular-nums transition-colors",
                  isSelected
                    ? "bg-brand font-semibold text-brand-foreground"
                    : "hover:bg-secondary",
                  !isSelected && isToday && "font-semibold text-brand ring-1 ring-brand/40",
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export interface TimePickerProps {
  value?: string | null
  onChange: (value: string) => void
  /** Pas en minutes entre deux créneaux (défaut 15). */
  step?: number
  id?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export function TimePicker({
  value,
  onChange,
  step = 15,
  id,
  placeholder = "Choisir une heure",
  disabled,
  className,
  "aria-label": ariaLabel,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const options = React.useMemo(() => {
    const out: string[] = []
    for (let mins = 0; mins < 24 * 60; mins += step) {
      out.push(`${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`)
    }
    return out
  }, [step])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(triggerClass, className)}
        >
          <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>
          <Clock className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-h-60 w-(--radix-popover-trigger-width) overflow-y-auto p-1">
        {options.map((opt) => {
          const isSelected = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-1.5 text-sm tabular-nums transition-colors",
                isSelected
                  ? "bg-brand font-semibold text-brand-foreground"
                  : "hover:bg-secondary",
              )}
            >
              {opt}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
