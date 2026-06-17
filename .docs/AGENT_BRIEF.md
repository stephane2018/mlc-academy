# Brief — Construction d'interfaces Math'LaClasse (prototype, données mockées)

Framework: **TanStack Start** (Vite + TanStack Router). PAS Next.js.

## Règles absolues
- Routes file-based dans `src/routes/`. Chaque fichier route :
  `export const Route = createFileRoute('<chemin>')({ component: NomComposant })`.
  Importer `createFileRoute`, `Link`, `useLocation`, `redirect` depuis `@tanstack/react-router`. **JAMAIS** d'import `next/*`.
- Liens : `<Link to="/chemin">…</Link>`. Actif : `useLocation().pathname`.
- Alias `@/` = `src/`.
- **NE PAS modifier** les fichiers partagés : `src/lib/mock.ts`, `src/styles.css`,
  `src/components/student/parts.tsx`, `src/components/math.tsx`, `src/routes/__root.tsx`.
  Tu peux créer de nouveaux composants sous `src/components/<espace>/`. Données spécifiques
  à un écran → `const` locales dans le fichier (n'édite pas mock.ts).
- Pas de directive `"use client"` (inutile ici).
- TS strict : `noUnusedLocals`/`noUnusedParameters` actifs → zéro import ou variable inutilisé.
- Les fichiers stub existants (badges, bibliotheque, live, profil, abonnement) sont à **remplacer**
  (Read puis Write).

## Design system (utilitaires Tailwind v4 déjà définis)
- Indigo primaire : `bg-brand` `text-brand` `bg-brand-soft` (CTA, progression). #4F46E5
- Teal secondaire : `bg-teal` `text-teal` `bg-teal-soft`. #0D9488
- Ambre (badges/niveaux/streak 🔥) : `bg-amber` `text-amber` `bg-amber-soft` `text-amber-foreground`. #F59E0B
- Sémantique : `text-success`/`bg-success-soft` (juste), `text-destructive` (faux),
  `text-info`/`bg-info-soft`, `text-locked` (premium verrouillé).
- Neutres : `bg-card` (blanc), `text-foreground`, `text-muted-foreground`, `border-border`,
  `bg-secondary`, `bg-background`.
- Sidebar admin sombre : `bg-sidebar` (#0F172A), `text-sidebar-foreground`, `bg-sidebar-accent`,
  `text-sidebar-primary` (teal pour item actif), `border-sidebar-border`.
- Titres : classe `font-heading` (Outfit), `font-bold`/`font-extrabold`. Corps : Lexend (défaut).
- Radius : `rounded-xl` / `rounded-2xl`. Ombres : `shadow-sm` / `shadow-md`.
- **Feedback jamais sur la couleur seule** : toujours icône + libellé.

## Composants disponibles
- shadcn/ui : `@/components/ui/{button,card,badge,progress,tabs,avatar,separator,input,label,dialog,dropdown-menu,sheet,tooltip,sonner,skeleton,switch,scroll-area,select,textarea}`.
  `Button` variants: default/outline/secondary/ghost/destructive, size sm/lg, `asChild` pour envelopper un `<Link>`.
- Helpers `@/components/student/parts` :
  `<Meter value={n} color="brand|teal|amber|success|auto" />`, `<SectionHeader title="" action={…} />`,
  `<SoftIcon tone="brand|teal|amber|success|info">{icon}</SoftIcon>`.
- Maths : `import { Math as Maths } from '@/components/math'` → `<Maths expr="2x+5=17" display />`.
- Icônes : `lucide-react`.
- Données `@/lib/mock` : student, skills{key,label,mastery}, dailyMission, badges{id,emoji,name,description,unlocked,tier},
  videos{id,title,chapter,domain,duration,progress,premium}, liveSessions{id,title,date,time,durationMin,group,teacher,status,confirmed},
  plans{id,name,price,period,tagline,features[],cta,highlight,badge}, weeklyActivity{label,minutes,score}[],
  profGroups{id,name,level,students,avgScore,activityRate,weakSkill}, profStudents{id,pseudo,avatar,group,avgScore,lastSeen,trend,weakSkill},
  parentChild, adminStats{activeStudents,groups,weeklyActivity,pendingSupport,mrr}.

## Qualité
Rendu premium (type Duolingo/Khan Academy). États hover/active, espacements cohérents, responsive.
Serveur dev sur http://localhost:3000. Vérifie le rendu :
`node -e 'fetch("http://localhost:3000/<route>").then(r=>r.text()).then(t=>console.log("len",t.length))'`
(curl indisponible). Vérifie l'absence d'erreur dans `/tmp/academy-dev.log`.

**Référence de style** : lis `src/routes/eleve/dashboard.tsx` et `src/routes/eleve/jeu.tsx`.
