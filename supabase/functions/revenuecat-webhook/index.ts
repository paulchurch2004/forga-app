// Edge Function : webhook RevenueCat → Supabase.
//
// RÔLE : faire de la DB la SOURCE DE VÉRITÉ de l'abonnement. Quand RevenueCat
// constate un achat / renouvellement / annulation / expiration / remboursement,
// il appelle cette fonction, qui met à jour public.users.is_premium /
// premium_until via la clé service_role (seule autorisée à écrire ces champs
// depuis la migration 027). Le client ne peut plus se déclarer premium.
//
// DÉPLOIEMENT (voir aussi les notes en bas) :
//   1. supabase secrets set REVENUECAT_WEBHOOK_SECRET="un-secret-long-aleatoire"
//   2. supabase functions deploy revenuecat-webhook --no-verify-jwt
//   3. Dashboard RevenueCat → Integrations → Webhooks :
//        URL    = https://<projet>.supabase.co/functions/v1/revenuecat-webhook
//        Header Authorization = le MÊME secret qu'en étape 1
//
// SÉCURITÉ : on n'agit que si le header Authorization == REVENUECAT_WEBHOOK_SECRET.
// (--no-verify-jwt est sûr ici car on fait notre propre authentification.)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
const PREMIUM_ENTITLEMENT = 'premium';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIFETIME_MS = 100 * 365 * 24 * 60 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // 1. Authentification : RevenueCat renvoie le header Authorization qu'on a
  //    configuré dans son dashboard. On le compare à notre secret.
  const auth = req.headers.get('Authorization') ?? '';
  if (!WEBHOOK_SECRET || auth !== WEBHOOK_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const event = payload?.event ?? {};
  const type: string = event.type ?? '';

  // Événement de test envoyé depuis le dashboard RevenueCat → OK, no-op.
  if (type === 'TEST') return json({ ok: true, test: true });

  // 2. Retrouver l'utilisateur Supabase. app_user_id = l'id passé à
  //    RevenueCat.configure() (notre UUID Supabase). On gère aussi les alias.
  const candidates: string[] = [
    event.app_user_id,
    event.original_app_user_id,
    ...(Array.isArray(event.aliases) ? event.aliases : []),
  ].filter(Boolean);
  const userId = candidates.find((c) => UUID_RE.test(c));

  // Achat anonyme (avant login) ou id non-UUID → on ignore proprement (200,
  // sinon RevenueCat réessaierait en boucle).
  if (!userId) return json({ ok: true, skipped: 'no_supabase_user' });

  // 3. Ne traiter que l'entitlement "premium" (s'il est précisé).
  const entIds: string[] = event.entitlement_ids
    ?? (event.entitlement_id ? [event.entitlement_id] : []);
  if (entIds.length > 0 && !entIds.includes(PREMIUM_ENTITLEMENT)) {
    return json({ ok: true, skipped: 'other_entitlement' });
  }

  // 4. Déterminer l'état premium à partir du type + date d'expiration.
  const now = Date.now();
  const expMs: number | null =
    typeof event.expiration_at_ms === 'number' ? event.expiration_at_ms
    : (typeof event.grace_period_expiration_at_ms === 'number' ? event.grace_period_expiration_at_ms : null);

  let isPremium: boolean;
  let premiumUntilIso: string | null;

  if (type === 'EXPIRATION' || type === 'SUBSCRIPTION_PAUSED') {
    // Abonnement réellement terminé / en pause → plus de premium.
    isPremium = false;
    premiumUntilIso = expMs ? new Date(expMs).toISOString() : null;
  } else if (expMs != null) {
    // Achat / renouvellement / annulation (accès jusqu'à la fin de période) /
    // billing issue (période de grâce) → premium tant que la date est future.
    isPremium = expMs > now;
    premiumUntilIso = new Date(expMs).toISOString();
  } else {
    // Pas d'expiration (achat non-renouvelable / à vie) → premium sauf annulation.
    isPremium = type !== 'CANCELLATION';
    premiumUntilIso = isPremium ? new Date(now + LIFETIME_MS).toISOString() : null;
  }

  // 5. Écrire en base (service_role → bypass RLS, seule source autorisée).
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const update: Record<string, unknown> = {
    is_premium: isPremium,
    premium_until: premiumUntilIso,
  };
  // Conversion payante → on sort l'utilisateur du flux d'essai (évite les
  // relances "ton essai se termine" envoyées à un abonné payant).
  if (isPremium) {
    update.trial_state = 'converted';
    update.trial_source = 'paid_conversion';
  }

  const { error } = await supabase.from('users').update(update).eq('id', userId);
  if (error) {
    // 5xx → RevenueCat réessaiera automatiquement (back-off intégré).
    return json({ error: error.message }, 500);
  }

  return json({ ok: true, user_id: userId, is_premium: isPremium, type });
});
