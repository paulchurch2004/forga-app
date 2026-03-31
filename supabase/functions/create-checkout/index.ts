import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const PRICES: Record<string, string> = {
  monthly: Deno.env.get('STRIPE_PRICE_MONTHLY')!,
  annual: Deno.env.get('STRIPE_PRICE_ANNUAL')!,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, userId, returnUrl } = await req.json();

    if (!plan || !PRICES[plan]) {
      return new Response(
        JSON.stringify({ error: 'Plan invalide. Utilise "monthly" ou "annual".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      client_reference_id: userId,
      success_url: `${returnUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/paywall`,
      subscription_data: {
        trial_period_days: 7,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
