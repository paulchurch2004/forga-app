# Privacy Policy — FORGA

**Last updated: May 5, 2026**
**Effective date: May 5, 2026**

---

## 1. Who we are

FORGA is a mobile application for nutrition and training coaching, operated by:

**Paul Church** — sole proprietor
2 allée Armand Praviel
33000 Bordeaux, France
SIRET: *to be added*
Contact: hello@forga.fr

In compliance with the General Data Protection Regulation (GDPR — Regulation
(EU) 2016/679), the California Consumer Privacy Act (CCPA), and other
applicable privacy laws, we are committed to protecting your privacy.

This policy explains:
- What data we collect
- Why we collect it
- How it is stored and protected
- What your rights are

---

## 2. Data we collect

### 2.1. Data you provide directly

- **Identification**: first name, email address, password (hashed)
- **Body information**: sex, age, height, weight, target weight, physical
  activity level
- **Goals**: muscle gain, fat loss, recomposition, maintenance
- **Dietary preferences**: restrictions (vegetarian, gluten-free, halal, etc.),
  food budget
- **Nutrition tracking**: validated meals, hydration, body measurements
- **Training tracking**: sessions, exercises, sets, weights, reps, perceived
  effort (RPE), free notes
- **Progress photos**: if you choose to add any, stored encrypted

### 2.2. Data collected automatically

- **Technical identifiers**: Supabase user ID (UUID), iOS version, device
  model, system language
- **Usage metrics**: features used, screens visited, time spent (via PostHog,
  anonymized)
- **Crash data**: stack traces, crash type (via Sentry, no personal content)

### 2.3. Data we DO NOT collect

- ❌ Geolocation
- ❌ Phone contacts
- ❌ Photos from your gallery (except if you explicitly choose to share one
  as a progress photo)
- ❌ Microphone
- ❌ Access to other apps
- ❌ Banking data (handled exclusively by Apple/Google)
- ❌ Advertising identifier (IDFA not collected)

---

## 3. Why we collect this data (purposes)

| Purpose | GDPR legal basis | Data involved |
|---|---|---|
| Create your account and sign you in | Contract performance | Email, password |
| Personalize your nutrition and training plans | Contract performance | Body profile, goals |
| Save your progress in the cloud | Contract performance | All your tracking data |
| Improve the app (anonymous analysis) | Legitimate interest | Anonymized usage metrics |
| Diagnose bugs | Legitimate interest | Anonymized crash reports |
| Contact you for support | Contract performance | Email |
| Manage your Premium subscription | Contract performance | Apple/Google status |

---

## 4. Data processors (with whom we share data)

FORGA relies on several technical providers. All are contractually bound to
GDPR. Here is the complete and transparent list:

### Supabase Inc. (USA, EU Standard Contractual Clauses)
- **Role**: database hosting, authentication, storage
- **Data**: email, hashed password, profile, tracking data, photos
- **Retention**: as long as your account exists
- **Outside EU transfer**: yes (USA), with validated SCCs
- Privacy: https://supabase.com/privacy

### Apple Inc. (USA)
- **Role**: "Sign in with Apple" authentication, In-App Purchase payments,
  push notifications, Apple Health integration (if you enable sync)
- **Data**: anonymized Apple ID, subscription status
- Privacy: https://www.apple.com/legal/privacy/

### Google LLC (USA)
- **Role**: "Sign in with Google" authentication if you choose this method
- **Data**: email, name (only on first sign-in)
- Privacy: https://policies.google.com/privacy

### RevenueCat Inc. (USA, validated SCCs)
- **Role**: subscription and free trial management
- **Data**: user ID, subscription status, purchase history
- Privacy: https://www.revenuecat.com/privacy

### Sentry (Functional Software Inc., USA, SCCs)
- **Role**: automatic detection of technical crashes
- **Data**: stack traces, app version, device model (NO email or personal
  content)
- Privacy: https://sentry.io/privacy/

### PostHog Inc. (USA, SCCs)
- **Role**: anonymous app usage analysis
- **Data**: events (clicks, screens), pseudonymized user ID, no PII
- Privacy: https://posthog.com/privacy

### Anthropic / Google AI Studio (future — AI coach)
- **Role**: AI coach response generation (starting June 2026)
- **Data**: your message + minimal profile context (goal, level). NO email,
  NO identifiable measurements.
- Privacy: https://www.anthropic.com/legal/privacy or
  https://policies.google.com/privacy

---

## 5. How long we keep your data

- **Active account**: as long as your account exists
- **Inactive account** (no login for 24 months): email alert then automatic
  deletion after 36 months
- **Account deleted by you**: immediate deletion of all data within 30 days
  (technical delay)
- **Anonymous logs** (Sentry, PostHog): 90 days
- **Billing data**: 10 years (legal tax obligation)

---

## 6. Your rights

Under GDPR (and equivalent rights under CCPA), you have the following
rights. You can exercise them at any time **directly in the app** or by
emailing us at **hello@forga.fr**:

### 🔍 Right of access (Article 15)
Request a copy of all data we have about you.
**Available in 1 tap in the app**: Profile → Settings → Export my data.
Portable JSON format.

### ✏️ Right to rectification (Article 16)
Modify your personal data anytime in the app: Profile → Edit profile.

### 🗑️ Right to erasure / "right to be forgotten" (Article 17)
Delete your account and all your data.
**Available in 1 tap in the app**: Profile → Settings → Delete my account.
Immediate and irreversible deletion.

### ⏸️ Right to restriction (Article 18)
Request that we freeze the processing of your data in certain situations.

### 📤 Right to data portability (Article 20)
Retrieve all your data in a structured, machine-readable, reusable format.
**Available in 1 tap**: Profile → Export my data.

### 🚫 Right to object (Article 21)
Object to the processing of your data based on legitimate interest
(particularly PostHog analytics). Email us at hello@forga.fr and we will
disable analytics for your account.

### 📞 CCPA-specific rights (California residents)
If you reside in California, you also have the right to know what personal
information is collected, the right to know whether it is sold (we do NOT
sell data), and the right to non-discrimination for exercising your rights.

### 📞 Right to lodge a complaint
If you believe your rights are not respected, you may contact:
- **EU**: your national Data Protection Authority. In France: CNIL —
  https://www.cnil.fr/fr/plaintes
- **California**: California Attorney General

---

## 7. Security

### 7.1. Technical measures

- **Encryption in transit**: all communications use TLS 1.3
- **Encryption at rest**: Supabase database encrypted with AES-256
- **Passwords**: hashed with bcrypt (never stored in plain text)
- **Authentication**: short-lived JWT tokens, refresh tokens
- **Sign in with Apple** available for password-free authentication

### 7.2. Limitations

No system is 100% foolproof. In the event of a data breach that may affect
your rights and freedoms, we will inform you within 72 hours in compliance
with GDPR Article 33.

---

## 8. Minors

FORGA is restricted to people aged **16 and over**. This limit is enforced
during onboarding (age validation required). If we learn that a minor
signed up by misrepresenting their age, we will delete their account
without notice.

For 16-18 year olds, we strongly recommend supervision by a parent or
healthcare professional for all nutrition and training recommendations.

For California residents under 18 (and other applicable jurisdictions), we
do not collect data for the purposes of selling personal information.

---

## 9. Cookies (web only)

The mobile app does not place any cookies on your device.

If you use **forga.fr** in a browser (future), we will use:
- Essential cookies for functionality (session, security)
- No advertising cookies
- No third-party tracking cookies

---

## 10. Changes to this policy

We may update this policy to reflect legal, technical, or feature changes.
In case of a **substantial change** (new purpose, major new processor), we
will notify you by email **at least 30 days in advance**.

The "Last updated" date at the top of the document always indicates the
current version.

---

## 11. Contact

For any question regarding this policy or your data:

**Email**: hello@forga.fr
**Mail**: Paul Church, 2 allée Armand Praviel, 33000 Bordeaux, France

We commit to responding to any legitimate request within **a maximum of
one month** (GDPR Article 12).
