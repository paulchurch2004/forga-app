# FORGA — Privacy Labels App Store Connect

Document à utiliser au moment du submit (App Store Connect → App Privacy section).
Ces déclarations doivent **exactement matcher** notre `PrivacyInfo.xcprivacy` (`assets/PrivacyInfo.xcprivacy`) et notre Privacy Policy (`app/privacy.tsx`).

Apple compare les 3 sources. Une incohérence = rejet.

---

## ⚠️ Avant de commencer

Sur App Store Connect :
- App → Privacy → Privacy Policy URL : remplir avec **https://forga.fr/privacy** (à publier sur le site avant submit)
- App → Data Collection : suivre les sections ci-dessous

---

## Section 1 — Données qu'on collecte

Réponse à "Do you or your third-party partners collect data from this app?"
→ **YES**

### 1.1 Contact Info

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **Email Address** | ✅ Yes | ❌ No | App Functionality (auth) |
| **Name** | ✅ Yes | ❌ No | App Functionality (personalization) |

### 1.2 Health & Fitness

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **Health** (weight, body measurements, body fat %) | ✅ Yes | ❌ No | App Functionality (core feature) |
| **Fitness** (workouts, sets, reps, 1RM, calories) | ✅ Yes | ❌ No | App Functionality (core feature) |

### 1.3 User Content

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **Photos or Videos** (progress photos) | ✅ Yes | ❌ No | App Functionality |
| **Other User Content** (coach chat messages, custom meals) | ✅ Yes | ❌ No | App Functionality |

### 1.4 Identifiers

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **User ID** (Supabase UUID) | ✅ Yes | ✅ Yes | App Functionality + Analytics |

> **Pourquoi "Tracking: Yes"** : User ID est utilisé par PostHog avec ATT consent pour faire le funnel cross-session.

### 1.5 Usage Data

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **Product Interaction** (screens viewed, features used) | ✅ Yes | ✅ Yes | Analytics + App Functionality |

### 1.6 Diagnostics

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **Crash Data** (Sentry) | ❌ No (anonymized) | ❌ No | App Functionality |
| **Performance Data** (Sentry) | ❌ No (anonymized) | ❌ No | App Functionality |

### 1.7 Purchases

| Data type | Linked to user | Tracking | Purposes |
|---|---|---|---|
| **Purchase History** (RevenueCat) | ✅ Yes | ❌ No | App Functionality |

---

## Section 2 — Tracking

Réponse à "Does this app track users?"
→ **YES**

Apple's definition de "tracking" :
- Linking user data with third-party data for ads
- Sharing data with data brokers

Pourquoi YES pour nous :
- PostHog analytics (avec ATT consent) peut techniquement linker des events à un user ID
- Sentry transmet des crash data (anonymized mais Apple considère ça comme tracking si pas 100% anonyme)

Mention obligatoire : "Tracking only occurs after explicit user consent via the iOS ATT prompt."

---

## Section 3 — Data Use Purpose Definitions

| Purpose | Activé ? | Justif |
|---|---|---|
| **Third-Party Advertising** | ❌ NO | On n'a pas de pub |
| **Developer's Advertising or Marketing** | ❌ NO | On n'utilise pas les data user pour des ads |
| **Analytics** | ✅ YES | PostHog (post-ATT) |
| **Product Personalization** | ✅ YES | Coach IA, plans nutrition, calibration |
| **App Functionality** | ✅ YES | Auth, save data, sync cross-device |
| **Other Purposes** | ❌ NO | — |

---

## Section 4 — Third-Party Partners (sous-traitants)

À mentionner dans la Privacy Policy mais PAS dans les labels (Apple Privacy Labels couvrent juste les types de data).

Liste actuelle (cf `app/privacy.tsx`) :
- **Supabase** (DB + auth) — Eu West, RGPD-compliant
- **Apple** (App Store / Sign in with Apple / Push notifications)
- **RevenueCat** (subscriptions)
- **Sentry** (crash reporting)
- **PostHog** (product analytics, ATT-gated)
- **Anthropic + Groq + OpenAI** (coach IA, no training on user data)
- **OpenFoodFacts** (barcode lookup, no user data sent)
- **Pollinations** (meal photos generation, name only sent)

---

## Section 5 — Privacy Policy URL

Avant submit, vérifier que **https://forga.fr/privacy** est :
1. Accessible publiquement (pas derrière login)
2. Match l'écran `app/privacy.tsx` (même contenu FR/EN)
3. Mentionne TOUS les sous-traitants
4. Mentionne le droit à l'export + suppression (RGPD art. 15 + 17)
5. Email de contact valide

---

## Section 6 — Checklist avant submit

- [ ] PrivacyInfo.xcprivacy présent dans le bundle (vérifié via Build → Show Package Contents)
- [ ] Privacy Labels remplis sur App Store Connect (sections 1.1 à 1.7 ci-dessus)
- [ ] Privacy Policy URL active sur https://forga.fr/privacy
- [ ] CGU active sur https://forga.fr/terms
- [ ] App Privacy Tracking activé (YES) avec mention ATT consent
- [ ] Toutes les permissions iOS (NSCamera, NSPhotoLibrary…) ont un description string clair dans `app.json`
- [ ] Restore Purchases visible dans le paywall
- [ ] Delete Account accessible depuis Profile

Si une seule ligne du tableau n'est pas remplie sur App Store Connect ↔ ne correspond pas à `PrivacyInfo.xcprivacy` → rejet.
