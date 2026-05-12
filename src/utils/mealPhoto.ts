// FORGA — Meal photo URL builder.
//
// Why this exists: the original `Meal.photoUrl` values (Wikimedia thumbs)
// were unreliable — broken 403s on some thumbs, mismatched dishes ("chicken
// + rice" pointing at a kebab photo, "tuna salad" pointing at a scientific
// tuna classification chart, "stir fry" pointing at raw chickens at a
// market), and duplicates across recipes.
//
// Replacing 500+ photoUrls one-by-one isn't worth the time before launch,
// so we generate a deterministic photo per meal at runtime through
// Pollinations (free, no API key required for basic usage, returns a real
// photo-quality image cached server-side). Each meal name produces the same
// image every time, and expo-image caches it on disk after the first fetch
// so the user only ever waits once per meal.
//
// The prompt is engineered to produce restaurant-quality top-down food
// photography rather than something abstract / illustrated.

import type { Meal } from '../types/meal';

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
/** flux is the default high-quality photorealistic model on Pollinations as
 *  of 2026. width/height chosen to match the 1:1 aspect ratio of meal cards. */
const SIZE = 600;
const MODEL = 'flux';

/** Build a photography prompt from the meal's user-facing name. We avoid
 *  rare ingredient names that confuse the model and instead lean on cuisine
 *  context (`French dish`, `homemade meal`) to produce something appetising. */
function buildPrompt(name: string): string {
  // Strip parenthetical notes, brand markers, etc. — model handles short
  // prompts better than long ones.
  const cleaned = name
    .replace(/\(.*?\)/g, '')
    .replace(/[,&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return `professional food photography of ${cleaned}, top down view, on white plate, natural daylight, restaurant quality, appetising, 4k, no people, no text, photorealistic`;
}

/** Returns a stable URL for the meal's photo. Same input → same image
 *  (Pollinations caches by prompt). */
export function getMealPhotoUrl(meal: Pick<Meal, 'name' | 'id'>): string {
  const prompt = buildPrompt(meal.name);
  const encoded = encodeURIComponent(prompt);
  // `seed` derived from the meal id keeps generation reproducible across app
  // installs (a different seed would produce a different image for the same
  // prompt). `nologo` removes the Pollinations watermark.
  const seed = hashString(meal.id);
  const params = new URLSearchParams({
    width: String(SIZE),
    height: String(SIZE),
    model: MODEL,
    seed: String(seed),
    nologo: 'true',
    private: 'true',
  });
  return `${POLLINATIONS_BASE}/${encoded}?${params.toString()}`;
}

/** Cheap deterministic hash; sufficient for Pollinations' seed param. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}
