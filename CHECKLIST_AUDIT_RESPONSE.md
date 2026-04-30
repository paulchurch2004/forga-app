# 🔍 FORGA — Audit Checklist (réponses vérifiées)

**Date :** 2026-04-30
**Méthode :** lecture directe du code + grep de vérification. Items corrigés vs claims initiaux trop optimistes.

---

## SECTION 1 — INFRASTRUCTURE & BACKEND

### 1.1 Tables (migrations 001-009)

- 1.1.1 `users` profil (sex, age, height, weight, objective) — ✅ OUI — [001:11-45]
- 1.1.2 `users` subscription (is_premium, premium_until, stripe_*) — ✅ OUI — [001 + 002 + 003_stripe]
- 1.1.3 `users.training_level` — ✅ OUI — [009:6-8]
- 1.1.4 `users.training_frequency` — ✅ OUI — [009:9-10]
- 1.1.5 `users.equipment_access` — ✅ OUI — [009:11-12]
- 1.1.6 `users.current_program_id` — ✅ OUI — [009:15]
- 1.1.7 Table `programs` — ❌ NON — fichier statique [src/data/programs.ts], pas de table DB
- 1.1.8 Table `program_sessions` — ❌ NON
- 1.1.9 Table `session_exercises` — ❌ NON
- 1.1.10 Table `exercises` (catalogue) — ❌ NON — fichier statique [src/data/exercises.ts]
- 1.1.11 Table `workouts` — ✅ OUI — [005:5-16]
- 1.1.12 Table `personal_records` — ❌ NON — PRs calculés à la volée depuis workouts
- 1.1.13 Table `user_program_history` — ✅ OUI — [009:23-32]
- 1.1.14 Table `usage_log` — ✅ OUI — [007:20-29]
- 1.1.15 Table `user_tokens` — ✅ OUI — [007:45-53]
- 1.1.16 Table `admob_transactions` — ❌ NON
- 1.1.17 Table `user_restrictions` — ⚠️ PARTIEL — champ `restrictions text[]` sur users [001:24], mais c'est pour les restrictions alimentaires, pas blessures
- 1.1.18 RLS sur tables user — ✅ OUI

### 1.2 Edge Functions

- 1.2.1 `coach-chat` Groq — ✅ OUI
- 1.2.2 `coach-chat` JWT — ✅ OUI — [coach-chat/index.ts:325-342]
- 1.2.3 `coach-chat` quota 5/j — ✅ OUI — [coach-chat:344-371]
- 1.2.4 `analyze-food` GPT-4o — ✅ OUI
- 1.2.5 `analyze-food` quota 3/j — ✅ OUI — [analyze-food:63-82]
- 1.2.6 `create-checkout` Stripe — ✅ OUI
- 1.2.7 `verify-session` Stripe — ✅ OUI
- 1.2.8 `admob-ssv` — ❌ NON
- 1.2.9 RPC `check_and_increment_quota` — ✅ OUI — [007]
- 1.2.10 RPC `award_video_tokens` — ✅ OUI — [007]
- 1.2.11 RPC `get_trial_stats` — ✅ OUI — [007]
- 1.2.12 RPC `expire_trial` — ✅ OUI — [007]
- 1.2.13 RPC `extend_trial` — ✅ OUI — [007]
- 1.2.14 Cron reset quotas — ❌ NON — reset implicite via `date = CURRENT_DATE` dans la RPC
- 1.2.15 Cron expiration trial — ❌ NON

### 1.3 Auth

- 1.3.1 Sign up — ✅ OUI
- 1.3.2 Sign in — ✅ OUI
- 1.3.3 Reset password — ✅ OUI
- 1.3.4 Face ID — ✅ OUI — [BiometricLockGate]
- 1.3.5 Session refresh — ✅ OUI
- 1.3.6 Suppression compte — ✅ OUI — cascade DELETE sur users

---

## SECTION 2 — ONBOARDING & PROFIL

### 2.1 Onboarding

- 2.1.1 Prénom — ✅ OUI
- 2.1.2 Âge — ✅ OUI
- 2.1.3 Sexe — ✅ OUI
- 2.1.4 Taille — ✅ OUI
- 2.1.5 Poids actuel — ✅ OUI
- 2.1.6 Poids cible — ✅ OUI
- 2.1.7 Objectif — ✅ OUI
- 2.1.8 Niveau d'activité — ✅ OUI
- 2.1.9 Restrictions alimentaires — ✅ OUI
- 2.1.10 Budget — ✅ OUI
- 2.1.11 Repas/jour — ✅ OUI
- 2.1.12 Niveau de musculation — ❌ NON — pas dans l'onboarding (champ DB ajouté mais pas de question)
- 2.1.13 Fréquence d'entraînement (3-6) — ❌ NON — pas dans l'onboarding
- 2.1.14 Accès matériel — ❌ NON — pas dans l'onboarding
- 2.1.15 Test de charge initial — ⚠️ PARTIEL — [app/calibration-test.tsx] existe mais accessible UNIQUEMENT depuis Settings, pas dans l'onboarding
- 2.1.16 Validations cohérence — ⚠️ PARTIEL — la fonction `assignProgram()` valide (ex: beginner cap à 4j), mais l'onboarding ne pose pas la question
- 2.1.17 TDEE + macros auto — ✅ OUI

### 2.2 Profil

- 2.2.1 Vue profil — ✅ OUI
- 2.2.2 Édition profil — ✅ OUI — via [app/settings.tsx]
- 2.2.3 Avatar — ❌ NON — pas d'upload image profil
- 2.2.4 Stats globales (séances, streak, PRs) — ✅ OUI
- 2.2.5 Achievements/badges — ✅ OUI
- 2.2.6 Photos progression — ✅ OUI — [progress-photos.tsx]

---

## SECTION 3 — ONGLET TRAINING

### 3.1 Catalogue exercices

- 3.1.1 Min 100 exercices — ⚠️ PARTIEL — **86 exercices** dans [exercises.ts]
- 3.1.2 Nom FR + EN — ✅ OUI — i18n keys
- 3.1.3 Groupes musculaires primaires — ✅ OUI
- 3.1.4 Groupes secondaires — ❌ NON
- 3.1.5 Matériel requis — ❌ NON — pas de champ `equipment` sur Exercise
- 3.1.6 Difficulté 1-10 — ❌ NON
- 3.1.7 Description exécution — ⚠️ PARTIEL — [exerciseTips.ts] couvre seulement les exercices principaux
- 3.1.8 Erreurs communes — ⚠️ PARTIEL — idem
- 3.1.9 Alternatives par matériel — ❌ NON — pas de structure de variants
- 3.1.10 GIF / vidéo — ✅ OUI — ~70/86 exercices ont un `gifUrl`
- 3.1.11 Variantes par genre — ❌ NON — la variation H/F est au niveau **programme**, pas **exercice**

### 3.2 Programmes

- 3.2.1 16+ programmes — ✅ OUI — **23 entrées** (16 logiques + variantes _M/_F éclatées)
- 3.2.2 Bulk tous niveaux/fréq — ✅ OUI
- 3.2.3 Cut — ✅ OUI
- 3.2.4 Recomp — ✅ OUI
- 3.2.5 Maintain — ✅ OUI
- 3.2.6 Programme femme glute — ✅ OUI — `BULK_INT_4D_UL_GLUTE`
- 3.2.7 Variantes H/F sur Lower — ✅ OUI — programmes `_M`/`_F` distincts

### 3.3 Mapping

- 3.3.1 `assignProgram()` — ✅ OUI — [src/services/programAssignment.ts]
- 3.3.2 Table correspondance — ✅ OUI — `lookupProgram()`
- 3.3.3 Cas particulier femme intermédiaire bulk 4j → glute focus — ✅ OUI
- 3.3.4 Fonction fallback — ✅ OUI
- 3.3.5 Variants genre — ✅ OUI — au niveau programme
- 3.3.6 Variants matériel — ❌ NON — type existe mais pas appliqué aux programmes
- 3.3.7 Module cycle menstruel — ❌ NON — colonnes DB existent (`cycle_tracking_enabled`, `last_period_date`) mais pas de logique appliquée

### 3.4 Vue training tab

- 3.4.1 Séance du jour — ✅ OUI
- 3.4.2 Nom du programme — ✅ OUI
- 3.4.3 Position semaine X/Y — ⚠️ PARTIEL — currentWeek calculé, X/Y séances pas explicite
- 3.4.4 Liste exos preview — ✅ OUI
- 3.4.5 Durée estimée — ❌ NON — pas affichée
- 3.4.6 CTA "Commencer" — ✅ OUI
- 3.4.7 Vue planning semaine — ✅ OUI — WeekDayCalendar
- 3.4.8 PRs récents — ✅ OUI
- 3.4.9 Streak visible — ✅ OUI

### 3.5 Mode séance active

- 3.5.1 Vue exo en cours — ✅ OUI
- 3.5.2 Nom + métadonnées — ✅ OUI
- 3.5.3 Bouton "Voir technique" — ✅ OUI — ExerciseTutorialModal
- 3.5.4 Inputs charge/reps — ✅ OUI — SetCardV2
- 3.5.5 Auto-fill charge dernière séance — ✅ OUI
- 3.5.6 Suggestion +2.5kg — ✅ OUI — visible dans `weightTip`
- 3.5.7 Affichage RIR — ❌ NON — aucun "RIR" dans active-workout.tsx
- 3.5.8 Affichage % 1RM — ❌ NON — aucun "%1RM" dans active-workout.tsx
- 3.5.9 Bouton "Valider" — ✅ OUI
- 3.5.10 Logging <5s par set — ✅ OUI (1-3 taps)
- 3.5.11 Historique sets séance courante — ✅ OUI
- 3.5.12 Comparaison dernière séance — ⚠️ PARTIEL — un tip "+2.5kg vs last" oui, mais pas de side-by-side complet
- 3.5.13 Mode portrait verrouillé — ✅ OUI
- 3.5.14 Pas de modal pendant séance — ⚠️ PARTIEL — sauf le LiveCoachIntervention qui s'affiche

### 3.6 Timer de repos

- 3.6.1 Auto-déclenché — ✅ OUI
- 3.6.2 Cercle visuel — ✅ OUI — RestCircleTimer
- 3.6.3 Notif fin de repos — ⚠️ PARTIEL — `triggerHaptic('medium')` à la fin, pas de notif système
- 3.6.4 Boutons +15s/-15s/Skip — ⚠️ PARTIEL — Skip oui, +/-15s non vérifié
- 3.6.5 Son et vibration — ⚠️ PARTIEL — vibration haptic oui, pas de son
- 3.6.6 Affichage prochaine série — ⚠️ PARTIEL — non explicite

### 3.7 Navigation entre exercices

- 3.7.1 Vue overview séance — ✅ OUI
- 3.7.2 Indication terminé/en cours/à venir — ✅ OUI — SetCardV2 states
- 3.7.3 Navigation entre exos — ✅ OUI
- 3.7.4 Sauter cet exercice — ⚠️ PARTIEL — possible de skip mais UI à confirmer
- 3.7.5 **Swap exo en LIVE** — ❌ NON — le mot "swap" dans active-workout réfère au type LiveCoachIntervention, pas à un vrai swap d'exo. Le swap existe en planning ([programStore.replaceExerciseInDay]) mais pas pendant la séance
- 3.7.6 Modifier set validé — ✅ OUI — toggleSet
- 3.7.7 Annuler la séance — ✅ OUI

### 3.8 Test de charge initial (Sprint 1 que je viens de faire)

- 3.8.1 3 questions — ✅ OUI — [calibration-test.tsx]
- 3.8.2 Mapping vers niveau — ✅ OUI — [strengthTest.ts]
- 3.8.3 Charges initiales — ✅ OUI
- 3.8.4 1ère séance "calibration" — ❌ NON — Sprint 2 pas fait
- 3.8.5 Feedback Facile/Bien/Dur — ❌ NON — Sprint 2 pas fait
- 3.8.6 Ajustement auto charge set suivant — ❌ NON — Sprint 2 pas fait
- 3.8.7 Calcul 1RM Epley — ✅ OUI — [oneRepMax.ts] (mais pas wiré dans active-workout)
- 3.8.8 Stockage 1RM par exercice — ❌ NON — calculé à la volée mais pas persisté

### 3.9 Surcharge progressive

- 3.9.1 Calcul auto charge prochaine — ⚠️ PARTIEL — logique simple +2.5kg si toutes reps OK [active-workout.tsx:262-264]
- 3.9.2 +2.5kg si toutes reps cibles — ✅ OUI
- 3.9.3 Double progression (8→12 puis +2.5kg) — ❌ NON — pas implémenté
- 3.9.4 Détection plateau — ❌ NON — fonction existe dans [oneRepMax.ts] mais non appelée
- 3.9.5 Suggestion deload auto — ❌ NON — fonction existe mais non appelée
- 3.9.6 Tableau %1RM → reps — ❌ NON

### 3.10 Fin de séance

- 3.10.1 Récap stats — ✅ OUI — SessionForgee
- 3.10.2 PRs en avant — ✅ OUI — PrNearAlert pendant séance
- 3.10.3 Partager PR — ❌ NON — aucun "share" dans le code
- 3.10.4 Note séance 1-5 — ❌ NON — pas implémenté
- 3.10.5 RPE — ❌ NON — pas implémenté
- 3.10.6 Note libre — ❌ NON — pas implémenté
- 3.10.7 Message Coach IA fin séance — ❌ NON — pas implémenté
- 3.10.8 Streak mis à jour — ✅ OUI
- 3.10.9 Anticipation prochaine séance — ❌ NON

### 3.11 Vues progression

- 3.11.1 Graphique 1RM — ⚠️ PARTIEL — [app/progression.tsx] et [exercise-progress.tsx] existent, à valider visuellement
- 3.11.2 Volume hebdo par muscle — ⚠️ PARTIEL — idem
- 3.11.3 Calendar heatmap — ⚠️ PARTIEL — visible dans profil
- 3.11.4 Comparaison mois — ❌ NON
- 3.11.5 Standards de force — ❌ NON
- 3.11.6 Niveau actuel — ⚠️ PARTIEL — `StrengthLevel` calculé via test, pas affiché en profil

### 3.12 Mode séance imprévue

- 3.12.1 Bouton "Séance libre" — ✅ OUI — [log-workout.tsx]
- 3.12.2 Choix focus — ⚠️ PARTIEL
- 3.12.3 Sélection exos à la volée — ✅ OUI
- 3.12.4 Gestion séance ratée — ⚠️ PARTIEL — markDaySkipped existe
- 3.12.5 Rattraper — ⚠️ PARTIEL
- 3.12.6 Skipper — ✅ OUI

### 3.13 Restrictions

- 3.13.1 Table user_restrictions — ❌ NON
- 3.13.2 Auto-déclaration blessures — ❌ NON — restrictions ALIMENTAIRES uniquement
- 3.13.3 Filtre exos selon restrictions — ❌ NON
- 3.13.4 Mode voyage/hôtel — ❌ NON
- 3.13.5 Mode 30 min — ❌ NON

### 3.14 Deload intelligent

- 3.14.1 Détection plateau — ❌ NON — fonction existe pas wirée
- 3.14.2 Suggestion deload — ❌ NON
- 3.14.3 Mode deload activable — ❌ NON
- 3.14.4 Notif récup — ❌ NON
- 3.14.5 Reprise auto — ❌ NON

---

## SECTION 4 — MEALS

### 4.1 Logging

- 4.1.1 Saisie manuelle — ✅ OUI
- 4.1.2 Scan code-barre — ✅ OUI — OpenFoodFacts
- 4.1.3 Base alimentaire — ✅ OUI — OpenFoodFacts + 800+ recettes statiques
- 4.1.4 Validation macros — ✅ OUI
- 4.1.5 Favoris — ✅ OUI
- 4.1.6 Historique — ✅ OUI
- 4.1.7 4 slots — ✅ OUI — en réalité 6 slots (breakfast/morning_snack/lunch/afternoon_snack/dinner/bedtime)

### 4.2 Tracking nutrition

- 4.2.1 Calories restantes — ✅ OUI
- 4.2.2 Macros restantes — ✅ OUI
- 4.2.3 Bilan jour — ✅ OUI
- 4.2.4 Bilan semaine — ✅ OUI — weekly-review.tsx
- 4.2.5 Suggestion repas — ✅ OUI
- 4.2.6 510+ recettes — ✅ OUI — 800+ en data
- 4.2.7 Recettes étape par étape — ⚠️ PARTIEL — listées mais pas toutes avec étapes

### 4.3 Hydratation

- 4.3.1 Tracking eau — ✅ OUI
- 4.3.2 Objectif personnalisé — ✅ OUI
- 4.3.3 Notifs eau — ⚠️ PARTIEL — pas de rappel eau spécifique vérifié

---

## SECTION 5 — COACH IA

### 5.1 Fonctionnalités

- 5.1.1 Chat fonctionnel — ✅ OUI
- 5.1.2 System prompt FORGA — ✅ OUI
- 5.1.3 Memory 12 tags — ✅ OUI
- 5.1.4 12 actions structurées — ✅ OUI
- 5.1.5 Welcome message — ✅ OUI
- 5.1.6 Coach lit workouts — ✅ OUI
- 5.1.7 Coach lit PRs — ✅ OUI
- 5.1.8 Coach lit programme — ✅ OUI
- 5.1.9 Coach lit meals — ✅ OUI
- 5.1.10 Disclaimer santé — ✅ OUI — system prompt
- 5.1.11 Filtre anti-prompt-injection — ❌ NON — aucune validation côté client
- 5.1.12 Refus conseils médicaux — ✅ OUI — dans system prompt
- 5.1.13 Refus stéroïdes — ⚠️ PARTIEL — implicite, pas explicite

### 5.2 Quotas

- 5.2.1 Quota 5 msg/j — ✅ OUI
- 5.2.2 Compteur visible — ❌ NON — pas affiché dans le coach tab
- 5.2.3 Modal "regarde une vidéo" — ❌ NON — actuellement quota_notice avec CTA "Passer en PRO", pas option vidéo
- 5.2.4 Bonus tokens incrémenté — ⚠️ PARTIEL — RPC existe mais aucun consommateur (pas de video player)

---

## SECTION 6 — MONÉTISATION

### 6.1 Trial 7 jours

- 6.1.1 Auto-trial signup — ✅ OUI — trigger SQL
- 6.1.2 is_premium pendant trial — ✅ OUI
- 6.1.3 Trigger handle_new_user_setup — ✅ OUI
- 6.1.4 Notif J-2 — ✅ OUI — [trialNotifications.ts]
- 6.1.5 Notif J-1 — ✅ OUI
- 6.1.6 Notif J0 — ✅ OUI
- 6.1.7 Modal trial expiré — ✅ OUI — [TrialExpirationModal]
- 6.1.8 Option "7 jours avec CB" — ⚠️ PARTIEL — RPC extend_trial existe, mais flow CB pas câblé (TODO commenté)
- 6.1.9 Modal downgrade 2 étapes — ✅ OUI

### 6.2 Paywall

- 6.2.1 Paywall V3 — ✅ OUI
- 6.2.2 14,99€/mois — ✅ OUI
- 6.2.3 119,88€/an — ✅ OUI
- 6.2.4 Trigger après cap — ⚠️ PARTIEL — coach quota notice mène au paywall, mais pas de trigger implicite
- 6.2.5 Trigger après trial — ✅ OUI
- 6.2.6 RevenueCat — ✅ OUI
- 6.2.7 Stripe — ✅ OUI

### 6.3 Publicités

- 6.3.1 AdMob installé — ❌ NON — package absent
- 6.3.2 Funding Choices CMP — ❌ NON
- 6.3.3 iOS ATT — ❌ NON
- 6.3.4 Banner Home — ❌ NON
- 6.3.5 Rewarded video — ❌ NON
- 6.3.6 Trigger rewarded sur quota Coach — ❌ NON — actuellement → paywall direct
- 6.3.7 Trigger rewarded sur quota Scan — ❌ NON
- 6.3.8 SSV — ❌ NON
- 6.3.9 Banner masqué pour PRO — ❌ NON (pas d'AdMob)
- 6.3.10 Tracking events ad — ❌ NON

---

## SECTION 7 — ENGAGEMENT

### 7.1 Streak / Gamification

- 7.1.1 Streak quotidien — ✅ OUI
- 7.1.2 Streak freeze hebdo — ✅ OUI
- 7.1.3 Best streak — ✅ OUI
- 7.1.4 FORGA Score — ✅ OUI
- 7.1.5 Badges débloquables — ✅ OUI
- 7.1.6 Niveaux Score — ✅ OUI

### 7.2 Notifications

- 7.2.1 Permissions push — ✅ OUI
- 7.2.2 Notif rappel séance — ✅ OUI
- 7.2.3 Notif streak danger — ✅ OUI
- 7.2.4 Notif rappel repas — ✅ OUI
- 7.2.5 Notif PR battu — ❌ NON
- 7.2.6 Notif fin programme — ❌ NON

### 7.3 Parrainage

- 7.3.1 Code parrainage — ✅ OUI
- 7.3.2 Récompenses parrain — ✅ OUI
- 7.3.3 Récompenses filleul — ✅ OUI
- 7.3.4 Tracking referral_log — ✅ OUI
- 7.3.5 Partage code — ✅ OUI

---

## SECTION 8 — ANALYTICS & TECH

### 8.1 Analytics

- 8.1.1 PostHog clé — ✅ OUI — set via EAS env var
- 8.1.2 PostHog actif — ⚠️ PARTIEL — code prêt, à vérifier au prochain build TestFlight
- 8.1.3 Events sign_up/in — ✅ OUI
- 8.1.4 Events onboarding — ✅ OUI
- 8.1.5 Events workout — ❌ NON — events workout_started/completed pas dans la liste
- 8.1.6 Events meal_logged — ✅ OUI — meal_validated
- 8.1.7 Events paywall — ✅ OUI
- 8.1.8 Events ad — ❌ NON
- 8.1.9 Funnel trackable — ⚠️ PARTIEL

### 8.2 Performance

- 8.2.1 Cold start <3s — ⚠️ PARTIEL — non mesuré
- 8.2.2 Bundle size — ⚠️ PARTIEL — non mesuré
- 8.2.3 Images WebP — ❌ NON — JPG/PNG via expo-image
- 8.2.4 Cache offline — ✅ OUI
- 8.2.5 Sync à reconnexion — ✅ OUI
- 8.2.6 Sentry installé — ❌ NON — package non installé, juste un stub
- 8.2.7 Pas de crash récurrent — ⚠️ PARTIEL — sans monitoring impossible à dire

### 8.3 Légal

- 8.3.1 Privacy policy — ✅ OUI
- 8.3.2 CGU — ✅ OUI
- 8.3.3 Mentions légales — ⚠️ PARTIEL — Contact existe, mention SAS pas explicite
- 8.3.4 Bouton suppression — ✅ OUI
- 8.3.5 Disclaimer santé — ✅ OUI
- 8.3.6 Limite 16 ans — ⚠️ PARTIEL — validation 14-65 actuellement, à serrer à 16
- 8.3.7 Export données — ❌ NON

---

## SECTION 9 — DESIGN

### 9.1 Cohérence

- 9.1.1 Theme dark — ✅ OUI
- 9.1.2 Orange #FF6B2C — ✅ OUI
- 9.1.3 Polices DM Sans / JBM / Outfit — ✅ OUI
- 9.1.4 Composants unifiés — ✅ OUI
- 9.1.5 Transitions — ✅ OUI
- 9.1.6 Haptic — ✅ OUI

### 9.2 Accessibilité

- 9.2.1 Texte 16pt min — ⚠️ PARTIEL
- 9.2.2 Boutons 48dp min — ⚠️ PARTIEL
- 9.2.3 Contrastes — ✅ OUI
- 9.2.4 Labels ARIA — ❌ NON
- 9.2.5 VoiceOver/TalkBack — ⚠️ PARTIEL — natif sans optimisation

---

## SECTION 10 — APP STORE

Hors code, à faire dans App Store Connect :
- Icône — ✅ OUI (présente dans assets)
- Le reste (compte, certs, screenshots, description, keywords, build, beta) — ❌ NON

---

# 📊 SYNTHÈSES

## A — Ce qui est PRÊT à lancer (✅ OUI)

**Backend solide :**
- Auth complet (signup, signin, Face ID, suppression compte)
- 9 migrations Supabase appliquées avec RLS
- 4 edge functions (coach-chat, analyze-food, create-checkout, verify-session)
- 6 RPCs (quotas, tokens, trial)
- Trigger auto-trial 7j

**Onboarding complet** (sauf 3 nouvelles questions training) — TDEE, macros, 7 steps

**Catalogue training :**
- 86 exercices avec GIFs
- 23 programmes (16 logiques + variantes H/F)
- Logique d'assignment programme avec validations
- Test de calibration accessible depuis Settings
- 1RM Epley codé dans engine

**Mode séance active (logging fluide) :**
- 1-3 taps par set, auto-fill, +2.5kg suggéré, timer repos visuel, GIFs
- SessionForgee fin de séance avec stats

**Meals complet :**
- 800+ recettes, scan barcode, photo IA, hydratation, weekly review

**Coach IA :**
- Chat Groq, memory 12 tags, 12 actions, quota 5/j, quota notice in-chat

**Monétisation backbone :**
- Paywall V3, RevenueCat + Stripe, Trial 7j auto, modal expiration, downgrade 2 étapes, parrainage

**Engagement :**
- Streak + freeze, FORGA Score, badges, notifications J-2/J-1/J0

**Analytics & légal :**
- PostHog wired (clé EAS), Privacy/Terms/Contact/FAQ écrans, downgrade-confirmation

---

## B — Ce qui DOIT être fait avant lancement (critique)

### 🔴 Bloquants Apple / RGPD
1. **Limite âge 16** dans validation onboarding (actuellement 14)
2. **Mention SAS / éditeur** dans Contact
3. **Process export données utilisateur** (RGPD obligatoire)
4. **Sentry réellement installé** (le code est un stub)

### 🔴 Cohérence promesse → réalité
5. **3 questions onboarding manquantes** : niveau muscu, fréquence, matériel — sinon `assignProgram()` utilise les valeurs dérivées d'`activity_level` (moins précis)
6. **Compteur quota visible dans coach tab** — sinon le user ne comprend pas pourquoi son 6e message est bloqué
7. **Disclaimer médical / âge** plus visible (actuellement seulement dans system prompt)

### 🔴 UX critique séance
8. **RIR cible affiché** sur chaque set
9. **Note de séance + RPE + note libre** en fin de séance
10. **Message Coach IA personnalisé en fin de séance** (utilise les data réelles)
11. **Son fin de repos** (pas juste haptic — l'user a souvent les écouteurs)

### 🟡 Important non-bloquant strict mais conseillé avant lancement
12. **Détection plateau + suggestion deload auto** (oneRepMax.ts a la fonction, à wirer)
13. **Swap exo en LIVE** pendant la séance
14. **PR celebration améliorée** (animation, partage)
15. **Catalogue 100+ exos** (actuellement 86)

---

## C — Ce qui peut attendre post-lancement

- AdMob complet (Section 6.3) — décision stratégique : lancer sans pub d'abord, AdMob au sprint 2
- Tables DB pour programs/exercises/sessions (statique = OK pour 50k users)
- Personal records table dédiée (calculée à la volée OK)
- Module cycle menstruel UI complète
- Mode voyage / 30 min / restrictions blessures
- Avatar upload cloud
- WebP optimisation images
- Crons Supabase (reset implicite via DATE actuelle suffit)
- Comparaison standards de force vs population
- Feedback per-set en mode calibration (Sprint 2 du test de charge)
- Recettes vidéo étape par étape
- Graphique 1RM par exo (existe mais à valider)

---

## Score global

- ✅ OUI : ~165 items (~58%)
- ⚠️ PARTIEL : ~45 items (~16%)
- ❌ NON : ~70 items (~25%)

**Verdict :** ~74% prêt au sens "implémenté ou partiellement". L'app peut être lancée en TestFlight pour beta interne. Pour App Store public, faire d'abord la liste B (15 items, ~3-4 jours de dev).
