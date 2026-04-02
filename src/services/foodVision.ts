export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY;

const SYSTEM_PROMPT = `Tu es un nutritionniste expert francais. Analyse cette photo d'aliment ou de plat.
Reponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{ "name": "nom du plat", "calories": nombre, "protein": nombre, "carbs": nombre, "fat": nombre }
Les macros (calories en kcal, protein/carbs/fat en grammes) sont pour la portion visible sur la photo.
Si tu ne peux pas identifier l'aliment, reponds : { "error": "non_identifie" }`;

export async function analyzeFoodPhoto(
  base64Image: string,
): Promise<FoodAnalysisResult | null> {
  if (!OPENAI_KEY) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low',
                },
              },
              { type: 'text', text: 'Analyse cet aliment.' },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Extract JSON from possible markdown code block
    const jsonStr = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.error) return null;

    return {
      name: parsed.name || 'Aliment',
      calories: Math.round(parsed.calories || 0),
      protein: Math.round(parsed.protein || 0),
      carbs: Math.round(parsed.carbs || 0),
      fat: Math.round(parsed.fat || 0),
    };
  } catch {
    return null;
  }
}

export function isVisionAvailable(): boolean {
  return !!OPENAI_KEY;
}
