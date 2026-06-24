import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Settings,
  CreditCard,
  Bank,
  Mail,
  Shield,
  ShieldCheck,
  Lock,
  Trophy,
  Zap,
  Flame,
  Sparkles,
  Check,
  CheckCircle2,
  Euro,
  Smartphone,
  Send,
  Target,
  Loader,
  type IconComponent,
} from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { SectionHeader, SoftIcon } from '@/components/student/parts'
import { SparkArea } from '@/components/blocks'
import { cn } from '@/lib/utils'
import { useAdminSettings, useUpdateSetting } from '@/hooks/use-admin-settings'
import { useAdminPlans } from '@/hooks/use-admin-billing'
import type { AppSettings, SettingValue } from '@/services/admin-settings'

export const Route = createFileRoute('/admin/parametres')({
  component: AdminParametres,
})

/* ------------------------------------------------------------------ */
/* Données décoratives inline (gérées côté Stripe / Resend Dashboard)  */
/* ------------------------------------------------------------------ */

type Tone = 'brand' | 'teal' | 'amber' | 'success' | 'info' | 'violet'

/* Stripe — secrets gérés côté serveur (variables d'environnement / Dashboard Stripe),
   jamais exposés par l'API : on affiche seulement leur intitulé, sans valeur inventée. */
type ApiKeyRow = { id: string; label: string }
const stripeKeys: ApiKeyRow[] = [
  { id: 'pk', label: 'Clé publiable' },
  { id: 'sk', label: 'Clé secrète' },
  { id: 'wh', label: 'Secret webhook' },
]

/* Stripe — moyens de paiement → clé app_settings `payment_method_<method>` */
type PaymentMethod = { id: string; label: string; method: string; icon: IconComponent; defaultEnabled: boolean }
const paymentMethods: PaymentMethod[] = [
  { id: 'card', label: 'Carte bancaire', method: 'card', icon: CreditCard, defaultEnabled: true },
  { id: 'bancontact', label: 'Bancontact', method: 'bancontact', icon: Smartphone, defaultEnabled: true },
  { id: 'sepa', label: 'Prélèvement SEPA', method: 'sepa_debit', icon: Bank, defaultEnabled: false },
]
const paymentKey = (method: string) => `payment_method_${method}`

/* E-mail (Resend) — e-mails transactionnels → clé app_settings `email_<id>` */
type MailRow = { id: string; label: string; description: string; defaultEnabled: boolean }
const transactionalMails: MailRow[] = [
  { id: 'report', label: 'Rapport parent', description: 'Synthèse hebdomadaire envoyée au tuteur', defaultEnabled: true },
  { id: 'result', label: 'Résultat', description: 'Notification après un examen ou une évaluation', defaultEnabled: true },
  { id: 'late', label: 'Devoir en retard', description: 'Alerte quand un devoir dépasse l’échéance', defaultEnabled: true },
  { id: 'inactive', label: 'Relance inactivité', description: 'E-mail de rappel après 7 jours sans activité', defaultEnabled: false },
  { id: 'welcome', label: 'Bienvenue', description: 'Message d’accueil à la création du compte', defaultEnabled: true },
]
const emailKey = (id: string) => `email_${id}`

/* Gamification — affichage de référence (géré dans les tables xp_rules / levels) */
type XpRuleRow = { action: string; label: string; baseXp: number; dailyCap: number | null; enabled: boolean }
const xpRules: XpRuleRow[] = [
  { action: 'exercice_juste', label: 'Exercice juste', baseXp: 10, dailyCap: 300, enabled: true },
  { action: 'exercice_apres_erreur', label: 'Exercice juste après erreur', baseXp: 4, dailyCap: 200, enabled: true },
  { action: 'session_jeu', label: 'Session de jeu terminée', baseXp: 20, dailyCap: 100, enabled: true },
  { action: 'examen_blanc', label: 'Examen blanc passé', baseXp: 50, dailyCap: null, enabled: true },
  { action: 'devoir_rendu', label: 'Devoir rendu', baseXp: 25, dailyCap: null, enabled: true },
  { action: 'evaluation_reussie', label: 'Évaluation réussie', baseXp: 40, dailyCap: null, enabled: true },
  { action: 'defi_gagne', label: 'Défi gagné', baseXp: 35, dailyCap: 140, enabled: true },
  { action: 'video_vue', label: 'Vidéo visionnée', baseXp: 5, dailyCap: 50, enabled: true },
  { action: 'presence_live', label: 'Présence en live', baseXp: 30, dailyCap: null, enabled: true },
  { action: 'streak_7', label: 'Série de 7 jours', baseXp: 50, dailyCap: null, enabled: true },
]

type LevelRow = { level: number; xpRequired: number; title?: string }
const levels: LevelRow[] = [
  { level: 1, xpRequired: 0, title: 'Débutant' },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 300 },
  { level: 4, xpRequired: 600 },
  { level: 5, xpRequired: 1000, title: 'Apprenti' },
  { level: 6, xpRequired: 1500 },
  { level: 7, xpRequired: 2100 },
  { level: 8, xpRequired: 2800 },
  { level: 9, xpRequired: 3600 },
  { level: 10, xpRequired: 4500, title: 'Confirmé' },
  { level: 11, xpRequired: 5500 },
  { level: 12, xpRequired: 6600 },
  { level: 13, xpRequired: 7800 },
  { level: 14, xpRequired: 9100 },
  { level: 15, xpRequired: 10500, title: 'Expert' },
]

/* ------------------------------------------------------------------ */
/* Helpers de lecture typée d'une valeur app_settings                  */
/* ------------------------------------------------------------------ */

function boolSetting(data: AppSettings | undefined, key: string, fallback: boolean): boolean {
  const v = data?.[key]
  return typeof v === 'boolean' ? v : fallback
}

function stringSetting(data: AppSettings | undefined, key: string, fallback: string): string {
  const v = data?.[key]
  return typeof v === 'string' && v.length > 0 ? v : fallback
}

/* Formatage d'une formule (`/admin/plans`) pour le tableau Stripe */
function formatPrice(cents: number): string {
  if (cents <= 0) return 'Gratuit'
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

function formatPeriod(period: string | null): string {
  if (!period) return '—'
  const map: Record<string, string> = { month: '/mois', year: '/an', week: '/semaine', day: '/jour' }
  return map[period] ?? period
}

/* ------------------------------------------------------------------ */
/* Navigation de sections                                              */
/* ------------------------------------------------------------------ */

type SectionId = 'stripe' | 'email' | 'gamification' | 'general'
type NavEntry = { id: SectionId; label: string; icon: IconComponent }
const navEntries: NavEntry[] = [
  { id: 'stripe', label: 'Stripe', icon: CreditCard },
  { id: 'email', label: 'E-mail', icon: Mail },
  { id: 'gamification', label: 'Gamification', icon: Trophy },
  { id: 'general', label: 'Général', icon: Settings },
]

/* ------------------------------------------------------------------ */
/* Petits composants visuels locaux                                    */
/* ------------------------------------------------------------------ */

function CardShell({
  icon,
  tone = 'brand',
  title,
  description,
  action,
  children,
  className,
}: {
  icon: IconComponent
  tone?: Tone
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const Icon = icon
  return (
    <Card className={cn('gap-4 rounded-2xl p-5 shadow-soft', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SoftIcon tone={tone}>
            <Icon className="size-5" />
          </SoftIcon>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold leading-tight">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </Card>
  )
}

/* Intitulé d'un secret + état de présence (la valeur reste côté serveur, jamais affichée) */
function SecretField({ field }: { field: ApiKeyRow }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground">
        <Lock className="size-3.5" />
        {field.label}
      </Label>
      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-success" />
        Gérée côté serveur
      </div>
    </div>
  )
}

/* Ligne avec Switch contrôlé (paiement / e-mail) — persiste au toggle */
function ToggleRow({
  icon,
  tone = 'brand',
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
  trailing,
}: {
  icon?: IconComponent
  tone?: Tone
  title: string
  description?: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (value: boolean) => void
  trailing?: React.ReactNode
}) {
  const Icon = icon
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <SoftIcon tone={tone} className="size-9">
            <Icon className="size-4.5" />
          </SoftIcon>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          {description ? <p className="truncate text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {trailing}
        <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-label={title} />
      </div>
    </div>
  )
}

/* Pied de page de section : bouton Enregistrer piloté par dirty */
function SaveBar({
  note,
  dirty,
  pending,
  onSave,
}: {
  note?: string
  dirty: boolean
  pending?: boolean
  onSave: () => void
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : <span />}
      <Button
        type="button"
        disabled={!dirty || pending}
        onClick={onSave}
        className="self-start sm:self-auto"
      >
        {pending ? <Loader className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Enregistrer
      </Button>
    </div>
  )
}

/* État de chargement / erreur partagé */
function SettingsState({ isLoading, isError }: { isLoading: boolean; isError: boolean }) {
  return (
    <Card className="rounded-2xl p-8 text-center shadow-soft">
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader className="size-5 animate-spin" />
          <p className="text-sm">Chargement des réglages…</p>
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les réglages de la plateforme.</p>
      ) : null}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Écran                                                               */
/* ------------------------------------------------------------------ */

function AdminParametres() {
  const [section, setSection] = useState<SectionId>('stripe')
  const { data, isLoading, isError } = useAdminSettings()
  const updateSetting = useUpdateSetting()
  const plansQ = useAdminPlans()

  /* Stripe — clés app_settings backées : stripe_test_mode + payment_method_<method> */
  const stripeTestMode = boolSetting(data, 'stripe_test_mode', false)

  /* Général — brouillon local, persisté au clic Enregistrer */
  const generalDefaults = {
    platform_name: stringSetting(data, 'platform_name', 'MLC Academy'),
    default_level: stringSetting(data, 'default_level', 'CE1D'),
    timezone: stringSetting(data, 'timezone', 'Europe/Brussels'),
    interface_language: stringSetting(data, 'interface_language', 'fr'),
  }
  const [general, setGeneral] = useState(generalDefaults)
  const [generalSaving, setGeneralSaving] = useState(false)

  /* Resynchronise le brouillon Général quand les données serveur arrivent/changent */
  useEffect(() => {
    if (data) setGeneral(generalDefaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.platform_name, data?.default_level, data?.timezone, data?.interface_language])

  const generalDirty =
    general.platform_name !== generalDefaults.platform_name ||
    general.default_level !== generalDefaults.default_level ||
    general.timezone !== generalDefaults.timezone ||
    general.interface_language !== generalDefaults.interface_language

  /* Persiste une clé unique et notifie */
  const persist = (key: string, value: SettingValue, label: string) => {
    updateSetting.mutate(
      { key, value },
      {
        onSuccess: () => toast.success('Réglage enregistré', { description: label }),
        onError: () => toast.error('Échec de l’enregistrement', { description: label }),
      },
    )
  }

  const saveGeneral = async () => {
    setGeneralSaving(true)
    const changes: Array<{ key: string; value: SettingValue }> = []
    if (general.platform_name !== generalDefaults.platform_name)
      changes.push({ key: 'platform_name', value: general.platform_name })
    if (general.default_level !== generalDefaults.default_level)
      changes.push({ key: 'default_level', value: general.default_level })
    if (general.timezone !== generalDefaults.timezone)
      changes.push({ key: 'timezone', value: general.timezone })
    if (general.interface_language !== generalDefaults.interface_language)
      changes.push({ key: 'interface_language', value: general.interface_language })
    try {
      await Promise.all(changes.map((c) => updateSetting.mutateAsync(c)))
      toast.success('Réglages enregistrés', { description: 'Configuration générale mise à jour.' })
    } catch {
      toast.error('Échec de l’enregistrement', { description: 'Configuration générale.' })
    } finally {
      setGeneralSaving(false)
    }
  }

  return (
    <div className="space-y-6 2xl:mx-auto 2xl:max-w-[1400px]">
      {/* En-tête */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <SoftIcon tone="brand">
            <Settings className="size-5" />
          </SoftIcon>
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">Paramètres</h1>
            <p className="text-sm text-muted-foreground">
              Configuration de la plateforme — paiements, e-mails, gamification.
            </p>
          </div>
        </div>
        <Badge className="bg-violet-soft text-violet">
          <Shield className="size-3" />
          Super-admin
        </Badge>
      </div>

      {/* Onglets horizontaux */}
      <div className="space-y-5">
        {/* Barre d'onglets */}
        <div className="-mx-1 overflow-x-auto px-1">
          <nav
            role="tablist"
            aria-label="Sections des paramètres"
            className="inline-flex min-w-max items-center gap-1 border-b border-border"
          >
            {navEntries.map((entry) => {
              const Icon = entry.icon
              const active = section === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSection(entry.id)}
                  className={cn(
                    '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {entry.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu de la section active */}
        <div className="min-w-0">
          {isLoading || isError ? (
            <div className="max-w-[880px]">
              <SettingsState isLoading={isLoading} isError={isError} />
            </div>
          ) : (
            <>
              {/* ============================ STRIPE ============================ */}
              {section === 'stripe' ? (
                <div className="max-w-[880px] space-y-5">
                  <CardShell
                    icon={CreditCard}
                    tone="brand"
                    title="Connexion Stripe"
                    description="Compte de paiement lié à la plateforme."
                    action={
                      <Badge className="bg-success-soft text-success">
                        <Check className="size-3" />
                        Connecté
                      </Badge>
                    }
                  >
                    <ToggleRow
                      icon={Shield}
                      tone="amber"
                      title="Mode test"
                      description="Bascule entre les environnements test et live."
                      checked={stripeTestMode}
                      disabled={updateSetting.isPending}
                      onCheckedChange={(value) => persist('stripe_test_mode', value, 'Mode test Stripe')}
                      trailing={
                        stripeTestMode ? (
                          <Badge className="bg-amber-soft text-amber-foreground">Test</Badge>
                        ) : (
                          <Badge className="bg-info-soft text-info">Live</Badge>
                        )
                      }
                    />
                  </CardShell>

                  <CardShell
                    icon={Lock}
                    tone="violet"
                    title="Clés API"
                    description="Valeurs masquées — gérées dans le Dashboard Stripe."
                  >
                    <div className="grid gap-4 lg:grid-cols-3">
                      {stripeKeys.map((k) => (
                        <SecretField key={k.id} field={k} />
                      ))}
                    </div>
                  </CardShell>

                  <section>
                    <SectionHeader title="Formules → Prix Stripe" />
                    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                          <thead>
                            <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="px-5 py-3 font-semibold">Formule</th>
                              <th className="px-5 py-3 font-semibold">Prix</th>
                              <th className="px-5 py-3 font-semibold">Période</th>
                              <th className="px-5 py-3 font-semibold">stripe_price_id</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {plansQ.isLoading ? (
                              <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-sm text-muted-foreground">
                                  Chargement des formules…
                                </td>
                              </tr>
                            ) : plansQ.isError ? (
                              <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-sm text-destructive">
                                  Impossible de charger les formules.
                                </td>
                              </tr>
                            ) : !plansQ.data?.length ? (
                              <tr>
                                <td colSpan={4} className="px-5 py-6 text-center text-sm text-muted-foreground">
                                  Aucune formule configurée.
                                </td>
                              </tr>
                            ) : (
                              plansQ.data.map((plan) => (
                                <tr key={plan.id} className="transition-colors hover:bg-secondary/40">
                                  <td className="px-5 py-3 font-medium">{plan.name}</td>
                                  <td className="px-5 py-3 font-semibold tabular-nums">{formatPrice(plan.priceCents)}</td>
                                  <td className="px-5 py-3 text-muted-foreground">{formatPeriod(plan.period)}</td>
                                  <td className="px-5 py-3">
                                    <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
                                      {plan.stripePriceId ?? '—'}
                                    </code>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </section>

                  <CardShell
                    icon={Euro}
                    tone="teal"
                    title="Moyens de paiement"
                    description="Adaptés au contexte belge."
                  >
                    <div className="space-y-2.5">
                      {paymentMethods.map((m) => {
                        const key = paymentKey(m.method)
                        return (
                          <ToggleRow
                            key={m.id}
                            icon={m.icon}
                            tone="teal"
                            title={m.label}
                            description={`method = ${m.method}`}
                            checked={boolSetting(data, key, m.defaultEnabled)}
                            disabled={updateSetting.isPending}
                            onCheckedChange={(value) => persist(key, value, m.label)}
                          />
                        )
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline">
                        <CreditCard className="size-4" />
                        Ouvrir le portail client Stripe
                      </Button>
                    </div>
                  </CardShell>

                  <p className="text-xs text-muted-foreground">
                    Les clés et webhooks sont gérés côté Dashboard Stripe. Le mode test et les moyens de
                    paiement sont enregistrés automatiquement.
                  </p>
                </div>
              ) : null}

              {/* ============================ E-MAIL ============================ */}
              {section === 'email' ? (
                <div className="max-w-[880px] space-y-5">
                  <CardShell
                    icon={Mail}
                    tone="brand"
                    title="Fournisseur d’envoi"
                    description="Service transactionnel d’e-mails."
                    action={
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge className="bg-brand-soft text-brand">
                          <Send className="size-3" />
                          Resend
                        </Badge>
                        <Badge className="bg-success-soft text-success">
                          <ShieldCheck className="size-3" />
                          mlcacademy.be vérifié
                        </Badge>
                      </div>
                    }
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SecretField field={{ id: 'resend', label: 'Clé API Resend' }} />
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground" htmlFor="sender">
                          <Mail className="size-3.5" />
                          Expéditeur
                        </Label>
                        <Input id="sender" readOnly value="no-reply@mlcacademy.be" className="h-9" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline">
                        <Send className="size-4" />
                        Envoyer un e-mail de test
                      </Button>
                    </div>
                  </CardShell>

                  <CardShell
                    icon={Sparkles}
                    tone="violet"
                    title="E-mails transactionnels"
                    description="Activez ou désactivez chaque modèle."
                  >
                    <div className="space-y-2.5">
                      {transactionalMails.map((mail) => {
                        const key = emailKey(mail.id)
                        return (
                          <ToggleRow
                            key={mail.id}
                            icon={Mail}
                            tone="violet"
                            title={mail.label}
                            description={mail.description}
                            checked={boolSetting(data, key, mail.defaultEnabled)}
                            disabled={updateSetting.isPending}
                            onCheckedChange={(value) => persist(key, value, mail.label)}
                          />
                        )
                      })}
                    </div>
                  </CardShell>

                  <p className="text-xs text-muted-foreground">
                    Domaine d’envoi authentifié (SPF / DKIM) via Resend. Chaque bascule est enregistrée
                    automatiquement.
                  </p>
                </div>
              ) : null}

              {/* ========================= GAMIFICATION ========================= */}
              {section === 'gamification' ? (
                <div className="max-w-[880px] space-y-5">
                  <section>
                    <SectionHeader
                      title="Barème XP"
                      action={
                        <Badge className="bg-amber-soft text-amber-foreground">
                          <Zap className="size-3" />
                          {xpRules.length} actions
                        </Badge>
                      }
                    />
                    <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-sm">
                          <thead>
                            <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="px-5 py-3 font-semibold">Action</th>
                              <th className="px-5 py-3 font-semibold">XP de base</th>
                              <th className="px-5 py-3 font-semibold">Plafond / jour</th>
                              <th className="px-5 py-3 font-semibold text-right">Activé</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {xpRules.map((rule) => (
                              <tr key={rule.action} className="transition-colors hover:bg-secondary/40">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className="grid size-7 place-items-center rounded-lg bg-amber-soft text-amber-foreground">
                                      <Zap className="size-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-medium">{rule.label}</p>
                                      <code className="font-mono text-[11px] text-muted-foreground">{rule.action}</code>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3 font-semibold tabular-nums">{rule.baseXp}</td>
                                <td className="px-5 py-3 tabular-nums">
                                  {rule.dailyCap === null ? (
                                    <span className="text-muted-foreground">—</span>
                                  ) : (
                                    rule.dailyCap
                                  )}
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex justify-end">
                                    <Badge
                                      className={cn(
                                        rule.enabled
                                          ? 'bg-success-soft text-success'
                                          : 'bg-secondary text-muted-foreground',
                                      )}
                                    >
                                      {rule.enabled ? 'Actif' : 'Inactif'}
                                    </Badge>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </section>

                  <section>
                    <SectionHeader
                      title="Courbe de niveaux"
                      action={
                        <Badge className="bg-brand-soft text-brand">
                          <Target className="size-3" />
                          {levels.length} niveaux
                        </Badge>
                      }
                    />
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                      <Card className="overflow-hidden rounded-2xl p-0 shadow-soft">
                        <div className="max-h-[420px] overflow-auto">
                          <table className="w-full min-w-[320px] text-sm">
                            <thead className="sticky top-0">
                              <tr className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="px-5 py-3 font-semibold">Niveau</th>
                                <th className="px-5 py-3 font-semibold">Titre</th>
                                <th className="px-5 py-3 font-semibold text-right">XP requis</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {levels.map((lvl) => (
                                <tr key={lvl.level} className="transition-colors hover:bg-secondary/40">
                                  <td className="px-5 py-3">
                                    <span className="inline-flex items-center gap-2 font-semibold">
                                      <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                                        {lvl.level}
                                      </span>
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-muted-foreground">{lvl.title ?? '—'}</td>
                                  <td className="px-5 py-3 text-right font-semibold tabular-nums">
                                    {lvl.xpRequired.toLocaleString('fr-FR')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>

                      <Card className="gap-3 rounded-2xl p-5 shadow-soft">
                        <div className="flex items-center gap-2">
                          <Flame className="size-4 text-amber-foreground" />
                          <p className="text-sm font-semibold">Progression de l’XP cumulée</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Seuil(n) = 50 × (n−1) × n — courbe d’XP requise par niveau.
                        </p>
                        <SparkArea data={levels.map((l) => l.xpRequired)} color="var(--brand)" height={140} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Niv. 1</span>
                          <span>Niv. {levels.length}</span>
                        </div>
                      </Card>
                    </div>
                  </section>

                  <p className="text-xs text-muted-foreground">
                    Le barème XP et la courbe de niveaux sont gérés dans les tables dédiées (xp_rules /
                    levels), affichés ici à titre de référence.
                  </p>
                </div>
              ) : null}

              {/* ============================ GÉNÉRAL ============================ */}
              {section === 'general' ? (
                <div className="max-w-[880px] space-y-5">
                  <CardShell
                    icon={Settings}
                    tone="brand"
                    title="Général"
                    description="Identité et réglages de base de la plateforme."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="platform-name">Nom de la plateforme</Label>
                        <Input
                          id="platform-name"
                          value={general.platform_name}
                          onChange={(e) => setGeneral((p) => ({ ...p, platform_name: e.target.value }))}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="default-level">Niveau par défaut</Label>
                        <Select
                          value={general.default_level}
                          onValueChange={(v) => setGeneral((p) => ({ ...p, default_level: v }))}
                        >
                          <SelectTrigger id="default-level" className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CE1D">CE1D</SelectItem>
                            <SelectItem value="S1">S1</SelectItem>
                            <SelectItem value="S2">S2</SelectItem>
                            <SelectItem value="S3">S3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="timezone">Fuseau horaire</Label>
                        <Select
                          value={general.timezone}
                          onValueChange={(v) => setGeneral((p) => ({ ...p, timezone: v }))}
                        >
                          <SelectTrigger id="timezone" className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Brussels">Europe/Brussels</SelectItem>
                            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="language">Langue de l’interface</Label>
                        <Select
                          value={general.interface_language}
                          onValueChange={(v) => setGeneral((p) => ({ ...p, interface_language: v }))}
                        >
                          <SelectTrigger id="language" className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français (FR)</SelectItem>
                            <SelectItem value="nl">Nederlands (NL)</SelectItem>
                            <SelectItem value="en">English (EN)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardShell>

                  <CardShell
                    icon={ShieldCheck}
                    tone="success"
                    title="Confidentialité (RGPD)"
                    description="Protection des données des mineurs."
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft/40 px-4 py-3">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
                      <p className="text-sm text-muted-foreground">
                        Les élèves sont <span className="font-semibold text-foreground">anonymes</span> : un pseudo,
                        sans adresse e-mail ni nom réel. Seuls les comptes parents et enseignants disposent
                        d’identifiants personnels. Aucune donnée nominative d’élève n’est collectée.
                      </p>
                    </div>
                  </CardShell>

                  <SaveBar
                    note="Conforme au RGPD — minimisation des données élèves."
                    dirty={generalDirty}
                    pending={generalSaving}
                    onSave={saveGeneral}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
