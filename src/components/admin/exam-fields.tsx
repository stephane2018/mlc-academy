import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSubjects, useClasses } from '@/hooks/use-catalog'
import type { ExamDifficulty } from '@/services/admin-exams'

export const difficulties: { value: ExamDifficulty; label: string }[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
]

/** Valeur de Select pour « aucune sélection » (les Select ne tolèrent pas la valeur vide). */
export const NONE = '__none__'

/** Brouillon de formulaire d'examen, partagé entre création et page de composition. */
export type ExamForm = {
  title: string
  subjectId: string
  themeId: string
  classId: string
  durationMin: string
  premium: boolean
  difficulty: ExamDifficulty
}

export function emptyExamForm(): ExamForm {
  return {
    title: '',
    subjectId: '',
    themeId: '',
    classId: '',
    durationMin: '30',
    premium: false,
    difficulty: 'moyen',
  }
}

/** Champs d'un formulaire d'examen (titre, matière, thème, classe, durée, difficulté, premium). */
export function ExamFields({ form, setForm }: { form: ExamForm; setForm: (f: ExamForm) => void }) {
  const { data: subjects = [] } = useSubjects()
  const { data: classes = [] } = useClasses()
  const subject = subjects.find((s) => s.id === form.subjectId)
  const themes = subject?.themes ?? []

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="exam-title">Titre</Label>
        <Input
          id="exam-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ex. : Examen blanc CE1D — Complet n°3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Matière</Label>
          <Select
            value={form.subjectId}
            onValueChange={(v) => setForm({ ...form, subjectId: v, themeId: '' })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Thème</Label>
          <Select
            value={form.themeId || NONE}
            onValueChange={(v) => setForm({ ...form, themeId: v === NONE ? '' : v })}
            disabled={!form.subjectId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Optionnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Aucun</SelectItem>
              {themes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Classe</Label>
          <Select
            value={form.classId || NONE}
            onValueChange={(v) => setForm({ ...form, classId: v === NONE ? '' : v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Optionnel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Aucune</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-duration">Durée (min)</Label>
          <Input
            id="exam-duration"
            type="number"
            min={5}
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
            placeholder="30"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Difficulté</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v) => setForm({ ...form, difficulty: v as ExamDifficulty })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-premium">Premium</Label>
          <div className="flex h-9 items-center gap-2">
            <Switch
              id="exam-premium"
              checked={form.premium}
              onCheckedChange={(v) => setForm({ ...form, premium: v })}
            />
            <span className="text-sm text-muted-foreground">
              {form.premium ? 'Réservé aux abonnés' : 'Accès gratuit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
