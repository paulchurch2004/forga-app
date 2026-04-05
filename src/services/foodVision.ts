import { supabase, isDemoMode } from './supabase';

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export async function analyzeFoodPhoto(
  base64Image: string,
): Promise<FoodAnalysisResult | null> {
  if (isDemoMode || !SUPABASE_URL) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    return {
      name: data.name || 'Aliment',
      calories: Math.round(data.calories || 0),
      protein: Math.round(data.protein || 0),
      carbs: Math.round(data.carbs || 0),
      fat: Math.round(data.fat || 0),
    };
  } catch {
    return null;
  }
}

export function isVisionAvailable(): boolean {
  return !isDemoMode && !!SUPABASE_URL;
}
