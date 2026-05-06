# Smoke test — TestFlight build #56

**Build** : iOS 1.0.0 (#56)
**Branche** : `redesign`
**Date soumission** : à compléter

Pour chaque section : **PASS / FAIL / SKIP** + note rapide si fail.

---

## ⚙️ Préparation (5 min)

- [ ] App installée via TestFlight sur iPhone perso
- [ ] **Compte test** : crée un nouveau compte email type `test+build56@gmail.com` (pas ton compte principal — tu vas le supprimer à la fin)
- [ ] **PostHog dashboard** ouvert dans un autre onglet : https://eu.posthog.com → Live events
- [ ] **Sentry dashboard** ouvert : https://sentry.io → Issues (pour repérer crashes)
- [ ] WiFi solide — on simulera l'offline plus tard

---

## 🚪 1. Onboarding flow (10 min)

Le funnel le plus critique pour le launch.

- [ ] **Landing page** : tap "Commencer" → écran register
- [ ] **Sign Up email** : crée le compte test
  - [ ] PostHog : event `sign_up` avec `method: email` apparaît dans les 30s
- [ ] **Onboarding** : passe les 8 steps (archetype → identity → body → objective → target → activity → preferences → summary)
  - [ ] PostHog : event `onboarding_step` avec `step: 0..7` à chaque écran
  - [ ] Données saisies se persistent si tu fermes l'app entre 2 steps
- [ ] **Step 7 → "Commencer"** :
  - [ ] PostHog : `onboarding_complete` + `trial_started`
  - [ ] Atterrit sur Home avec ton score FORGA et plan repas
  - [ ] Bouton premium en haut de l'écran absent (tu es Premium pendant 7 jours)
- [ ] **Sign out** depuis Profil → Settings → Sign out → retour landing
- [ ] **Sign In** : tap "J'ai déjà un compte" → tape email/password → home
  - [ ] PostHog : `sign_in` avec `method: email`

---

## 🔐 2. Sign in with Apple / Google (5 min)

- [ ] Sign out, retour landing
- [ ] **Apple Sign In** : tap bouton noir "Continuer avec Apple" → Face ID → confirmation
  - [ ] **Cas 1** (premier login Apple sur ce téléphone) : tu arrives en onboarding step 0 (nouveau user)
    - PostHog : `sign_up` avec `method: apple`
  - [ ] **Cas 2** (Apple ID déjà lié) : tu arrives direct sur Home
    - PostHog : `sign_in` avec `method: apple`
- [ ] **Google Sign In** : tap bouton blanc → choisis ton compte
  - [ ] PostHog : `sign_up` ou `sign_in` avec `method: google`

---

## 🍎 3. Apple Health sync (10 min) — Premium only

⚠️ **Important** : nécessite que tu sois Premium (trial actif). Le toggle ouvre le paywall sinon.

- [ ] **Settings → toggle Apple Health** → switch ON
  - [ ] iOS demande permissions HealthKit → **active toutes les catégories** (poids, pas, calories, séances)
  - [ ] Toggle reste ON après acceptation
  - [ ] Bouton "Synchroniser maintenant" apparaît sous le toggle
  - [ ] Date "Dernière sync" se met à jour (timestamp récent)
- [ ] **Vérifier import poids** :
  - [ ] Si tu as déjà des entrées poids dans Apple Santé → ouvrir Profil → Mensurations → tu dois voir tes poids importés
- [ ] **Push séance** : lance une séance test (n'importe quel programme), termine-la
  - [ ] Ouvre Apple Santé app → Activité → Entraînements → ta séance FORGA apparaît avec le bon type (musculation/cardio)
- [ ] **Toggle OFF** : remettre le switch à off → check que la sync s'arrête (les data déjà importées restent — c'est OK)
- [ ] **Restart de l'app** : kill l'app puis rouvre → check que les données importées sont toujours là

**Cas d'erreur à tester** :
- [ ] Refuser les permissions iOS quand demandé → toggle revient à OFF, alert "Permission refusée" affichée

---

## 🔗 4. Deep links parrainage (3 min)

- [ ] **Sign out** d'abord (sinon le code est ignoré)
- [ ] Ouvre **Notes** ou **Messages** sur ton iPhone
- [ ] Tape ce lien : `forga://r/AMI-A3K9` → tap dessus
- [ ] FORGA s'ouvre → écran register avec **section "Code de parrainage" ouverte** et `AMI-A3K9` pré-rempli en majuscules
- [ ] Tap dans le champ pour vérifier que tu peux modifier/effacer manuellement

⚠️ **Universal Links** (`https://forga.fr/r/CODE`) ne marchent pas tant que `apple-app-site-association` n'est pas hébergé sur forga.fr — c'est attendu.

---

## 🍽️ 5. Repas + streak + score (10 min)

- [ ] **Home** : tap un repas suggéré (ex: petit-déj) → détail
  - [ ] PostHog : `meal_viewed` avec `mealId` et `slot`
- [ ] **Valider le repas** → animation de célébration → retour Home
  - [ ] PostHog : `meal_validated`
  - [ ] Streak passe à 1 (compteur en haut), `streak_day` event
  - [ ] Si premier repas ever → badge "Premier Repas" débloqué + push notification (si autorisée)
  - [ ] PostHog : `badge_unlocked` avec `badge: first_meal`
- [ ] **Score FORGA** : check qu'il est non-zéro après validation
- [ ] **Quota Free** (avec un compte non-Premium) : valide 5 repas → 6e tentative bloquée par paywall
  - [ ] PostHog : `paywall_shown` avec `trigger: meal_cap`

---

## 💪 6. Séance d'entraînement (10 min)

- [ ] **Home → onglet Plan ou Coach** : voir la séance du jour
- [ ] **Démarrer la séance** → écran active-workout
- [ ] Compléter au moins 2 séries d'1 exercice (poids + reps)
- [ ] **Live coach** : check que le banner orange apparaît parfois (forme/repos/pousse) — on peut le tap pour le faire disparaître
- [ ] **Substituer un exercice** (Premium only) : tap menu sur exercice → "Remplacer" → choisir une alternative
  - [ ] Free : doit afficher paywall
- [ ] **Terminer la séance** → écran post-workout feedback
- [ ] Note 4/5 étoiles + RPE 7 + note libre "Test build #56"
- [ ] **Soumettre** : retour home
  - [ ] Apple Santé : check que la séance est bien syncée (cf. section 3)
  - [ ] Workouts list dans Profil contient la nouvelle séance

---

## 🧠 7. Coach IA + cache (8 min)

- [ ] **Onglet Coach** → mode Conversation
- [ ] **Style iMessage** : check visuellement
  - [ ] Bulle reçue (coach) : slate gris, à gauche
  - [ ] Bulle envoyée (toi) : orange FORGA, à droite
  - [ ] **Pop animation** quand un message apparaît (spring overshoot, pas un fade)
  - [ ] Bouton send circulaire avec flèche vers le haut, apparaît dès que tu tapes
  - [ ] Indicator "typing" : 3 points slate qui ondulent quand le coach réfléchit
- [ ] **Tape une question** : "Combien de protéines il me reste ?"
  - [ ] Réponse cohérente avec ton profil (~2-4s de wait)
  - [ ] PostHog : `coach_message_sent` avec `cached: false`
- [ ] **Re-tape exactement la même question** dans la même session
  - [ ] Réponse beaucoup plus rapide (~50ms — cache hit)
  - [ ] PostHog : `coach_message_sent` avec `cached: true`
- [ ] **Quota Free** : envoie 5 messages → 6e bloqué avec card "Quota atteint" + bouton paywall
  - [ ] PostHog : `quota_exceeded` avec `feature: coach_message`
- [ ] **Mode avion ON** + tape un message → fallback déterministe (réponse générique mais utile)
  - [ ] PostHog : `coach_fallback_used` (synced quand tu remets le wifi)

---

## 📡 8. Offline / résilience (5 min)

- [ ] WiFi + cellulaire **OFF** (mode avion)
- [ ] Banner orange "Mode hors-ligne" apparaît en haut
- [ ] **Valide 2 repas** offline → pas d'erreur
- [ ] **Termine 1 séance** offline → idem
- [ ] **Force-quit l'app** (swipe up depuis le multitâche)
- [ ] Réouvre → données toujours là (persistées localement)
- [ ] Mode avion **OFF**
- [ ] Attends ~30s → banner disparaît + sync auto en background
- [ ] Profil → onglet Cloud : voir que tout est bien synced

---

## 💰 9. Paywall (3 min) — sans IAP encore

⚠️ **Comportement attendu** : aucun produit affiché tant que les IAP App Store Connect ne sont pas créés. C'est normal.

- [ ] **Trigger paywall** : tap "Passer Premium" depuis n'importe où
  - [ ] PostHog : `paywall_shown` avec le bon `trigger`
- [ ] Écran s'affiche avec hero "Débloque ton plein potentiel" mais **liste produits vide**
- [ ] Tap "Restore Purchases" → message "Aucun achat à restaurer" (au lieu de crash)
- [ ] Tap croix pour fermer → PostHog : `paywall_dismissed`

---

## ⚙️ 10. Settings + RGPD (5 min)

- [ ] **Settings → Privacy Policy** : page s'ouvre, contenu lisible, "Paul Church entrepreneur individuel" mentionné
- [ ] **Settings → Terms of Service** : idem
- [ ] **Settings → Exporter mes données** : génère un JSON, share sheet iOS s'ouvre
- [ ] **Settings → Supprimer mon compte** : alert de confirmation → confirme
  - [ ] Compte supprimé, retour landing
  - [ ] Re-tente de te connecter avec ce compte → "Compte introuvable"

---

## 🧹 11. Cleanup post-test

- [ ] Si pas déjà fait : **supprime le compte test** depuis Profil → Settings
- [ ] Vérifie dans Supabase Studio que la row `users` du compte test n'existe plus
- [ ] Vérifie dans PostHog que les events test sont bien arrivés (~50 events au total)

---

## 🐛 Bugs détectés pendant le test

| # | Section | Description | Severity (low/med/high) | Fix planifié |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## ✅ Verdict

- [ ] **GO LAUNCH** : 0 bug high, paywall vide assumé, prêt pour soumission App Review
- [ ] **GO TESTFLIGHT EXTERNE** : 0 bug high, on peut élargir aux beta testeurs externes
- [ ] **HOLD** : ≥1 bug high → fix + build #57
- [ ] **HOLD ARCHITECTURE** : problème majeur → on retravaille avant le prochain build

---

## 📈 Métriques attendues sur ce smoke test

À la fin, dans PostHog tu devrais voir (sur le user `test+build56`) :

| Event | Count attendu |
|---|---|
| `app_opened` | ≥3 |
| `sign_up` | 1 (email) |
| `onboarding_step` | 8 |
| `onboarding_complete` | 1 |
| `trial_started` | 1 |
| `meal_viewed` | ≥2 |
| `meal_validated` | ≥1 |
| `streak_day` | 1 |
| `badge_unlocked` | ≥1 |
| `paywall_shown` | ≥1 |
| `paywall_dismissed` | ≥1 |
| `coach_message_sent` | ≥3 |
| `coach_message_sent` (cached: true) | ≥1 |
| `quota_exceeded` | optionnel (si tu pushes le test Free) |
| `referral_code_used` | 1 (si tu test deep link parrainage) |

Si un de ces events ne fire pas → soit bug dans le wire-up, soit PostHog côté serveur en retard. Vérifie le `forga-store-debug` AsyncStorage pour confirmer la queue locale.
