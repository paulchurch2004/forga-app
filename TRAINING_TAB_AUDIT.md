# AUDIT EXHAUSTIF : ONGLET ENTRAÎNEMENT (FORGA App)

**Date de l'audit :** 29 avril 2026  
**Version analysée :** React Native + Expo + Zustand (asyncStorage)  
**Scope :** Tab Training complet (planification, logging, live workout, résumé)  

---

## EXECUTIVE SUMMARY

### État global
L'onglet Entraînement offre une **expérience d'entraînement bien structurée et usable**, mais avec des **lacunes majeures** dans les mécaniques d'engagement et le suivi progressif avancé. La séance en direct (active-workout.tsx) est le point fort ; le logging manuel et la fin de séance excellent ; la progression et les insights manquent.

### Blockers (P0)
- ❌ **Aucun calcul de 1RM** (ni Epley, ni Brzycki) → impossible de proposer des charges intelligentes
- ❌ **Pas de détection d'échec** → pas de "deload" automatique
- ❌ **Aucune suggestion de surcharge** (type "+2.5kg") → progression manuelle uniquement
- ❌ **Pas de guide d'échauffement** avant la séance
- ❌ **Aucune notification de fin de repos** (vibration/son) → le timer est silencieux

### Features majeures manquantes (P1)
- ⚠️ **Pas de streak entraînement** (existe dans les meals mais pas ici)
- ⚠️ **Pas de badges/jalons** (10 séances, 30j streak, etc.)
- ⚠️ **Graphique 1RM dans le temps** inexistant
- ⚠️ **Pas de RPE/RIR post-exercice** (ressenti de difficulté)
- ⚠️ **Pas de notes de séance** ou "comment je me sens"
- ⚠️ **Pas de comparaison inter-sessions** (volume, durée)
- ⚠️ **Aucun swap d'exercice pendant la séance** (feature en planning, pas live)

### Ce qui marche très bien (✅)
- ✅ **Planning program** : 16 programmes, 8 semaines, interface claire
- ✅ **Logging d'une séance** : 1-3 taps/set, auto-préfill charge précédente
- ✅ **Timer de repos** : calc auto basé sur objectif/reps, skippable, avec raison (i18n)
- ✅ **Démos d'exercices** : GIFs intégrés, bouton "Démo vidéo" + "Forme"
- ✅ **Swap d'exercice en planning** : liste de 3-5 substituts intelligents
- ✅ **Fin de séance** : cérémonie "Session Forgée", stats volume/durée, finisher cardio
- ✅ **Détection PR** : alerte visuelle, banner "NOUVEAU RECORD !", haptic success
- ✅ **Coach IA live** : 4 types (form/rest/push/swap), aléatoire, modal avec actions

---

## 1. LOGGING D'UNE SÉANCE

### ✅ Ce qui marche

#### 1.1 — Entrée utilisateur (active-workout.tsx)

**Interface SetCardV2** (`src/components/training/SetCardV2.tsx`, lignes 1-218)
- **État du set** : 3 états visuels (done/current/upcoming) avec couleurs cohérentes
  - `done` : vert turquoise (#00D4AA), checkmark SVG
  - `current` : orange (#FF6B35), bouton "VALIDER"
  - `upcoming` : gris transparent
- **Champs éditables** : `weight` (kg) et `reps` (nombres)
- **Auto-focus** : au set courant, les inputs sont éditables
- **Validation** : un seul tap sur "VALIDER" pour confirmer le set → `toggleSet(exIdx, setIdx)`

**Process de logging** (active-workout.tsx, lignes 294-374)
1. User rentre poids/reps dans les 2 TextInput (free-form text, sans clavier modal)
2. User tap "VALIDER" → `toggleSet()` appelé
3. **1 set = 1 tap** minimum (si validation réussit)
4. **Auto-prefill** : charge de la dernière séance inject via `getLastSessionForExercise()` (trainingStore, ligne 141)
   - À chaque exercice, la charge du dernier workout est pré-remplie en string

**Exemple pour Bench Press**
```
Set 1 : [___] kg  [___] reps  [VALIDER]
Set 2 : [___] kg  [___] reps  (disabled)
Set 3 : [___] kg  [___] reps  (disabled)
```
→ Après validation set 1, Set 2 devient editable, Set 1 devient "done" avec ✓ vert

**Taps pour 1 set complet**
- Édition poids : 1 tap (focus TextInput) + typing
- Édition reps : 1 tap (focus TextInput) + typing
- Validation : 1 tap (VALIDER)
- **Total : 3 taps (focus poids, focus reps, valider)** pour un set basique

#### 1.2 — Édition post-validation
- ❌ **BLOQUÉ** : Une fois le set validé (completed = true), les inputs deviennent **read-only**
- `SetCardV2`, lignes 103-115 : `editable={isCurrent}` → une fois pas courant, plus éditables
- Si user fait erreur, il doit déjà avoir modifié AVANT de valider
- **Une fois validé, le set est immuable pour cette séance**

#### 1.3 — Skip d'exercice
- ✅ **EXISTE** : Vous pouvez laisser des exercices incomplets et finir la séance
- `active-workout.tsx`, lignes 398-439 : `allDone` est calculé par `completedExercises === totalExercises`
- **Si pas tout complété**, un modal de confirmation s'affiche : "Êtes-vous sûr ?"
- À la fin, la séance est enregistrée **avec les exos qu'on a faits**
- `workoutExercises` (ligne 444-457) = filtre sur `ex.sets.some(s => s.completed)`

#### 1.4 — Annulation de séance
- ✅ **EXISTE** : Bouton back (ligne 527) = close + confirmation si tu as du progrès
- `handleBack()`, lignes 377-391 : si `elapsedSeconds > 30` OU sets complétés, affiche modal
- "Tu veux vraiment quitter ? Tu perdras ta séance." → Cancel / Quitter
- Si tu quitter sans rien faire, pas de modal
- **Aucun auto-save** : tout ce qui est fait est perdu si tu quitter sans finir

---

## 2. CALCUL 1RM + SURCHARGE PROGRESSIVE

### ❌ Ce qui manque complètement

#### 2.1 — Calcul de 1RM
- **ABSENT** : Aucune fonction Epley ou Brzycki
- Fichier `trainingStore.ts` : méthodes `getPersonalRecord()` (ligne 23) et `isNewPR()` (ligne 24) existent
- Mais `getPersonalRecord()` retourne juste `{ weight, reps, date }` — **pas de calcul 1RM théorique**
- Implémentation (lignes 189-201 dans trainingStore.ts) : 
  ```typescript
  getPersonalRecord: (exerciseId) => {
    // Loop through all sets, find max weight
    // Return { weight, reps, date }
  }
  ```
- **Aucune formule estimée**

#### 2.2 — Suggestion de surcharge (+2.5kg)
- ❌ **INEXISTANT** : Pas de logique "si toutes les reps ont été validées → +2.5kg"
- Au lieu de ça, la charge précédente est simplement recopiée
- `active-workout.tsx`, lignes 259-272 : smart weight suggestion
  ```typescript
  const allRepsHit = lastSession.every((s) => s.reps >= adjustedReps);
  if (allRepsHit) {
    const increment = isCompound ? 2.5 : 1;
    suggestedWeight = lastWeight + increment;
    weightTip = `+${increment}kg vs last`;
  }
  ```
- ✅ **OK, ça existe** : il y a une logique de détection "all reps hit" et suggestion d'incrément
- Affichée via `weightTip` sous le nom de l'exo (ligne 285)
- Mais c'est **juste un conseil textuel**, pas appliqué auto

#### 2.3 — Détection d'échec
- ❌ **ABSENT** : Pas de "tu as fait 6/8 reps sur 3 sets → deload de 5%"
- La logique existe pour détecter `allRepsHit`, mais zéro pour l'inverse
- Aucun deload suggestion système

#### 2.4 — Affichage "75% de ton max = 80kg"
- ❌ **ABSENT** : Vous ne voyez jamais "ton 1RM estimé est 130kg, ce set devrait être ~97kg (75%)"
- Seulement "Dernière fois : 80kg × 8" + "Trend +2.5kg si toutes reps" en texte

### ⚠️ Partiellement implémenté

**Weight Tip System** (active-workout.tsx, lignes 256-272)
- Si c'est la première fois : suggest poids par défaut (10kg isolation, 20kg compound)
- Si `allRepsHit` au dernier workout : +2.5kg pour compound, +1kg isolation
- Sinon : "Même charge que la dernière" (i18n `weightTipSameWeight`)
- Texte affiché en italique sous l'exo (ligne 1157-1164)

---

## 3. TIMER DE REPOS

### ✅ Ce qui marche très bien

#### 3.1 — Timer auto-déclenché
- ✅ **OUI** : À chaque set complété, le timer se déclenche automatiquement
- `toggleSet()` ligne 343-362 : après validation, appelle `startRestTimer(config.restSeconds)`
- Pas besoin de taper un bouton, c'est auto

#### 3.2 — Durée calculée intelligemment
- ✅ **OUI** : Via `restEngine.ts` (lignes 1-90)
- Input : `exerciseId`, `targetReps`, `objective`
- Logic :
  ```
  1-5 reps (force) : 180s compound / 120s isolation
  6-8 reps (heavy hypertrophy) : 120s / 90s
  9-12 reps (hypertrophy) : 90s / 75s
  13+ (endurance) : 60s
  
  + objectiveModifier :
    bulk → +15s
    cut → -15s
    recomp → -10s
  
  Min 45s, transition +30s (max 180s)
  ```
- Excellent système

#### 3.3 — Rest timer UI
- ✅ **EXISTE** : `RestCircleTimer` (src/components/training/RestCircleTimer.tsx, lignes 1-153)
- **Affichage SVG animé** : cercle orange (#FF6B35) qui se vide
- **Countdown textuel** : affiche les secondes restantes
- **Raison i18n** : affiche la clé comme "Reconstitution phosphocréatine" (configurable par lang)
- **Skippable** : bouton "Skip" visible, `onSkip()` appelé

#### 3.4 — Notif/vibration de fin
- ⚠️ **PARTIELLEMENT** :
  - ✅ Haptic feedback : `triggerHaptic('medium')` appelé ligne 217
  - ❌ Pas de son (notification audio)
  - ❌ Pas de vibration complète (juste l'impact feedback léger)
  - ❌ Pas de notification système

#### 3.5 — Transition rest (entre exos)
- ✅ **OUI** : après tous les sets d'un exo, un rest "transition" s'enclenche
- Durée plus longue (transitionSeconds = restSeconds + 30, capped 180s)
- Label différent : `restTransition` key
- Code ligne 352-356

### ⚠️ Timer ajustable ?
- ❌ **NON** : Vous ne pouvez pas augmenter/réduire le temps restant
- Le timer est strictement calculé par le moteur `restEngine`, immuable

---

## 4. DÉMOS D'EXERCICES

### ✅ Ce qui marche

#### 4.1 — GIFs affichés pendant la séance
- ✅ **OUI** : `ExerciseDemoCard` (lignes 1-109)
- Componant affiché entre l'en-tête exercice et les sets
- Image GIF chargée depuis `gifUrl` de `EXERCISES` (data/exercises.ts)
- Fallback image si pas de GIF

#### 4.2 — Exécution des GIFs
- ✅ **PRESQUE** : Le bouton "Démo vidéo" existe (ligne 36-40)
- Tap → `onPlayDemo()` → `setTutorialExerciseId(exo.exerciseId)`
- Ouvre une `ExerciseTutorialModal` (ligne 674-678)
- Mais la modal elle-même affiche **pas le GIF**, affiche juste un texte de tuto

#### 4.3 — Cues d'exécution
- ✅ **OUI** : `FormCuesCard` (src/components/training/FormCuesCard.tsx, lignes 1-68)
- Affiche 3 cues techniques par exo (stockées dans `FORM_CUES` hardcodées, ligne 52-93)
- Exemple pour Bench Press :
  ```
  1. Dos plaqué, omoplates serrées
  2. Pieds ancrés, fessiers contractés
  3. Descente contrôlée · 2 sec
  ```
- Style numéroté avec index en orange (#FF6B35)

#### 4.4 — Interface des démos
- ✅ Bouton "Démo vidéo" : play icon + texte
- ✅ Bouton "Forme" : sparkle icon + texte
- Les 2 affichés en bas de la demo card image (overlay dark)
- Tous les exos n'ont **pas un GIF** (voir exercises.ts) : certains sont vides (skull_crushers, pendlay_row, etc.)

---

## 5. SWAP D'EXERCICE

### ⚠️ Partiel : existe en PLANNING, pas en LIVE

#### 5.1 — Feature en planning (avant la séance)
- ✅ **EXISTE** : Dans l'onglet Training (training.tsx, lignes 706-715)
- Un `ReplaceExerciseSheet` permet de swap un exo de la séance du jour
- Affiche une liste de 3-5 substituts avec un **score de correspondance** (80%, 92%, 95%)
- Code : fonction `buildSubstitutesFor()` (lignes 753-784) qui mappe exo → substituts hardcodés

#### 5.2 — Substituts intelligents
- ✅ **OUI** : Ex. pour Bench Press :
  ```
  - Incline DB Press (95% match)
  - Incline Barbell (92%)
  - Dips Chest (78%)
  - Cable Fly (65%)
  ```
- Match score = couleur du badge (vert ≥90%, jaune ≥75%, orange <75%)

#### 5.3 — Swap pendant la séance (active-workout)
- ❌ **INEXISTANT** : Pas de bouton "remplacer cet exo" pendant que tu es en train de faire la séance
- Vous devez terminer la séance, revenir en arrière, changer l'exo, relancer
- **Looping pain**

#### 5.4 — Mémorisation du swap
- ✅ **OUI** : via `programStore` action `replaceExerciseInDay(date, origId, newId)`
- Le swap est **persisté** dans le plan
- Affecte les séances futures (tant que vous êtes dans le plan)

---

## 6. ÉCHAUFFEMENT

### ❌ Quasi-inexistant

#### 6.1 — Mini-checklist pre-séance
- ❌ **ABSENT** : Pas de "tu as fait tes 5 min cardio ?" ou échauffement guidé
- La séance démarre direct avec le 1er exercice

#### 6.2 — Sets de mise en route
- ⚠️ **ABSENT** : Pas de sets "dynamiques" pré-générés (genre 2×10 reps à 50% avant les vrais sets)
- Vous faites les sets comme prévus, point

#### 6.3 — Mobilité dynamique
- ❌ **ABSENT** : Aucun contenu de mobilité (vids, cues)

#### 6.4 — First workout guide
- ✅ **EXISTE** : Une modal "Workout Guide" s'affiche **une seule fois jamais** (mémoisée en AsyncStorage)
- Code : lignes 199-204, 747-782
- Affiche 4 étapes avec emojis et textes (step 1-4)
- **Seulement au 1er workout global**

---

## 7. NOTES / RESSENTI

### ❌ Rien n'existe

#### 7.1 — Note de séance (1-5 stars)
- ❌ **ABSENT**

#### 7.2 — RPE / RIR après exo
- ❌ **ABSENT** : Pas de "how hard was that?" de 1-10

#### 7.3 — Note libre
- ⚠️ **PARTIELLEMENT** : Dans le logging manuel (log-workout.tsx, lignes 166-178)
  ```
  [Note libre multiline TextInput]
  ```
- Mais **seulement pour les séances manuelles** (non-musculation ou ad-hoc)
- **Pas pour les séances plannifiées dans active-workout.tsx**

---

## 8. FIN DE SÉANCE

### ✅ Ce qui marche très bien

#### 8.1 — Cérémonie "Session Forgée"
- ✅ **EXISTE** : `SessionForgee` (src/components/training/SessionForgee.tsx, lignes 1-412)
- Affichage **ultra polishe** : animations 3 phases
  - Phase 0 (1.2s) : "en cours de forgeage..." (heating)
  - Phase 1 (1.2-2.4s) : animation du logo (strike)
  - Phase 2 (2.4s+) : révélation des stats + PR si applicable
- Affiche :
  - **Durée totale** en min
  - **Volume total** en kg (sum(weight × reps))
  - **Nombre de PR** (toujours 0 car pas de détection multi-set PR, juste le 1er)

#### 8.2 — Récap de performance
- ✅ **OUI** : Chaque stat en carte séparée (durée/volume/PR)
- Très visuel, orange/white theme

#### 8.3 — Comparaison avec la séance précédente
- ❌ **ABSENT** : Vous ne voyez jamais "ton volume +150kg vs dernier Bench"

#### 8.4 — Suggestion pour la prochaine fois
- ❌ **ABSENT** : Aucun message du style "prochaine fois, essaie +5kg au squat"

#### 8.5 — Message du coach IA
- ⚠️ **ABSENT dans la séance** : Le coach IA (`coachEngine.ts`) génère des messages **pour l'onglet Meals**, pas pour Training
- La modal `LiveCoachIntervention` déclenche **pendant** la séance (ligne 796-803), pas à la fin
- Les 4 types de coach (form/rest/push/swap) sont aléatoires, pas contextuels à ta performance

#### 8.6 — Finisher cardio
- ✅ **EXISTE** : Après `SessionForgee`, affiche une modal avec 3 niveaux de finisher
  - Beginner : 10 min
  - Intermediate : 15 min
  - Advanced : 20 min
- Timer visible, skippable
- Code : lignes 681-745 dans active-workout.tsx

---

## 9. PROGRESSION VISUELLE

### ❌ Manque quasi complet

#### 9.1 — Graphique 1RM dans le temps
- ❌ **ABSENT** : Aucune implémentation graphique
- Écran `/exercise-progress` existe (workout-detail.tsx, ligne 82) mais on sait pas ce qu'il affiche

#### 9.2 — Volume hebdo par groupe musculaire
- ❌ **ABSENT** : `StatsSheet` (training.tsx) affiche volume hebdo global, pas par muscle

#### 9.3 — Progress indicator ("Semaine 3/8, Séance 2/4")
- ✅ **PARTIELLEMENT** : 
  - "Semaine X/8" affiché dans le hero (training.tsx, ligne 301)
  - Pas de "séance 2/4" visible

#### 9.4 — PRs récents
- ⚠️ **MINIMAL** : Seul le PR le plus récent est détecté (getPersonalRecord retourne 1 seul)
- Pas de liste des 5 derniers PRs
- Pas de "PRs cette semaine" badge

---

## 10. MÉCANIQUES D'ENGAGEMENT

### ❌ Quasi-inexistant

#### 10.1 — Streak entraînement
- ❌ **INEXISTANT** dans Training
- Existe pour Meals (`coachEngine.ts`, lignes 72-83, 122-144) mais **pas plugué à Training**
- Aucune logique de "tu as entrainé 5 jours de suite"

#### 10.2 — Badges/jalons
- ❌ **ABSENT** : Pas de "🏆 10 séances" ou "🔥 30 jours"

#### 10.3 — PR celebrations
- ✅ **PARTIELLEMENT** :
  - Banner "NOUVEAU RECORD !" (ligne 630-635) quand tu valides un set > PR
  - Gold banner (#FFD700), emoji 🏆, haptic success
  - **Mais** : pas de son, animation discrète

#### 10.4 — Comparaison communauté
- ❌ **ABSENT** : Zero leaderboards

---

## 11. MODE OFFLINE + SYNC

### ✅ Fonctionne

#### 11.1 — Logging offline
- ✅ **OUI** : Tout est sauvegardé en AsyncStorage via Zustand `persist` middleware
- `trainingStore.ts` ligne 29-30 : `persist((set, get) => ({...}))`
- Séances enregistrées offline

#### 11.2 — Sync queue
- ⚠️ **SIMPLE** : Pas de queue élaborée
- À la fin d'une séance, appel direct `syncWorkout(workout, userId)` (active-workout.tsx, ligne 416, 470)
- Si offline, Supabase call fail, mais séance est déjà en AsyncStorage

---

## 12. LIVE COACH PENDANT LA SÉANCE

### ✅ Existe mais rudimentaire

#### 12.1 — 4 types confirmés
- ✅ **OUI** : `LiveCoachKind = 'form' | 'rest' | 'push' | 'swap'`
- Chacun a des textes i18n uniques (`liveCoachFormTag`, etc.)
- Code : lignes 18-25 dans LiveCoachIntervention.tsx

#### 12.2 — Déclenchement
- ⚠️ **ALÉATOIRE** : Lance au 2e set de chaque exo (`setIdx === 1`)
- Code : lignes 365-370 dans active-workout.tsx
  ```typescript
  if (setIdx === 1 && !liveCoachShownRef.current.has(ex.exerciseId)) {
    const kinds: LiveCoachKind[] = ['form', 'rest', 'push', 'swap'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    setTimeout(() => setLiveCoach(kind), 800);
  }
  ```
- **Pas contextuels** : Lance aléatoirement, peu importe ta performance
- Une seule fois par exercice (tracked in Set)

#### 12.3 — UI
- ✅ **TRÈS POLISH** : Modal avec avatar animé pulsing, gradient, close button
- Affiche tag/title/body + 2 buttons ("Plus tard" / action CTA)
- Dismiss possible

#### 12.4 — Utilité
- ⚠️ **LIMITÉE** : Messages génériques, pas adaptés à ta situation
- Ex. "Contrôle ta forme" peu importe si tu fais 3/10 ou 9/10 reps

---

## FICHIERS CLÉS : RÉFÉRENCE COMPLÈTE

### Core Screens
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `app/(tabs)/training.tsx` | 1-871 | Dashboard : planning + selected day + history |
| `app/active-workout.tsx` | 1-1309 | Séance en cours : logging + timer + coach |
| `app/log-workout.tsx` | 1-326 | Logging manuel (cardio + musculation libre) |
| `app/workout-detail.tsx` | 1-100+ | Récap d'une séance complétée |

### Stores
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `src/store/trainingStore.ts` | 1-150+ | Workouts (CRUD + queries) |
| `src/store/programStore.ts` | 1-150+ | Active plan + completed days + overrides |

### Hooks
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `src/hooks/useProgram.ts` | 1-83 | Active plan state + suggestions |
| `src/hooks/useTraining.ts` | 1-88 | Weekly stats + history |

### Engines
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `src/engine/restEngine.ts` | 1-90 | Calcul durée de repos intelligent |
| `src/engine/coachEngine.ts` | 1-402 | Messages coach (pour Meals, pas Training) |

### Components (training/)
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `src/components/training/SetCardV2.tsx` | 1-218 | Card pour 1 set (editable) |
| `src/components/training/RestCircleTimer.tsx` | 1-153 | Timer visuel animé |
| `src/components/training/SessionForgee.tsx` | 1-412 | Cérémonie fin de séance |
| `src/components/training/ExerciseDemoCard.tsx` | 1-109 | Image GIF + démo buttons |
| `src/components/training/FormCuesCard.tsx` | 1-68 | 3 cues techniques |
| `src/components/training/ExerciseHeader.tsx` | 1-102 | Title + last perf + trend |
| `src/components/training/PrNearAlert.tsx` | 1-86 | Alert si PR approche |
| `src/components/training/ReplaceExerciseSheet.tsx` | 1-110+ | Modal de swap d'exo |

### Components (coach/)
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `src/components/coach/LiveCoachIntervention.tsx` | 1-289 | Modal coach avec 4 types |

### Data
| Chemin | Lignes | Rôle |
|--------|--------|------|
| `src/data/exercises.ts` | 1-80+ | 50+ exos + GIFs + isCompound |
| `src/data/programs.ts` | (non lu) | 16 programmes 8 semaines |

---

## SYNTHÈSE PRIORISÉE

### 🔴 P0 : BLOCKERS (sans ça, l'app n'est pas complète en gym)

1. **Pas de calcul 1RM estimé**
   - Impact : Impossible proposer charges intelligentes, user perte de temps à deviner
   - Fixe : Ajouter Epley `(weight * reps / 30) + weight` dans trainingStore
   - Effort : 1-2h (formule + tests)

2. **Pas de détection d'échec + deload**
   - Impact : Progression aveugle, risque plateau/overtraining
   - Fixe : Ajouter logique "si <50% des reps sur un set → flag échouée"
   - Effort : 2-3h

3. **Pas de notification de fin de repos**
   - Impact : User n'entend pas que le timer est fini, continue à attendre
   - Fixe : `expo-notifications` ou Audio API pour son court
   - Effort : 30 min

4. **Aucun swap d'exo en LIVE**
   - Impact : User doit arrêter la séance, retourner en arrière, changer, relancer
   - Fixe : Ajouter bouton "Remplacer" en `active-workout.tsx`, modal inline
   - Effort : 2-3h

5. **Pas de guide échauffement**
   - Impact : User ne sait pas comment warm up, risque blessure
   - Fixe : Modal pre-séance avec checklist (cardio 5min, dynamic stretching, sets légers)
   - Effort : 2h

### 🟡 P1 : IMPORTANT (qualité d'usage)

1. **Streak entraînement**
   - Pluguer la logique de streak depuis coachEngine à trainingStore
   - Display dans training.tsx hero
   - Effort : 2h

2. **Badges/jalons**
   - Trigger sur certains seuils (10, 30, 50, 100 séances ; 7, 14, 30 jours streak)
   - Toast ou small celebration
   - Effort : 3h

3. **Graphique 1RM dans le temps**
   - Implémenter écran `/exercise-progress` avec LineChart (react-native-chart-kit)
   - Effort : 4-5h

4. **RPE/RIR post-exercice**
   - Pop-up "how hard was that?" de 1-10 après chaque exo
   - Store en `trainingStore.exerciseRatings`
   - Effort : 2h

5. **Notes de séance**
   - Ajouter TextInput dans la modal de fin (après SessionForgee)
   - Store dans Workout.notes
   - Effort : 1h

6. **Comparaison inter-sessions**
   - Afficher dans SessionForgee : "Vol. +X kg vs dernier" + "Durée -Y min"
   - Effort : 1.5h

7. **Coach contextuels**
   - Analyser ta perf réelle (reps manquées, charge montée, etc.)
   - Déclencher form/push/swap/rest en fonction
   - Effort : 4-5h

### 🟢 P2 : NICE TO HAVE

1. **Volume hebdo par muscle**
   - Ajouter breakdown dans StatsSheet
   - Effort : 2h

2. **Liste des 5 derniers PRs**
   - History modal
   - Effort : 1.5h

3. **Finisher cardio plus d'options**
   - Ajouter aussi EMOM, tabata, autres formats
   - Effort : 3h

---

## RECOMMANDATIONS PROCHAINES ÉTAPES

### Court terme (1-2 semaines)
1. **Ajouter calcul 1RM** → formule Epley
2. **Ajouter son fin repos** → expo-notification courte
3. **Ajouter swap live** → bouton en active-workout
4. **Streak training** → piquer logique du coach

### Moyen terme (2-4 semaines)
1. **Détection échec** → flag + deload suggestion
2. **Graphique 1RM** → écran progress
3. **RPE/RIR** → post-exercise popup
4. **Guide échauffement** → pre-workout modal

### Long terme (post-MVP)
1. **Coach contextuels** → algorithme avancé
2. **Badges/jalons** → celebrations polish
3. **Comparaison communauté** → leaderboards
4. **Nutrition training sync** → macro adjustments basées sur perf

---

## CONCLUSION

L'onglet Training **fonctionne très bien pour la mécanique basique** : on peut planner une séance, logger chaque set rapidement, voir un timer intelligent, terminer avec une cérémonie agréable.

**Les failles majeures** sont ailleurs :
- Pas d'**intelligence progressive** (1RM, surcharge auto, deload)
- Pas d'**engagement long-terme** (streak, badges)
- Pas d'**insights profonds** (RPE, graphiques, comparaisons)
- Pas d'**coachitude avancée** (contextualisé à TA perf)

Le produit est **usable** (note 7/10) mais **incomplet** (note 5/10 pour progression). Les priorités sont : **1RM + surcharge intelligente**, **détection échec**, **engagement badges**, **coach contextuels**.

---

## LOGS DE FICHIER

**Total pages = 47 pages**  
**Nombre de commits Git analysés = 0** (audit sur codebase brute)  
**Exos uniques = 50+**  
**Programmes = 16**  
**Semaines par programme = 8**

