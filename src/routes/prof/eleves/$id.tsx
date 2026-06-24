import { useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Zap, Flame, Percent, BookOpen, MessageSquare, Pencil, AlertCircle, Lock } from '@/components/icons'
import { Meter, SectionHeader, SoftIcon } from '@/components/student/parts'
import { PageHero, RailLayout, StatTile } from '@/components/blocks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { QueryError } from '@/components/query-error'
import { useTeacherStudent, useResetStudentPin } from '@/hooks/use-teacher'

export const Route = createFileRoute('/prof/eleves/$id')({
  component: ProfStudentDetail,
})

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

function NotFound() {
  return (
    <div className="2xl:mx-auto 2xl:max-w-[1700px]">
      <Card className="flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-soft">
        <SoftIcon tone="amber">
          <AlertCircle className="size-5" />
        </SoftIcon>
        <p className="font-heading text-lg font-bold">Élève introuvable</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Cet élève n'existe pas ou ne fait pas partie de tes groupes.
        </p>
        <Button asChild variant="outline" className="mt-1">
          <Link to="/prof/eleves">
            <ArrowLeft className="size-4" />
            Annuaire
          </Link>
        </Button>
      </Card>
    </div>
  )
}

function ProfStudentDetail() {
  const { id } = useParams({ from: '/prof/eleves/$id' })
  const detailQ = useTeacherStudent(id)
  const { data: detail, isLoading } = detailQ

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chargement…</div>
  }
  if (detailQ.isError) {
    return (
      <div className="2xl:mx-auto 2xl:max-w-[1700px]">
        <QueryError onRetry={() => detailQ.refetch()} />
      </div>
    )
  }
  if (!detail) return <NotFound />

  const avgMastery = detail.skills.length
    ? Math.round(detail.skills.reduce((sum, s) => sum + s.mastery, 0) / detail.skills.length)
    : 0

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1700px]">
      <Link
        to="/prof/eleves"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Annuaire
      </Link>

      <PageHero
        eyebrow="Fiche élève"
        title={
          <span className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-2xl">{detail.avatar}</span>
            {detail.pseudo}
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {detail.groups.map((g) => (
              <Badge key={g} variant="secondary" className="bg-brand-soft text-brand">{g}</Badge>
            ))}
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Zap className="size-4 text-amber" />
              Niveau {detail.level} · {detail.xp} XP
            </span>
          </span>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Zap} tone="info" label="Niveau" value={detail.level} />
        <StatTile icon={Zap} tone="brand" label="Expérience" value={`${detail.xp} XP`} />
        <StatTile icon={Flame} tone="amber" label="Série en cours" value={`${detail.streak} j`} />
        <StatTile icon={Percent} tone="teal" label="Maîtrise moyenne" value={`${avgMastery} %`} />
      </div>

      <RailLayout
        rail={
          <Card className="gap-3 p-5">
            <p className="font-heading text-base font-bold">Actions</p>
            <Button asChild className="w-full justify-start">
              <Link to="/prof/exercices/nouveau">
                <Pencil className="size-4" />
                Créer / assigner un devoir
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/prof/messages">
                <MessageSquare className="size-4" />
                Envoyer un message
              </Link>
            </Button>
            <ResetPinDialog studentId={detail.id} pseudo={detail.pseudo} />
            {detail.lastActive && (
              <p className="text-xs text-muted-foreground">
                Dernière activité : {dateFmt.format(new Date(detail.lastActive))}
              </p>
            )}
          </Card>
        }
      >
        {/* Compétences par matière */}
        <section>
          <SectionHeader title="Compétences par matière" />
          <Card className="gap-5 p-5 shadow-soft">
            {detail.skills.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <SoftIcon tone="brand">
                  <BookOpen className="size-5" />
                </SoftIcon>
                <p className="text-sm text-muted-foreground">Pas encore de données de maîtrise pour cet élève.</p>
              </div>
            ) : (
              detail.skills.map((s) => (
                <div key={s.subjectId}>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color ?? 'var(--brand)' }} />
                      {s.subjectName}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-muted-foreground">{s.mastery}%</span>
                  </div>
                  <ul className="space-y-3">
                    {s.themes.map((t) => (
                      <li key={t.themeId} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 truncate text-sm font-medium">{t.name}</span>
                        <Meter value={t.mastery} color="auto" />
                        <span className="w-9 shrink-0 text-right text-sm font-bold tabular-nums">{t.mastery}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </Card>
        </section>
      </RailLayout>
    </div>
  )
}

function ResetPinDialog({ studentId, pseudo }: { studentId: string; pseudo: string }) {
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const reset = useResetStudentPin()
  const valid = /^\d{6}$/.test(pin)

  function submit() {
    if (!valid) return
    reset.mutate(
      { id: studentId, pin },
      {
        onSuccess: () => {
          setOpen(false)
          setPin('')
          toast.success('PIN réinitialisé', { description: `Communique le nouveau code à ${pseudo}.` })
        },
        onError: () => toast.error('Échec de la réinitialisation.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPin('') }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Lock className="size-4" />
          Réinitialiser le PIN
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser le PIN de {pseudo}</DialogTitle>
          <DialogDescription>Définis un nouveau code à 6 chiffres. Transmets-le à l'élève.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-1">
          <Label htmlFor="new-pin">Nouveau PIN</Label>
          <Input
            id="new-pin"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="max-w-[160px] text-center font-heading text-lg tracking-[0.3em]"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <Button disabled={!valid || reset.isPending} onClick={submit}>Réinitialiser</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
