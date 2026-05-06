# 🚀 Launch Kit FORGA

Tout ce qu'il faut pour soumettre l'app à l'App Review et aux autorités RGPD.

## Fichiers

| Fichier | Description | Où l'utiliser |
|---|---|---|
| `app-store-listing-fr.md` | Titre, sous-titre, description, mots-clés ASO (FR) | App Store Connect → Informations app FR-FR |
| `app-store-listing-en.md` | Idem en anglais | App Store Connect → en-US |
| `privacy-policy-fr.md` | Politique de confidentialité RGPD complète | À héberger publiquement sur `forga.fr/privacy` |
| `privacy-policy-en.md` | Idem en anglais | Idem |
| `terms-fr.md` | Conditions Générales d'Utilisation | `forga.fr/terms` |
| `terms-en.md` | Idem en anglais | Idem |
| `data-processors.md` | Liste sous-traitants RGPD avec finalités | Référence interne (registre Article 30) |

## ⚠️ Actions manuelles à faire avant launch

### Légal / administratif

- [ ] Récupérer ton SIRET / SIREN auto-entrepreneur (ou créer une société)
- [ ] Compléter le SIRET dans les fichiers `privacy-policy-*.md` et `terms-*.md`
  (cherche `*à compléter*`)
- [ ] Créer l'email `hello@forga.fr` (Google Workspace ~6 €/mois OU forwarding gratuit OVH/Gandi)
- [ ] Acquérir le domaine `forga.fr` s'il n'est pas encore à toi
- [ ] Créer un registre des activités de traitement (RGPD Article 30) basé sur `data-processors.md`
- [ ] Déposer la marque "FORGA" à l'INPI (~190 €, optionnel mais recommandé avant le launch)

### Hébergement web

Pour héberger les pages légales (Apple exige une URL publique pour la
Privacy Policy) :

**Option simple — Vercel + Markdown** :
1. Crée un repo GitHub `forga-web`
2. Y ajouter les 4 markdowns convertis en HTML simple (ou utilise
   [Notion publishing](https://notion.so) ou [Bear](https://bear.app/) → publish to web)
3. Connecter à Vercel (gratuit) → forga.fr/privacy, /terms

**Option simplissime — page Notion publique** :
1. Crée 4 pages Notion (privacy FR/EN, terms FR/EN)
2. Active "Publish to web" sur chacune
3. Mappe avec un domaine personnalisé `forga.fr` (Notion permet)
4. URLs finales : `forga.fr/privacy`, `forga.fr/terms`

**Option pro — Webflow / Framer** :
Si tu veux une vraie landing page en plus, Webflow (~14 $/mois) ou Framer
(plan gratuit avec custom domain) te donnent un site complet en 1-2 jours.

### App Store Connect (à faire le jour de la soumission)

- [ ] Coller `app-store-listing-fr.md` dans la fiche app FR-FR
- [ ] Coller `app-store-listing-en.md` dans la fiche app en-US
- [ ] Coller l'URL `forga.fr/privacy` dans le champ "Privacy Policy URL"
- [ ] Cocher l'âge **17+**
- [ ] Cocher la catégorie **Health & Fitness**
- [ ] Préparer **6-10 captures d'écran** (voir specs dans `app-store-listing-fr.md`)
- [ ] Préparer **App Preview vidéo** (15-30 sec, optionnel mais boost ASO)
- [ ] Remplir le **DSA trader info** (déjà partiellement fait dans Business)

### Privacy nutrition labels (App Store Connect → Privacy)

À cocher dans App Store Connect → ton app → App Privacy :

| Catégorie | Données | Lié à l'utilisateur ? | Utilisé pour tracking ? |
|---|---|---|---|
| **Contact Info** | Email | Oui | Non |
| **User Content** | Photos | Oui | Non |
| **User Content** | Other (workouts, meals) | Oui | Non |
| **Identifiers** | User ID | Oui | Non |
| **Usage Data** | Product Interaction | Oui | Non |
| **Diagnostics** | Crash Data | Non | Non |
| **Diagnostics** | Performance Data | Non | Non |
| **Health & Fitness** | Fitness | Oui | Non |
| **Health & Fitness** | Health (si Apple Health activé) | Oui | Non |

⚠️ **Aucune donnée n'est utilisée pour du tracking publicitaire.** C'est un
gros différenciateur vs MyFitnessPal/Yazio qui doivent cocher "Used for
tracking" sur plusieurs catégories.

## Avant la soumission App Review — checklist finale

- [ ] Tous les liens dans l'app pointent vers les bons URLs publics
  (`forga.fr/privacy`, `forga.fr/terms`)
- [ ] Le formulaire de contact `hello@forga.fr` répond (test : envoie un email,
  vérifie réception)
- [ ] L'app contient un disclaimer santé visible (déjà fait dans
  `step1-identity.tsx`)
- [ ] Bouton "Restore Purchases" fonctionne dans le paywall
- [ ] Le bouton "Delete account" fonctionne et supprime vraiment toutes les
  données dans Supabase
- [ ] Le bouton "Export my data" génère un JSON complet
- [ ] Tous les onboarding steps fonctionnent même offline
- [ ] Le mode Free est utilisable (pas de plantage à la 6ème validation de repas)
- [ ] Les paywalls s'ouvrent bien quand on hit une limite Free

## Délais réalistes

- **Hébergement pages légales** : 1 jour
- **Création des screenshots** : 2-3 jours (le plus chronophage)
- **Soumission App Review** : 1 jour de prep
- **Review Apple** : 24-72h en moyenne (parfois rejet → corriger → resoumettre)
- **Total prêt-à-publier** : compter **1 semaine** entre la décision de
  lancer et la disponibilité publique sur l'App Store
