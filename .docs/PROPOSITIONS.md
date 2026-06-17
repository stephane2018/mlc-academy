# Propositions & backlog — academy.mathslaclasse.com

Backlog fonctionnel dérivé du **cahier des charges v1.0** (Léopold Minko, 2026) et de l'état actuel du prototype d'interfaces (TanStack Start + Supabase, données mockées).

**Légende d'état :** ✅ fait (UI mock) · 🟡 partiel · ⬜ à faire
**Phases (cahier §7) :** `V1` MVP bloquant · `V1.5` 3 mois post-lancement · `V2` 6–12 mois

---

## 0. État actuel du prototype

| Espace | Écrans livrés (UI mock) | État |
|---|---|---|
| Élève | onboarding, dashboard, jeu/quiz, **devoirs/évaluations** (liste + passation + **historique**), examens blancs, bibliothèque + lecteur, live + salle de cours intégrée, classement, coach IA, messages, profil, badges, abonnement + checkout, mon-abonnement | ✅ |
| Prof | vue d'ensemble, planning, **créateur de devoirs** + **résultats**, annuaire, fiche élève, groupes (+ détail), ressources (médiathèque), messagerie, rapports PDF | ✅ |
| Parent | connexion + liaison, dashboard de suivi | ✅ |
| Admin | vue d'ensemble, ressources, abonnements, support, examens (gestion), **banque de questions** | ✅ |
| Public | hub, confidentialité, CGU | ✅ |

> **Toutes les interfaces sont livrées en mock** — V1, V1.5, et même des écrans V2 (salle live intégrée, coach IA). **35 routes**, `tsc` clean. Il ne reste plus que le **back-end** : brancher Supabase (schéma Postgres + RLS + auth), câbler TanStack Query/mutations, et les intégrations (Mollie, Meet/Daily.co, push PWA, vrai coach IA). Données dans `src/lib/mock.ts`.

---

## 1. Authentification & comptes — §1, §8

- ⬜ `V1` **Auth élève réelle** : pseudo + avatar + mot de passe, **sans nom/email/photo** (RGPD mineurs). Email parent séparé, optionnel pour reset. Adapter Supabase Auth (email synthétique `pseudo@academy.local` ou auth custom).
- ⬜ `V1` **Liaison parent** : l'élève génère un code depuis son dashboard, le parent le saisit (UI du code déjà présente côté élève).
- ⬜ `V1` **Code de groupe** à l'inscription → rattachement auto au groupe du prof.
- ⬜ `V1` **RLS Supabase** : élève ne lit que ses données ; parent que l'élève lié ; prof que ses groupes (critère d'acceptation §9).

## 2. Jeu CE1D & exercices — §6

- 🟡 `V1` **Jeu intégré** : connexion du jeu existant → crédit XP au profil (UI quiz faite, logique XP à câbler).
- ⬜ `V1.5` **Assignation individuelle** d'exercices ciblés par le prof à un élève (avec délai optionnel).
- ⬜ `V2` **Génération d'exercices paramétrés** automatiques.

## 3. Examens blancs — §4, §9 ⭐ structurant

- ⬜ `V1.5` Module dédié `/eleve/examens`, distinct du jeu :
  - **Chronométré** (ex. 50 min · 20 questions), **correction automatique**.
  - **Score ≥ 50 % requis** pour valider → crédite **+50 XP**.
  - **Résultats archivés** dans le profil, historique des tentatives, **corrigé détaillé** (KaTeX).
- ⬜ Côté admin : remplir l'entrée « Examens blancs » (création/édition d'un examen, banque de questions).

## 4. Gamification — §6 (barème exact du cahier)

- 🟡 `V1` **Barème XP** à câbler : exercice juste 1er coup **10**, après erreur **5**, session jeu (20 q.) **20**, examen blanc (>50 %) **50**, vidéo ≥80 % **5**, présence live (≥45/60 min) **30**, streak 7 j **+50**.
- ⬜ `V1.5` **Échelle de niveaux + déblocages** :
  - 0–199 **Apprenti Mathématicien** (standard)
  - 200–499 **Élève Confirmé** (+3 fiches méthode bonus)
  - 500–999 **Expert CE1D** (+examens blancs supplémentaires)
  - 1000–1999 **Champion des Maths** (badge national + classement)
  - 2000+ **Légende Math'LaClasse** (certificat PDF téléchargeable)
  - → écran « Mes niveaux » avec prochaine récompense à débloquer.
- ⬜ `V1.5` **Classement hebdomadaire** entre élèves d'un même groupe (UI classement déjà amorcée sur le dashboard).
- ✅/🟡 **Badges & récompenses visuelles** (UI faite, logique de déblocage à câbler).

## 5. Cours live & visioconférence — §5

- ⬜ `V1` **Bouton « Rejoindre »** affiché **5 min avant** la séance → lien **Google Meet** (stocké en base, créé depuis Google Calendar). Ouvre un nouvel onglet.
- ⬜ `V1` **Confirmation de présence** en 1 clic depuis le dashboard ; le prof voit le taux de confirmation en temps réel (UI toggle présence déjà dans le détail de séance prof).
- ⬜ `V2` **Salle intégrée Daily.co (iFrame)** : l'élève ne quitte pas la plateforme ; **vidéo + quiz de révision dans la même fenêtre**.
  - Fonctions UI : **partage d'écran** prof, **chat texte** latéral, **micros élèves coupés par défaut** (main levée pour la parole), **enregistrement → replay**.
  - **Présence auto** : connecté ≥ 45 min sur 60 = présent (→ 30 XP). Capacité 15 participants (1 prof + 14 élèves).
- ⬜ **Replay** : le prof uploade l'enregistrement pour les absents (entrée prévue dans le planning).

## 6. Partage de ressources (prof) — §4 ⭐ structurant

- ⬜ `V1` `/prof/ressources` → **« Ajouter une ressource »** :
  1. **Type** : vidéo / PDF / exercice / fiche.
  2. **Cible** : groupe entier / élève(s) spécifique(s) / niveau (CE1D·S1·S2·S3).
  3. **Message d'accompagnement** optionnel.
  4. **Publier maintenant** ou **planifier** (date/heure).
  - → apparaît dans le dashboard de l'élève ciblé + **notification**.
- 🟡 La **bibliothèque élève** consomme déjà ces types (vidéo/PDF/exercice/fiche) — manque la production côté prof + l'upload (Supabase Storage).

## 7. Suivi individuel asynchrone — §3.3 (pilier « accompagnement écrit »)

- ⬜ `V1.5` **Fiche élève individuelle** (clic depuis l'annuaire/suivi) : historique complet, progression par domaine, **erreurs récurrentes** détectées, graphes d'évolution.
- ⬜ `V1.5` **File de corrections** prof : exercices soumis à commenter par écrit.
- ⬜ `V1.5` **Messagerie asynchrone** élève ↔ prof (réponse 24–48 h), fil par élève/groupe.
- ⬜ `V1.5` **Notes privées** prof sur chaque profil élève (visibles du prof seul).
- ⬜ `V1.5` **Rapport individuel auto du lundi** → élève + parent lié.

## 8. Espace parent — §2.3

- ✅/🟡 Dashboard lecture seule (fait en UI). À câbler : **rapport mensuel PDF** téléchargeable, **alerte email inactivité 3 jours** (encart UI présent).
- ⬜ `V1` Liaison au profil élève via code (cf. §1).

## 9. Espace prof — gestion

- ⬜ `V1` **Gestion des groupes** : créer/éditer un groupe, **régénérer le code d'invitation**.
- ⬜ `V1` **Planificateur de séances** (fait en UI ; manque navigation entre mois — figé sur juin — et persistance).
- ⬜ **Générateur de rapport PDF** par élève / groupe (export 1 clic, pour le conseil de classe).
- ⬜ **File d'activité / notifications** prof (présences, exercices rendus, élèves inactifs).

## 10. Paiement — §7 (BLOQUANT MVP)

- ⬜ `V1` **Mollie** (Bancontact + carte obligatoires, standard belge) : tunnel de souscription depuis `/eleve/abonnement`, gestion d'état (actif/essai/annulé), webhooks.
- ⬜ `V1` **Déblocage Premium** : les contenus verrouillés (cadenas déjà en UI) s'ouvrent selon l'abonnement.
- ⬜ Page **« Mon abonnement »** : facture, résiliation. Offres : Découverte (gratuit), Premium 9,90 €, Famille 14,90 €, packs live, combinés (cf. `Tarifs 2026`).

## 11. Notifications & PWA — §1.2, §3.2, §7.2

- ⬜ `V1` **PWA installable** Android/iOS (manifest présent, à finaliser : icônes, service worker, offline).
- ⬜ `V1.5` **Notifications push PWA** + email : rappel séance **24 h avant** + **30 min avant**.
- ⬜ « Se souvenir de moi » (token 30 jours).

## 12. Conformité & pages légales — §8

- ⬜ `V1` **Politique de confidentialité** + **CGU**, accessibles **sans connexion** (routes publiques).
- ⬜ Tableau des données collectées respecté (pas de nom/email élève/photo/IP). Secrets (clé Anthropic, etc.) **uniquement côté serveur** (Edge Functions), jamais côté client.

## 13. Différenciation V2 — §7.3

- ⬜ `V2` **Coach IA textuel** (Claude) : explications contextualisées aux erreurs de l'élève — panneau « Aide » dans le quiz / le lecteur.
- ⬜ `V2` **Prédiction de score CE1D** par UAA → jauge « probabilité de réussite » visible prof + parent.
- ⬜ `V2` **App mobile native** React Native iOS/Android.

---

## Roadmap synthétique (cahier §7)

### V1 — MVP (6–8 semaines, avant 50 élèves payants)
Auth élève · Dashboard élève · Jeu CE1D + crédit XP · Espace prof basique (groupes, élèves, séances) · **Paiement Mollie** · Cours live (lien Meet) · Partage PDF/vidéo · Espace parent basique · RLS · PWA installable · Pages légales.

### V1.5 — 3 mois post-lancement
Classement hebdo · Badges complets · Rapport PDF parent mensuel · Notifications push · Assignation individuelle d'exercices · Messagerie asynchrone · Examens blancs · Échelle de niveaux.

### V2 — 6–12 mois
Daily.co iFrame intégré · Coach IA textuel · Génération d'exercices paramétrés · Prédiction score CE1D · App mobile native.

---

## Prochain pas
Les **interfaces V1 sont terminées** (mock). Deux pistes :
1. **Brancher Supabase (V1 réel)** — schéma Postgres + RLS + auth élève RGPD, puis câbler TanStack Query sur les écrans existants. C'est le socle bloquant (§1).
2. **Compléter quelques écrans V1.5/admin en mock** si on veut d'abord figer toute l'UI : examens blancs (§3), fiche élève individuelle (§7), messagerie (§7).

> Backlog issu de `MathLaClasse CahierCharges Developpeur (1).docx` (v1.0) + `MathLaClasse Tarifs 2026.docx`. À mettre à jour au fil du branchement Supabase.
