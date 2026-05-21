import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'https://forga.fr').split(',');

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

const SYSTEM_PROMPT = `Tu es un nutritionniste expert francais. Analyse cette photo d'aliment ou de plat.

Reponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans explication :
{
  "name": "nom du plat",
  "calories": nombre, "protein": nombre, "carbs": nombre, "fat": nombre,
  "items": [
    { "name": "nom de l'ingredient identifie", "quantityG": nombre }
  ]
}

Regles :
- name : court (2-5 mots), le nom du plat tel qu'on l'appelle en France
- calories en kcal, protein/carbs/fat en grammes, pour la portion VISIBLE sur la photo
- items : liste des ingredients identifies avec leur quantite estimee en grammes
  - Decompose au maximum (ex : "burger" -> pain + steak + cheddar + salade + tomate + sauce)
  - Pour les marques visibles (Coca, Big Mac, Snickers) : 1 item avec le nom de la marque
  - quantityG = poids estime en grammes (1ml ~ 1g pour les liquides)
- Si tu ne peux pas identifier l'aliment du tout : { "error": "non_identifie" }

L'app dispose d'une base de ~1000 ingredients FR (CIQUAL/USDA + marques) et resout les items en macros exactes. Plus tu decompo es precisement, plus la macro finale est juste.`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ✅ Quota check AVANT appel GPT-4o
    const { data: quotaCheck, error: quotaError } = await supabase.rpc(
      'check_and_increment_quota',
      {
        p_user_id: user.id,
        p_feature: 'food_scan',
        p_daily_cap: 3,
      },
    );

    if (quotaError || !quotaCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'quota_exceeded',
          message: 'Limite de scans atteinte. Regarde une vidéo pour +1 scan bonus.',
          quota: quotaCheck,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { base64Image } = await req.json();

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: 'Image required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Analysis failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No result' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const jsonStr = content.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.error) {
      return new Response(
        JSON.stringify({ error: 'unrecognized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Propage le tableau `items` si GPT-4o l'a renvoye — l'app le resoudra
    // contre INGREDIENTS_ALL pour des macros precises.
    let items: Array<{ name: string; quantityG: number }> | undefined;
    if (Array.isArray(parsed.items)) {
      items = parsed.items
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

    return new Response(
      JSON.stringify({
        name: parsed.name || 'Aliment',
        calories: Math.round(parsed.calories || 0),
        protein: Math.round(parsed.protein || 0),
        carbs: Math.round(parsed.carbs || 0),
        fat: Math.round(parsed.fat || 0),
        items,
        quota: quotaCheck,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
