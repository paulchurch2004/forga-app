// FORGA — Upload des avatars utilisateur vers Supabase Storage.
//
// Pourquoi : la persistance locale (Documents/forga/avatars/) ne
// survit pas à toutes les situations. Sur iOS, le container UUID de
// l'app peut changer entre 2 sessions du dev client, et au moindre
// rebuild TestFlight le path absolu est invalidé. Conséquence : l'user
// perd sa photo dès qu'il quitte l'app et la relance.
//
// La vraie fix robuste = passer par un Storage cloud. Avantages :
//  - L'avatar survit aux rebuilds, réinstalls, changements de device
//  - L'avatar est consultable depuis le web / d'autres devices
//  - L'URL publique est stable (pas besoin de resolver dynamiquement)
//
// On garde le mode dégradé (URI locale) comme fallback si l'upload
// échoue (offline, bucket pas configuré, etc.) — l'user voit toujours
// sa photo localement, juste pas cross-device.

import { Platform } from 'react-native';
import { supabase } from './supabase';

const BUCKET = 'avatars';

/** Upload une image (URI locale) vers Supabase Storage bucket "avatars".
 *  Retourne l'URL publique HTTP si OK, ou `null` si l'upload échoue.
 *
 *  Le path dans le bucket est `{userId}/avatar.{ext}` — un seul avatar
 *  par user, écrasé à chaque changement (pas d'historique). Le suffixe
 *  ts dans l'URL retournée force le bust du cache HTTP.
 */
/** Result type pour distinguer succès, erreur upload, erreur read, etc.
 *  Permet au caller d'afficher un message ciblé à l'user. */
export type AvatarUploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export async function uploadAvatar(localUri: string, userId: string): Promise<AvatarUploadResult> {
  if (!localUri) return { ok: false, reason: 'URI locale vide' };
  if (!userId) return { ok: false, reason: 'userId manquant' };
  if (Platform.OS === 'web') return { ok: false, reason: 'web non supporté' };

  try {
    // 1) Lire le fichier via fetch() — natif RN, ne nécessite pas
    // expo-file-system/legacy (qui a un bug "Permissions module not
    // found" sur certains builds Expo SDK 55). fetch sur file:// URI
    // est supporté par React Native depuis longtemps et marche sur
    // tous les builds dev/prod.
    const response = await fetch(localUri);
    if (!response.ok) {
      return { ok: false, reason: `Fetch local : HTTP ${response.status}` };
    }
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return { ok: false, reason: 'Lecture du fichier vide (0 bytes)' };
    }

    // 2) Content-type depuis l'extension
    const ext = (localUri.match(/\.(\w+)(?:\?.*)?$/)?.[1] ?? 'jpg').toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';

    // 3) Upload — path déterministe (écrase l'avatar précédent)
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      return { ok: false, reason: `Storage : ${uploadError.message}` };
    }

    // 4) URL publique avec cache-bust
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) return { ok: false, reason: 'Pas d\'URL publique retournée' };
    return { ok: true, url: `${data.publicUrl}?v=${Date.now()}` };
  } catch (err: any) {
    return { ok: false, reason: `Exception : ${err?.message ?? String(err)}` };
  }
}

/** Décodage base64 → Uint8Array, compatible React Native (pas de Buffer). */
function base64ToArrayBuffer(base64: string): Uint8Array {
  // Polyfill atob — disponible en RN via le runtime Hermes, mais on
  // décode à la main pour ne pas en dépendre.
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') bufferLength -= 1;
  if (base64[base64.length - 2] === '=') bufferLength -= 1;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (encoded4 !== 64) bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
  }
  return bytes;
}
