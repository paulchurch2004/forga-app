/**
 * Service de routing vélo — résolution d'adresses et calcul de
 * distance pour le profil cyclisme commute de l'user.
 *
 * Stack technique : APIs publiques gratuites, 0 dep native :
 *
 *  - **Nominatim** (OpenStreetMap) pour geocoder l'adresse texte en
 *    coordonnées lat/lng. Free, no key, fair-use policy : max 1 req/sec.
 *    Doc : https://nominatim.org/release-docs/develop/api/Search/
 *
 *  - **OSRM public router** profil "cycling" pour calculer la
 *    distance route réelle (pas le straight-line). Free, no key, demo
 *    server. Pour la prod long-terme on hébergera notre propre OSRM
 *    mais pour le launch v1 le demo suffit largement.
 *    Doc : http://project-osrm.org/docs/v5.24.0/api/#route-service
 *
 * Gestion d'erreurs : tout est best-effort. Une adresse invalide
 * ou un timeout réseau retourne null et l'appelant montre une UI
 * "impossible de calculer la distance, ressaye".
 */

export interface GeocodedAddress {
  /** L'adresse normalisée que Nominatim retourne (utile pour confirmer
   *  à l'user que l'app a bien compris). */
  displayName: string;
  lat: number;
  lng: number;
}

/** Une suggestion d'adresse (autocomplete). Identique à `GeocodedAddress`
 *  mais sémantiquement c'est UN choix parmi plusieurs. */
export type AddressSuggestion = GeocodedAddress;

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';

/**
 * Convertit une adresse texte en coordonnées lat/lng.
 *
 * Limit Nominatim : 1 requête/seconde. On compte sur le fait qu'un
 * user fait 2 lookups (home + destination) avec quelques secondes
 * entre chaque saisie, on ne hammer pas.
 *
 * @param address Texte libre saisi par l'user (ex "12 rue de la Paix Paris").
 * @returns Résultat geocodé ou null si non trouvé / erreur réseau.
 */
export async function geocodeAddress(address: string): Promise<GeocodedAddress | null> {
  const trimmed = address.trim();
  if (trimmed.length < 3) return null;

  try {
    const url =
      `${NOMINATIM_BASE}/search?format=json&limit=1` +
      `&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim demande explicitement un User-Agent identifiant
        // l'app (fair-use policy). Sans ça → 403.
        'User-Agent': 'FORGA/1.0 (support.forga@gmail.com)',
        'Accept-Language': 'fr',
      },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      displayName: String(result.display_name ?? trimmed),
      lat,
      lng,
    };
  } catch {
    return null;
  }
}

/**
 * Recherche multi-résultats pour l'autocomplete d'adresse.
 *
 * Diffère de `geocodeAddress` :
 *  - Retourne jusqu'à 5 candidats au lieu d'un seul
 *  - Annulable via AbortSignal (pour debouncer côté UI sans race)
 *  - Tolère les requêtes courtes (≥ 3 caractères) — l'user tape
 *    progressivement
 *  - Pas de fallback à null sur erreur ; throw pour que l'UI puisse
 *    distinguer "réseau KO" de "aucun résultat"
 *
 * Comme `geocodeAddress`, respecte le fair-use Nominatim → l'appelant
 * DOIT debouncer (≥300ms) pour ne pas spammer 1 req/touche.
 */
export async function searchAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url =
    `${NOMINATIM_BASE}/search?format=json&limit=5&addressdetails=0` +
    `&q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, {
    signal,
    headers: {
      'User-Agent': 'FORGA/1.0 (support.forga@gmail.com)',
      'Accept-Language': 'fr',
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((item: any) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        displayName: String(item.display_name ?? trimmed),
        lat,
        lng,
      };
    })
    .filter((x): x is AddressSuggestion => x !== null);
}

/**
 * Calcule la distance d'un trajet vélo entre deux points.
 *
 * On utilise OSRM avec le profil `cycling` qui prend en compte les
 * pistes cyclables, contre-sens autorisés, etc. — plus précis qu'un
 * straight-line × 1.3 (qui sur-estime en ville).
 *
 * @returns Distance one-way en km, ou null si l'API échoue.
 */
export async function computeCyclingDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<number | null> {
  try {
    const url =
      `${OSRM_BASE}/route/v1/cycling/` +
      `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
      `?overview=false&alternatives=false`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data?.code !== 'Ok') return null;

    const meters = data?.routes?.[0]?.distance;
    if (typeof meters !== 'number' || meters < 0) return null;

    // Conversion en km, arrondi à 1 décimale (0.1 km = 100m de précision).
    return Math.round(meters / 100) / 10;
  } catch {
    return null;
  }
}

/**
 * Variante "rapide" de `computeCommuteDistance` : prend des coordonnées
 * déjà geocodées (typiquement issues de `searchAddresses` via
 * l'autocomplete). Skip donc les 2 appels Nominatim et le délai
 * fair-use, et appelle directement OSRM.
 *
 * À utiliser dès qu'on a les lat/lng en main — bien plus rapide UX et
 * pas de risque de "Nominatim ne trouve pas".
 */
export async function computeCommuteDistanceFromCoords(
  home: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<{ distanceKm: number } | null> {
  const distance = await computeCyclingDistance(home, destination);
  if (distance === null) return null;
  return { distanceKm: distance };
}

/**
 * Helper haut-niveau : prend 2 adresses texte, retourne la distance
 * one-way en km et les adresses normalisées. Combine geocoding +
 * routing en 1 appel propre.
 *
 * Délai artificiel de 1.2s entre les 2 geocodings pour respecter
 * la fair-use policy de Nominatim (1 req/sec).
 */
export async function computeCommuteDistance(
  homeAddress: string,
  destinationAddress: string,
): Promise<{
  distanceKm: number;
  homeNormalized: string;
  destinationNormalized: string;
} | null> {
  const home = await geocodeAddress(homeAddress);
  if (!home) return null;

  // Respect Nominatim fair-use policy : 1 req/sec.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const dest = await geocodeAddress(destinationAddress);
  if (!dest) return null;

  const distance = await computeCyclingDistance(
    { lat: home.lat, lng: home.lng },
    { lat: dest.lat, lng: dest.lng },
  );
  if (distance === null) return null;

  return {
    distanceKm: distance,
    homeNormalized: home.displayName,
    destinationNormalized: dest.displayName,
  };
}

/**
 * Calcule les kcal/jour dépensées en moyenne sur 7 jours pour un
 * trajet commute donné.
 *
 * Formule : kcal/km dépend du poids et du sexe (le vélo brûle moins
 * pour les corps plus légers). Valeurs basées sur tables MET ACSM.
 *
 *   - Homme 75kg @ 18 km/h : ~32 kcal/km
 *   - Femme 60kg @ 18 km/h : ~26 kcal/km
 *
 * Le modèle prend un middle ground proportionnel au poids :
 *   kcal/km = poids × 0.42
 *
 * Puis on répartit sur 7 jours pour éviter les pics de calories
 * jour de boulot vs weekend qui désorientent l'user.
 */
export function computeCyclingKcalPerDay(
  distanceKmOneWay: number,
  daysPerWeek: number,
  bodyWeightKg: number,
): number {
  if (distanceKmOneWay <= 0 || daysPerWeek <= 0 || bodyWeightKg <= 0) return 0;

  const kcalPerKm = bodyWeightKg * 0.42;
  const kmPerWeek = distanceKmOneWay * 2 * daysPerWeek;
  const kcalPerWeek = kmPerWeek * kcalPerKm;
  return Math.round(kcalPerWeek / 7);
}
