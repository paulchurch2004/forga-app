# FORGA — État du projet & passation

> **Pour Claude (nouvelle session) et pour Paul.** Ce document capture tout
> ce qu'il faut savoir pour reprendre le projet sans contexte préalable.
> Lis-le en premier, puis on continue le launch.

---

## 1. C'est quoi FORGA

App mobile de **coaching nutrition + entraînement** (React Native / Expo SDK 55 + Supabase). Cible : **App Store**, marché francophone, modèle **freemium** (essai 7j + abonnement Pro).

- **Propriétaire** : Paul Church
- **Bundle ID iOS** : `fr.forga.ios`
- **Apple App ID** : 6762985427
- **Repo** : github.com/paulchurch2004/forga-app
- **Branche de travail** : `redesign`

---

## 2. Stack technique

| Couche | Techno |
|---|---|
| App | React Native / Expo SDK 55, expo-router, Zustand (state + persist AsyncStorage) |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions Deno) — projet `quwzjsbwylgkdxbdgcsc` |
| Paiements | RevenueCat (entitlement `premium`, offering `default`, produits `com.forga.premium.annual/monthly`) |
| Coach IA | Edge Function `coach-chat` — routing multi-LLM : Groq Llama 3.3 70B (primaire, free tier 12k TPM) → fallback Claude Haiku + GPT-4o-mini |
| Vision repas | Edge Function `analyze-food` — GPT-4o vision |
| Analytics | PostHog (gated par ATT) |
| Crash | Sentry |

### Variables d'env (`.env`, gitignoré — à recréer sur chaque machine)
```
EXPO_PUBLIC_SUPABASE_URL=https://quwzjsbwylgkdxbdgcsc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_RhfkpUWqoYaTNJb0Qzoi6g_kxhs-Ytk
EXPO_PUBLIC_REVENUECAT_IOS=appl_qZaQrgnvLhhOTgswpgywYKkHgOy
```
Les clés LLM (Anthropic/OpenAI/Groq) sont dans les **secrets Supabase Edge Functions**, PAS dans le code.

---

## 3. Architecture produit (concepts clés)

- **2 catalogues de recettes distincts** :
  - `src/data/meals/*` (~500 recettes classiques) → tracking quotidien, portions ajustées via `calculatePortions`, organisées par slot.
  - `src/data/meals/sport.ts` (72 recettes sport) → section "inspiration" + maintenant **loggables** (flag `isSportRecipe` + badge "SPORT" dans la journée).
- **Quotas anti-coûts** (caps serveur, 3 paliers) :
  - Coach IA : Free **5**/j · Essai **15**/j · Payant **50**/j
  - Scan photo : Free **3**/j · Essai **5**/j · Payant **10**/j
- **Training** : 60 programmes générés (`OBJECTIF_NIVEAU_LIEU_SEXE`, ex `BULK_ADVANCED_GYM_M`). Plan = 4 semaines (28 jours). Charges dérivées du 1RM/calibration. Autorégulation pré-séance via check-in "métal" (Plomb→Or, multiplicateur adapté au niveau).
- **Dark-only** : l'app est verrouillée en mode sombre (cf §6). Le thème clair n'est PAS supporté (≈100 fichiers avec couleurs hardcodées).

---

## 4. Tout ce qui a été fait (session du 8-9 juin 2026)

### Bugs corrigés
- Onboarding : double demande de poids + **freeze** après prompt notifs (modal natif → overlay absolu)
- Flux repas : latence + superposition au retour sur nutrition (double célébration retirée) + swipe-back ramenait à la biblio (helper `returnToNutrition` qui reset la pile Home→Nutrition)
- Suppression de compte : `programStore`/`metalHistory`/`weeklyPlan` n'étaient pas reset → ancien programme persistait
- Crash wizard training : `useWindowDimensions()` appelé dans le JSX conditionnel (Rules of Hooks)
- Remplacement d'exercice : 2e remplacement perdu (override indexé sur ID original — résolution de clé corrigée)
- Avatar profil : ne persistait pas → upload **Supabase Storage** (bucket `avatars`)
- Barre slots biblio coupée, hero profil pas pleine largeur, tête de page sous la caméra
- Messages "coach live" pendant séance : **inventaient des données** (RPE, HR, vitesse descente, poids bidons) → réécrits honnêtes/génériques
- Carte rappel coach : "15:00" ambigu → "🔔 À 15h00" + permission notif demandée à la confirmation

### Features ajoutées
- **Fin de cycle** (`CycleCompleteCard`) : bilan (séances/tonnage/PR) + reco niveau suivant en 1 tap (`recommendNextProgram`)
- **Recettes sport loggables** + badge "SPORT"
- **Plan hebdo** : sélection repas par **fit macro** + portions optimisées sur les 4 macros (moindres carrés)
- **Volume cible training** basé sur historique réel (+5% surcharge progressive)
- **Bouton copier** message coach (⧉) + fix identité (n'avoue plus jamais "GPT/IA")
- **Paywall amélioré** : timeline d'essai, prix barré, CTA "0€ aujourd'hui", ancrage café, claims honnêtes (50/jour au lieu de "illimité"), testimonials (⚠️ placeholders à remplacer)

### Conformité / config
- **Privacy Manifest iOS** (`assets/PrivacyInfo.xcprivacy` + `plugins/withPrivacyManifest.js`)
- **Modal disclaimer santé** (Apple G1.4.1) post-onboarding
- **App verrouillée dark-only**
- **RLS Supabase** corrigé (policies `users` SELECT/INSERT/UPDATE) + garde de session dans `syncProfile`
- **RevenueCat** entièrement configuré (clé P8, produits, entitlement `premium`, offering `default`)
- **Edge Functions déployées** : `coach-chat`, `analyze-food`
- **Docs créées** : `docs/APP_STORE_PRIVACY_LABELS.md`, `docs/REVENUECAT_GRACE_PERIOD.md`

### Coach IA — validé par stress test
Sécurité médicale 🟢 (refuse médoc/régimes dangereux/stéroïdes), anti-hallucination 🟢, personnalisation 🟢, identité 🟢. **Seul point ouvert** : un message TRÈS long peut faire échouer l'appel (rate-limit Groq free tier) → fallback honnête affiché ("découpe ton message"). À surveiller en prod ; envisager Groq tier payant si fréquent.

### Audit pré-launch conformité Apple (9 juin) — correctifs appliqués
Audit multi-agent (8 dimensions) → 10 bloquants. Tous les bloquants **code** corrigés :
- **Faux testimonials** (Thomas L./Sarah M./Karim B.) → composant `Testimonials.tsx` supprimé, remplacé par `FeatureHighlights.tsx` (bénéfices factuels non attribués). Compteur inventé « 12 847 personnes » → « 3 coachs en 1 ». (G2.3.1)
- **Claims « illimité » mensongers** (coach réel 50/j, scan 10/j) → corrigés partout : faq, downgrade-confirmation, PremiumUpgradeCard, TrialExpirationModal, trialNotifications, coach.tsx (message quota), i18n fr/en. Caps réels : Coach Free 5 / Essai 15 / Pro 50 ; Scan Free 3 / Essai 5 / Pro 10.
- **RevenueCat jamais (ré)initialisé au login/inscription en session** (`_layout.tsx`) → `initRevenueCat` ajouté au handler `SIGNED_IN` (rendu idempotent : `logIn` si déjà configuré). Sans ça : paywall sans offres, achat & restore KO pour tout nouvel inscrit (= le reviewer).
- **Pas de liens Terms/Privacy sur le paywall** (G3.1.2) → ajoutés sous le CTA.
- **Prix EUR codés en dur** → tirés de RevenueCat (`priceString`/`pricePerMonthString`/`pricePerMonth`), localisés par devise, badge remise calculé, fallback EUR si offering absent (web/démo). CTA désactivé tant qu'aucune offre chargée. Idem nettoyage prix en dur dans TrialExpirationModal + downgrade-confirmation.
- **« 800+ recettes »** (faux, ~582 réelles) → « 500+ » (cohérent avec le listing 510 et FeatureHighlights).
- **Faux flow « 7j de plus avec CB »** (TrialExpirationModal + downgrade) → reformulé honnête : extension gratuite, sans CB.
- Nettoyage : `expo-build-properties` dédupliqué + clé Info.plist `NSUserNotificationsUsageDescription` (invalide) retirée + string ATT reformulée (plus « données anonymes ») + accents restaurés dans les permissions iOS ; clé orpheline retirée de `PrivacyInfo.xcprivacy` (plist relinté OK) ; Sentry ne reçoit plus l'email (id seul).

**Validé** : typecheck OK, `app.json` JSON valide, `plutil -lint` OK. Confirmé CONFORME par l'audit : suppression de compte (5.1.1v), Restaurer les achats (3.1.1), disclaimer santé (1.4.1), Sign in with Apple (4.8), accès freemium sans payer, ATT gaté, aucun secret fuité.

**Non-bloquants laissés pour v1.1** (cf rapport audit) : backdoor dev premium (long-press version dans Réglages — à gater `__DEV__` si gênant), StepsCard route vers Profil au lieu de Réglages>Santé, garde div/0 dans `portionCalculator`, clés i18n mortes, Rules-of-Hooks bénin dans `MessageBubble` (coach).

---

## 5. CE QU'IL RESTE POUR LE LAUNCH 🚀

### A. Build production
```bash
eas build --platform ios --profile production
```
Embarque tous les fixes + Privacy Manifest + clé RevenueCat. ~30 min. Puis :
```bash
eas submit --platform ios
```

### B. App Store Connect (appstoreconnect.apple.com)
- [ ] **Description** FR + EN (texte rédigé — voir historique ou redemander)
- [ ] **2 IAP** finalisés : prix (9,99€/an, 14,99€/mois) + essai 7j + nom localisé + statut "Prêt à envoyer"
- [ ] **Dispositif médical → NON** (bandeau bleu "Informations sur l'app")
- [ ] **Compte démo App Review** : créer `apple-review@forga.fr` dans Supabase Auth + le pré-remplir (SQL prêt dans l'historique) + saisir dans "Vérification de l'app" + notes
- [ ] **Privacy Labels** : déjà remplis (11 types) ✅
- [ ] **Classification 4+** ✅ · **DAC7** réglé ✅
- [ ] **Lier le build** à la version 1.0
- [ ] **Grace period 16j** (cf `docs/REVENUECAT_GRACE_PERIOD.md`)

### C. AVANT le build — vérifications manuelles (dashboards)
Les correctifs **code** sont faits (cf §4, audit 9 juin). Restent des vérifs **hors code** :
1. **RevenueCat dashboard** : l'offering est bien marqué **« current »** ; les 2 packages sont typés **ANNUAL / MONTHLY** ; produits `com.forga.premium.annual/monthly` rattachés à l'entitlement exactement nommé **`premium`**. (Le code sélectionne par `packageType` et lit `entitlements.active['premium']` — si mal configuré : paywall vide / restore qui ne débloque jamais.)
2. **Prix App Store Connect** : configurer les prix par palier (€ inclus) — le paywall affiche désormais le prix **réel** de la store via RevenueCat, donc ASC = source de vérité.
3. **Supabase** : confirmer que la RPC **`delete_my_account`** (migration 016) est déployée (sinon suppression de compte KO → rejet Apple).
4. **EAS** : `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` / `_REVENUECAT_IOS` présents au build prod (sinon app en mode démo silencieux).
5. **Sign in with Apple** : capability activée dans le provisioning / App ID (le code est prêt).
6. (Optionnel) **RPE→progression** : RPE collecté mais n'ajuste pas les charges → **v1.1** (modèle métal+reps solide).

---

## 6. Pièges / notes importantes

- **Dark-only** : `src/context/ThemeContext.tsx` force `isDark=true`. Ne PAS réactiver le thème clair sans pass design complet (≈100 fichiers à couleurs hardcodées).
- **ngrok souvent en panne** → utiliser `npx expo start --dev-client --lan` (iPhone + Mac même WiFi) au lieu de `--tunnel`.
- **Test du coach / rappels notifs** : marche mieux sur build TestFlight que dev client.
- **Lancer l'app** : `npx expo start --dev-client --lan --clear` puis ouvrir FORGA sur iPhone → reconnecter à Metro.
- **Déployer une Edge Function** : `supabase functions deploy <nom>` (Docker pas requis).
- **Apple Small Business Program** : à activer (commission 15% au lieu de 30%).

---

## 7. Modèle économique (pour contexte décisions)

Freemium. Pas de pub (décision actée — casserait le positionnement + complique privacy). Revenu = conversion gratuit→Pro. Simulation pessimiste 6 mois : profit positif même bas (~+1 750€), tout dépend des **téléchargements** (le vrai levier = acquisition). Coût LLM borné par les quotas (worst case ~15€/mois/payant, réel ~4-5€).
