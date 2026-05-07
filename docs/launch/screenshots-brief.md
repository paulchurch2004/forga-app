# Brief Screenshots App Store — FORGA v1

10 frames pour la fiche App Store, optimisés conversion (vs juste "joli").
Spec Apple 2026 :
- **iPhone 6.7"** : 1290 × 2796 px (iPhone 15 Pro Max et plus récent) — **OBLIGATOIRE**
- iPhone 6.5" : 1242 × 2688 px (legacy, optionnel)

Apple n'exige plus que les 6.5" depuis SDK 14. Concentre-toi sur **6.7" uniquement** — gain de temps × 2.

---

## 🎨 Style général

- **Background** : dégradé radial sombre `#07070D` → `#1a0c08` (couleurs FORGA), centré derrière le device
- **Device frame** : iPhone 15 Pro mockup, légèrement incliné (-5°), ombre douce
- **Overlay text** : police FORGA display (Outfit Bold), taille **80-100pt** pour le titre, **40pt** pour le sous-titre
- **Couleur titre** : blanc pur `#FFFFFF`
- **Couleur accent** : orange FORGA `#FF6B35` pour 1-2 mots clés par frame (technique "highlight word")
- **Layout** : titre + sous-titre **EN HAUT** (pas en bas — Apple recommande le haut depuis 2025 pour mieux survivre au crop sur les listes "Discover")

**Outils recommandés** :
1. **Figma** + plugin "Shottr" ou "AppMockUp" → import direct des screenshots
2. **Rotato** (Mac, $30) → mockups 3D avec animations si tu fais aussi un App Preview
3. **Screenshots.pro** ($29/mois) → templates prêts si tu veux aller vite

---

## 📋 Les 10 frames (ordre prioritaire)

### Frame 1 — Hero / Promesse
**Titre** : Ton coach nutrition + sport
**Accent** : "coach"
**Sous-titre** : 100 % francophone, sans pub
**Capture à prendre** : Home tab après un onboarding complet, score FORGA visible (~75/100), quelques repas validés, streak à 5+ jours.
**Pourquoi en 1er** : c'est la frame que 80% des users verront sur Discover. Doit communiquer la value prop en 0.5s.

---

### Frame 2 — Score FORGA
**Titre** : Ta progression, en un chiffre
**Accent** : "un chiffre"
**Sous-titre** : 6 piliers : repas, protéines, hydratation, séances, sommeil, régularité
**Capture** : Home avec score FORGA en grand (cercle ou jauge), ses 6 sous-scores en breakdown, animation gauges si possible
**Pourquoi** : différenciateur vs MyFitnessPal qui n'a pas de score unifié

---

### Frame 3 — Plan d'entraînement
**Titre** : Un plan qui s'adapte à toi
**Accent** : "à toi"
**Sous-titre** : 23 programmes, 3-6 séances/semaine
**Capture** : Onglet Plan avec calendrier de la semaine, séance du jour highlightée, exercices listés en preview
**Pourquoi** : capture le côté "training app" — concurrence Strong/Hevy

---

### Frame 4 — Séance live + 1RM
**Titre** : Le bon poids, à chaque série
**Accent** : "à chaque série"
**Sous-titre** : 1RM Epley calculé en temps réel + suggestions next-set
**Capture** : Active-workout en cours, exercice avec timer de repos circulaire visible, badge "Suggéré : 80kg" sur le prochain set
**Pourquoi** : signature feature, justifie le Premium

---

### Frame 5 — Repas validés + macros
**Titre** : Tes macros, sans calculs
**Accent** : "sans calculs"
**Sous-titre** : 500+ repas pré-calculés, validation en 1 tap
**Capture** : Détail d'un repas avec pie chart macros, ingrédients listés, gros bouton "Valider ce repas"
**Pourquoi** : démo concrète vs photos abstraites

---

### Frame 6 — Coach IA contextuel
**Titre** : Un coach qui te connaît
**Accent** : "qui te connaît"
**Sous-titre** : Conseils personnalisés selon ton profil, ton historique, ton humeur
**Capture** : Chat coach style iMessage avec 2-3 messages échangés, dont un message coach contextuel ("Tu as 35g de protéines à rattraper. Le poulet de ce soir est ton allié.")
**Pourquoi** : LE différenciateur IA — feature la plus marketable

---

### Frame 7 — Volume par muscle
**Titre** : Vois ton corps évoluer
**Accent** : "ton corps"
**Sous-titre** : Volume hebdo par groupe musculaire, équilibre auto
**Capture** : Onglet stats avec barres orange pour chaque muscle (pectoraux, dos, quadriceps, etc.) sur la dernière semaine
**Pourquoi** : data viz qui rassure les serious lifters

---

### Frame 8 — Photos de progression
**Titre** : Avant / Après, toi-même juge
**Accent** : "toi-même juge"
**Sous-titre** : Comparateur side-by-side, 8 points corporels suivis
**Capture** : Écran progress photos avec 2 photos côte-à-côte (mockup, pas de vraies photos), date/poids overlay
**Pourquoi** : visuel ultra-fort, génère la conversion émotionnelle

---

### Frame 9 — Streaks + badges
**Titre** : Reste régulier, gagne des trophées
**Accent** : "régulier"
**Sous-titre** : Streaks nutrition + entraînement, 12 badges à débloquer
**Capture** : Profil avec streak en flammes (ex: 23 jours), 4-5 badges débloqués visibles
**Pourquoi** : ressort retention/engagement — important pour le métier

---

### Frame 10 — Premium pitch
**Titre** : 7 jours gratuits, puis 5 €/mois
**Accent** : "5 €/mois"
**Sous-titre** : 1/2 prix de MyFitnessPal, 100x plus de valeur
**Capture** : Paywall avec table Free vs Premium claire (8 features cochées Premium, 3 cochées Free)
**Pourquoi** : ASO + clarté pricing dès la fiche store, réduit la friction du paywall in-app

---

## 🎬 App Preview Vidéo (optionnel mais boost ASO +30%)

Format : 15-30 secondes, 1080×1920 px (portrait 9:16), MP4 H.264

**Storyboard recommandé (20 sec)** :
- 0-2s : Logo FORGA fade in sur fond noir
- 2-5s : Frame 1 (Hero) avec voix off "Ton coach perso, en français"
- 5-9s : Frame 4 (séance) avec animation tap "Valider série"
- 9-13s : Frame 6 (coach IA) avec message qui apparaît + voix coach
- 13-17s : Frame 10 (paywall) avec hover sur "5 €/mois"
- 17-20s : CTA final "Disponible sur l'App Store" + logo

**Outils** :
- **Rotato** ($30 one-time) : mockups 3D animés
- **Screen Studio** ($89 one-time) : screencast mac avec auto-zoom
- **CapCut** (gratuit) : montage final + voix off + sous-titres

---

## 📐 Templates Figma à réutiliser

Frame Figma à créer (1 fichier, 10 pages) :

```
[ Background: gradient radial #07070D → #1a0c08 ]
  └─ [ Title overlay: top 20%, Outfit Bold 96pt, white + #FF6B35 accent word ]
  └─ [ Subtitle: below title, Outfit Medium 40pt, white 80% opacity ]
  └─ [ Device mockup: iPhone 15 Pro, scale 0.85, rotate -5°, shadow blur 60 opacity 30% ]
       └─ [ Screenshot inside frame ]
  └─ [ Optional: small FORGA logo bottom-right, opacity 50% ]
```

Si tu veux gagner 1 jour : utilise [Previewed.app](https://previewed.app) ou [AppMockUp.com](https://appmockup.com) — drag & drop tes screenshots, ils auto-génèrent les frames Apple-spec en 5 min.

---

## ⏱️ Estimations temps

| Tâche | Temps |
|---|---|
| Captures brutes des 10 écrans (depuis TestFlight) | 30 min |
| Création template Figma | 1h |
| Design des 10 frames finales | 2-3h |
| Export PNG 1290×2796 | 15 min |
| Upload App Store Connect | 30 min |
| **Total** | **4-5h** |

Tu peux faire ça en 1 demi-journée si tu es focus.

---

## 🚫 Erreurs courantes à éviter

1. **Trop de texte** : max 8 mots par titre. Apple favorise les screenshots qui se lisent en 0.5s.
2. **Trop de captures** : 5-6 frames suffisent vraiment, plus = dilue l'attention. Si tu mets les 10, ordonne du plus convertissant au moins.
3. **Mockups génériques** : pas de iPhone qui flotte sans fond — montre toujours du contexte (ombre, gradient, mood).
4. **Captures bruts non-stylées** : Apple les accepte mais ça fait amateur. Toujours overlay un titre.
5. **Inclure des emojis dans le titre** : Apple les rejette parfois en review. Évite.
6. **Promettre des features pas dispo** : ne montre pas le coach IA si la version v1 n'a que les templates. Apple peut rejeter pour "misleading screenshots".
7. **Timestamps figés sur l'iPhone mockup** : utilise toujours **9:41** dans la status bar (timestamp Apple officiel) pour les mockups.

---

## 📦 Checklist export final

Avant d'uploader sur App Store Connect :

- [ ] 10 PNG en 1290×2796 px exact
- [ ] Aucun PNG > 8 MB (réduire qualité si nécessaire)
- [ ] Pas de captures privées visibles (numéros de téléphone, données réelles d'un autre user)
- [ ] Status bar à 9:41, batterie 100%, pas de Wi-Fi/5G visible (utilise le mode démo iOS)
- [ ] Localisations EN également générées si tu cibles US/UK (sinon FR-FR suffit)
- [ ] Order = ordre de conversion (frame 1 = hero, frame 10 = paywall)
