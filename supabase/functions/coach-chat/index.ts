import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
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

interface CoachContext {
  firstName: string;
  hour: number;
  currentStreak: number;
  mealsValidatedCount: number;
  mealsExpected: number;
  score: { total: number; nutrition: number; consistency: number; progression: number; discipline: number };
  objective: string;
  consumedProtein: number;
  targetProtein: number;
  consumedCalories: number;
  targetCalories: number;
  consumedCarbs: number;
  targetCarbs: number;
  consumedFat: number;
  targetFat: number;
}

function buildSystemPrompt(ctx: CoachContext): string {
  const objectiveLabels: Record<string, string> = {
    bulk: 'prise de masse',
    cut: 'sèche / perte de gras',
    maintain: 'maintien',
    recomp: 'recomposition corporelle',
  };

  return `Tu es FORGA Coach, un coach sportif et nutritionnel personnel dans l'application FORGA.
Tu parles en français, tu tutoies l'utilisateur, tu es motivant, direct et concis (2-3 phrases max par réponse).
Tu utilises les données en temps réel de l'utilisateur pour personnaliser tes conseils.

Données actuelles de ${ctx.firstName} :
- Objectif : ${objectiveLabels[ctx.objective] || ctx.objective}
- Score FORGA : ${ctx.score.total}/100 (nutrition: ${ctx.score.nutrition}, régularité: ${ctx.score.consistency}, progression: ${ctx.score.progression}, discipline: ${ctx.score.discipline})
- Calories : ${ctx.consumedCalories}/${ctx.targetCalories} kcal consommées
- Protéines : ${ctx.consumedProtein}/${ctx.targetProtein}g
- Glucides : ${ctx.consumedCarbs}/${ctx.targetCarbs}g
- Lipides : ${ctx.consumedFat}/${ctx.targetFat}g
- Repas validés aujourd'hui : ${ctx.mealsValidatedCount}/${ctx.mealsExpected}
- Streak actuel : ${ctx.currentStreak} jours consécutifs
- Heure actuelle : ${ctx.hour}h

Règles strictes :
- Ne donne JAMAIS de conseil médical ou de diagnostic
- Reste sur le sport, la nutrition et la motivation
- Sois concis : 2-3 phrases maximum par réponse
- Utilise le prénom de l'utilisateur naturellement
- Si la question est hors sujet, redirige poliment vers le sport/nutrition
- Ne mentionne jamais que tu es une IA ou un modèle de langage`;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // JWT verification is handled by Supabase gateway (--no-verify-jwt for this function)
    // Coach chat is a non-sensitive endpoint, no user auth required

    const { message, context, history } = await req.json();

    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: 'Message and context required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build messages array with system prompt + history + current message
    const systemPrompt = buildSystemPrompt(context);
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include last 10 messages for conversational memory
      ...(history || []).slice(-10),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'ai_unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return new Response(
        JSON.stringify({ error: 'ai_unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
