import { supabase, isDemoMode } from './supabase';

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /**
   * Décomposition ingrédient + quantité que GPT-4o a identifiée sur la photo.
   * Quand présente, l'app peut résoudre les ingrédients contre la DB locale
   * (~1 000 items) pour des macros exactes au lieu des estimations vision.
   */
  items?: Array<{ name: string; quantityG: number }>;
}

export interface QuotaInfo {
  used: number;
  cap: number;
  bonus: number;
  remaining: number;
}

export type FoodVisionResult =
  | { kind: 'ok'; data: FoodAnalysisResult; quota: QuotaInfo }
  | { kind: 'quota_exceeded'; message: string; quota: QuotaInfo }
  | { kind: 'unrecognized' }
  | { kind: 'error' };

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export async function analyzeFoodPhoto(base64Image: string): Promise<FoodVisionResult> {
  if (isDemoMode || !SUPABASE_URL) return { kind: 'error' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { kind: 'error' };

    const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ base64Image }),
    });

    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      return {
        kind: 'quota_exceeded',
        message: body?.message ?? 'Limite de scans atteinte aujourd\'hui.',
        quota: body?.quota ?? { used: 0, cap: 3, bonus: 0, remaining: 0 },
      };
    }

    if (!res.ok) return { kind: 'error' };

    const data = await res.json();
    if (data.error === 'unrecognized') return { kind: 'unrecognized' };
    if (data.error) return { kind: 'error' };

    // Items optionnels : si GPT-4o a décomposé en ingrédients, on les
    // propage à l'appelant pour résolution locale via INGREDIENTS_ALL.
    let items: Array<{ name: string; quantityG: number }> | undefined;
    if (Array.isArray(data.items)) {
      items = data.items
        .filter(
          (it: any) =>
            it && typeof it.name === 'string' && typeof it.quantityG === 'number',
        )
        .map((it: any) => ({
          name: String(it.name).trim(),
          quantityG: Math.max(0, Math.round(it.quantityG)),
        }));
      if (items && items.length === 0) items = undefined;
    }

    return {
      kind: 'ok',
      data: {
        name: data.name || 'Aliment',
        calories: Math.round(data.calories || 0),
        protein: Math.round(data.protein || 0),
        carbs: Math.round(data.carbs || 0),
        fat: Math.round(data.fat || 0),
        items,
      },
      quota: data.quota ?? { used: 0, cap: 3, bonus: 0, remaining: 0 },
    };
  } catch {
    return { kind: 'error' };
  }
}

export function isVisionAvailable(): boolean {
  return !isDemoMode && !!SUPABASE_URL;
}
