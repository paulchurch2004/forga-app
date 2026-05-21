// FORGA — Persistance des images user (avatar, photos progress).
//
// Pourquoi : expo-image-picker retourne des URIs dans `tmp/` sur iOS,
// qui est purgé par l'OS au fil du temps ET non préservé en toute
// rigueur entre les mises à jour TestFlight. Les users perdaient leur
// photo de profil "à chaque build" — c'est exactement ce que l'user
// a signalé.
//
// Cette fonction copie l'image picker URI vers `Documents/forga/...`
// (préservé entre les rebuilds, backed up iCloud) et retourne la
// nouvelle URI stable.
//
// V1.1 visée : upload vers Supabase Storage pour cross-device. Pour
// l'instant ce fix résout déjà le 80% du pain : photo persistante sur
// le device tant qu'on ne change pas d'appareil ni ne logout.

import { Platform } from 'react-native';

/**
 * Copie une URI temporaire (typiquement issue d'ImagePicker) vers le
 * Documents directory de l'app — préservé entre les rebuilds. Retourne
 * la nouvelle URI persistante, ou l'URI d'origine si la copie échoue
 * (on dégrade gracieusement plutôt que de bloquer l'user).
 *
 * @param sourceUri URI source (file:// du picker)
 * @param prefix Sous-dossier dans Documents (ex. 'avatars', 'progress')
 */
export async function persistImage(sourceUri: string, prefix: string): Promise<string> {
  if (!sourceUri) return sourceUri;
  if (Platform.OS === 'web') return sourceUri; // web : pas de filesystem natif
  try {
    // expo-file-system v19+ a déplacé `documentDirectory`, `makeDirectoryAsync`
    // et `copyAsync` dans le sous-module `/legacy`. Le sous-module racine
    // n'expose plus que la nouvelle Paths/File API. Sans cet import legacy,
    // `FS.documentDirectory` est undefined → la persistance échoue
    // silencieusement et l'avatar est perdu à chaque rebuild.
    const FS: any = await import('expo-file-system/legacy');
    const docDir = FS.documentDirectory;
    if (!docDir) return sourceUri;

    // Crée le sous-dossier si nécessaire (idempotent)
    const dirPath = `${docDir}forga/${prefix}/`;
    try {
      await FS.makeDirectoryAsync(dirPath, { intermediates: true });
    } catch {
      // Existe déjà — OK
    }

    // Génère un nom de fichier unique (timestamp + extension)
    const ext = sourceUri.match(/\.(\w+)(?:\?.*)?$/)?.[1] ?? 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const destUri = `${dirPath}${filename}`;

    await FS.copyAsync({ from: sourceUri, to: destUri });
    return destUri;
  } catch {
    // Tout problème filesystem → on garde l'URI source plutôt que
    // de retourner un fallback qui casserait l'UI.
    return sourceUri;
  }
}
