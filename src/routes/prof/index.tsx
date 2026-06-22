import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, Radio, Clock, Boxes, Target, FileText, Copy, ArrowRight } from '@/components/icons'
import { toast } from 'sonner'
import { SectionHeader } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGroups } from '@/hooks/use-groups'
import { useTeacherStudents } from '@/hooks/use-teacher'
import { useLiveSessions } from '@/hooks/use-live'
import { useClasses } from '@/hooks/use-catalog'

export const Route = createFileRoute('/prof/')({
  component: ProfOverview,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function ProfOverview() {
  const { data: groups = [] } = useGroups()
  const { data: students = [] } = useTeacherStudents()
  const { data: sessions = [] } = useLiveSessions()
  const { data: classes = [] } = useClasses()

  const classLabel = (id: string) => classes.find((c) => c.id === id)?.label ?? '—'
  const groupName = (id: string | null) => (id ? groups.find((g) => g.id === id)?.name : null) ?? null

  // Prochaine séance : à venir/live la plus proche.
  const upcoming = sessions
    .filter((s) => s.status === 'upcoming' || s.status === 'live')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const next = upcoming[0] ?? null

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <PageHero
        eyebrow="Espace Prof"
        title="Bonjour 👋"
        subtitle="Voici l'état de vos groupes et la prochaine échéance."
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Users} tone="brand" label="Élèves suivis" value={students.length} />
        <StatTile icon={Boxes} tone="info" label="Groupes" value={groups.length} />
        <StatTile
          icon={Radio}
          tone="teal"
          label="Prochaine séance live"
          value={next ? dateFmt.format(new Date(next.scheduledAt)) : '—'}
          spark={
            next ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-teal" />
                </span>
                {next.title}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Aucune séance planifiée</span>
            )
          }
        />
      </div>

      <RailLayout
        rail={
          <>
            {/* Prochaine séance */}
            <Card className="gap-0 p-5">
              <p className="font-heading text-base font-bold">Prochaine séance</p>
              {next ? (
                <>
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-teal-soft p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal text-white">
                      <Radio className="size-5" />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-bold">{next.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> {dateFmt.format(new Date(next.scheduledAt))}
                        {groupName(next.groupId) ? ` · ${groupName(next.groupId)}` : ''}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="mt-3 w-full">
                    <Link to="/prof/planning">Voir le planning</Link>
                  </Button>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Aucune séance planifiée. Crée-en une dans le planning.</p>
              )}
            </Card>

            {/* Actions rapides */}
            <Card className="gap-3 p-5">
              <p className="font-heading text-base font-bold">Actions rapides</p>
              <Button asChild className="w-full justify-start">
                <Link to="/prof/exercices/nouveau">
                  <Target className="size-4" />
                  Créer / assigner un devoir
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/prof/rapports">
                  <FileText className="size-4" />
                  Envoyer un rapport
                </Link>
              </Button>
            </Card>
          </>
        }
      >
        {/* Mes groupes */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="Mes groupes" />
            <Button asChild size="sm" variant="ghost">
              <Link to="/prof/groupes">Tout voir <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
          {groups.length === 0 ? (
            <Card className="py-10 text-center text-sm text-muted-foreground">
              Aucun groupe. Crée ton premier groupe et partage son code.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((g) => (
                <Link key={g.id} to="/prof/groupes/$id" params={{ id: g.id }} className="card-hover block rounded-2xl">
                  <Card className="h-full gap-0 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-heading text-base font-bold">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.studentCount} élève{g.studentCount > 1 ? 's' : ''}</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-soft text-amber-foreground">{classLabel(g.classId)}</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        navigator.clipboard?.writeText(g.code).catch(() => {})
                        toast.success('Code copié', { description: g.code })
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand"
                    >
                      Code : <span className="font-mono font-bold text-foreground">{g.code}</span>
                      <Copy className="size-3.5" />
                    </button>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </RailLayout>
    </div>
  )
}
