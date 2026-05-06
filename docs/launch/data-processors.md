# Registre des sous-traitants RGPD — FORGA

Conformément à l'**Article 30 du RGPD**, voici le registre complet des
sous-traitants techniques de FORGA. Ce document doit être tenu à jour et
peut être demandé par la CNIL ou l'utilisateur.

**Responsable de traitement** : Paul Church
**SIRET** : *à compléter*
**Adresse** : 2 allée Armand Praviel, 33000 Bordeaux, France
**Email DPO/contact** : hello@forga.fr

---

## Liste des sous-traitants (mai 2026)

### 1. Supabase Inc.

- **Catégorie** : Hébergement DB + Auth + Storage
- **Adresse** : 970 Toa Payoh North #07-04 Singapore 318992 (entité parent)
  / Supabase, Inc., 970 N California Ave, San Francisco CA 94109, USA
- **Pays principaux de traitement** : États-Unis (région `eu-west-3` Paris
  configurable)
- **Données traitées** :
  - Email, mot de passe hashé (bcrypt)
  - Profil utilisateur, mensurations, repas validés, séances
  - Photos de progression (storage chiffré)
  - Métadonnées techniques (timestamps, UUID)
- **Finalité** : hébergement de la base de données, authentification,
  storage objet
- **Base légale** : exécution du contrat (Article 6.1.b)
- **Mécanisme transfert hors UE** : Standard Contractual Clauses (SCC) UE
- **DPA** : https://supabase.com/legal/dpa
- **Privacy Policy** : https://supabase.com/privacy
- **Durée conservation** : tant que le compte utilisateur existe + 30
  jours après suppression

### 2. Apple Inc.

- **Catégorie** : Authentification + Paiements + Push + Health (optionnel)
- **Adresse** : One Apple Park Way, Cupertino CA 95014, USA
- **Pays de traitement** : États-Unis, Irlande (Apple Distribution
  International Limited pour l'UE)
- **Données traitées** :
  - Sign in with Apple : email anonymisé, identifiant Apple
  - In-App Purchase : statut abonnement, transaction IDs
  - Push Notifications : APNs tokens
  - Apple Health (si activé) : poids, calories, séances (échange
    bidirectionnel via HealthKit)
- **Finalité** : authentification, gestion d'abonnement, notifications,
  intégration Health
- **Base légale** : exécution du contrat (Article 6.1.b) ; consentement
  pour Apple Health (Article 6.1.a)
- **Mécanisme transfert hors UE** : Apple ADI (Irlande, UE) pour la
  plupart des traitements EU
- **DPA / Privacy** : https://www.apple.com/legal/privacy/
- **Durée conservation** : selon Apple (généralement 12-24 mois)

### 3. Google LLC

- **Catégorie** : Authentification (Sign in with Google, optionnel)
- **Adresse** : 1600 Amphitheatre Parkway, Mountain View CA 94043, USA
- **Pays de traitement** : États-Unis ; Irlande pour les utilisateurs UE
  (Google Ireland Limited)
- **Données traitées** :
  - Email Google (à la 1ère connexion seulement)
  - Nom complet (à la 1ère connexion seulement, si l'utilisateur consent)
- **Finalité** : authentification sans mot de passe via OAuth Google
- **Base légale** : exécution du contrat (Article 6.1.b) si l'utilisateur
  choisit Sign in with Google
- **Mécanisme transfert hors UE** : SCC + Google Ireland Limited
- **DPA** : https://cloud.google.com/terms/data-processing-addendum
- **Privacy** : https://policies.google.com/privacy
- **Durée conservation** : Google gère selon sa politique

### 4. RevenueCat Inc.

- **Catégorie** : Gestion abonnements (mobile subscription)
- **Adresse** : RevenueCat, Inc., 535 Mission St 14th Floor, San Francisco
  CA 94105, USA
- **Pays de traitement** : États-Unis
- **Données traitées** :
  - User ID (UUID interne FORGA, anonymisé)
  - Statut abonnement, dates de début/fin
  - Historique des achats (montants, plans)
  - Plateforme (iOS/Android)
- **Finalité** : gestion centralisée des abonnements, sync entre
  RevenueCat et Supabase via webhooks
- **Base légale** : exécution du contrat (Article 6.1.b)
- **Mécanisme transfert hors UE** : SCC + DPA validé
- **DPA** : https://www.revenuecat.com/dpa
- **Privacy** : https://www.revenuecat.com/privacy
- **Durée conservation** : tant que l'abonnement existe + archivage légal
  (10 ans pour audit fiscal)

### 5. Functional Software, Inc. (Sentry)

- **Catégorie** : Détection plantages techniques
- **Adresse** : 45 Fremont Street 8th Floor, San Francisco CA 94105, USA
- **Pays de traitement** : États-Unis (option région UE disponible —
  recommandé d'activer pour FORGA)
- **Données traitées** :
  - Stack traces techniques
  - Type de device, OS version, app version
  - User ID pseudonymisé (sans email ni mensurations)
- **Finalité** : diagnostic des bugs techniques pour amélioration de
  l'app
- **Base légale** : intérêt légitime (Article 6.1.f) — l'amélioration
  technique sert l'utilisateur sans porter atteinte à ses droits
- **Mécanisme transfert hors UE** : SCC + DPA
- **DPA** : https://sentry.io/legal/dpa/
- **Privacy** : https://sentry.io/privacy/
- **Durée conservation** : 90 jours par défaut, jamais plus de 12 mois

### 6. PostHog Inc.

- **Catégorie** : Analytique produit anonyme
- **Adresse** : 2261 Market Street #4008, San Francisco CA 94114, USA
  (entité UE disponible : PostHog Limited, Royaume-Uni)
- **Pays de traitement** : États-Unis OU Royaume-Uni (configurable)
- **Données traitées** :
  - Événements (clic, vue d'écran, action)
  - User ID pseudonymisé
  - Pas de PII (email, nom, mensurations)
- **Finalité** : analyse anonyme pour comprendre l'usage et améliorer
  l'app
- **Base légale** : intérêt légitime (Article 6.1.f) — pseudonymisation
  + droit d'opposition disponible via support
- **Mécanisme transfert hors UE** : SCC ; option région UK disponible
- **DPA** : https://posthog.com/dpa
- **Privacy** : https://posthog.com/privacy
- **Durée conservation** : 7 ans par défaut chez PostHog (paramétrable)

### 7. Anthropic PBC ou Google AI Studio (futur — coach IA, à partir juin 2026)

- **Catégorie** : Génération de réponses IA contextuelles
- **Adresse Anthropic** : Anthropic PBC, 548 Market Street PMB 90375,
  San Francisco CA 94104, USA
- **Adresse Google AI** : Google LLC (cf. ci-dessus)
- **Pays de traitement** : États-Unis (Anthropic n'a pas de région UE
  dédiée à mai 2026)
- **Données traitées** :
  - Message texte de l'utilisateur au coach
  - Contexte minimal du profil : objectif, niveau d'activité, sexe (PAS
    l'email, PAS le nom complet, PAS les mensurations identifiables)
- **Finalité** : génération de conseils nutrition/entraînement
  contextualisés
- **Base légale** : exécution du contrat Premium (Article 6.1.b) +
  consentement explicite via toggle Settings
- **Mécanisme transfert hors UE** : SCC ; opt-out de l'utilisation des
  données pour entraînement de modèles activé par défaut côté FORGA
- **DPA Anthropic** : https://www.anthropic.com/legal/dpa
- **Privacy Anthropic** : https://www.anthropic.com/legal/privacy
- **DPA Google AI** : https://cloud.google.com/terms/data-processing-addendum
- **Durée conservation** : Anthropic ne stocke pas les prompts au-delà
  de 30 jours (mode "no-training") ; FORGA cache les réponses 24h max
  côté Edge Function

---

## Résumé des transferts hors UE

| Sous-traitant | Pays | Mécanisme | Risque résiduel |
|---|---|---|---|
| Supabase | USA | SCC + chiffrement | Faible |
| Apple | USA + Irlande | ADI Irlande pour UE | Très faible |
| Google | USA + Irlande | Google Ireland Ltd | Très faible |
| RevenueCat | USA | SCC + DPA | Faible |
| Sentry | USA (opt UE) | SCC | Faible |
| PostHog | USA (opt UK) | SCC + UK adequacy | Très faible |
| Anthropic | USA | SCC + no-training | Modéré (à surveiller) |

---

## Mises à jour

| Date | Modification | Auteur |
|---|---|---|
| 2026-05-05 | Création initiale du registre | Paul Church |

---

## Procédure d'ajout d'un nouveau sous-traitant

1. Vérifier l'existence d'un DPA conforme RGPD
2. Documenter dans ce fichier (catégorie, finalité, données, base légale,
   transfert)
3. Notifier les utilisateurs si le nouveau sous-traitant traite des
   données personnelles non-anonymes (notification email + mise à jour
   Privacy Policy)
4. Mettre à jour `privacy-policy-fr.md` et `privacy-policy-en.md`
5. Si le sous-traitant traite des données sensibles ou présente un risque
   élevé, conduire une **AIPD (Analyse d'Impact relative à la Protection
   des Données)** — Article 35 RGPD
