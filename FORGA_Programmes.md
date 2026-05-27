# FORGA — Spécification complète des programmes d'entraînement

> Document de référence pour l'implémentation (destiné à Claude Code).
> Couvre **60 programmes** = 5 objectifs × 2 sexes × 3 niveaux × 2 lieux, plus le moteur de classification de niveau et le module suppléments.
> Toutes les données sont fondées sur la littérature scientifique (sources en fin de document).

## Comment lire ce document
- **Familles d'objectifs** : `HYPERTROPHIE` (Prise de masse, Sèche, Recomposition, Maintien) partagent les mêmes exercices ; seuls le volume, le cardio et la nutrition changent. `FORCE` (Powerlifter) est une logique distincte (reps basses, charges lourdes, RPE).
- **Moteur** : la section *Paramètres* contient les tables sources ; la *Matrice* en dérive les 60 programmes via la logique décrite.
- **Sections clés pour le dev** : `Paramètres` (constantes), `Matrice 60 programmes` (sortie attendue), `Séances détaillées` (contenu des séances + conseils), `Standards de force` (auto-classification du niveau), `Suppléments` (module nutrition).

### Logique de dérivation de la Matrice (pseudo-code)
```
famille = OBJECTIF.famille            # "Hypertrophie" | "Force"
if famille == "Hypertrophie":
    split        = NIVEAU_HYP[niveau].split[lieu]
    seances_sem  = NIVEAU_HYP[niveau].seances
    reps         = NIVEAU_HYP[niveau].reps
    rir          = NIVEAU_HYP[niveau].rir
    repos        = NIVEAU_HYP[niveau].repos
    tempo        = NIVEAU_HYP[niveau].tempo
    progression  = NIVEAU_HYP[niveau].progression
    series_base  = moyenne(NIVEAU_HYP[niveau].series_bas, series_haut)
    series_muscle_semaine = round(series_base × OBJECTIF.mult_volume)
    if sexe == "Femme":
        series_jambes_fessiers = round(series_muscle_semaine × 1.45)
    cardio    = OBJECTIF.cardio
    nutrition = OBJECTIF.nutrition
    proteines = OBJECTIF.proteines
    deload    = OBJECTIF.deload
else:  # Force
    split        = NIVEAU_FORCE[niveau].split[lieu]
    seances_sem  = NIVEAU_FORCE[niveau].seances
    frequence_SBD= NIVEAU_FORCE[niveau].frequence_sbd
    intensite    = NIVEAU_FORCE[niveau].pct_1rm      # %1RM
    reps         = NIVEAU_FORCE[niveau].reps
    rpe          = NIVEAU_FORCE[niveau].rpe
    repos        = NIVEAU_FORCE[niveau].repos
    tempo        = NIVEAU_FORCE[niveau].tempo
    progression  = NIVEAU_FORCE[niveau].progression
    deload       = NIVEAU_FORCE[niveau].deload
    cardio       = "Minimal (1–2 × LISS, à distance des séances lourdes)"
    nutrition    = "Maintien à léger surplus (+5 à +15 %)"
    proteines    = "1,6–2,2 g/kg poids corps · glucides 4–6 g/kg"
    # NB : Force + Maison = variante d'entretien (barre+rack requis pour le 1RM max)
```


---

# Mode d'emploi


## FORGA — BIBLIOTHÈQUE DE PROGRAMMES D'ENTRAÎNEMENT  (V3)

*5 objectifs × 2 sexes × 3 niveaux × 2 lieux = 60 programmes · 14 onglets*


### À QUOI SERT CE CLASSEUR


| Objet | Un programme complet et adapté pour chaque profil Forga : 5 objectifs × 2 sexes × 3 niveaux × 2 lieux = 60 combinaisons. |
|---|---|
| Public | Audience francophone mixte (hommes ET femmes), 18–45 ans. |
| Nouveautés V3 | Onglet « Application par objectif » (exemples chiffrés sèche/masse/etc.), « Cardio & Échauffement », « Progression & Charges » (1RM/Epley, deload), « Planning hebdo », « Nutrition », « Récup & Femmes ». Séances Force complétées (tous les jours + version femme). |


### LES 14 ONGLETS


| 1. Mode d'emploi | Cette page : logique, abréviations, légende. |
|---|---|
| 2. Paramètres | Le moteur : modifie une valeur → la Matrice se recalcule (VLOOKUP). |
| 3. Matrice 60 programmes | 1 ligne = 1 combinaison complète. |
| 4. Application par objectif | Exemples CHIFFRÉS : la même séance déclinée en masse / sèche / recomp / maintien / force. |
| 5. Séances détaillées | Les vraies séances exercice par exercice (hypertrophie ET force, tous niveaux/lieux/sexes). |
| 6. Cardio & Échauffement | Protocoles d'échauffement, montée en charge, LISS, HIIT, zones cardio. |
| 7. Progression & Charges | Estimation 1RM (Epley), choix de la charge, double progression, semaine de deload. |
| 8. Planning hebdo | Organisation de la semaine selon 3/4/5/6 séances + jours de repos. |
| 9. Banque d'exercices | Meilleurs exos + accessoires powerlifting, équivalence Salle ↔ Maison. |
| 10. Technique SBD | Repères techniques Squat / Développé couché / Soulevé de terre. |
| 11. Repères de volume | MEV/MAV/MRV par muscle + zones d'intensité Prilepin. |
| 12. Nutrition | Calcul du maintien (TDEE), macros par objectif, journée-type. |
| 13. Récup & Femmes | Sommeil, récupération, mobilité, et entraînement & cycle menstruel. |
| 14. Sources | Références scientifiques. |


### LES 2 FAMILLES D'OBJECTIFS


| HYPERTROPHIE | Prise de masse · Sèche · Recomposition · Maintien. MÊMES exercices et reps pour un niveau donné. Ce qui change = VOLUME (×mult.), CARDIO, NUTRITION. → Voir onglet « Application par objectif » pour le voir chiffré. |
|---|---|
| FORCE | Force / Powerlifter. Reps basses (1–6), charges lourdes (75–95% 1RM), RPE 7–9, repos longs (3–5 min), cardio minimal, splits Squat/Bench/Deadlift. |


### LA LOGIQUE EN 3 COUCHES


| 1 — NIVEAU | Structure : split, fréquence, volume/intensité de base, progression. |
|---|---|
| 2 — OBJECTIF | Hyp. : volume + cardio + nutrition. Force : reps basses + charges lourdes + cardio minimal. |
| 3 — SEXE | Femme (hyp.) : +bas du corps/fessiers ×1,45. Femme (force) : +1 séance DC, repos accessoires −20%. |


### ABRÉVIATIONS


| RIR / RPE | Reps en réserve / Effort perçu /10 (RPE 8 ≈ 2 reps en réserve). |
|---|---|
| 1RM / %1RM | Charge max sur 1 rep / pourcentage de cette charge. |
| SBD | Squat · Bench (développé couché) · Deadlift (soulevé de terre). |
| MEV/MAV/MRV | Volume Minimum Efficace / Maximum Adaptatif / Maximum Récupérable (séries/muscle/sem). |
| AMRAP | As Many Reps As Possible (série jusqu'à la dernière rep propre). |
| DUP / Bloc | Périodisation ondulatoire / par blocs. |
| TDEE | Dépense énergétique totale quotidienne (calories de maintien). |
| Z2 / LISS / HIIT | Cardio facile continu / intervalles haute intensité. |
| Tempo (2-0-1-0) | Excentrique - pause basse - concentrique - pause haute (s). |


### AVERTISSEMENT


| Force à la maison | Powerlifting = spécifique à la barre. Sans barre+rack+plaques → variante d'ENTRETIEN, pas de 1RM max. Signalé dans la Matrice. |
|---|---|
| Non médical | Repères issus de la littérature. À individualiser et faire valider par un coach diplômé STAPS / kiné avant publication Forga. |



---

# Paramètres


## TABLE NIVEAU — HYPERTROPHIE


| Niveau | Split (Salle) | Split (Maison) | Séances/sem | Séries base bas | Séries base haut | Fourchette reps | RIR | Repos | Tempo | Progression |
|---|---|---|---|---|---|---|---|---|---|---|
| Débutant | Full Body A/B | Full Body A/B | 3 | 6 | 10 | 8–12 (jambes 10–15) | 2–3 | 2–3 min / 60–90 s | 2-0-1-0 | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance |
| Intermédiaire | Half Body (Haut/Bas) | Half Body (Haut/Bas) | 4 | 12 | 16 | 6–12 base · 10–20 iso | 1–3 | 2–3 min / 60–90 s | 2-0-1-0 | Double progression · deload 5–6 sem |
| Avancé / Pro | Push/Pull/Legs | Haut/Bas ou PPL adapté DB | 6 | 16 | 22 | 3–6 force · 8–12 hyp · 15–25 métab | 0–2 | 3–4 min / 90 s | 2-0-1-0 | Périodisation · deload 4–5 sem |


## TABLE NIVEAU — FORCE / POWERLIFTING


| Niveau | Split (Salle) | Split (Maison) | Séances/sem | Fréquence SBD | %1RM | Reps | RPE | Repos | Tempo | Progression / Périodisation | Deload |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Débutant | Full Body 3j (Starting Strength / GZCLP) | Full Body haltères (variante entretien) | 3 | Squat 3× · DC 1,5× · SdT 1×/sem | 75–85 | 5 (3×5) | 7–8 | 3–5 min | Excentrique contrôlé · concentrique explosif | Linéaire : +2,5 kg haut · +5 kg bas / séance · reset −10% après 3 échecs | Réactif (~6–12 sem) |
| Intermédiaire | Haut/Bas 4j (5/3/1 · Texas Method · GZCL) | Haut/Bas haltères (variante entretien) | 4 | Squat 2× · DC 2× · SdT 1,5×/sem | 65–95 (vagues 5/3/1) | 1–5 + AMRAP | 7–9 | 3–5 min | Contrôlé · explosif | 5/3/1 : +2,5 kg haut · +5 kg bas / cycle · −10% TM si AMRAP échoue | Semaine 4 du cycle (40/50/60% TM) |
| Avancé / Pro | SBD 4–6j (Sheiko · Blocs · Westside) | — (barre + rack requis) | 4–6 | Squat 2–3× · DC 2–3× · SdT 1–2×/sem | 70–95+ (par blocs) | 1–5 | 7–9 · pics 10 en peaking | 3–6 min | Contrôlé · explosif | Périodisation par blocs ou DUP | Toutes les 4–6 sem (ou réactif 6–12 sem) |


## TABLE OBJECTIF


| Objectif | Famille | Multiplicateur volume | Cardio | Nutrition (calories) | Protéines | Deload (hypertrophie) |
|---|---|---|---|---|---|---|
| Prise de masse | Hypertrophie | 1.1 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Toutes les 4–6 sem |
| Sèche | Hypertrophie | 0.75 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Toutes les 3–5 sem |
| Recomposition | Hypertrophie | 0.9 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Toutes les 5–6 sem |
| Maintien | Hypertrophie | 0.6 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Rarement nécessaire |
| Force / Powerlifter | Force | 0.8 | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Voir niveau Force |


## TABLE SEXE


| Sexe | Multiplicateur jambes/fessiers (hyp.) | Repos isolation | Notes |
|---|---|---|---|
| Homme | 1 | 90–120 s | Ratio Poussée:Tirage:Jambes ≈ 1:1:1. Force : SdT 1×/sem lourd. Échec rare. |
| Femme | 1.45 | 45–90 s tolérés | Hyp. : jambes/fessiers ×1,45, +4–8 séries fessiers/sem, reps 10–20 OK. Force : +1 séance DC, repos accessoires −20%. |

Valeurs en bleu = hypothèses ajustables. Modifie-les ici → la Matrice se recalcule.



---

# Matrice 60 programmes


## MATRICE DES 60 PROGRAMMES — Objectif × Sexe × Niveau × Lieu


| ID | Objectif | Famille | Sexe | Niveau | Lieu | Split recommandé | Séances /sem | Fréquence mvts clés (Force) | Intensité (charge) | Fourchette reps | RIR / RPE | Séries /muscle /sem (Hyp) | Séries jambes-fessiers /sem (F, Hyp) | Repos | Tempo | Cardio | Nutrition (calories) | Protéines | Progression / Périodisation | Deload | Note clé |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Prise de masse | Hypertrophie | Homme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 9 | 9 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 4–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 2 | Prise de masse | Hypertrophie | Homme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 9 | 9 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 4–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 3 | Prise de masse | Hypertrophie | Homme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 15 | 15 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 4–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 4 | Prise de masse | Hypertrophie | Homme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 15 | 15 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 4–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 5 | Prise de masse | Hypertrophie | Homme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 21 | 21 | 3–4 min / 90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 4–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 6 | Prise de masse | Hypertrophie | Homme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 21 | 21 | 3–4 min / 90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 4–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 7 | Prise de masse | Hypertrophie | Femme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 9 | 13 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 4–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 8 | Prise de masse | Hypertrophie | Femme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 9 | 13 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 4–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 9 | Prise de masse | Hypertrophie | Femme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 15 | 22 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 4–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 10 | Prise de masse | Hypertrophie | Femme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 15 | 22 | 2–3 min / 60–90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 4–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 11 | Prise de masse | Hypertrophie | Femme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 21 | 30 | 3–4 min / 90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 4–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 12 | Prise de masse | Hypertrophie | Femme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 21 | 30 | 3–4 min / 90 s | 2-0-1-0 | 1–2 × 20–30 min Z2 (santé/récup) | +10 à +20 % (surplus) · +0,25–0,5 %/sem | 1,6–2,2 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 4–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 13 | Sèche | Hypertrophie | Homme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 6 | 6 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 3–5 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 14 | Sèche | Hypertrophie | Homme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 6 | 6 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 3–5 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 15 | Sèche | Hypertrophie | Homme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 11 | 11 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Double progression · deload 5–6 sem | Toutes les 3–5 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 16 | Sèche | Hypertrophie | Homme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 11 | 11 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Double progression · deload 5–6 sem | Toutes les 3–5 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 17 | Sèche | Hypertrophie | Homme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 14 | 14 | 3–4 min / 90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Périodisation · deload 4–5 sem | Toutes les 3–5 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 18 | Sèche | Hypertrophie | Homme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 14 | 14 | 3–4 min / 90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Périodisation · deload 4–5 sem | Toutes les 3–5 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 19 | Sèche | Hypertrophie | Femme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 6 | 9 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 3–5 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 20 | Sèche | Hypertrophie | Femme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 6 | 9 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 3–5 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 21 | Sèche | Hypertrophie | Femme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 11 | 16 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Double progression · deload 5–6 sem | Toutes les 3–5 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 22 | Sèche | Hypertrophie | Femme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 11 | 16 | 2–3 min / 60–90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Double progression · deload 5–6 sem | Toutes les 3–5 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 23 | Sèche | Hypertrophie | Femme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 14 | 20 | 3–4 min / 90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Périodisation · deload 4–5 sem | Toutes les 3–5 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 24 | Sèche | Hypertrophie | Femme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 14 | 20 | 3–4 min / 90 s | 2-0-1-0 | 2–4 × 20–40 min Z2 + 1 HIIT optionnel | −15 à −25 % (déficit) · perte 0,5–1 %/sem | 2,3–3,1 g/kg masse maigre | Périodisation · deload 4–5 sem | Toutes les 3–5 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 25 | Recomposition | Hypertrophie | Homme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 7 | 7 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 5–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 26 | Recomposition | Hypertrophie | Homme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 7 | 7 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 5–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 27 | Recomposition | Hypertrophie | Homme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 13 | 13 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 5–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 28 | Recomposition | Hypertrophie | Homme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 13 | 13 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 5–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 29 | Recomposition | Hypertrophie | Homme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 17 | 17 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 5–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 30 | Recomposition | Hypertrophie | Homme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 17 | 17 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 5–6 sem | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 31 | Recomposition | Hypertrophie | Femme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 7 | 10 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 5–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 32 | Recomposition | Hypertrophie | Femme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 7 | 10 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Toutes les 5–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 33 | Recomposition | Hypertrophie | Femme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 13 | 19 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 5–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 34 | Recomposition | Hypertrophie | Femme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 13 | 19 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Double progression · deload 5–6 sem | Toutes les 5–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 35 | Recomposition | Hypertrophie | Femme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 17 | 25 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 5–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 36 | Recomposition | Hypertrophie | Femme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 17 | 25 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 25 min Z2 | Maintien à −300 kcal | 1,8–2,4 g/kg poids corps | Périodisation · deload 4–5 sem | Toutes les 5–6 sem | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 37 | Maintien | Hypertrophie | Homme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 5 | 5 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Rarement nécessaire | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 38 | Maintien | Hypertrophie | Homme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 5 | 5 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Rarement nécessaire | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 39 | Maintien | Hypertrophie | Homme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 8 | 8 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Double progression · deload 5–6 sem | Rarement nécessaire | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 40 | Maintien | Hypertrophie | Homme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 8 | 8 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Double progression · deload 5–6 sem | Rarement nécessaire | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 41 | Maintien | Hypertrophie | Homme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 11 | 11 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Périodisation · deload 4–5 sem | Rarement nécessaire | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 42 | Maintien | Hypertrophie | Homme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 11 | 11 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Périodisation · deload 4–5 sem | Rarement nécessaire | Mêmes exercices que les autres objectifs hypertrophie : seuls volume, cardio et nutrition changent. |
| 43 | Maintien | Hypertrophie | Femme | Débutant | Salle | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 5 | 7 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Rarement nécessaire | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 44 | Maintien | Hypertrophie | Femme | Débutant | Maison | Full Body A/B | 3 | — | Modérée — proche de l'échec (RIR) | 8–12 (jambes 10–15) | RIR 2–3 | 5 | 7 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Linéaire : +2,5–5 kg haut · +5–10 kg bas / séance | Rarement nécessaire | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 45 | Maintien | Hypertrophie | Femme | Intermédiaire | Salle | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 8 | 12 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Double progression · deload 5–6 sem | Rarement nécessaire | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 46 | Maintien | Hypertrophie | Femme | Intermédiaire | Maison | Half Body (Haut/Bas) | 4 | — | Modérée — proche de l'échec (RIR) | 6–12 base · 10–20 iso | RIR 1–3 | 8 | 12 | 2–3 min / 60–90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Double progression · deload 5–6 sem | Rarement nécessaire | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 47 | Maintien | Hypertrophie | Femme | Avancé / Pro | Salle | Push/Pull/Legs | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 11 | 16 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Périodisation · deload 4–5 sem | Rarement nécessaire | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 48 | Maintien | Hypertrophie | Femme | Avancé / Pro | Maison | Haut/Bas ou PPL adapté DB | 6 | — | Modérée — proche de l'échec (RIR) | 3–6 force · 8–12 hyp · 15–25 métab | RIR 0–2 | 11 | 16 | 3–4 min / 90 s | 2-0-1-0 | 2–3 × 30 min (santé) | Maintien | 1,4–1,6 g/kg poids corps | Périodisation · deload 4–5 sem | Rarement nécessaire | Priorité bas du corps / fessiers (×1,45) · reps 10–20 tolérées. |
| 49 | Force / Powerlifter | Force | Homme | Débutant | Salle | Full Body 3j (Starting Strength / GZCLP) | 3 | Squat 3× · DC 1,5× · SdT 1×/sem | 75–85 % 1RM | 5 (3×5) | RPE 7–8 | — | — | 3–5 min | Excentrique contrôlé · concentrique explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Linéaire : +2,5 kg haut · +5 kg bas / séance · reset −10% après 3 échecs | Réactif (~6–12 sem) | Charges lourdes (≥75% 1RM) non négociables : la force max dépend de l'intensité. |
| 50 | Force / Powerlifter | Force | Homme | Débutant | Maison | Full Body haltères (variante entretien) | 3 | Squat 3× · DC 1,5× · SdT 1×/sem | 75–85 % 1RM | 5 (3×5) | RPE 7–8 | — | — | 3–5 min | Excentrique contrôlé · concentrique explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Linéaire : +2,5 kg haut · +5 kg bas / séance · reset −10% après 3 échecs | Réactif (~6–12 sem) | ⚠ Sans barre + rack, variante haltères/poids du corps = force générale & entretien (pas de maximisation du 1RM). |
| 51 | Force / Powerlifter | Force | Homme | Intermédiaire | Salle | Haut/Bas 4j (5/3/1 · Texas Method · GZCL) | 4 | Squat 2× · DC 2× · SdT 1,5×/sem | 65–95 (vagues 5/3/1) % 1RM | 1–5 + AMRAP | RPE 7–9 | — | — | 3–5 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | 5/3/1 : +2,5 kg haut · +5 kg bas / cycle · −10% TM si AMRAP échoue | Semaine 4 du cycle (40/50/60% TM) | Charges lourdes (≥75% 1RM) non négociables : la force max dépend de l'intensité. |
| 52 | Force / Powerlifter | Force | Homme | Intermédiaire | Maison | Haut/Bas haltères (variante entretien) | 4 | Squat 2× · DC 2× · SdT 1,5×/sem | 65–95 (vagues 5/3/1) % 1RM | 1–5 + AMRAP | RPE 7–9 | — | — | 3–5 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | 5/3/1 : +2,5 kg haut · +5 kg bas / cycle · −10% TM si AMRAP échoue | Semaine 4 du cycle (40/50/60% TM) | ⚠ Sans barre + rack, variante haltères/poids du corps = force générale & entretien (pas de maximisation du 1RM). |
| 53 | Force / Powerlifter | Force | Homme | Avancé / Pro | Salle | SBD 4–6j (Sheiko · Blocs · Westside) | 4–6 | Squat 2–3× · DC 2–3× · SdT 1–2×/sem | 70–95+ (par blocs) % 1RM | 1–5 | RPE 7–9 · pics 10 en peaking | — | — | 3–6 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Périodisation par blocs ou DUP | Toutes les 4–6 sem (ou réactif 6–12 sem) | Soulevé de terre 1×/sem lourd (+1 variation) : récupération = facteur limitant. |
| 54 | Force / Powerlifter | Force | Homme | Avancé / Pro | Maison | — (barre + rack requis) | 4–6 | Squat 2–3× · DC 2–3× · SdT 1–2×/sem | 70–95+ (par blocs) % 1RM | 1–5 | RPE 7–9 · pics 10 en peaking | — | — | 3–6 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Périodisation par blocs ou DUP | Toutes les 4–6 sem (ou réactif 6–12 sem) | ⚠ Powerlifting avancé impossible à la maison : barre + rack + plaques requis. Variante haltères = entretien, pas 1RM max. |
| 55 | Force / Powerlifter | Force | Femme | Débutant | Salle | Full Body 3j (Starting Strength / GZCLP) | 3 | Squat 3× · DC 1,5× · SdT 1×/sem | 75–85 % 1RM | 5 (3×5) | RPE 7–8 | — | — | 3–5 min | Excentrique contrôlé · concentrique explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Linéaire : +2,5 kg haut · +5 kg bas / séance · reset −10% après 3 échecs | Réactif (~6–12 sem) | Femme : +1 séance développé couché conseillée · repos accessoires −20%. |
| 56 | Force / Powerlifter | Force | Femme | Débutant | Maison | Full Body haltères (variante entretien) | 3 | Squat 3× · DC 1,5× · SdT 1×/sem | 75–85 % 1RM | 5 (3×5) | RPE 7–8 | — | — | 3–5 min | Excentrique contrôlé · concentrique explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Linéaire : +2,5 kg haut · +5 kg bas / séance · reset −10% après 3 échecs | Réactif (~6–12 sem) | ⚠ Sans barre + rack, variante haltères/poids du corps = force générale & entretien (pas de maximisation du 1RM). |
| 57 | Force / Powerlifter | Force | Femme | Intermédiaire | Salle | Haut/Bas 4j (5/3/1 · Texas Method · GZCL) | 4 | Squat 2× · DC 2× · SdT 1,5×/sem | 65–95 (vagues 5/3/1) % 1RM | 1–5 + AMRAP | RPE 7–9 | — | — | 3–5 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | 5/3/1 : +2,5 kg haut · +5 kg bas / cycle · −10% TM si AMRAP échoue | Semaine 4 du cycle (40/50/60% TM) | Femme : +1 séance développé couché conseillée · repos accessoires −20%. |
| 58 | Force / Powerlifter | Force | Femme | Intermédiaire | Maison | Haut/Bas haltères (variante entretien) | 4 | Squat 2× · DC 2× · SdT 1,5×/sem | 65–95 (vagues 5/3/1) % 1RM | 1–5 + AMRAP | RPE 7–9 | — | — | 3–5 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | 5/3/1 : +2,5 kg haut · +5 kg bas / cycle · −10% TM si AMRAP échoue | Semaine 4 du cycle (40/50/60% TM) | ⚠ Sans barre + rack, variante haltères/poids du corps = force générale & entretien (pas de maximisation du 1RM). |
| 59 | Force / Powerlifter | Force | Femme | Avancé / Pro | Salle | SBD 4–6j (Sheiko · Blocs · Westside) | 4–6 | Squat 2–3× · DC 2–3× · SdT 1–2×/sem | 70–95+ (par blocs) % 1RM | 1–5 | RPE 7–9 · pics 10 en peaking | — | — | 3–6 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Périodisation par blocs ou DUP | Toutes les 4–6 sem (ou réactif 6–12 sem) | Femme : +1 séance développé couché conseillée · repos accessoires −20%. |
| 60 | Force / Powerlifter | Force | Femme | Avancé / Pro | Maison | — (barre + rack requis) | 4–6 | Squat 2–3× · DC 2–3× · SdT 1–2×/sem | 70–95+ (par blocs) % 1RM | 1–5 | RPE 7–9 · pics 10 en peaking | — | — | 3–6 min | Contrôlé · explosif | Minimal : 1–2 × LISS 20–40 min, à distance des séances lourdes (≥3 h) | Maintien à léger surplus (+5 à +15 %) | 1,6–2,2 g/kg PC · glucides 4–6 g/kg | Périodisation par blocs ou DUP | Toutes les 4–6 sem (ou réactif 6–12 sem) | ⚠ Powerlifting avancé impossible à la maison : barre + rack + plaques requis. Variante haltères = entretien, pas 1RM max. |

La colonne « Famille » fait basculer la logique. Hyp. → volume = base(niveau) × mult.(objectif) ; femme applique ×1,45 sur jambes/fessiers. Force → reps basses + %1RM + RPE. Pour voir les objectifs CHIFFRÉS sur une vraie séance → onglet « Application par objectif ». Texte vert = lié à Paramètres.



---

# Application par objectif


## APPLICATION PAR OBJECTIF — la même séance, déclinée

*Principe : pour la famille HYPERTROPHIE, on garde EXACTEMENT les mêmes exercices. On ajuste seulement (1) le nombre de séries (× multiplicateur), (2) le cardio, (3) la nutrition. La FORCE, elle, change de structure.*


### CE QUI CHANGE D'UN OBJECTIF À L'AUTRE


| Objectif | Volume (× base) | Cardio /sem | Nutrition | Reps & charges |
|---|---|---|---|---|
| Prise de masse | ×1,10 (haut MAV) | 1–2 × Z2 léger | Surplus +10–20% | Identiques (hyp.) |
| Recomposition | ×0,90 | 2–3 × Z2 | Maintien à −300 kcal | Identiques (hyp.) |
| Sèche | ×0,75 (on GARDE les charges) | 2–4 × Z2 + 1 HIIT opt. | Déficit −15–25% | Identiques (hyp.) |
| Maintien | ×0,60 (MV–MEV) | 2–3 × Z2 santé | Maintien | Identiques (hyp.) |
| Force / Powerlifter | Structure différente | Minimal (1–2 × LISS) | Maintien / léger surplus | 1–6 reps · 75–95% 1RM |


## EXEMPLE CHIFFRÉ — Séance BAS du corps (Intermédiaire, Homme)

*Base de référence = volume MAV (~14 séries/muscle). On lit chaque colonne comme le nombre de SÉRIES à faire. Les reps et les charges ne changent pas entre masse/recomp/sèche/maintien.*


| Exercice (mêmes exos) | Reps | Prise de masse | Recomp | Sèche | Maintien |
|---|---|---|---|---|---|
| Squat | 5–8 | 4 séries | 4 séries | 3 séries | 3 séries |
| Soulevé de terre roumain (RDL) | 8–10 | 4 séries | 3 séries | 3 séries | 2 séries |
| Hip thrust | 10–12 | 4 séries | 3 séries | 3 séries | 2 séries |
| Presse / Fente bulgare | 10–12 | 3 séries | 3 séries | 2 séries | 2 séries |
| Leg curl | 10–12 | 3 séries | 3 séries | 2 séries | 2 séries |
| Mollets debout | 12–15 | 4 séries | 4 séries | 3 séries | 3 séries |
| TOTAL séries |   | 22 | 20 | 16 | 14 |

→ Sèche = MÊMES exercices, MÊMES reps, MÊMES charges (on préserve le muscle), mais MOINS de séries (récupération réduite en déficit) + on AJOUTE du cardio (voir onglet Cardio). On ne transforme PAS la muscu en circuit léger : c'est le mythe à éviter.


## EXEMPLE CHIFFRÉ — Séance HAUT du corps (Intermédiaire, Homme)

*Même principe : on module les séries.*


| Exercice | Reps | Prise de masse | Recomp | Sèche | Maintien |
|---|---|---|---|---|---|
| Développé couché / incliné | 6–8 | 4 séries | 4 séries | 3 séries | 3 séries |
| Rowing | 6–10 | 4 séries | 3 séries | 3 séries | 2 séries |
| Développé militaire | 8–10 | 3 séries | 3 séries | 2 séries | 2 séries |
| Traction / Tirage vertical | 8–10 | 3 séries | 3 séries | 2 séries | 2 séries |
| Curl biceps | 10–12 | 3 séries | 3 séries | 2 séries | 2 séries |
| Extension triceps | 10–12 | 3 séries | 3 séries | 2 séries | 2 séries |


### ET POUR LA FEMME ?

Même logique, mais on multiplie le volume JAMBES/FESSIERS par ~1,45 (voir Matrice colonne dédiée). Ex. en prise de masse, la femme passe les 4 séries de hip thrust à 6, ajoute 3 séries d'abduction + 3 de kickback, et peut faire une 2e séance bas/sem. Le haut du corps reste proche de la version homme.


### ET POUR LA FORCE ?

La force ne s'obtient PAS en modulant le volume d'une séance d'hypertrophie : c'est une structure à part (squat/bench/deadlift, 1–6 reps, 75–95% 1RM, RPE 7–9, repos 3–5 min). → Voir les séances dédiées dans l'onglet « Séances détaillées » (blocs violets).



---

# Séances détaillées

RAPPEL : famille HYPERTROPHIE = mêmes exercices pour les 4 objectifs (le volume est ajusté → onglet « Application par objectif »). Famille FORCE (blocs violets) = séances propres. Échauffement avant chaque séance → onglet « Cardio & Échauffement ».


## DÉBUTANT — FULL BODY 3 j/sem — SALLE  [HYPERTROPHIE]

*Progression linéaire · RIR 2–3 · Tempo 2-0-1-0*


### Séance A (Lun & Ven) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat barre | 3 | 5 | 2–3 min | Pieds largeur d'épaules, descendre les hanches sous les genoux, poitrine fière, pousser le sol avec tout le pied. |
| Développé couché | 3 | 5 | 2–3 min | Omoplates serrées et basses, léger arch, descendre la barre au bas des pecs, coudes ~45°, pousser en ligne. |
| Rowing barre | 3 | 8 | 90 s | Buste penché ~45°, tirer la barre vers le nombril, serrer les omoplates, dos neutre, pas de balancier. |
| Gainage (planche) | 3 | 30 s | 60 s | Corps en ligne, fessiers et abdos serrés, ne pas cambrer ni lever les fesses, respirer. |


### Séance B (Mer) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Soulevé de terre | 1×5 + 2×5 RDL | 5 | 3 min | Barre au milieu du pied, dos neutre gainé, pousser le sol, hanches et épaules montent ensemble. |
| Développé militaire | 3 | 5 | 2 min | Debout gainé, barre du haut des pecs jusqu'au-dessus de la tête, fessiers serrés, pas de cambrure lombaire. |
| Tirage vertical | 3 | 8 | 90 s | Tirer la barre vers le haut des pecs, sortir la poitrine, descendre les coudes, dos légèrement incliné. |
| Hip thrust | 3 | 10 | 90 s | Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Relevé genoux suspendu | 3 | 10 | 60 s | Suspendu à la barre, monter les genoux en enroulant le bassin, contrôler la descente, sans élan. |


### Séance A — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Hip thrust | 4 | 8–10 | 90 s | Exercice prioritaire · Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Squat barre | 3 | 8 | 2–3 min | Pieds largeur d'épaules, descendre les hanches sous les genoux, poitrine fière, pousser le sol avec tout le pied. |
| Développé couché | 3 | 8 | 2 min | Omoplates serrées et basses, léger arch, descendre la barre au bas des pecs, coudes ~45°, pousser en ligne. |
| Rowing barre | 3 | 10 | 90 s | Buste penché ~45°, tirer la barre vers le nombril, serrer les omoplates, dos neutre, pas de balancier. |
| Abduction hanche | 3 | 15 | 45 s | Écarter la cuisse contre la résistance, contrôler le retour, sentir le moyen fessier sur le côté. |
| Gainage (planche) | 3 | 30 s | 60 s | Corps en ligne, fessiers et abdos serrés, ne pas cambrer ni lever les fesses, respirer. |


### Séance B — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Soulevé de terre roumain | 3 | 8 | 2–3 min | Jambes quasi tendues, pousser les fessiers loin en arrière, barre collée aux jambes, étirer les ischios. |
| Hip thrust | 3 | 10 | 90 s | Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Développé militaire | 3 | 8 | 2 min | Debout gainé, barre du haut des pecs jusqu'au-dessus de la tête, fessiers serrés, pas de cambrure lombaire. |
| Tirage vertical | 3 | 10 | 90 s | Tirer la barre vers le haut des pecs, sortir la poitrine, descendre les coudes, dos légèrement incliné. |
| Fentes marchées | 3 | 10/jambe | 90 s | Grand pas, genou arrière vers le sol, pousser sur le talon avant, torse droit et gainé. |
| Relevé genoux suspendu | 3 | 12 | 60 s | Suspendu à la barre, monter les genoux en enroulant le bassin, contrôler la descente, sans élan. |


## DÉBUTANT — FULL BODY 3 j/sem — MAISON  [HYPERTROPHIE]

*Haltères / élastiques / PdC · Surcharge : reps → tempo → variante → charge*


### Séance A — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Goblet squat | 3 | 8–10 | 90 s | Haltère tenu contre la poitrine, coudes entre les genoux en bas, dos droit, talons ancrés au sol. |
| Développé haltères au sol / Pompes | 3 | 8–12 | 90 s | Au sol : les coudes touchent le sol puis poussée. Pompes : corps gainé en planche, descente complète. |
| Rowing 1 bras haltère | 3 | 10 | 90 s | Genou et main appuyés sur le banc, tirer le coude vers la hanche, ne pas tourner le buste. |
| RDL haltères | 3 | 10 | 90 s | Haltères le long des jambes, pousser les fessiers en arrière, dos droit, descendre jusqu'à mi-tibia. |
| Gainage | 3 | 30 s | 60 s | Corps gainé en ligne, abdos et fessiers serrés, ne pas creuser le bas du dos. |


### Séance B — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Fente bulgare | 3 | 8/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Développé épaules haltères | 3 | 8 | 90 s | Assis dos calé, monter sans cogner les haltères, descendre au niveau des oreilles. |
| Tirage élastique / Rowing inversé | 3 | 8–12 | 90 s | Élastique : serrer les omoplates en tirant. Rowing inversé sous une table : corps gainé en planche. |
| Hip thrust haltère au sol | 3 | 12 | 90 s | Au sol, haltère sur les hanches, monter en serrant les fessiers, ne pas cambrer le bas du dos. |
| Relevé jambes au sol | 3 | 12 | 60 s | Allongé, monter les jambes en décollant légèrement le bas du dos, descente contrôlée. |


### Séance A — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Hip thrust élastique + haltère | 4 | 12–15 | 75 s | Exercice prioritaire · Élastique autour des genoux pour activer les fessiers, monter et serrer 1 s en haut. |
| Goblet squat | 3 | 10–12 | 90 s | Haltère tenu contre la poitrine, coudes entre les genoux en bas, dos droit, talons ancrés au sol. |
| Développé haltères au sol / Pompes | 3 | 8–12 | 90 s | Au sol : les coudes touchent le sol puis poussée. Pompes : corps gainé en planche, descente complète. |
| Rowing 1 bras haltère | 3 | 10 | 90 s | Genou et main appuyés sur le banc, tirer le coude vers la hanche, ne pas tourner le buste. |
| Kickback élastique | 3 | 15 | 45 s | Pousser le talon vers l'arrière (extension de hanche), serrer le fessier, sans cambrer le dos. |
| Gainage | 3 | 30 s | 60 s | Corps gainé en ligne, abdos et fessiers serrés, ne pas creuser le bas du dos. |


### Séance B — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| RDL haltères | 3 | 10 | 90 s | Haltères le long des jambes, pousser les fessiers en arrière, dos droit, descendre jusqu'à mi-tibia. |
| Pont fessier 1 jambe | 3 | 12/jambe | 45 s | Une jambe tendue, pousser sur le talon au sol, monter le bassin sans cambrer le dos. |
| Développé épaules haltères | 3 | 8–10 | 90 s | Assis dos calé, monter sans cogner les haltères, descendre au niveau des oreilles. |
| Tirage élastique / Rowing inversé | 3 | 8–12 | 90 s | Élastique : serrer les omoplates en tirant. Rowing inversé sous une table : corps gainé en planche. |
| Fente bulgare | 3 | 10/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Relevé jambes au sol | 3 | 12 | 60 s | Allongé, monter les jambes en décollant légèrement le bas du dos, descente contrôlée. |


## INTERMÉDIAIRE — HALF BODY 4 j/sem — SALLE  [HYPERTROPHIE]

*Double progression · RIR 1–2 · Deload 5–6 sem · Femme : 2e séance BAS conseillée*


### HAUT du corps — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé couché / incliné | 4 | 6–8 | 2–3 min | Omoplates serrées, descente au bas des pecs, ne pas écarter les coudes à 90°, garder les pieds ancrés. |
| Rowing | 4 | 6–10 | 2 min | Tirer vers le bas-ventre, coudes le long du corps, serrer les omoplates, ne pas balancer le buste. |
| Développé militaire | 3 | 8–10 | 2 min | Debout gainé, barre du haut des pecs jusqu'au-dessus de la tête, fessiers serrés, pas de cambrure lombaire. |
| Traction / Tirage vertical | 3 | 8–10 | 2 min | Traction : amener la poitrine vers la barre. Trop dur ? Version assistée à l'élastique. |
| Curl biceps | 3 | 10–12 | 75 s | Coudes fixes le long du corps, ne pas balancer, serrer en haut, descente contrôlée. |
| Extension triceps poulie | 3 | 10–12 | 75 s | Coudes collés au corps, étendre complètement l'avant-bras, ne bouger que l'avant-bras. |


### BAS du corps — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat | 4 | 5–8 | 3 min | Pieds largeur d'épaules, descendre sous la parallèle, dos neutre, pousser le sol, genoux dans l'axe des pieds. |
| Soulevé de terre roumain (RDL) | 3 | 8–10 | 2 min | Jambes quasi tendues, pousser les fessiers en arrière, barre collée aux jambes, sentir l'étirement des ischios. |
| Hip thrust | 3 | 10–12 | 90 s | Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Presse / Fente bulgare | 3 | 10–12 | 90 s | Presse : descendre à 90° sans décoller le bas du dos. Fente bulgare : pied arrière surélevé, poids à l'avant. |
| Leg curl | 3 | 10–12 | 75 s | Fléchir le genou en contractant les ischios, pause courte, descente lente et contrôlée. |
| Mollets debout | 4 | 12–15 | 60 s | Amplitude complète : monter haut sur la pointe, descendre en étirant le mollet, pause 1 s. |


### HAUT du corps — FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé couché / incliné | 3 | 8–10 | 2 min | Omoplates serrées, descente au bas des pecs, ne pas écarter les coudes à 90°, garder les pieds ancrés. |
| Rowing | 4 | 8–10 | 90 s | Tirer vers le bas-ventre, coudes le long du corps, serrer les omoplates, ne pas balancer le buste. |
| Développé militaire | 3 | 10 | 90 s | Debout gainé, barre du haut des pecs jusqu'au-dessus de la tête, fessiers serrés, pas de cambrure lombaire. |
| Traction / Tirage vertical | 3 | 10 | 90 s | Traction : amener la poitrine vers la barre. Trop dur ? Version assistée à l'élastique. |
| Curl biceps | 3 | 12 | 60 s | Coudes fixes le long du corps, ne pas balancer, serrer en haut, descente contrôlée. |
| Extension triceps poulie | 3 | 12 | 60 s | Coudes collés au corps, étendre complètement l'avant-bras, ne bouger que l'avant-bras. |


### BAS du corps — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Hip thrust | 4 | 8–10 | 2 min | Exercice prioritaire, lourd · Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Squat | 4 | 6–8 | 2–3 min | Pieds largeur d'épaules, descendre sous la parallèle, dos neutre, pousser le sol, genoux dans l'axe des pieds. |
| Soulevé de terre roumain (RDL) | 3 | 8–10 | 90 s | Jambes quasi tendues, pousser les fessiers en arrière, barre collée aux jambes, sentir l'étirement des ischios. |
| Fente bulgare | 3 | 10/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Abduction hanche | 3 | 15 | 45 s | Écarter la cuisse contre la résistance, contrôler le retour, sentir le moyen fessier sur le côté. |
| Kickback poulie | 3 | 15 | 45 s | Pousser le talon vers l'arrière, extension de hanche contrôlée, sans compenser avec le bas du dos. |
| Mollets debout | 4 | 15 | 45 s | Amplitude complète : monter haut sur la pointe, descendre en étirant le mollet, pause 1 s. |


## INTERMÉDIAIRE — HALF BODY 4 j/sem — MAISON  [HYPERTROPHIE]

*Haltères + élastiques · Surcharge par reps/tempo/unilatéral*


### HAUT — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé haltères incliné | 4 | 8–10 | 2 min | Banc incliné, amplitude complète, contrôler la descente 2-3 s, serrer les pecs en haut. |
| Rowing 1 bras haltère | 4 | 8–10 | 90 s | Genou et main appuyés sur le banc, tirer le coude vers la hanche, ne pas tourner le buste. |
| Développé épaules haltères | 3 | 8–10 | 90 s | Assis dos calé, monter sans cogner les haltères, descendre au niveau des oreilles. |
| Traction porte / Tirage élastique | 3 | 8–10 | 90 s | Barre de porte bien sécurisée, ou élastique ancré en hauteur : serrer le dos en tirant. |
| Curl haltères | 3 | 10–12 | 75 s | Coudes fixes, ne pas balancer le buste, contraction complète en haut, descente lente. |
| Extension triceps haltère | 3 | 10–12 | 75 s | Coude fixe et haut, descendre l'haltère derrière la nuque, étendre sans bouger le coude. |


### BAS — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Goblet / Front squat haltères | 4 | 8–10 | 2 min | Haltère(s) près du buste, torse vertical, descendre profond, pousser les talons. |
| RDL haltères | 4 | 8–10 | 90 s | Haltères le long des jambes, pousser les fessiers en arrière, dos droit, descendre jusqu'à mi-tibia. |
| Hip thrust haltère | 3 | 12 | 90 s | Haltère sur les hanches, dos calé, extension complète des hanches, menton rentré, fessiers serrés en haut. |
| Fente bulgare | 3 | 10/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Leg curl glissé / Nordic assisté | 3 | 8–12 | 75 s | Leg curl glissé (serviette/sliders) ou Nordic freiné à la descente : excentrique lent des ischios. |
| Mollets 1 jambe | 4 | 12–15 | 45 s | Sur une marche, une jambe, monter haut, descendre en étirant, contrôler. |


### HAUT — FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé haltères incliné | 3 | 8–10 | 90 s | Banc incliné, amplitude complète, contrôler la descente 2-3 s, serrer les pecs en haut. |
| Rowing 1 bras haltère | 4 | 8–10 | 90 s | Genou et main appuyés sur le banc, tirer le coude vers la hanche, ne pas tourner le buste. |
| Développé épaules haltères | 3 | 10 | 90 s | Assis dos calé, monter sans cogner les haltères, descendre au niveau des oreilles. |
| Traction porte / Tirage élastique | 3 | 10 | 90 s | Barre de porte bien sécurisée, ou élastique ancré en hauteur : serrer le dos en tirant. |
| Curl haltères | 3 | 12 | 60 s | Coudes fixes, ne pas balancer le buste, contraction complète en haut, descente lente. |
| Extension triceps haltère | 3 | 12 | 60 s | Coude fixe et haut, descendre l'haltère derrière la nuque, étendre sans bouger le coude. |


### BAS — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Hip thrust élastique lesté | 4 | 12–15 | 75 s | Exercice prioritaire · Élastique aux genoux + lest, extension complète des hanches, fessiers serrés en haut. |
| Goblet / Front squat haltères | 4 | 8–10 | 2 min | Haltère(s) près du buste, torse vertical, descendre profond, pousser les talons. |
| RDL haltères | 4 | 8–10 | 90 s | Haltères le long des jambes, pousser les fessiers en arrière, dos droit, descendre jusqu'à mi-tibia. |
| Fente bulgare | 3 | 10/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Pont fessier + abduction | 3 | 15 | 45 s | Monter le bassin, puis écarter les genoux contre l'élastique en position haute. |
| Mollets 1 jambe | 4 | 15 | 45 s | Sur une marche, une jambe, monter haut, descendre en étirant, contrôler. |


## AVANCÉ / PRO — PUSH / PULL / LEGS 6 j/sem — SALLE  [HYPERTROPHIE]

*Charges mixtes · RIR 0–2 · Deload 4–5 sem*


### PUSH A (pectoraux) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé couché | 4 | 5–6 | 3 min | Omoplates serrées et basses, léger arch, descendre la barre au bas des pecs, coudes ~45°, pousser en ligne. |
| Développé incliné haltères | 3 | 8–10 | 2 min | Banc à 30°, descendre jusqu'à étirer les pecs, ne pas cogner les haltères en haut. |
| Écarté poulie | 3 | 12 | 75 s | Léger fléchissement des coudes constant, rapprocher les mains devant, sentir l'étirement des pecs. |
| Élévations latérales | 3 | 12–15 | 60 s | Monter les bras à l'horizontale, coudes légèrement fléchis, ne pas hausser les épaules (trapèzes). |
| Extension triceps overhead | 3 | 10 | 75 s | Bras au-dessus de la tête, coudes fixes, étirer en bas puis étendre, cible le long chef du triceps. |
| Pushdown triceps | 3 | 12 | 60 s | Coudes collés au corps, pousser vers le bas jusqu'à extension complète, contrôler la remontée. |


### PULL A (dos, épaisseur) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Soulevé de terre | 3 | 4–6 | 3–4 min | Barre au milieu du pied, dos neutre gainé, pousser le sol, hanches et épaules montent ensemble. |
| Rowing Pendlay | 3 | 6–8 | 2 min | La barre repart du sol à chaque rep, buste parallèle au sol, tirage explosif vers le ventre. |
| Traction | 3 | 8 | 2 min | Prise un peu plus large que les épaules, monter le menton au-dessus de la barre, descente complète contrôlée. |
| Tirage horizontal poulie | 3 | 10 | 90 s | Buste droit, tirer vers le nombril, serrer les omoplates 1 s en fin de course. |
| Oiseau / arrière épaule | 3 | 15 | 60 s | Buste penché, écarter les bras en cible l'arrière d'épaule, charge légère, mouvement contrôlé. |
| Curl barre | 3 | 8–10 | 75 s | Coudes immobiles, monter sans à-coups, serrer les biceps en haut, contrôler la descente. |


### LEGS A (quadriceps) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat | 4 | 5–6 | 3 min | Pieds largeur d'épaules, descendre sous la parallèle, dos neutre, pousser le sol, genoux dans l'axe des pieds. |
| Presse à cuisses | 3 | 10 | 2 min | Pieds largeur d'épaules, descendre jusqu'à ~90°, ne pas décoller le bas du dos, pas de verrouillage brutal. |
| Fente marchée | 3 | 10 | 90 s | Grand pas, descendre droit, pousser sur le talon avant pour avancer, buste droit. |
| Leg extension | 3 | 12 | 60 s | Contrôler la montée, serrer les quadriceps 1 s en haut, descente lente. |
| Mollets debout | 4 | 10–12 | 60 s | Amplitude complète : monter haut sur la pointe, descendre en étirant le mollet, pause 1 s. |
| Relevé jambes suspendu | 3 | 12 | 60 s | Suspendu, monter les jambes en enroulant le bassin, descente lente, sans balancier. |


### PUSH B (épaules) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé militaire | 4 | 6–8 | 2–3 min | Debout gainé, barre du haut des pecs jusqu'au-dessus de la tête, fessiers serrés, pas de cambrure lombaire. |
| Développé incliné haltères | 3 | 8–10 | 2 min | Banc à 30°, descendre jusqu'à étirer les pecs, ne pas cogner les haltères en haut. |
| Élévations latérales | 4 | 12–15 | 45 s | Monter les bras à l'horizontale, coudes légèrement fléchis, ne pas hausser les épaules (trapèzes). |
| Écarté poulie | 3 | 12 | 75 s | Léger fléchissement des coudes constant, rapprocher les mains devant, sentir l'étirement des pecs. |
| Dips | 3 | AMRAP | 2 min | Buste légèrement penché en avant (pecs), descendre jusqu'à étirer, ne pas descendre trop bas si épaules sensibles. |
| Pushdown triceps | 3 | 12 | 60 s | Coudes collés au corps, pousser vers le bas jusqu'à extension complète, contrôler la remontée. |


### PULL B (dos, largeur) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Traction lestée | 4 | 6–8 | 2–3 min | Ajouter du poids à la ceinture, amplitude complète, aucun balancier. |
| Rowing chest-supported | 3 | 8–10 | 90 s | Poitrine calée sur un banc incliné, tirer les coudes en arrière, isole le dos sans tricher. |
| Tirage vertical | 3 | 10 | 90 s | Tirer la barre vers le haut des pecs, sortir la poitrine, descendre les coudes, dos légèrement incliné. |
| Oiseau / arrière épaule | 3 | 15 | 60 s | Buste penché, écarter les bras en cible l'arrière d'épaule, charge légère, mouvement contrôlé. |
| Curl haltères | 3 | 10 | 60 s | Coudes fixes, ne pas balancer le buste, contraction complète en haut, descente lente. |
| Curl barre | 3 | 12 | 60 s | Coudes immobiles, monter sans à-coups, serrer les biceps en haut, contrôler la descente. |


### LEGS B (chaîne postérieure / fessiers) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Soulevé de terre roumain (RDL) | 4 | 6–8 | 2–3 min | Jambes quasi tendues, pousser les fessiers en arrière, barre collée aux jambes, sentir l'étirement des ischios. |
| Hip thrust | 3 | 8 | 2 min | Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Fente bulgare | 3 | 10/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Leg curl | 3 | 10–12 | 75 s | Fléchir le genou en contractant les ischios, pause courte, descente lente et contrôlée. |
| Mollets 1 jambe | 4 | 12 | 45 s | Sur une marche, une jambe, monter haut, descendre en étirant, contrôler. |
| Gainage anti-extension | 3 | 12–15 | 60 s | Planche stricte : empêcher le bas du dos de cambrer, abdos serrés en permanence. |


### LEGS (fessiers prioritaires) — FEMME  [remplace 1 des Legs, jusqu'à 3 jours jambes/sem]


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Hip thrust | 4 | 6–10 | 2–3 min | Exercice prioritaire, lourd · Haut du dos contre le banc, pieds à plat, monter les hanches en serrant fort les fessiers, pause 1 s en haut. |
| Soulevé de terre roumain (RDL) | 4 | 6–8 | 2 min | Jambes quasi tendues, pousser les fessiers en arrière, barre collée aux jambes, sentir l'étirement des ischios. |
| Squat | 4 | 6–8 | 2–3 min | Pieds largeur d'épaules, descendre sous la parallèle, dos neutre, pousser le sol, genoux dans l'axe des pieds. |
| Fente bulgare | 3 | 10/jambe | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Abduction hanche | 3 | 15 | 45 s | Écarter la cuisse contre la résistance, contrôler le retour, sentir le moyen fessier sur le côté. |
| Kickback poulie | 3 | 15 | 45 s | Pousser le talon vers l'arrière, extension de hanche contrôlée, sans compenser avec le bas du dos. |
| Mollets debout | 4 | 15 | 45 s | Amplitude complète : monter haut sur la pointe, descendre en étirant le mollet, pause 1 s. |


### Note FEMME — jours HAUT du corps


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Reprendre Push A / Pull A / Push B / Pull B (mêmes exercices écrits ci-dessus) | — | — | — | Volume haut du corps proche de la version homme |


## AVANCÉ / PRO — HAUT/BAS 5–6 j/sem — MAISON  [HYPERTROPHIE]

*Techniques d'intensité : myo-reps, séries dégressives, unilatéral, tempo*


### HAUT — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé haltères incliné | 4 | 8–12 | 2 min | Banc incliné, amplitude complète, contrôler la descente 2-3 s, serrer les pecs en haut. |
| Pompes lestées / déficit | 4 | 10–15 | 90 s | Dégressives sur la dernière série · Lest sur le dos, ou mains surélevées (déficit) pour plus d'amplitude. Corps gainé, descente complète. |
| Rowing 1 bras haltère | 4 | 8–12 | 90 s | Genou et main appuyés sur le banc, tirer le coude vers la hanche, ne pas tourner le buste. |
| Traction lestée | 4 | 6–10 | 2 min | Ajouter du poids à la ceinture, amplitude complète, aucun balancier. |
| Élévations latérales | 4 | 12–20 | 45 s | Myo-reps possibles · Monter les bras à l'horizontale, coudes légèrement fléchis, ne pas hausser les épaules (trapèzes). |
| Curl + Extension triceps (superset) | 3 | 12–15 | 60 s | Enchaîner curl puis extension triceps sans repos : coudes immobiles sur les deux. |


### BAS — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Fente bulgare lestée | 4 | 10–12/jambe | 2 min | Pied arrière surélevé + haltères, descente lente, poussée sur le talon avant. |
| RDL haltères lourd | 4 | 8–12 | 90 s | Charnière de hanche stricte, dos neutre, haltères collés aux jambes, remontée en serrant les fessiers. |
| Hip thrust haltère | 4 | 12–15 | 90 s | Dégressives possibles · Haltère sur les hanches, dos calé, extension complète des hanches, menton rentré, fessiers serrés en haut. |
| Sissy squat / Spanish squat | 3 | 12–15 | 60 s | Sissy : genoux qui avancent, talons hauts. Spanish : élastique derrière les genoux. Étire les quadriceps. |
| Nordic curl assisté | 3 | 6–10 | 75 s | Genoux calés, descendre le buste lentement en freinant avec les ischios, s'aider des mains en bas. |
| Mollets 1 jambe | 4 | 15–20 | 45 s | Sur une marche, une jambe, monter haut, descendre en étirant, contrôler. |


### HAUT — FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé haltères incliné | 4 | 8–12 | 90 s | Banc incliné, amplitude complète, contrôler la descente 2-3 s, serrer les pecs en haut. |
| Rowing 1 bras haltère | 4 | 8–12 | 90 s | Genou et main appuyés sur le banc, tirer le coude vers la hanche, ne pas tourner le buste. |
| Développé épaules haltères | 3 | 10–12 | 90 s | Assis dos calé, monter sans cogner les haltères, descendre au niveau des oreilles. |
| Traction porte / Tirage élastique | 3 | 8–12 | 90 s | Barre de porte bien sécurisée, ou élastique ancré en hauteur : serrer le dos en tirant. |
| Élévations latérales | 4 | 12–20 | 45 s | Monter les bras à l'horizontale, coudes légèrement fléchis, ne pas hausser les épaules (trapèzes). |
| Curl + Extension triceps (superset) | 3 | 12–15 | 60 s | Enchaîner curl puis extension triceps sans repos : coudes immobiles sur les deux. |


### BAS — FEMME (priorité fessiers)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Hip thrust élastique lesté | 5 | 12–15 | 75 s | Exercice prioritaire · Élastique aux genoux + lest, extension complète des hanches, fessiers serrés en haut. |
| Fente bulgare lestée | 4 | 10–12/jambe | 2 min | Pied arrière surélevé + haltères, descente lente, poussée sur le talon avant. |
| RDL haltères lourd | 4 | 10–12 | 90 s | Charnière de hanche stricte, dos neutre, haltères collés aux jambes, remontée en serrant les fessiers. |
| Pont fessier 1 jambe | 3 | 12/jambe | 45 s | Une jambe tendue, pousser sur le talon au sol, monter le bassin sans cambrer le dos. |
| Pont fessier + abduction | 3 | 20 | 45 s | Monter le bassin, puis écarter les genoux contre l'élastique en position haute. |
| Mollets 1 jambe | 4 | 15–20 | 45 s | Sur une marche, une jambe, monter haut, descendre en étirant, contrôler. |


## DÉBUTANT — FORCE 3 j/sem — SALLE  [POWERLIFTING]

*Starting Strength / GZCLP · Linéaire · RPE 7–8 · Repos 3–5 min · 75–85% 1RM*


### Séance A — HOMME & FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat | 3 | 5 | 3–5 min | Mouvement clé · Pieds largeur d'épaules, descendre sous la parallèle, dos neutre, pousser le sol, genoux dans l'axe des pieds. |
| Développé couché | 3 | 5 | 3–5 min | Mouvement clé · Omoplates serrées et basses, léger arch, descendre la barre au bas des pecs, coudes ~45°, pousser en ligne. |
| Rowing barre | 3 | 5–8 | 2–3 min | Buste penché ~45°, tirer la barre vers le nombril, serrer les omoplates, dos neutre, pas de balancier. |
| Gainage (planche) | 3 | 30 s | 60 s | Corps en ligne, fessiers et abdos serrés, ne pas cambrer ni lever les fesses, respirer. |


### Séance B — HOMME & FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat | 3 | 5 | 3–5 min | Plus léger que la séance A · Pieds largeur d'épaules, descendre sous la parallèle, dos neutre, pousser le sol, genoux dans l'axe des pieds. |
| Développé militaire | 3 | 5 | 3–5 min | Mouvement clé · Debout gainé, barre du haut des pecs jusqu'au-dessus de la tête, fessiers serrés, pas de cambrure lombaire. |
| Soulevé de terre | 1 | 5 | 3–5 min | 1 seule série lourde · Barre au milieu du pied, dos neutre gainé, pousser le sol, hanches et épaules montent ensemble. |
| Traction / Tirage vertical | 3 | 6–10 | 2 min | Traction : amener la poitrine vers la barre. Trop dur ? Version assistée à l'élastique. |


### Notes Force débutant


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Femme : micro-plaques de 1,25 kg sur le développé couché et militaire | — | — | — | Préserve la progression linéaire plus longtemps |
| Progression : +2,5 kg en haut du corps · +5 kg en bas chaque séance | — | — | — | 3 échecs d'affilée → on enlève 10% et on remonte |


## INTERMÉDIAIRE — FORCE 4 j/sem — SALLE  [POWERLIFTING]

*Wendler 5/3/1 (TM = 90% du 1RM) · RPE 7–9 · Repos 3–5 min · Deload semaine 4*


### Le cycle 5/3/1 (s'applique à chaque mouvement clé)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Semaine 1 : 5 @ 65% · 5 @ 75% · 5+ @ 85% (AMRAP) | 1 | 5/5/5+ | 3–5 min | Dernier set jusqu'à la dernière rep propre |
| Semaine 2 : 3 @ 70% · 3 @ 80% · 3+ @ 90% | 1 | 3/3/3+ | 3–5 min |   |
| Semaine 3 : 5 @ 75% · 3 @ 85% · 1+ @ 95% | 1 | 5/3/1+ | 3–5 min |   |
| Semaine 4 : deload 5 @ 40% · 5 @ 50% · 5 @ 60% | 1 | 5/5/5 | 2–3 min | Semaine légère, récupération |


### Jour 1 — SQUAT — HOMME & FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat (schéma 5/3/1) | 3 | voir cycle | 3–5 min | Même technique que le squat. Suivre les %1RM du cycle, dernier set en AMRAP propre. |
| Supplémentaire : Squat 5×10 @50% (BBB) | 5 | 10 | 2–3 min | Charge légère, but = volume. Technique propre, repos court (~2 min). |
| Leg curl | 3 | 10–15 | 90 s | Fléchir le genou en contractant les ischios, pause courte, descente lente et contrôlée. |
| Gainage anti-extension | 3 | 30–45 s | 60 s | Planche stricte : empêcher le bas du dos de cambrer, abdos serrés en permanence. |


### Jour 2 — DÉVELOPPÉ COUCHÉ — HOMME & FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé couché (5/3/1) | 3 | voir cycle | 3–5 min | Technique stricte, suivre les % du cycle, dernier set en AMRAP propre, drive des jambes. |
| Supplémentaire : DC 5×10 (BBB) | 5 | 10 | 2–3 min | Charge légère (~50% TM), volume, repos court, technique propre. |
| Traction | 3 | 8–12 | 90 s | Prise un peu plus large que les épaules, monter le menton au-dessus de la barre, descente complète contrôlée. |
| Curls + Triceps | 3 | 10–15 | 75 s | Curl : coudes fixes. Triceps : coudes fixes, n'étendre que l'avant-bras. Superset pour le bras. |


### Jour 3 — SOULEVÉ DE TERRE — HOMME & FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Soulevé de terre (5/3/1) | 3 | voir cycle | 3–5 min | Technique stricte, suivre les % du cycle, 1 série lourde suffit (récup), dos neutre. |
| Supplémentaire : SdT 5×5 (FSL @ poids sem 1) | 5 | 5 | 2–3 min | First Set Last : reprendre le poids de la 1re série pour du volume contrôlé. |
| Hyperextensions / Good morning | 3 | 10–12 | 90 s | Hyperextension : buste à l'horizontale, serrer fessiers/ischios. Good morning : charnière de hanche dos neutre. |
| Gainage anti-rotation | 3 | 30 s | 60 s | Résister à la rotation (pallof press) : tronc immobile, abdos serrés. |


### Jour 4 — DÉVELOPPÉ MILITAIRE — HOMME & FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé militaire (5/3/1) | 3 | voir cycle | 3–5 min | Debout gainé, fessiers serrés, suivre les % du cycle, pas de cambrure, dernier set AMRAP. |
| Supplémentaire : Militaire 5×10 (BBB) | 5 | 10 | 2–3 min | Charge légère, volume épaules, repos court, gainage constant. |
| Rowing | 3 | 8–12 | 90 s | Tirer vers le bas-ventre, coudes le long du corps, serrer les omoplates, ne pas balancer le buste. |
| Élévations latérales | 3 | 12–15 | 60 s | Monter les bras à l'horizontale, coudes légèrement fléchis, ne pas hausser les épaules (trapèzes). |


### Ajustements FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Ajouter une 2e séance Développé couché dans la semaine (5/3/1 ou volume) | — | — | 3–5 min | Gains haut du corps supérieurs chez la femme |
| Réduire le repos sur les accessoires d'environ 20% | — | — | ~2 min | Récupération inter-séries plus rapide |


## AVANCÉ / PRO — FORCE 4–6 j/sem — SALLE  [POWERLIFTING]

*Périodisation par blocs (Sheiko / Bloc / Westside) · RPE 7–9, pics 10 en peaking · Repos 3–6 min*


### Logique des blocs (cycle complet)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Accumulation (4 sem) : 65–75% 1RM, 3–6 reps, volume élevé | — | 12–24 reps/zone | 3–4 min | Prilepin zone 70–80% |
| Intensification (3 sem) : 75–85%, 2–4 reps | — | 10–20 reps/zone | 3–5 min | Prilepin zone 80–90% |
| Réalisation / Peaking (2 sem) : 85–95%+, 1–2 reps | — | 4–10 reps/zone | 4–6 min | Prilepin zone 90%+ |
| Taper 7–10 j avant compétition · openers ~93% du 1RM visé | — | singles | — | Récupérer la fraîcheur |


### Jour SQUAT (bloc intensification) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat (lourd) | 4–5 | 3 | 4–5 min | RPE 8–9 · Échauffement progressif, technique parfaite, arrêter à 1-2 reps de l'échec (RPE 8-9). |
| Squat pause 2–3 s | 3 | 3 | 3 min | Point faible : bas du squat · Pause complète en bas sans relâcher la tension, puis remonter explosif. Travaille le point mort. |
| Hip thrust / Good morning | 3 | 6–8 | 2 min | Hanche / lockout · Hip thrust : serrer les fessiers en haut. Good morning : charnière de hanche, dos neutre, ischios étirés. |
| Gainage anti-extension | 3 | 10–15 | 90 s | Planche stricte : empêcher le bas du dos de cambrer, abdos serrés en permanence. |


### Jour DÉVELOPPÉ COUCHÉ (bloc intensification) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Développé couché (lourd) | 4–5 | 3 | 4–5 min | RPE 8–9 · Omoplates verrouillées, drive des jambes, arrêter à RPE 8-9, trajectoire constante. |
| DC pause 1–3 s | 3 | 3–4 | 3 min | Point faible : décollage poitrine · Pause 1-3 s barre sur la poitrine sans rebond, puis pousser. Renforce le décollage de poitrine. |
| Close-grip / Board press | 3 | 5–6 | 2–3 min | Point faible : lockout triceps · Prise serrée (largeur d'épaules) ou planche sur la poitrine : surcharge les triceps et le lockout. |
| Tractions + Oiseau | 3 | 8–12 | 90 s | Équilibre dos / épaules · Traction : poitrine vers la barre. Oiseau : arrière d'épaule, léger. Équilibre tirage/épaules. |


### Jour SOULEVÉ DE TERRE (bloc intensification) — HOMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Soulevé de terre (lourd) | 3–4 | 2–3 | 4–6 min | RPE 8–9 · 1×/sem lourd · Barre au milieu du pied, dos neutre, pousser le sol, 1×/sem lourd seulement, RPE 8-9. |
| Deficit deadlift 2–5 cm | 3 | 3 | 3 min | Point faible : décollage du sol · Debout sur un disque/step : amplitude augmentée, renforce le décollage du sol. |
| Rack / Block pull | 3 | 3–5 | 3 min | Point faible : lockout · Barre surélevée (hauteur genoux) : surcharge le lockout, on peut charger plus lourd. |
| RDL + Gainage | 3 | 6–10 | 2 min | Chaîne postérieure · RDL : charnière de hanche, ischios étirés. Gainage : tronc immobile et serré. |


### Jour SQUAT — FEMME


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat (lourd) | 4–5 | 3 | 3–4 min | Fréquence squat 2,5–3×/sem · Échauffement progressif, technique parfaite, arrêter à 1-2 reps de l'échec (RPE 8-9). |
| Squat pause / Front squat | 3 | 4–5 | 2,5 min | Repos accessoires −20% · Pause en bas ou front squat torse vertical : renforce la sortie du squat. |
| Hip thrust haltère lourd | 4 | 5–6 | 2,5 min | Volume d'accumulation supérieur · Haltère lourd sur les hanches, dos calé, monter en serrant les fessiers, ne pas cambrer. |
| Fente bulgare | 3 | 8–12 | 90 s | Pied arrière surélevé, descendre droit, poids sur la jambe avant, léger penché du buste en avant. |
| Abduction hanche | 3 | 15 | 45 s | Écarter la cuisse contre la résistance, contrôler le retour, sentir le moyen fessier sur le côté. |


### Sélection des accessoires selon le point faible


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Squat faible en bas → front squat, pause squat, pin/Anderson squat | — | — | — |   |
| SdT faible au décollage → deficit, pause sous genou, front squat | — | — | — |   |
| DC faible au lockout → close-grip, board press, dips lestés | — | — | — |   |
| SdT faible au lockout → rack/block pull, RDL, good morning | — | — | — |   |


## FORCE — MAISON (variante d'ENTRETIEN)  [POWERLIFTING limité]

*⚠ Sans barre + rack, on entretient la force générale, on ne maximise pas le 1RM*


### Maison-Partielle — HOMME & FEMME (haltères lourds + banc + barre de traction)


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| Goblet / Front squat haltères lourds | 4 | 5–8 | 3–4 min | RPE 7–9 · Haltère(s) près du buste, torse vertical, descendre profond, pousser fort les talons. |
| Développé haltères (banc/sol) | 4 | 5–8 | 3 min | Banc ou sol, descendre en étirant les pecs, pousser en ligne, ne pas cogner les haltères. |
| RDL haltères lourd | 4 | 5–8 | 3 min | Charnière de hanche stricte, dos neutre, haltères collés aux jambes, remontée en serrant les fessiers. |
| Traction lestée | 4 | 5–8 | 3 min | Ajouter du poids à la ceinture, amplitude complète, aucun balancier. |
| Fente bulgare lestée | 3 | 6–10 | 2 min | Pied arrière surélevé + haltères, descente lente, poussée sur le talon avant. |


### Message à afficher à l'utilisateur


| Exercice | Séries | Reps | Repos | Conseil technique |
|---|---|---|---|---|
| « Pour un objectif Force/Powerlifting optimal, un rack + barre + plaques est requis. Sinon ce programme bâtit une base de force solide mais ne maximise pas le 1RM aux 3 mouvements. » | — | — | — |   |



---

# Cardio & Échauffement


## ÉCHAUFFEMENT


### 1) Échauffement général (5–8 min, avant chaque séance)


| Étape | Durée | Intensité | Détail |
|---|---|---|---|
| Cardio léger | 3–5 min | Facile | Vélo / rameur / marche rapide : élever la température corporelle |
| Mobilité dynamique | 2–3 min | — | Cercles d'épaules, rotations de hanches, fentes dynamiques, balancements de jambes |
| Activation | 1–2 min | Légère | Bandes : band pull-apart (épaules), monster walk (fessiers) avant le bas du corps |


### 2) Montée en charge (ramp-up) sur le 1er exercice lourd

Avant les séries de travail, on monte progressivement. Exemple pour un squat de travail à 100 kg × 5 :


| Série d'approche | Charge | Reps | But |
|---|---|---|---|
| 1 | Barre à vide (20 kg) | 8–10 | Rodage technique |
| 2 | 40% (40 kg) | 5 | Patron moteur |
| 3 | 60% (60 kg) | 3 |   |
| 4 | 75% (75 kg) | 2 |   |
| 5 | 90% (90 kg) | 1 | Dernière approche |
| → Travail | 100% du poids de travail (100 kg) | 5 | Séries comptées |

Les exercices suivants de la séance ne nécessitent qu'1 série d'approche légère (les muscles sont déjà chauds).


## CARDIO — zones, protocoles, placement


### Zones de fréquence cardiaque (FCmax ≈ 220 − âge)


| Zone | % FCmax | Ressenti | Usage |
|---|---|---|---|
| Zone 1 | 50–60% | Très facile, conversation aisée | Récupération active, échauffement |
| Zone 2 (LISS) | 60–70% | Facile, conversation possible | Brûle-graisse principal, peu de fatigue · CARDIO DE BASE |
| Zone 3 | 70–80% | Modéré, phrases courtes | Endurance, à doser (fatigue +) |
| Zone 4–5 (HIIT) | 80–95%+ | Très dur, pas de parole | Intervalles courts, max 1×/sem en sèche |


### Protocole LISS (Low Intensity Steady State)


| Paramètre | Valeur |
|---|---|
| Format | Marche inclinée / vélo / rameur en continu |
| Durée | 20–40 min |
| Intensité | Zone 2 (60–70% FCmax) |
| Avantage | Très peu d'interférence avec la muscu, récupération facile |


### Protocole HIIT (sèche uniquement, max 1×/sem)


| Paramètre | Valeur |
|---|---|
| Échauffement | 3–5 min facile |
| Intervalles | 10 × (30 s effort intense / 60 s récup) |
| Support | Vélo / rameur (peu d'impact, préserve les jambes) |
| Retour au calme | 3–5 min facile |
| ⚠ Précaution | Pas le même jour qu'une séance de jambes lourde |


### Placement anti-interférence (Schumann et al. 2022)

La force MAX n'est pas compromise par le cardio, mais la force EXPLOSIVE oui (surtout en même séance). Règles : (1) cardio de préférence les jours OFF, (2) sinon ≥3 h après la muscu, (3) si même séance : muscu D'ABORD, cardio après, (4) privilégier le vélo (moins de dégâts musculaires que la course).


### Dose de cardio par objectif (rappel)


| Objectif | Cardio /sem |
|---|---|
| Prise de masse | 1–2 × 20–30 min Z2 (santé/récup) |
| Recomposition | 2–3 × 25 min Z2 |
| Sèche | 2–4 × 20–40 min Z2 + 1 HIIT optionnel |
| Maintien | 2–3 × 30 min Z2 (santé) |
| Force / Powerlifter | Minimal : 1–2 × LISS, à distance des séances lourdes |



---

# Progression & Charges


## ESTIMER SON 1RM (formule d'Epley)

1RM ≈ poids × (1 + reps / 30).  Ex. 80 kg × 5 reps → 80 × (1 + 5/30) = 93 kg estimé. Sert à fixer les %1RM (force) et à suivre la progression sans tester le max.


### Table %1RM ↔ reps (repère rapide)


| Reps possibles | % du 1RM | Usage typique |
|---|---|---|
| 1 | 100% | Test max / peaking |
| 2 | 95% | Force |
| 3 | 93% | Force |
| 4 | 90% | Force |
| 5 | 87% | Force / hypertrophie lourde |
| 6 | 85% | Force / hypertrophie |
| 8 | 80% | Hypertrophie |
| 10 | 75% | Hypertrophie |
| 12 | 70% | Hypertrophie / endurance |
| 15 | 65% | Endurance musculaire |


## CHOISIR SA CHARGE DE DÉPART


| Situation | Méthode |
|---|---|
| Débutant total | Commencer à la barre à vide ou très léger, ajouter à chaque séance tant que la technique est propre (RIR 2–3) |
| Connaît son ~max | Utiliser la table %1RM ci-dessus : hypertrophie 70–80%, force 80–90% |
| Ne connaît pas son max | Choisir un poids où la dernière rep prévue laisse 2–3 reps en réserve (RIR 2–3), puis ajuster |


## LA DOUBLE PROGRESSION (cœur de l'hypertrophie)

On progresse d'abord en REPS dans une fourchette, puis en CHARGE quand le haut de la fourchette est atteint sur toutes les séries.


### Exemple — développé couché, fourchette 8–10 reps, 4 séries


| Semaine | Charge | Reps réalisées | Action |
|---|---|---|---|
| S1 | 60 kg | 8/8/8/8 | On garde, on vise +reps |
| S2 | 60 kg | 9/9/8/8 | Progresse en reps |
| S3 | 60 kg | 10/10/10/10 | Haut de fourchette atteint → +charge |
| S4 | 62,5 kg | 8/8/8/8 | On repart en bas de fourchette |


## LA SEMAINE DE DELOAD (exemple concret)

But : dissiper la fatigue accumulée sans perdre les acquis. On réduit le VOLUME (~40–50% des séries), on garde une intensité modérée (~80–90% des charges habituelles). Fréquence : voir Matrice (hyp. 4–6 sem · force = semaine 4 du cycle 5/3/1 ou 4–6 sem).


### Exemple — semaine normale → semaine deload (Intermédiaire, bas du corps)


| Exercice | Semaine normale | Semaine deload |
|---|---|---|
| Squat | 4 séries × 6 @ 100 kg | 2 séries × 5 @ 85 kg |
| RDL | 3 séries × 8 @ 80 kg | 2 séries × 8 @ 65 kg |
| Hip thrust | 3 séries × 10 @ 90 kg | 2 séries × 10 @ 75 kg |
| Accessoires | 3 séries chacun | 1–2 séries chacun |
| Cardio | Normal | Réduit / marche facile |

Variante Force (5/3/1) : semaine 4 = 5 reps @ 40%, 50%, 60% du Training Max. Puis on reprend un cycle avec +2,5 kg (haut) / +5 kg (bas) au TM.



---

# Planning hebdo


## ORGANISER SA SEMAINE

Règle d'or : espacer les séances qui sollicitent les mêmes muscles, et placer au moins 1 jour de repos après les séances les plus lourdes. Voici des trames types selon le nombre de séances.


### 3 séances — Full Body (Débutant · hyp. ou force)


| 3 j/sem | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|---|---|---|---|---|---|---|---|
| Séance | Full Body A | Repos | Full Body B | Repos | Full Body A | Repos | Repos |


### 4 séances — Half Body Haut/Bas (Intermédiaire)


| 4 j/sem | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|---|---|---|---|---|---|---|---|
| Séance | Haut | Bas | Repos | Haut | Bas | Repos | Repos |


### 4 séances — Force 5/3/1 (Intermédiaire)


| 4 j/sem | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|---|---|---|---|---|---|---|---|
| Séance | Squat | DC | Repos | SdT | Militaire | Repos | Repos |


### 5 séances — PPL + Haut/Bas (Avancé intermédiaire)


| 5 j/sem | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|---|---|---|---|---|---|---|---|
| Séance | Push | Pull | Legs | Repos | Haut | Bas | Repos |


### 6 séances — Push/Pull/Legs ×2 (Avancé)


| 6 j/sem | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|---|---|---|---|---|---|---|---|
| Séance | Push A | Pull A | Legs A | Push B | Pull B | Legs B | Repos |


### Où placer le cardio

Idéalement les jours de repos, ou ≥3 h après la muscu. Évite le HIIT la veille ou le jour d'une grosse séance de jambes. Le LISS (marche/vélo facile) peut se faire presque tous les jours sans gêner la récupération.



---

# Banque d'exercices


## BANQUE D'EXERCICES — Équivalence SALLE ↔ MAISON


### HYPERTROPHIE — schémas de base


| Schéma / Muscle | Salle (meilleurs exos) | Maison (haltères / élastique / PdC) |
|---|---|---|
| Squat (quadriceps) | Back squat · Front squat · Hack squat | Goblet squat · Front squat haltères · Fente bulgare |
| Charnière hanche (ischios/fessiers) | Soulevé de terre · RDL · Trap-bar | RDL haltères · RDL 1 jambe · Good morning élastique |
| Extension hanche (fessiers) | Hip thrust barre | Hip thrust haltère au sol · Hip thrust élastique |
| Poussée horizontale (pecs) | Développé couché · incliné · écarté poulie | Développé haltères · Pompes (déclinées, archer, déficit) |
| Poussée verticale (épaules) | Développé militaire · presse épaules machine | Développé haltères · Pike push-up · Handstand push-up |
| Tirage horizontal (dos) | Rowing barre · poulie · chest-supported | Rowing 1 bras haltère · Rowing inversé · tirage élastique |
| Tirage vertical (dos) | Traction · tirage vertical poulie | Traction barre de porte · tirage élastique · assistée |
| Isolation quadriceps | Leg extension | Sissy squat · Spanish squat · split squat lent |
| Isolation ischios | Leg curl | Nordic curl assisté · leg curl élastique · glissé |
| Isolation fessiers | Kickback poulie · abduction machine | Kickback élastique · clamshell · abduction au sol |
| Mollets | Mollets debout / assis machine | Mollet 1 jambe sur marche (haltère) |
| Épaules latérales | Élévations latérales poulie/haltères | Élévations latérales haltères/élastique |
| Biceps | Curl barre/haltères/poulie | Curl haltères/élastique |
| Triceps | Pushdown · extension overhead | Extension haltère · dips entre chaises · pompes serrées |
| Gainage / abdos | Relevé jambes suspendu · crunch poulie | Planche · hollow hold · dead bug · crunch élastique |


### FORCE / POWERLIFTING — accessoires & correction des points faibles


| Schéma / Muscle | Salle (meilleurs exos) | Maison (haltères / élastique / PdC) |
|---|---|---|
| Squat — bas (quads) | Front squat · Pause squat (2–4 s) · Pin/Anderson squat | Front squat haltères · Pause goblet squat |
| Squat — milieu (hanche) | Hip thrust lesté · Deadlift hyperextension | Hip thrust haltère · Pont fessier lesté |
| Squat — dos qui s'arrondit | Pause squat · SSB good morning · Chest-supported row | Good morning élastique · Rowing haltère |
| DC — décollage poitrine | Pause bench (1–3 s) · DC large · Larsen press | Développé haltères pause · Pompes lestées |
| DC — lockout (triceps) | Close-grip bench · Board press · JM press · Dips lestés | Pompes serrées lestées · Extension triceps lourde |
| SdT — décollage sol (quads) | Deficit deadlift · Pause sous genou · Front squat | RDL déficit haltères |
| SdT — lockout (hanche/dos) | Rack/Block pull · RDL · Good morning | RDL haltères lourd · Good morning élastique |
| Volume de soutien (T2) | Variations des mvts clés 3×6–8 @ 70–80% | Variations haltères 4×6–8 |
| Hypertrophie de soutien (T3) | Rowing · RDL · Curls · Latérales · Abdos 3×10–15 | Idem en haltères/élastiques |



---

# Technique SBD


## TECHNIQUE DES 3 MOUVEMENTS — Squat · Développé couché · Soulevé de terre


### SQUAT


| Respiration / gainage | Inspirer dans le ventre (360°) avant la descente, bloquer (Valsalva), pousser contre la ceinture. |
|---|---|
| Dos / barre | « Rentrer les coudes sous la barre », serrer les dorsaux, cage haute. |
| Profondeur | Pli de hanche sous le haut du genou (standard IPF 2026). |
| Sortie du bas | « Trapèzes en arrière, hanches dessous » (évite l'hyperextension lombaire). |
| Stance | Sit down = plus vertical/quadriceps · Sit back = plus chaîne postérieure. |


### DÉVELOPPÉ COUCHÉ


| Barre | « Serrer la barre au maximum », « casser la barre en deux » à la descente (active les dorsaux). |
|---|---|
| Position | Cage haute, omoplates serrées et basses, léger arch, fessiers contractés. |
| Jambes | Drive via les talons dans le sol (pas de poussée du buste — interdit IPF 2026). |
| Coudes | NE PAS sur-rentrer ; « visser les épaules » pour le lockout. |
| IPF 2026 | Lockout complet des coudes avant le « start » ; pas de relance du buste. |


### SOULEVÉ DE TERRE


| Placement | Barre au-dessus du milieu du pied, tibias proches. |
|---|---|
| Dorsaux | « Protéger les aisselles » : serrer les dorsaux, barre collée aux tibias. |
| Gainage | Charnière de hanche, dos rigide neutre, Valsalva avant de tirer. |
| Tirage | « Pousser le sol » (conventionnel) ou « écarter les genoux » (sumo). |
| Lockout | Épaules derrière la barre, sans hyperextension lombaire (règle IPF 2026). |



---

# Repères de volume


## REPÈRES DE VOLUME — séries par muscle et par semaine (Renaissance Periodization)


### MEV = minimum efficace · MAV = zone optimale (cible) · MRV = maximum récupérable (plafond)


| Muscle | MEV | MAV | MRV | Commentaire |
|---|---|---|---|---|
| Pectoraux | 8 | 12–20 | 22 |   |
| Dos | 10 | 14–22 | 25 | Tolère un gros volume |
| Épaules (latéral) | 8 | 16–22 | 26 | Récupère vite |
| Biceps | 6 | 14–20 | 26 |   |
| Triceps | 6 | 10–18 | 22 |   |
| Quadriceps | 8 | 12–18 | 20 |   |
| Ischios | 6 | 10–16 | 20 |   |
| Fessiers | 6 | 12–24 | 30 | Prioritaire femme : 14–24, jusqu'à 30+ |
| Mollets | 8 | 12–16 | 20 |   |
| Abdos | 6 | 16–20 | 25 |   |


## ZONES D'INTENSITÉ — FORCE (chart de Prilepin)


| Zone %1RM | Reps / série | Total reps optimal | Plage totale | Usage (bloc) |
|---|---|---|---|---|
| 55–65 % | 3–6 | 24 | 18–30 | Échauffement / technique |
| 70–80 % | 3–6 | 18 | 12–24 | Accumulation |
| 80–90 % | 2–4 | 15 | 10–20 | Intensification |
| 90 %+ | 1–2 | 7 | 4–10 | Peaking / réalisation |



---

# Nutrition


## NUTRITION — calculer son maintien et ses macros

Si Forga gère déjà la nutrition via une autre fonctionnalité, cet onglet sert de référence et peut être retiré. Sinon, voici la méthode.


### 1) Calcul du métabolisme de base (Mifflin-St Jeor)


| Sexe | Formule (BMR, kcal/jour) |
|---|---|
| Homme | 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5 |
| Femme | 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge − 161 |


### 2) Multiplier par le niveau d'activité → TDEE (maintien)


| Activité | Facteur |
|---|---|
| Sédentaire | × 1,2 |
| Léger (1–3 séances/sem) | × 1,375 |
| Modéré (3–5 séances/sem) | × 1,55 |
| Intense (6 séances/sem) | × 1,725 |


### 3) Ajuster selon l'objectif


| Objectif | Ajustement kcal | Protéines | Reste |
|---|---|---|---|
| Prise de masse | +10 à +20% | 1,6–2,2 g/kg PC | Lipides 0,8–1 g/kg, glucides = le reste |
| Recomposition | Maintien à −300 kcal | 1,8–2,4 g/kg PC | idem |
| Sèche | −15 à −25% | 2,3–3,1 g/kg masse maigre | Lipides ≥0,6 g/kg, glucides = le reste |
| Maintien | Maintien | 1,4–1,6 g/kg PC | Équilibré |
| Force | Maintien à +5–15% | 1,6–2,2 g/kg PC | Glucides 4–6 g/kg (carburant) |


### Exemple chiffré — Homme 75 kg, 178 cm, 25 ans, 4 séances/sem


| Étape | Calcul | Résultat |
|---|---|---|
| BMR | 10×75 + 6,25×178 − 5×25 + 5 | 1 743 kcal |
| TDEE (×1,55) | 1 743 × 1,55 | ≈ 2 700 kcal (maintien) |
| Prise de masse (+15%) | 2 700 × 1,15 | ≈ 3 100 kcal |
| Sèche (−20%) | 2 700 × 0,80 | ≈ 2 160 kcal |
| Protéines (prise de masse) | 75 × 2 g | 150 g (≈ 600 kcal) |
| Lipides | 75 × 0,9 g | ≈ 68 g (≈ 610 kcal) |
| Glucides (prise de masse) | reste : (3100 − 600 − 610) / 4 | ≈ 470 g |


### Repères pratiques

• 1 g protéine/lipide/glucide = 4 / 9 / 4 kcal.  • Répartir les protéines sur 3–5 repas (~0,4 g/kg par repas).  • Pré/post-training : glucides + protéines.  • Hydratation 30–40 ml/kg/jour.  • La régularité hebdomadaire compte plus que la perfection d'un repas.



---

# Récup & Femmes


## RÉCUPÉRATION


### Les piliers de la récupération


| Sommeil | 7–9 h/nuit. Premier levier de récupération et de progression. Un manque chronique réduit force, hypertrophie et augmente le risque de blessure. |
|---|---|
| Nutrition | Assez de calories et de protéines (voir onglet Nutrition). Un déficit agressif ralentit la récupération → on baisse alors le volume (voir Application par objectif). |
| Jours de repos | Au moins 1–2/sem (voir Planning hebdo). La croissance musculaire se fait PENDANT le repos, pas pendant la séance. |
| Gestion du stress | Le stress de vie (travail, sommeil, etc.) puise dans la même réserve de récupération que l'entraînement. En période chargée → réduire le volume. |
| Deload | Toutes les 4–6 semaines (voir Progression & Charges). Signaux d'alerte : stagnation, sommeil dégradé, motivation en baisse, douleurs articulaires. |


### Mobilité & prévention


| Échauffement | Le meilleur « préhab » = bien s'échauffer et progresser graduellement (voir onglet Cardio & Échauffement). |
|---|---|
| Amplitude | Travailler en amplitude complète et contrôlée renforce les tissus mieux que des étirements passifs isolés. |
| Zones sensibles | Mobilité ciblée si besoin : hanches/chevilles (squat), épaules/poignets (DC), ischios/hanches (SdT). |
| Douleur | Douleur articulaire aiguë ≠ courbature. En cas de douleur, réduire la charge / changer de variante / consulter. Ne pas « pousser à travers ». |


## ENTRAÎNEMENT & CYCLE MENSTRUEL (femmes)

Ce qu'en dit la science (synthèse 2023–2024) : les revues de meilleure qualité (Colenso-Semple, Elliott-Sale & Phillips 2023) concluent qu'il est PRÉMATURÉ d'affirmer que la phase du cycle influence significativement la performance ou les adaptations à la musculation. Les effets rapportés sont faibles, incohérents, et la variabilité entre individus est énorme.


### Recommandations pratiques (et prudentes)


| S'entraîner régulièrement | Le message principal : continuer à s'entraîner tout au long du cycle. Ne pas bâtir le programme autour des phases — les preuves ne le justifient pas. |
|---|---|
| Auto-régulation | Les jours de basse énergie ou d'inconfort, utiliser le RPE/RIR : garder les mêmes exercices mais ajuster la charge/le volume au ressenti, plutôt que d'annuler la séance. |
| Symptômes | Crampes, fatigue, ballonnements peuvent affecter le ressenti et la performance perçue. C'est individuel : encourager chaque utilisatrice à noter ce qui marche POUR ELLE. |
| Fer & énergie | Veiller à des apports suffisants (fer, calories) — des règles abondantes peuvent contribuer à une carence en fer qui impacte l'énergie. Renvoi médecin si fatigue persistante. |
| Ce qu'il NE faut PAS faire | Éviter de promettre dans l'app une « périodisation par phase » comme une science exacte : ce serait du marketing non soutenu par les preuves actuelles. |


---

# Standards de force & classification de niveau

> **But** : permettre à Forga de classer automatiquement un utilisateur en Débutant / Intermédiaire / Avancé (et Élite), séparément pour hommes et femmes, à partir de ses charges.
> **Source principale** : base de données Strength Level (153 M+ levées enregistrées). Définitions de percentiles : Débutant ≈ 5e, Novice ≈ 20e, Intermédiaire ≈ 50e, Avancé ≈ 80e, Élite ≈ 95e.

## Système à 5 niveaux

| Label interne (FR) | Label Strength Level | Percentile | Âge d'entraînement typique |
|---|---|---|---|
| Débutant absolu | Untrained / Beginner | < 5e | 0–1 mois |
| Débutant | Novice | ~20e | 1–6 mois |
| Intermédiaire | Intermediate | ~50e | ~2 ans |
| Avancé | Advanced | ~80e | 5+ ans |
| Pro / Élite | Elite | ~95e | Athlète de force compétitif |

> UI à 3 niveaux possible : Beginner+Novice → **Débutant** · Intermediate → **Intermédiaire** · Advanced+Elite → **Avancé/Pro**.

## Standards en multiples du poids de corps (1RM ÷ poids de corps) — formule à coder

### Hommes

| Mouvement | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| Développé couché | 0,50× | 0,75× | 1,25× | 1,75× | 2,00× |
| Squat | 0,75× | 1,25× | 1,50× | 2,25× | 2,75× |
| Soulevé de terre | 1,00× | 1,50× | 2,00× | 2,50× | 3,00× |
| Développé militaire | 0,35× | 0,55× | 0,80× | 1,10× | 1,40× |

### Femmes

| Mouvement | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| Développé couché | 0,25× | 0,50× | 0,75× | 1,00× | 1,50× |
| Squat | 0,50× | 0,75× | 1,25× | 1,50× | 2,00× |
| Soulevé de terre | 0,50× | 1,00× | 1,25× | 1,75× | 2,50× |
| Développé militaire | 0,20× | 0,35× | 0,50× | 0,75× | 1,00× |

> Désaccord entre sources : ExRx est plus indulgent (données curées), Strength Level plus représentatif des utilisateurs d'apps de log (léger biais vers le haut car auto-déclaré). **Recommandation Forga : utiliser Strength Level par défaut** et le documenter dans l'app.

## Tables de force absolues (kg, 1RM) — à intégrer directement

### Développé couché — Hommes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 60 | 34 | 51 | 72 | 96 | 123 |
| 70 | 44 | 62 | 85 | 112 | 141 |
| 80 | 53 | 74 | 98 | 127 | 157 |
| 90 | 62 | 84 | 111 | 141 | 172 |
| 100 | 71 | 94 | 122 | 153 | 187 |

### Développé couché — Femmes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 50 | 12 | 24 | 40 | 59 | 82 |
| 55 | 15 | 27 | 43 | 64 | 87 |
| 60 | 17 | 29 | 47 | 68 | 92 |
| 70 | 20 | 34 | 53 | 75 | 101 |
| 80 | 24 | 39 | 59 | 82 | 109 |

### Squat — Hommes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 60 | 47 | 68 | 95 | 127 | 161 |
| 70 | 59 | 83 | 113 | 147 | 184 |
| 80 | 72 | 98 | 130 | 166 | 205 |
| 90 | 83 | 112 | 146 | 184 | 225 |
| 100 | 95 | 125 | 160 | 201 | 243 |

### Squat — Femmes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 50 | 23 | 39 | 61 | 87 | 115 |
| 55 | 26 | 43 | 65 | 92 | 122 |
| 60 | 29 | 47 | 70 | 97 | 128 |
| 70 | 34 | 53 | 78 | 106 | 138 |
| 80 | 39 | 59 | 85 | 115 | 148 |

### Soulevé de terre — Hommes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 60 | 58 | 83 | 114 | 149 | 187 |
| 70 | 73 | 100 | 133 | 171 | 212 |
| 80 | 86 | 116 | 151 | 192 | 235 |
| 90 | 99 | 131 | 168 | 211 | 256 |
| 100 | 111 | 145 | 184 | 228 | 275 |

### Soulevé de terre — Femmes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 50 | 31 | 49 | 73 | 102 | 133 |
| 55 | 34 | 53 | 78 | 107 | 140 |
| 60 | 37 | 57 | 83 | 113 | 146 |
| 70 | 43 | 64 | 91 | 123 | 157 |
| 80 | 48 | 71 | 99 | 132 | 168 |

### Développé militaire — Hommes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 60 | 21 | 32 | 47 | 64 | 84 |
| 70 | 27 | 40 | 56 | 75 | 95 |
| 80 | 33 | 47 | 64 | 84 | 106 |
| 90 | 39 | 54 | 72 | 93 | 116 |
| 100 | 44 | 60 | 79 | 102 | 125 |

### Développé militaire — Femmes (kg)
| Poids corps | Débutant | Novice | Intermédiaire | Avancé | Élite |
|---|---|---|---|---|---|
| 50 | 10 | 17 | 28 | 40 | 55 |
| 55 | 11 | 19 | 30 | 43 | 58 |
| 60 | 12 | 21 | 32 | 45 | 60 |
| 70 | 15 | 24 | 35 | 50 | 65 |
| 80 | 17 | 26 | 39 | 54 | 70 |

> Pour les poids de corps intermédiaires : interpolation linéaire entre les lignes.

## Critères de transition de niveau (logique d'app la plus importante)

Les chiffres bruts ne suffisent pas : le modèle Rippetoe (*Practical Programming*) définit les niveaux par **la vitesse à laquelle on peut encore récupérer et ajouter du poids**, pas par la charge absolue. C'est la logique de classement **prioritaire** ; les tables ne sont qu'un contrôle secondaire.

| Niveau | Marqueur pratique | Cadence de progression | Âge d'entraînement |
|---|---|---|---|
| Débutant (Novice) | Peut ajouter du poids **à chaque séance** (linéaire : +2,5 kg haut / +5 kg bas par séance) sans casser la technique | Séance à séance | 0–6 mois |
| Intermédiaire | La progression linéaire est **bloquée**. Les PR arrivent **semaine par semaine** (périodisation hebdo/ondulatoire). Progrès ~5–10 kg/mois par mouvement | Micro-cycles hebdo | 6 mois – 2 ans |
| Avancé | Plus de PR hebdo fiables. Nécessite des **blocs périodisés mensuels/trimestriels** (mésocycles, peaking, deloads). Progrès annuel 5–15 kg/mouvement | Périodisation mensuelle/annuelle | 3–5+ ans |
| Élite / Pro | Années d'entraînement, compétitif, ~95e percentile | Blocs longs | 5–10+ ans |

### Arbre de décision recommandé (à coder)
1. Demander l'historique d'entraînement (mois d'entraînement régulier).
2. Question : « Peux-tu encore ajouter du poids à la barre à chaque séance sur les mouvements principaux ? » (oui/non).
3. Tester le 1RM estimé via un max sur 3–5 reps + formule d'Epley `1RM = poids × (1 + reps/30)` (validée ±2–4 %).
4. Comparer le 1RM aux tables en multiples du poids de corps.
5. **Niveau de l'utilisateur = MINIMUM de (niveau âge d'entraînement, niveau progression linéaire, niveau numérique)** → empêche la sur-classification.
6. Afficher le niveau **par mouvement** (la plupart des gens sont à des niveaux différents selon les lifts) + un niveau global = le plus bas des quatre. Montrer « l'écart en kg jusqu'au niveau suivant » comme objectif motivant.

## Notes spécifiques au sexe
- **Écart haut du corps large, écart bas du corps faible.** Ratios femme/homme au niveau Intermédiaire : développé couché **60 %**, militaire **62,5 %**, squat **83 %**, soulevé de terre **62,5 %**. Ne pas appliquer un coefficient unique — utiliser les tables femmes dédiées.
- **Vitesse de progression relative comparable.** Communiquer la progression en **gain relatif** (%), pas en kg absolus, pour un message mixte équitable.
- **Pas de « formule femme ».** Mêmes mouvements, mêmes principes ; seules les charges absolues diffèrent.
- Après 40 ans : soustraire ~5 % du 1RM absolu par décennie (concerne le haut de la tranche 18–45 de Forga).

> ⚠️ Données Strength Level auto-déclarées (léger biais vers le haut), mais c'est le bon repère pour un public actif d'app fitness. Tables basées sur un vrai 1RM technique (squat à la parallèle, DC en pause, sans sangles). En 1RM estimé, prévoir ±2–4 % de dérive.


---

# Suppléments fondés sur la science

> **But** : module honnête qui sépare ce qui marche de ce qui est survendu. Architecture en 3 tiers (✅ Prendre / ⚠️ Conditionnel / ❌ Inutile), alignée sur le cadre AIS (Australian Institute of Sport, groupes A/B/C/D), le consensus CIO 2018 (Maughan et al., *Br J Sports Med*) et les position stands de l'ISSN.
> Le CIO 2018 est explicite : seuls **caféine, créatine, agents tampons spécifiques et nitrate** ont de bonnes preuves de bénéfice. Tout le reste vit dans un tier de preuves bien plus faible.

## ✅ TIER 1 — PREUVES FORTES (ça marche vraiment) — Groupe A

| Supplément | Effet prouvé | Niveau de preuve | Dosage | Timing | Précautions |
|---|---|---|---|---|---|
| **Créatine monohydrate** | +10–40 % phosphocréatine ; +1,46 kg masse maigre (combinée à la muscu) + gains de force | FORT (ISSN 2017, >1000 études, AIS A) | Charge 20 g/j (4×5 g) 5–7 j puis 3–5 g/j ; OU 3–5 g/j sans charge (saturation en ~3–4 sem) | Quotidien, peu importe l'heure ; post-training avec glucides marginalement optimal | Seul le **monohydrate** a les preuves (pas HCl/buffered/ester). ~1 kg d'eau intramusculaire. Sûr jusqu'à 30 g/j chez le sujet sain |
| **Caféine** | Réduit l'effort perçu ; améliore endurance, sprint, saut, force | FORT (ISSN 2021, AIS A, CIO confirmé) | **3–6 mg/kg** (70 kg → 210–420 mg). Mini efficace ~2 mg/kg. ≥9 mg/kg = pas mieux + effets indésirables | ~60 min avant (capsules/café) ; gomme ~10–20 min | Varie selon génotype (CYP1A2). Éviter 6–8 h avant le coucher. Grossesse : ≤200 mg/j |
| **Bêta-alanine** | ↑ carnosine musculaire (tampon H⁺) ; retarde la fatigue sur efforts 1–10 min | FORT (ISSN 2015, AIS A) | **4–6 g/j**, en doses ≤2 g, pendant ≥2–4 sem (charge chronique) | Réparti dans la journée avec les repas | Picotements (paresthésie) sans danger ; doses fractionnées pour les réduire. Marginal pour le 1RM pur |
| **Nitrate / jus de betterave** | Vasodilatation, ↓ coût en O₂, ↑ fibres II ; endurance & efforts intermittents | FORT pour endurance (AIS A ; méta Senefeld 2020) | **6–13 mmol (~370–800 mg)** de nitrate, 2–3 h avant ; ou ≥3 j en chronique | 2–3 h avant l'effort | Faible pour le 1RM pur. Éviter bain de bouche antibactérien (tue les bactéries orales nécessaires) |
| **Bicarbonate de sodium** | Tampon extracellulaire ; efforts max 1–7 min | FORT (AIS A, CIO confirmé) | 0,2–0,4 g/kg, 60–180 min avant | Pré-effort | Troubles digestifs fréquents ; formes encapsulées + montée progressive. Usage de niche (sports de combat, 400–1500 m) |
| **Protéine / whey** (aliment, pas « supplément ») | Moyen pratique d'atteindre l'apport protéique quotidien | FORT comme outil ; faible pour un effet « fenêtre anabolique » aigu | Total **1,4–2,0 g/kg/j** (jusqu'à **2,3–3,1 g/kg en sèche**) ; par repas **0,25 g/kg ou 20–40 g** (700–3000 mg leucine), toutes les 3–4 h | Réparti sur 3–5 repas ; caséine 30–40 g avant le coucher (modeste) | Pas indispensable si l'apport alimentaire suffit. Whey = plus riche en leucine ; blends végétaux (pois+riz) → portions ~25–30 % plus grandes |

## ⚠️ TIER 2 — CONDITIONNEL (seulement si besoin spécifique)

| Supplément | Effet | Niveau de preuve | Dosage | Quand |
|---|---|---|---|---|
| **Vitamine D₃** | Effets sur muscle/os/immunité ; ergogénique **uniquement si carence** | MODÉRÉ (si 25(OH)D < 75 nmol/L) | 1 000–2 000 UI/j entretien ; 4 000 UI/j charge puis 1 000 UI/j si insuffisance | Tester le sang d'abord. Sportifs en intérieur / latitude >40° (toute la France) oct.–mars souvent concernés |
| **Oméga-3 (EPA+DHA)** | ↓ modeste des courbatures/inflammation ; santé cardio/cerveau. **PAS** un constructeur de muscle si protéines suffisantes | MODÉRÉ pour récupération | **≥2 400 mg/j EPA+DHA pendant ≥4,5 sem** | Choisir marques testées (IFOS/tiers) ; végan = DHA d'algue |
| **Citrulline malate** | ↓ légère des courbatures et de l'effort perçu ; petit effet sur reps-jusqu'à-l'échec | FAIBLE à MODÉRÉ (pas d'effet établi sur le 1RM ni l'endurance) | 6–8 g (citrulline malate) 60 min avant | Optionnel, non essentiel. La plupart des pre-workout sous-dosent (<3 g = inutile) |

## ❌ TIER 3 — PREUVES INSUFFISANTES / INUTILE (Groupe C/D)

| Supplément | Verdict | Pourquoi |
|---|---|---|
| **BCAA** (seuls) | INUTILE si protéines suffisantes | Wolfe 2017 (ISSN) : la prétention que les BCAA seuls stimulent la synthèse protéique est « injustifiée ». Manquent les 6 autres acides aminés essentiels. AIS groupe C. Si tu atteins 1,6–2,2 g/kg de protéines → **zéro** apport |
| **Glutamine** | INUTILE pour muscle/force | Examine : « ne modifie pas la composition corporelle ni le gain musculaire ». Utilité mineure intestin chez l'endurant très chargé |
| **Multivitamines** | INUTILE chez l'adulte bien nourri | CIO 2018 : pas recommandé en routine ; seulement après carence documentée |
| **ZMA** | FAIBLE/NUL | Koehler 2007 : « aucun effet significatif sur la testostérone » chez sujet non carencé en zinc. Léger effet sommeil possible (magnésium seul) |
| **Tribulus / « boosters de testostérone » / acide D-aspartique** | NUL chez l'homme sain | Aucun complément en vente libre n'augmente fiablement la testostérone chez l'homme eugonadique |
| **Magnésium (performance)** | Seulement si carence | N'améliore pas la performance chez le non-carencé (AIS B au mieux) |

## Pre-workout : ce qu'il y a vraiment dedans

Analyse des 100 pre-workout les plus vendus (Jagim et al., *Nutrients* 2019) :

| Ingrédient | Présence | Dose moyenne/portion | Dose efficace | Verdict |
|---|---|---|---|---|
| Bêta-alanine | 87 % | 2,0 g | 3,2–6,4 g/j chronique | Sous-dosé/portion (mais seule la charge chronique compte) |
| Caféine | 86 % | 254 mg | 3–6 mg/kg | Souvent bien dosé |
| Citrulline | 71 % | 4,0 g | 6–8 g | Souvent sous-dosé |
| Tyrosine | 63 % | — | preuves faibles | Remplissage |
| Taurine | 51 % | — | faible/nul | Remplissage |
| Créatine | 49 % | 2,1 g | 3–5 g/j | Souvent sous-dosé |

> 44,3 % des ingrédients sont cachés dans des « proprietary blends » sans dose individuelle = signal d'alerte.
> **Message Forga** : un café (~100–200 mg caféine) + tes 5 g de créatine + tes 4 g/j de bêta-alanine battent la plupart des pots de marque, pour une fraction du prix. Pour l'effet « pump », ajouter 6–8 g de citrulline malate.

## Recommandations module suppléments
1. Structurer en 3 tiers honnêtes (✅ / ⚠️ / ❌) comme ci-dessus.
2. Afficher les doses exactes (mg/kg, grammes) et citer la source à côté de chaque entrée (ISSN, CIO 2018, AIS).
3. Carte pédagogique « ce qu'il y a dans ton pre-workout » : nommer les 4 ingrédients fondés (caféine, créatine, bêta-alanine, citrulline) + alerte sur les blends propriétaires et la citrulline sous-dosée.
4. Recommander des produits certifiés (Informed-Sport, NSF Certified for Sport, Cologne List) pour limiter la contamination.
5. Disclaimer in-app : valable pour adultes sains 18–45 ans ; grossesse/allaitement/pathologies/mineurs → avis médical.
6. Données femmes sous-représentées dans la littérature : effets répliqués mais intervalles de confiance plus larges. **Ne pas vendre de « formule femme »** — la science ne soutient pas des doses différentes pour un même supplément.


---

# Sources scientifiques

## Entraînement (hypertrophie / force)
- **Volume** : Schoenfeld, Ogborn & Krieger (2017), *J Sports Sci* 35:1073–82 · Pelland et al. (2026), *Sports Med* 56(2):481–505
- **Fréquence** : Schoenfeld, Grgic & Krieger (2019) — ≥2×/muscle/sem > 1×
- **Charge / reps** : Schoenfeld, Grgic, Ogborn & Krieger (2017), *JSCR* 31:3508–23
- **Repos** : Schoenfeld et al. (2016), *JSCR* 30:1805–12 — 3 min > 1 min
- **Proximité de l'échec (RIR)** : Refalo et al. (2023), *Sports Medicine - Open* 9:10
- **Tempo** : Schoenfeld, Ogborn & Krieger (2015) · Enes/Schoenfeld (2025), *JSCR* 39:1331–9
- **Volume MEV/MAV/MRV** : Israetel / Renaissance Periodization
- **Recomposition** : Barakat et al. (2020), *Strength & Conditioning Journal*
- **Cardio / interférence** : Schumann et al. (2022), *Sports Med* 52(3):601–12
- **Recommandations générales** : ACSM Position Stand (mars 2026, Phillips et al.)
- **Différences H/F** : Roberts, Nuckols & Krieger (2020), *JSCR* 34(5):1448–60 · Hunter (2014), *Acta Physiol* · Ansdell et al. (2019), *J Physiol*
- **Périodisation** : Williams et al. (2017), *Sports Med* 47:2083–2100
- **Fréquence force** : Colquhoun et al. (2018), *JSCR* 32(5):1207–13
- **Programmes force** : Starting Strength (Rippetoe) · 5/3/1 (Wendler) · GZCL (Lefever) · Sheiko · Westside · RTS (Tuchscherer)
- **Prilepin** : chart de Prilepin (école russe)
- **Technique SBD** : Stronger by Science (Nuckols) · IPF Technical Rules 2026
- **Deload** : Bell et al. (2023), *Sports Medicine - Open* 9:87
- **Cycle menstruel** : Colenso-Semple, D'Souza, Elliott-Sale & Phillips (2023), *Front Sports Act Living* 5:1054542 · Niering et al. (2024), *Sports* 12:31

## Nutrition & 1RM
- **TDEE** : Mifflin-St Jeor (1990)
- **Protéines** : Jäger et al., ISSN Position Stand (2017) · Morton et al. (2018), *BJSM*
- **Sèche / off-season** : Helms, Aragon & Fitschen (2014), *JISSN* · Iraki et al. (2019), *Sports*
- **Estimation 1RM** : formule d'Epley `1RM = poids × (1 + reps/30)`

## Standards de force
- **Strength Level** (strengthlevel.com) — base de 153 M+ levées (percentiles)
- **ExRx.net** strength standards (Kilgore) — repère plus indulgent
- **Rippetoe**, *Practical Programming* — critères de transition de niveau
- **OpenPowerlifting** — percentiles pour le contexte powerlifting

## Suppléments
- **ISSN Position Stands** : Kreider et al. 2017 (créatine) · Guest et al. 2021 (caféine) · Trexler et al. 2015 (bêta-alanine) · Jäger et al. 2017 (protéines) · Wolfe 2017 (BCAA)
- **CIO** : Maughan et al. (2018), consensus sur les compléments, *Br J Sports Med* / *IJSNEM* 28:104–125
- **AIS** : cadre ABCD (Australian Institute of Sport, 2024)
- **Nitrate** : Senefeld et al. (2020), *MSSE* 52(10):2250–61 · Tian et al. (2025), *Nutrients* 17(12):1958
- **Oméga-3** : Martínez-Ferrán et al. (2024), *Nutrients*
- **ZMA** : Koehler et al. (2007), *Eur J Appl Physiol*
- **Tribulus** : Pacheco et al. (2025), *Nutrients* (PMC11990417)
- **Pre-workout** : Jagim, Harty & Camic (2019), *Nutrients* 11(2):254
- **Examine.com** — synthèses de doses et de preuves

---

*Avertissement : repères issus de la littérature (population souvent jeune et masculine). À individualiser et faire valider par un coach diplômé STAPS / kiné avant publication officielle Forga. Non médical.*
