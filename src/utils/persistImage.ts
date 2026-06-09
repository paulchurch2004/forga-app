// FORGA — Persistance des images user (avatar, photos progress).
//
// Pourquoi ce fichier existe :
// expo-image-picker retourne des URIs `tmp/...` qui sont purgées par
// iOS. Notre 1re version copiait vers `Documents/forga/...` et stockait
// l'URI ABSOLUE. Bug : sur iOS, le container UUID de l'app change
// après une réinstall, un upgrade TestFlight, ou parfois entre 2
// sessions de dev client → l'URI absolue devient invalide → l'avatar
// "disparaît" alors que le fichier existe encore quelque part.
//
// Fix : on stocke maintenant un CHEMIN RELATIF (ex: `forga/avatars/
// 12345.jpg`) qu'on résout dynamiquement via `resolveLocalUri()` au
// moment du render. Le path absolu change, mais le path relatif au
// documentDirectory reste stable. Marche aussi pour les progress
// photos.
//
// V1.1 visée : upload vers Supabase Storage pour cross-device.

import { Platform } from 'react-native';

/** Préfixe utilisé pour distinguer un chemin relatif géré par nous
 *  d'une URI externe (http, file://, data:). Sert au resolver. */
const RELATIVE_MARKER = 'forga/';

/**
 * Copie une URI temporaire (typiquement issue d'ImagePicker) vers le
 * Documents directory et retourne un CHEMIN RELATIF stable. À utiliser
 * via `resolveLocalUri()` au render — ne jamais passer la valeur
 * directement à <Image source={{uri}}> car ce n'est pas une URI valide
 * sans résolution.
 *
 * Si la persistance échoue, retourne l'URI source telle quelle (l'user
 * voit son image jusqu'au prochain restart au pire).
 *
 * @param sourceUri URI source (file:// du picker, http(s):// d'une URL)
 * @param prefix Sous-dossier dans Documents (ex. 'avatars', 'progress')
 */
export async function persistImage(sourceUri: string, prefix: string): Promise<string> {
  if (!sourceUri) return sourceUri;
  if (Platform.OS === 'web') return sourceUri; // web : pas de filesystem natif
  // URL externe (http) — pas la peine de la persister, laisse telle quelle
  if (sourceUri.startsWith('http://') || sourceUri.startsWith('https://')) {
    return sourceUri;
  }

  try {
    // expo-file-system v19+ : `documentDirectory`, `makeDirectoryAsync`,
    // `copyAsync` sont dans `/legacy`. Sans cet import, FS.documentDirectory
    // est undefined → la persistance échoue silencieusement et l'avatar
    // est perdu.
    const FS: any = await import('expo-file-system/legacy');
    const docDir = FS.documentDirectory;
    if (!docDir) return sourceUri;

    // Crée le sous-dossier si nécessaire
    const dirPath = `${docDir}${RELATIVE_MARKER}${prefix}/`;
    try {
      await FS.makeDirectoryAsync(dirPath, { intermediates: true });
    } catch {
      // Existe déjà — OK
    }

    // Nom de fichier unique (timestamp + extension). On stocke le
    // chemin RELATIF au documentDirectory pour survivre aux changements
    // de container iOS.
    const ext = sourceUri.match(/\.(\w+)(?:\?.*)?$/)?.[1] ?? 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const relativePath = `${RELATIVE_MARKER}${prefix}/${filename}`;
    const destUri = `${docDir}${relativePath}`;

    await FS.copyAsync({ from: sourceUri, to: destUri });
    return relativePath; // ← chemin relatif, à passer dans resolveLocalUri()
  } catch {
    // Tout problème filesystem → garde l'URI source (l'user voit
    // toujours sa photo, juste plus persistante).
    return sourceUri;
  }
}

/**
 * Résout un chemin (potentiellement relatif) en URI utilisable par
 * <Image>. À appeler à chaque render — ne pas mémoiser sur une longue
 * durée car le documentDirectory peut changer entre les sessions.
 *
 * Retourne :
 * - L'input tel quel si c'est déjà une URI absolue (http, file://, data:)
 * - documentDirectory + input si c'est un chemin relatif (ex: forga/avatars/x.jpg)
 * - undefined si l'input est falsy
 */
export function resolveLocalUri(stored: string | null | undefined): string | undefined {
  if (!stored) return undefined;
  if (Platform.OS === 'web') return stored;
  // Déjà une URI absolue ? Return tel quel.
  if (
    stored.startsWith('http://') ||
    stored.startsWith('https://') ||
    stored.startsWith('data:') ||
    stored.startsWith('file://')
  ) {
    return stored;
  }
  // Chemin relatif géré par notre persistImage → résoudre
  if (stored.startsWith(RELATIVE_MARKER)) {
    try {
      // Import sync via require — `expo-file-system/legacy` est dispo
      // immédiatement après le 1er resolve. Si ça plante, on dégrade
      // sur le path nu (cassera l'image mais pas l'app).
      const FS = require('expo-file-system/legacy');
      const docDir = FS.documentDirectory;
      if (!docDir) return stored;
      return `${docDir}${stored}`;
    } catch {
      return stored;
    }
  }
  // Format inconnu — return tel quel
  return stored;
}

/**
 * Vérifie qu'un fichier (chemin relatif OU URI absolue) existe encore
 * sur le disque. Sert au boot pour purger les références orphelines
 * (cas où le fichier a été manuellement supprimé / iCloud cleanup).
 */
export async function imageStillExists(stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  if (Platform.OS === 'web') return true; // pas vérifiable
  if (stored.startsWith('http://') || stored.startsWith('https://') || stored.startsWith('data:')) {
    return true; // on assume true pour les URL externes
  }
  try {
    const FS: any = await import('expo-file-system/legacy');
    const uri = resolveLocalUri(stored) ?? stored;
    const info = await FS.getInfoAsync(uri);
    return !!info?.exists;
  } catch {
    return false;
  }
}
