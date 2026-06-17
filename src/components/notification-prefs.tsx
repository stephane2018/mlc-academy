import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, Smartphone, Mail, Check, type IconComponent } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { prefChannels, type NotifPref, type PrefChannel } from '@/lib/mock'

const CHANNEL_META: Record<PrefChannel, { label: string; Icon: IconComponent }> = {
  inapp: { label: 'App', Icon: Bell },
  push: { label: 'Push', Icon: Smartphone },
  email: { label: 'E-mail', Icon: Mail },
}

export function NotificationPreferences({ prefs }: { prefs: NotifPref[] }) {
  const channels = prefChannels.filter((c) => prefs.some((p) => p.channels.includes(c.key)))

  const [state, setState] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {}
    for (const p of prefs) {
      init[p.key] = {}
      for (const c of p.channels) init[p.key][c] = p.defaults.includes(c)
    }
    return init
  })

  const toggle = (key: string, channel: PrefChannel) =>
    setState((s) => ({ ...s, [key]: { ...s[key], [channel]: !s[key][channel] } }))

  return (
    <Card className="gap-0 p-4 sm:p-5">
      {/* Légende des canaux */}
      <div className="mb-4 flex flex-wrap gap-2">
        {channels.map((c) => {
          const M = CHANNEL_META[c.key]
          return (
            <span
              key={c.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium"
            >
              <M.Icon className="size-4 text-brand" />
              {c.label}
              <span className="hidden text-muted-foreground sm:inline">· {c.hint}</span>
            </span>
          )
        })}
      </div>

      <ul className="divide-y divide-border">
        {prefs.map((p) => (
          <li
            key={p.key}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 sm:max-w-sm">
              <p className="font-semibold">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => {
                const available = p.channels.includes(c.key)
                const on = available && state[p.key]?.[c.key]
                const M = CHANNEL_META[c.key]
                if (!available) {
                  return (
                    <span
                      key={c.key}
                      className="inline-flex w-[5.5rem] items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground/50"
                    >
                      <M.Icon className="size-4" />—
                    </span>
                  )
                }
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggle(p.key, c.key)}
                    className={cn(
                      'inline-flex w-[5.5rem] items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                      on ? 'border-brand bg-brand-soft text-brand' : 'border-border text-muted-foreground hover:bg-secondary',
                    )}
                    aria-pressed={on}
                  >
                    <M.Icon className="size-4" />
                    <span className="hidden sm:inline">{M.label}</span>
                    <span
                      className={cn(
                        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                        on ? 'bg-brand' : 'bg-muted-foreground/30',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all',
                          on ? 'left-[18px]' : 'left-0.5',
                        )}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {channels.some((c) => c.key === 'email')
            ? 'Les e-mails sont envoyés au parent lié au compte.'
            : 'Les rappels arrivent dans l’app et en push si elle est installée.'}
        </p>
        <Button onClick={() => toast.success('Préférences enregistrées')}>
          <Check className="size-4" /> Enregistrer
        </Button>
      </div>
    </Card>
  )
}
