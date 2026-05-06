# Politique de confidentialité — FORGA

**Dernière mise à jour : 5 mai 2026**
**Entrée en vigueur : 5 mai 2026**

---

## 1. Qui sommes-nous ?

FORGA est une application mobile de coaching nutrition et entraînement
éditée par :

**Paul Church** — entrepreneur individuel
2 allée Armand Praviel
33000 Bordeaux
France
SIRET : *à compléter*
Contact : hello@forga.fr

Conformément au Règlement Général sur la Protection des Données (RGPD,
Règlement (UE) 2016/679) et à la loi Informatique et Libertés modifiée,
nous nous engageons à protéger ta vie privée.

Cette politique explique :
- Quelles données nous collectons
- Pourquoi nous les collectons
- Comment elles sont stockées et protégées
- Quels sont tes droits

---

## 2. Données collectées

### 2.1. Données que tu nous fournis directement

- **Identification** : prénom, adresse email, mot de passe (hashé)
- **Informations corporelles** : sexe, âge, taille, poids, poids cible,
  niveau d'activité physique
- **Objectifs** : prise de masse, perte de gras, recomposition, maintien
- **Préférences alimentaires** : restrictions (végétarien, sans gluten,
  halal, etc.), budget alimentaire
- **Suivi nutrition** : repas validés, hydratation, mensurations
- **Suivi entraînement** : séances, exercices, séries, poids, reps,
  ressenti (RPE), notes libres
- **Photos de progression** : si tu choisis d'en ajouter, stockées de
  manière chiffrée

### 2.2. Données collectées automatiquement

- **Identifiants techniques** : ID utilisateur Supabase (UUID), version
  iOS, modèle d'appareil, langue système
- **Métriques d'usage** : fonctionnalités utilisées, écrans visités, temps
  passé (via PostHog, anonymisé)
- **Données de plantage** : stack traces, type de plantage (via Sentry,
  sans contenu personnel)

### 2.3. Données que nous NE collectons PAS

- ❌ Géolocalisation
- ❌ Contacts du téléphone
- ❌ Photos de la galerie (sauf si tu choisis explicitement d'en partager
  une comme photo de progression)
- ❌ Microphone
- ❌ Accès à d'autres apps
- ❌ Données bancaires (gérées exclusivement par Apple/Google)
- ❌ Identifiant publicitaire (IDFA non collecté)

---

## 3. Pourquoi nous collectons ces données (finalités)

| Finalité | Base légale RGPD | Données concernées |
|---|---|---|
| Créer ton compte et te connecter | Exécution du contrat | Email, mot de passe |
| Personnaliser tes plans nutrition et entraînement | Exécution du contrat | Profil corporel, objectifs |
| Sauvegarder tes progrès dans le cloud | Exécution du contrat | Tous tes suivis |
| Améliorer l'app (analyse anonyme) | Intérêt légitime | Métriques d'usage anonymisées |
| Diagnostiquer les bugs | Intérêt légitime | Crash reports anonymisés |
| Te contacter pour le support | Exécution du contrat | Email |
| Gérer ton abonnement Premium | Exécution du contrat | Statut Apple/Google |

---

## 4. Sous-traitants (avec qui partageons-nous tes données)

FORGA fait appel à plusieurs prestataires techniques. Tous sont contractuellement
liés au RGPD. Voici la liste complète et transparente :

### Supabase Inc. (USA, conforme aux Standard Contractual Clauses UE)
- **Rôle** : hébergement de la base de données, authentification, stockage
- **Données traitées** : email, mot de passe hashé, profil, suivis, photos
- **Durée de conservation** : tant que ton compte existe
- **Transfert hors UE** : oui (USA), avec SCC validés
- Privacy : https://supabase.com/privacy

### Apple Inc. (USA)
- **Rôle** : authentification "Sign in with Apple", paiements In-App Purchase,
  push notifications, intégration Apple Health (si tu actives la sync)
- **Données traitées** : identifiant Apple anonymisé, statut abonnement
- Privacy : https://www.apple.com/legal/privacy/

### Google LLC (USA)
- **Rôle** : authentification "Sign in with Google" si tu choisis ce moyen
- **Données traitées** : email, nom (uniquement à la 1ère connexion)
- Privacy : https://policies.google.com/privacy

### RevenueCat Inc. (USA, SCC validés)
- **Rôle** : gestion des abonnements et essais gratuits
- **Données traitées** : ID utilisateur, statut abonnement, historique des achats
- Privacy : https://www.revenuecat.com/privacy

### Sentry (Functional Software Inc., USA, SCC)
- **Rôle** : détection automatique de plantages techniques
- **Données traitées** : stack traces, version app, modèle d'appareil
  (PAS d'email ni de contenu personnel)
- Privacy : https://sentry.io/privacy/

### PostHog Inc. (USA, SCC)
- **Rôle** : analyse anonyme de l'usage de l'app
- **Données traitées** : événements (clics, écrans), ID utilisateur
  pseudonymisé, pas de PII
- Privacy : https://posthog.com/privacy

### Anthropic / Google AI Studio (futur — coach IA)
- **Rôle** : génération de réponses du coach IA contextuel (à partir de
  juin 2026)
- **Données traitées** : ton message au coach + contexte minimal de ton
  profil (objectif, niveau). PAS ton email, PAS tes mensurations
  identifiables.
- Privacy : https://www.anthropic.com/legal/privacy ou
  https://policies.google.com/privacy

---

## 5. Combien de temps gardons-nous tes données

- **Compte actif** : tant que ton compte existe
- **Compte inactif** (pas de connexion depuis 24 mois) : alerte par email
  puis suppression automatique après 36 mois
- **Compte supprimé par toi** : suppression immédiate de toutes les
  données dans les 30 jours (délai technique)
- **Logs anonymes** (Sentry, PostHog) : 90 jours
- **Données de facturation** : 10 ans (obligation légale fiscale)

---

## 6. Tes droits

Conformément au RGPD, tu disposes des droits suivants. Tu peux les exercer
à tout moment **directement dans l'application** ou en nous écrivant à
**hello@forga.fr** :

### 🔍 Droit d'accès (Article 15)
Demande-nous une copie de toutes les données que nous avons sur toi.
**Disponible en 1 tap dans l'app** : Profil → Paramètres → Exporter mes
données. Format JSON portable.

### ✏️ Droit de rectification (Article 16)
Modifie tes données personnelles à tout moment dans l'app : Profil →
Modifier le profil.

### 🗑️ Droit à l'effacement / "droit à l'oubli" (Article 17)
Supprime ton compte et toutes tes données.
**Disponible en 1 tap dans l'app** : Profil → Paramètres → Supprimer mon
compte. Suppression immédiate et irréversible.

### ⏸️ Droit à la limitation (Article 18)
Demande-nous de geler le traitement de tes données dans certaines
situations.

### 📤 Droit à la portabilité (Article 20)
Récupère toutes tes données dans un format structuré, lisible et
réutilisable. **Disponible en 1 tap** : Profil → Exporter mes données.

### 🚫 Droit d'opposition (Article 21)
Oppose-toi au traitement de tes données à des fins d'intérêt légitime
(notamment l'analyse PostHog). Écris-nous à hello@forga.fr et nous
désactiverons l'analytics pour ton compte.

### 📞 Droit de réclamation
Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL
(autorité française de protection des données) à
https://www.cnil.fr/fr/plaintes ou à l'autorité de protection de ton pays
de résidence dans l'UE.

---

## 7. Sécurité

### 7.1. Mesures techniques

- **Chiffrement en transit** : toutes les communications utilisent TLS 1.3
- **Chiffrement au repos** : base de données Supabase chiffrée AES-256
- **Mots de passe** : hashés avec bcrypt (jamais stockés en clair)
- **Authentification** : tokens JWT avec expiration courte, refresh tokens
- **Sign in with Apple** disponible pour authentification sans mot de passe

### 7.2. Limites

Aucun système n'est 100 % infaillible. En cas de violation de données qui
risquerait d'affecter tes droits et libertés, nous t'en informerons dans
les 72h conformément à l'article 33 du RGPD.

---

## 8. Mineurs

FORGA est interdit aux personnes de moins de **16 ans**. Cette limite est
appliquée dès l'onboarding (validation de l'âge requise). Si nous
apprenons qu'un mineur s'est inscrit en falsifiant son âge, nous
supprimerons son compte sans préavis.

Pour les 16-18 ans, nous recommandons fortement la supervision d'un parent
ou d'un professionnel de santé pour toutes les recommandations
nutritionnelles et d'entraînement.

---

## 9. Cookies (web uniquement)

L'app mobile ne dépose aucun cookie sur ton appareil.

Si tu utilises **forga.fr** dans un navigateur (futur), nous utiliserons :
- Des cookies essentiels au fonctionnement (session, sécurité)
- Aucun cookie publicitaire
- Aucun cookie de tracking tiers

---

## 10. Modifications de cette politique

Nous pouvons mettre à jour cette politique pour refléter des changements
légaux, techniques ou de fonctionnalités. En cas de **changement
substantiel** (nouvelle finalité, nouveau sous-traitant majeur), nous
t'en informerons par email **au moins 30 jours à l'avance**.

La date de "dernière mise à jour" en haut du document indique toujours
la version courante.

---

## 11. Contact

Pour toute question relative à cette politique ou à tes données :

**Email** : hello@forga.fr
**Courrier** : Paul Church, 2 allée Armand Praviel, 33000 Bordeaux, France

Nous nous engageons à répondre à toute demande légitime dans un **délai
maximum d'un mois** (article 12 du RGPD).
