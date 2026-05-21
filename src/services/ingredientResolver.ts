import Fuse from 'fuse.js';
import type { Ingredient } from '../types/meal';
import { INGREDIENTS_ALL } from '../data/ingredients';
import { findBestMatchByName, type OpenFoodFactsProduct } from './openFoodFacts';

/**
 * Résolution d'un texte en langage naturel → ingrédient avec macros réelles.
 *
 * Pourquoi ce module existe : les LLM hallucinent les macros. On préfère
 * matcher contre des données déterministes (DB locale CIQUAL/USDA, puis
 * Open Food Facts si miss) et n'utiliser l'estimation IA qu'en dernier
 * recours, avec un flag explicite pour pouvoir l'afficher à l'user.
 *
 * Pipeline :
 *   1. Fuzzy match local (Fuse.js sur INGREDIENTS_ALL ≈ 1 000 entrées)
 *      → seuil de confiance ≥ 0.6 : `source = 'local'`
 *   2. Si miss, recherche Open Food Facts (texte FR)
 *      → si trouvé : `source = 'open_food_facts'`
 *   3. Si toujours rien : retourne null. C'est l'appelant qui décidera
 *      de demander une estimation IA (marquée comme telle).
 *
 * Le mode `allowNetwork=false` court-circuite l'étape 2 pour les
 * contextes où on ne veut pas de round-trip (ex. parcours offline,
 * suggestions instantanées dans une autocomplete).
 */

export type ResolutionSource = 'local' | 'open_food_facts' | 'estimated';

export interface ResolvedIngredient {
  ingredient: Ingredient;
  source: ResolutionSource;
  /** 0–1. 1.0 = match exact, ≥0.6 = match utilisable, <0.6 = à confirmer. */
  confidence: number;
  /** Texte original de l'user. Permet de tracer pour debug. */
  query: string;
  /** Présent si la source est OFF — meta-info pour l'UI (image, marque). */
  offProduct?: OpenFoodFactsProduct;
}

export interface ResolverOptions {
  /** Autorise l'appel réseau (Open Food Facts). Défaut true. */
  allowNetwork?: boolean;
  /** Seuil minimal pour accepter un match local. Défaut 0.6. */
  minConfidence?: number;
}

/**
 * Index Fuse pour le matching local. Construit une fois au premier appel.
 * On indexe la NAME, et on garde l'objet entier dans `item` pour retour direct.
 */
let fuseIndex: Fuse<Ingredient> | null = null;

function getFuse(): Fuse<Ingredient> {
  if (fuseIndex) return fuseIndex;
  const items = Object.values(INGREDIENTS_ALL);
  fuseIndex = new Fuse(items, {
    keys: ['name'],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
  return fuseIndex;
}

/** Fuse score : 0 = parfait, 1 = nul. On inverse pour exposer une
 *  "confidence" 0–1 où 1 = parfait. */
function scoreToConfidence(score: number | undefined): number {
  if (score === undefined) return 0.5;
  return Math.max(0, Math.min(1, 1 - score));
}

/** Convertit un produit OFF en Ingredient pour qu'il s'intègre
 *  transparentement aux flows existants (calcul de portions, etc.).
 *  L'ID est préfixé `off_` + slug du barcode (si dispo) ou du nom. */
function ingredientFromOFF(p: OpenFoodFactsProduct): Ingredient {
  const idSafe = (p.barcode ||
    p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40)) || 'unknown';
  return {
    id: `off_${idSafe}`,
    name: p.name,
    caloriesPer100g: p.caloriesPer100g,
    proteinPer100g: p.proteinPer100g,
    carbsPer100g: p.carbsPer100g,
    fatPer100g: p.fatPer100g,
    unit: 'g',
    // Si le fabricant déclare une portion < 100g, c'est probablement la
    // portion attendue (ex Nutella : 15g). Sinon arrondi 10g standard.
    roundTo: p.servingSize > 0 && p.servingSize <= 50 ? Math.round(p.servingSize) : 10,
  };
}

/**
 * Point d'entrée principal. Retourne `null` si rien ne matche assez bien.
 * Dans ce cas l'appelant peut soit (a) demander une estimation IA, soit
 * (b) afficher une UI "ingrédient inconnu, à logger manuellement".
 */
export async function resolveIngredient(
  query: string,
  options: ResolverOptions = {},
): Promise<ResolvedIngredient | null> {
  const { allowNetwork = true, minConfidence = 0.6 } = options;
  const trimmed = query.trim();
  if (!trimmed) return null;

  // Étape 1 — match local (rapide, déterministe, offline-ok).
  const fuse = getFuse();
  const localResults = fuse.search(trimmed, { limit: 3 });
  const bestLocal = localResults[0];

  if (bestLocal) {
    const confidence = scoreToConfidence(bestLocal.score);
    if (confidence >= minConfidence) {
      return {
        ingredient: bestLocal.item,
        source: 'local',
        confidence,
        query: trimmed,
      };
    }
  }

  // Étape 2 — fallback Open Food Facts si autorisé.
  if (allowNetwork) {
    const offProduct = await findBestMatchByName(trimmed);
    if (offProduct) {
      return {
        ingredient: ingredientFromOFF(offProduct),
        source: 'open_food_facts',
        // Confiance modérée — OFF peut retourner un produit voisin
        // (ex "Nutella" vs "Nutella & Go") qu'on n'a pas le moyen de
        // valider sans humain. 0.7 par défaut, jamais 1.0.
        confidence: 0.7,
        query: trimmed,
        offProduct,
      };
    }
  }

  // Étape 3 — rien trouvé. On retourne aussi le meilleur match local
  // même s'il est sous le seuil, pour que l'UI puisse proposer
  // "Vous vouliez dire X ?" si la confiance est ≥ 0.3.
  if (bestLocal) {
    const confidence = scoreToConfidence(bestLocal.score);
    if (confidence >= 0.3) {
      return {
        ingredient: bestLocal.item,
        source: 'local',
        confidence,
        query: trimmed,
      };
    }
  }

  return null;
}

/**
 * Résout un lot d'items en parallèle. Utile quand le coach parse
 * "j'ai mangé 200g de riz et un blanc de poulet" → 2 lookups simultanés.
 *
 * Préserve l'ordre de l'input. Les éléments non résolus sont retournés
 * en `null` (l'appelant décide de l'estimation ou de l'abandon).
 */
export async function resolveMany(
  queries: string[],
  options?: ResolverOptions,
): Promise<Array<ResolvedIngredient | null>> {
  return Promise.all(queries.map((q) => resolveIngredient(q, options)));
}

/** Construit un Ingredient "estimé" à partir de macros que l'IA a
 *  proposées. Le flag `source = 'estimated'` permet à l'UI de
 *  flagger la valeur (⚠ icône). À utiliser UNIQUEMENT en dernier recours. */
export function buildEstimatedIngredient(input: {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  query: string;
}): ResolvedIngredient {
  const idSafe = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'estimated';
  return {
    ingredient: {
      id: `est_${idSafe}`,
      name: input.name,
      caloriesPer100g: Math.round(input.caloriesPer100g),
      proteinPer100g: Math.round(input.proteinPer100g * 10) / 10,
      carbsPer100g: Math.round(input.carbsPer100g * 10) / 10,
      fatPer100g: Math.round(input.fatPer100g * 10) / 10,
      unit: 'g',
      roundTo: 10,
    },
    source: 'estimated',
    confidence: 0.4,
    query: input.query,
  };
}
