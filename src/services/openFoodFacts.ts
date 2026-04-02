export interface OpenFoodFactsProduct {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingSize: number; // grams
  imageUrl?: string;
}

export async function fetchProductByBarcode(
  barcode: string,
): Promise<OpenFoodFactsProduct | null> {
  // Validate barcode format (numeric, 8-14 digits)
  if (!/^\d{8,14}$/.test(barcode)) return null;

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments || {};

    const name =
      p.product_name_fr || p.product_name || p.generic_name_fr || 'Produit inconnu';

    // Parse serving size from string like "30 g" or "250 ml"
    let servingSize = 100;
    if (p.serving_quantity) {
      servingSize = parseFloat(p.serving_quantity) || 100;
    } else if (p.serving_size) {
      const match = p.serving_size.match(/(\d+(?:\.\d+)?)/);
      if (match) servingSize = parseFloat(match[1]) || 100;
    }

    return {
      name,
      caloriesPer100g: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0),
      proteinPer100g: Math.round((n.proteins_100g || 0) * 10) / 10,
      carbsPer100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      fatPer100g: Math.round((n.fat_100g || 0) * 10) / 10,
      servingSize,
      imageUrl: p.image_front_small_url || p.image_url || undefined,
    };
  } catch {
    return null;
  }
}
