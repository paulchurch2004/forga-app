# FORGA — Audit de finition v1

**Date :** 2026-04-30
**Branche :** redesign
**Build actuel :** iOS #44

Audit factuel basé sur lecture du code après les derniers commits (quotas serveur, trial 7j auto, modal d'expiration, quota notice dans le chat, paywall vidéo nettoyé).

---

## Méthode

Pour chaque écran : lecture des fichiers, vérification que les boutons sont câblés, que les données affichées sont réelles, que les promesses du paywall correspondent au code. Les chemins et lignes sont cités pour chaque point.

---

## 1. Onboarding (`app/(onboarding)/`)

✅ **Fonctionne**
- 7 steps complets (archetype → identity → body → objective → target → activity → preferences → summary)
- TDEE + macros calculés en temps réel via `calculateTDEE()` + `calculateMacros()` ([step7-summary.tsx](app/(onboarding)/step7-summary.tsx))
- Profil upserté en Supabase à la fin
- Trial 7j auto via `premiumUntil = NOW + 7d` ([step7-summary.tsx:182-183](app/(onboarding)/step7-summary.tsx#L182-L183)) — **plus le doublon avec le trigger SQL** désormais
- Pre-fill prénom depuis register screen
- Modal "Activer les rappels ?" en V2 glass après onboarding
- Referral code generation + application

⚠️ **Améliorable**
- Le placeholder "Paul" pour le prénom (step0) peut prêter à confusion
- Pas de toast/feedback visible après le upsert final, juste redirection silencieuse

❌ **Manquant**
- Rien de bloquant

---

## 2. Tab Home (`app/(tabs)/home.tsx`)

✅ **Fonctionne**
- Carousel 3D avec vraies données (nutrition, training, myspace, boutique)
- FORGA Score, streak, weight prompt → tous branchés sur stores réels
- Coach focus message dynamique selon repas restants / protéines / calories
- Premium upgrade card conditionnelle si free user

⚠️ **Améliorable**
- Card "Boutique" hardcodée `comingSoon: true` — assume placeholder OK pour v1
- Pas de pull-to-refresh manuel

❌ **Manquant**
- Aucun bug détecté

---

## 3. Tab Training (`app/(tabs)/training.tsx`)

✅ **Fonctionne**
- 7 programmes définis ([src/data/programs.ts:458](src/data/programs.ts#L458)) : `full_body_h/f`, `upper_lower_h/f`, `ppl_h/f`, `stronglifts_5x5`
- Calendrier hebdo avec statuts (completed / today / skipped / rest)
- Workout flow complet : démarrer → logger sets/reps → valider → score
- Sync workouts vers Supabase (`syncWorkout()`)
- **Live coach pendant la séance EST implémenté** ([app/active-workout.tsx:32](app/active-workout.tsx#L32)) avec 4 types : form, rest, push, swap

⚠️ **Améliorable**
- "40+ plans" annoncé sur paywall = **FAUX** : seulement 7 programmes (15 variantes sex-aware)
- PRs calculés mais pas surfacés en Achievements

❌ **À corriger**
- 🔴 **Paywall ment** : changer "40+ plans" en "7 programmes" ou en créer plus

---

## 4. Tab Meals (`app/(tabs)/meals.tsx`)

✅ **Fonctionne**
- **800+ recettes réelles** ([src/data/meals/index.ts](src/data/meals/index.ts)) — paywall annonce "510" ce qui est même sous-estimé ✅
- Slot filtering (breakfast / lunch / dinner / snacks)
- Filtres budget + restrictions
- Search Fuse.js
- Favoris persistés
- Barcode scan via OpenFoodFacts API ([scan/barcode.tsx:37-44](app/scan/barcode.tsx#L37-L44))
- **Photo IA câblée** : `analyze-food` edge function existe + JWT + quota 3/j (post-migration 007)

⚠️ **Améliorable**
- `weeklyPlanner.ts` existe mais pas de bouton "Générer mon plan semaine" visible dans Meals
- Photo IA : à tester end-to-end après deploy edge functions

❌ **Manquant**
- 🟡 UI "Generate weekly plan" jamais ajoutée alors que la logique existe

---

## 5. Tab Coach (`app/(tabs)/coach.tsx`)

✅ **Fonctionne**
- 12 actions IA déclarées + parsées (log_meal, log_workout, log_water, swap_exercise, etc.)
- Memory system : 12 catégories, persistance en `chatStore`, restitution dans le prompt (15 dernières)
- Welcome card affichée à la première utilisation, dismissable
- **Quota system enforced server-side** (5 msg/j free) via RPC `check_and_increment_quota`
- **Quota notice dans le chat** style carte système avec bouton "Passer en PRO" (ajouté ce jour)
- Voice input (mic) + speak output

⚠️ **Améliorable**
- Mode toggle Presence/Chat : UI existe, comportement à valider visuellement
- Pas de filtre par pertinence sur les memories (juste les 15 plus récentes)

❌ **Manquant**
- Rien de bloquant — le système est cohérent

---

## 6. Tab Profile (`app/(tabs)/profile.tsx`)

✅ **Fonctionne**
- Hero card (nom, archetype, streak, score)
- Achievements / badges
- Top 3 PRs
- 30-day metal history (calendar heatmap)
- Edit profile complet (age, weight, objective, etc.) avec sauvegarde en DB
- Logout / delete account avec nettoyage du state (chatStore.resetOnLogout, etc.)
- Premium upgrade card conditionnelle
- Biometric lock toggle

⚠️ **Améliorable**
- `UserStateDebugCard` visible si `__DEV__` ou flag — OK
- Pas de toast après save, juste setProfile silencieux

❌ **Manquant**
- Rien

---

## 7. Settings (`app/settings.tsx`)

✅ **Fonctionne**
- Sections expansibles (body / goals / preferences)
- Recalcul TDEE/macros à la sauvegarde
- Validation runtime (age 16-65, height 120-220, weight 30-300)
- Toggle langue + thème
- Long-press version → toggles dev (Premium ON/OFF, Core State debug)

⚠️ **Améliorable**
- Restore purchases : bouton présent, pas testé sur web
- Aucune confirmation visuelle après save

❌ **Manquant**
- 🟡 Bouton "Contact / Support" inexistant
- 🟡 Lien vers Terms / Privacy inexistant dans l'UI

---

## 8. Paywall (`app/paywall.tsx`)

✅ **Fonctionne**
- Design V3 Transformation (eyebrow + display headline)
- Vidéo en bordure dégradé orange (nettoyée ce jour : plus de LIVE/brackets/timecode)
- Toggle Sans Pro / Avec FORGA Pro
- 5 features avec checks verts en mode pro
- 2 cartes prix (Annuel 9,99€/mois -33% / Mensuel 14,99€/mois)
- CTA gradient "Démarrer mes 7 jours gratuits"

⚠️ **Améliorable**
- Trigger query param `?trigger=quota_coach_message` accepté mais ignoré — pourrait personnaliser le headline

❌ **À corriger**
- 🔴 **"40+ plans d'entraînement" → mensonge marketing** (seulement 7) — soit en créer plus, soit changer le wording
- 🔴 Quotas annoncés "5 messages / jour" et "5 scans / jour" — **désormais enforced à 5 et 3** depuis migration 007. Réalité = 5 msg + **3 scans** — corriger soit le paywall soit le edge function pour aligner

---

## 9. Backend (Supabase)

✅ **Fonctionne**
- 7 migrations appliquées (001 → 007)
- Edge functions : `coach-chat`, `analyze-food`, `create-checkout`, `verify-session`
- RPCs : `check_and_increment_quota`, `award_video_tokens`, `get_trial_stats`, `expire_trial`, `extend_trial`
- Trigger auto : `on_auth_user_created_setup` → init `user_tokens` + démarre trial 7j
- RLS sur toutes les tables user-data

⚠️ **Améliorable**
- `award_video_tokens` callable depuis le client → un user malicieux peut s'auto-attribuer des bonus en boucle. Devrait être derrière une edge function avec **AdMob Server-Side Verification** (à faire AVANT d'activer la pub)

❌ **À auditer**
- 🔴 RLS sur `users.is_premium`, `users.forga_score`, `users.stripe_*` — il faut vérifier que [004_security_hardening.sql](supabase/migrations/004_security_hardening.sql) bloque vraiment les writes client sur ces colonnes. Audit Supabase dashboard requis.

---

## 10. Pages légales / contact

❌ **Manquant**
- 🔴 Pas d'écran Terms (obligatoire pour App Store)
- 🔴 Pas d'écran Privacy Policy (obligatoire pour App Store + RGPD)
- 🟡 Pas d'écran FAQ
- 🟡 Pas d'écran Contact / Support

C'est **bloquant pour soumission App Store** : Apple rejette les apps sans privacy policy URL au minimum.

---

## 11. Notifications

✅ **Fonctionne**
- Notifications repas (`scheduleMealReminders`)
- Notifications streak (`streak_alerts`)
- Notifications check-in hebdo
- Notifications réactivation J+2 / J+3 / J+5
- Notifications trial J-2 / J-1 / J0 (ajoutées ce jour)

⚠️ **Améliorable**
- Pas de notification "PR battu"
- Pas de notification "Coach a un message" (push), juste in-app

❌ **Manquant**
- Rien de bloquant

---

## 12. Analytics

❌ **Manquant**
- 🟡 PostHog : stub seulement, `EXPO_PUBLIC_POSTHOG_KEY` jamais configurée. Tous les `events.xxx()` ne font rien en prod.
- 🟡 Sentry : `sentry.ts` existe mais package non installé, fallback silencieux

Sans analytics actifs, impossible de mesurer la conversion paywall → premium, le retention, le funnel onboarding. **À activer avant soumission** (au moins PostHog free tier).

---

## 13. Performance

✅ **Fonctionne**
- expo-image avec cache
- FlatList virtualisée partout
- useMemo extensif (macros, scores)
- Reanimated 3 pour animations 60fps

⚠️ **Améliorable**
- Coach chat charge tout l'historique en RAM (slice -10 pour le contexte LLM, mais affichage = full)
- VideoMontage du paywall 1080p × 10 — peut être lourd en mémoire

---

## 14. Sécurité

✅ **Fonctionne**
- API keys Anon-only côté client (`EXPO_PUBLIC_*` pattern)
- Service role key uniquement dans les edge functions
- JWT requis sur `coach-chat` et `analyze-food` après migration 007
- RLS activée sur toutes les tables

❌ **À auditer**
- 🔴 `award_video_tokens` callable directement depuis le client — pas grave tant qu'AdMob n'est pas intégré, mais à fixer avant la pub
- 🔴 Vérifier que `users.is_premium` est bien protégé (un user pourrait se passer en premium via le client si la policy `004_security_hardening` est mal écrite)

---

## Synthèse priorisée

### 🔴 P0 — Blockers pour release App Store

1. **Privacy Policy + Terms screens** — Apple rejette sans. Créer `app/privacy.tsx` + `app/terms.tsx` avec contenu réel + lien dans Settings.
2. **Audit RLS Supabase** — vérifier que `is_premium`, `forga_score`, `stripe_*`, `user_tokens` sont write-protected pour les users authentifiés.
3. **Aligner paywall ↔ réalité** :
   - "40+ plans" → "7 programmes" (ou créer plus de programmes)
   - "5 scans/jour" → "3 scans/jour" (ou bumper le cap dans `analyze-food`)
4. **Tester end-to-end les quotas** après deploy edge functions :
   - Coach 6e message → quota notice s'affiche
   - 4e scan → erreur claire
5. **Activer PostHog** (au moins en stub fonctionnel) — sans ça aucune visibilité post-launch

### 🟡 P1 — Important mais non-bloquant

6. **Écran Contact/Support** dans Settings (avec mailto: vers ton email)
7. **Écran FAQ** (5-10 questions courantes)
8. **UI "Générer mon plan semaine"** dans Meals (la logique existe déjà)
9. **App Store metadata** : description, screenshots, keywords (à préparer dans App Store Connect, pas dans le code)
10. **PostHog wired with real key** + dashboards conversion paywall
11. **Toast feedback** après save profile/settings
12. **Notification "PR battu"** + "Coach a un message"

### 🟢 P2 — Nice-to-have post-v1

13. Animation splash (Lottie)
14. Plus de programmes d'entraînement (atteindre vraiment 40+)
15. Boutique (carte placeholder pour l'instant)
16. Error Boundary global + UI d'erreur stylée
17. Offline sync queue testée bout en bout
18. Filtre par pertinence sur les coach memories
19. Trigger paywall personnalisé selon `?trigger=` query param

---

## Checklist avant soumission App Store

- [ ] `app/privacy.tsx` rédigé + lié depuis Settings
- [ ] `app/terms.tsx` rédigé + lié depuis Settings
- [ ] Audit Supabase RLS dashboard (10 min)
- [ ] Aligner "40+ plans" ↔ réalité dans paywall
- [ ] Aligner "5 scans" ↔ réalité (3) dans paywall ou backend
- [ ] PostHog API key configurée + 1er event qui remonte
- [ ] App Store Connect : description, keywords, screenshots
- [ ] App Store Connect : finaliser les 2 produits subscription (`forga_pro_monthly`, `forga_pro_annual`)
- [ ] RevenueCat : pricing live + sandbox testé
- [ ] Test final : nouveau compte → onboarding → trial actif → tester quota → expiration trial → modal apparaît
- [ ] Tester paywall conversion sur sandbox
- [ ] Build TestFlight #45 avec tout en place

---

## État global

**~88% complète pour v1.0.**

Ce qui reste est essentiellement du **legal + alignement marketing + tests end-to-end**, pas du développement de features. Tu peux raisonnablement viser une release dans **5-10 jours de travail focused** :

- 1 jour : Privacy + Terms + Contact + FAQ
- 1 jour : audit RLS + corrections paywall
- 1 jour : PostHog wiring + tests events
- 1 jour : App Store Connect (subscriptions + metadata + screenshots)
- 1-2 jours : QA finale + bug fix
- 1 jour : build TestFlight + soumission

**Après release** : stabilisation + monitoring 2-4 semaines avant d'attaquer la pub.
