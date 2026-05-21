/**
 * Open Food Facts wrapper — base de données collaborative ~2M produits
 * avec code-barres et macros. Gratuit, sans clé, focalisé France.
 *
 * Deux modes d'usage :
 *  - `fetchProductByBarcode(ean)`   — scan EAN-13 → produit unique
 *  - `searchProductByName(query)`   — recherche texte (ex "nutella")
 *
 * Caching : un petit LRU en mémoire évite de re-fetch le même produit
 * dans la même session. Le cache n'est PAS persistant — c'est volontaire,
 * la DB OFF évolue et un cache disque devrait être invalidé régulièrement.
 */

export interface OpenFoodFactsProduct {
  /** Nom affiché à l'user. Préfère `product_name_fr`. */
  name: string;
  /** Marque si disponible (ex "Ferrero"). */
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  /** Portion type indiquée par le fabricant, en grammes/ml. 100 par défaut. */
  servingSize: number;
  /** EAN-13 si récupéré via barcode lookup. */
  barcode?: string;
  imageUrl?: string;
  /** Score de pertinence pour les recherches texte. 1.0 = match exact. */
  matchConfidence?: number;
}

/** Cache mémoire — clé = barcode OU `name:<query>`. Max 200 entrées,
 *  expulsion FIFO. */
const cache = new Map<string, OpenFoodFactsProduct | null>();
const CACHE_MAX = 200;

function cacheSet(key: string, value: OpenFoodFactsProduct | null): void {
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, value);
}

function parseProduct(p: any, barcode?: string): OpenFoodFactsProduct | null {
  const n = p?.nutriments;
  if (!n) return null;

  const name =
    p.product_name_fr ||
    p.product_name ||
    p.generic_name_fr ||
    p.generic_name ||
    null;
  if (!name) return null;

  // OFF expose souvent énergie en kJ ; convertir en kcal si seulement kJ est dispo.
  let kcal: number = n['energy-kcal_100g'];
  if (!kcal && n['energy_100g']) kcal = n['energy_100g'] / 4.184;
  if (!kcal && n['energy-kj_100g']) kcal = n['energy-kj_100g'] / 4.184;
  if (!kcal) return null;

  let servingSize = 100;
  if (p.serving_quantity) {
    servingSize = parseFloat(p.serving_quantity) || 100;
  } else if (typeof p.serving_size === 'string') {
    const match = p.serving_size.match(/(\d+(?:[.,]\d+)?)/);
    if (match) servingSize = parseFloat(match[1].replace(',', '.')) || 100;
  }

  return {
    name,
    brand: p.brands || undefined,
    caloriesPer100g: Math.round(kcal),
    proteinPer100g: Math.round((n.proteins_100g || 0) * 10) / 10,
    carbsPer100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    fatPer100g: Math.round((n.fat_100g || 0) * 10) / 10,
    servingSize,
    barcode,
    imageUrl: p.image_front_small_url || p.image_url || undefined,
  };
}

/** Lookup par code-barres EAN. Validation stricte 8–14 chiffres avant
 *  de gaspiller un round-trip réseau. */
export async function fetchProductByBarcode(
  barcode: string,
): Promise<OpenFoodFactsProduct | null> {
  if (!/^\d{8,14}$/.test(barcode)) return null;

  if (cache.has(barcode)) return cache.get(barcode) ?? null;

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { headers: { 'User-Agent': 'FORGA/1.0 (support.forga@gmail.com)' } },
    );
    if (!res.ok) {
      cacheSet(barcode, null);
      return null;
    }

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      cacheSet(barcode, null);
      return null;
    }

    const parsed = parseProduct(data.product, barcode);
    cacheSet(barcode, parsed);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Recherche texte. Retourne jusqu'à `limit` produits triés par
 * pertinence (algo OFF). Filtre dur sur les produits qui ont au
 * minimum énergie + protéines documentées — sinon on aurait des
 * fiches OFF incomplètes qui pollueraient les suggestions.
 *
 * `country=france` biaise les résultats vers les références FR
 * (sinon on tape souvent dans la version US d'un produit, avec
 * d'autres tailles de portion / formulations différentes).
 */
export async function searchProductByName(
  query: string,
  limit: number = 5,
): Promise<OpenFoodFactsProduct[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = `name:${trimmed.toLowerCase()}:${limit}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    return cached ? [cached] : [];
  }

  try {
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=${encodeURIComponent(trimmed)}` +
      `&search_simple=1&action=process&json=1` +
      `&page_size=${limit}` +
      `&tagtype_0=countries&tag_contains_0=contains&tag_0=france` +
      `&sort_by=popularity_key`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FORGA/1.0 (support.forga@gmail.com)' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const products: any[] = data.products || [];

    const parsed = products
      .map((p) => parseProduct(p))
      .filter((p): p is OpenFoodFactsProduct =>
        p !== null && p.caloriesPer100g > 0 && p.proteinPer100g >= 0,
      );

    // Cache seulement le premier résultat (le meilleur match) — c'est
    // ce qu'on consommera en pratique pour la résolution coach.
    if (parsed.length > 0) cacheSet(cacheKey, parsed[0]);

    return parsed;
  } catch {
    return [];
  }
}

/** Convenience : meilleur match unique par nom, ou null. */
export async function findBestMatchByName(
  query: string,
): Promise<OpenFoodFactsProduct | null> {
  const results = await searchProductByName(query, 1);
  return results[0] ?? null;
}
