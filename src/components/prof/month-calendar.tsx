import { cn } from '@/lib/utils'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

type MonthCalendarProps = {
  year: number
  month: number // 0-indexed
  today?: number
  markedDays?: number[]
  selectedDays?: number[]
  onPickDay?: (day: number) => void
  className?: string
}

/** Calendrier d'un mois (lundi en premier). Mode lecture ou sélection de jours. */
export function MonthCalendar({
  year,
  month,
  today,
  markedDays = [],
  selectedDays = [],
  onPickDay,
  className,
}: MonthCalendarProps) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className={className}>
      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />
          const isToday = day === today
          const marked = markedDays.includes(day)
          const selected = selectedDays.includes(day)
          const Cmp = onPickDay ? 'button' : 'div'
          return (
            <Cmp
              key={day}
              {...(onPickDay ? { type: 'button' as const, onClick: () => onPickDay(day) } : {})}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors',
                onPickDay && 'cursor-pointer hover:bg-secondary',
                selected
                  ? 'bg-brand text-white shadow-brand-glow'
                  : isToday
                    ? 'bg-brand-soft text-brand ring-1 ring-brand/40'
                    : 'text-foreground',
              )}
            >
              {day}
              {marked && (
                <span
                  className={cn(
                    'absolute bottom-1 size-1.5 rounded-full',
                    selected ? 'bg-white' : 'bg-brand',
                  )}
                />
              )}
            </Cmp>
          )
        })}
      </div>
    </div>
  )
}
