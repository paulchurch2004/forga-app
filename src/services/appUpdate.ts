// Vérification de mise à jour App Store, pilotée serveur (table app_config).
//
// Compare la version installée à min_version / latest_version :
//   version < min_version    → 'force' (popup bloquant)
//   version < latest_version → 'soft'  (popup avec "Plus tard")
//   sinon                    → 'none'
//
// Aucune dépendance native : si la config est injoignable, on ne bloque rien.

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const STORE_URL = 'https://apps.apple.com/app/id6762985427';

export type UpdateVerdict = {
  type: 'none' | 'soft' | 'force';
  url: string;
  message?: string | null;
};

/** Compare deux versions semver (x.y.z). Retourne -1, 0 ou 1. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

export async function checkForUpdate(): Promise<UpdateVerdict> {
  const none: UpdateVerdict = { type: 'none', url: STORE_URL };
  // L'App Store ne concerne que l'iOS natif.
  if (Platform.OS !== 'ios') return none;

  const current = Constants.expoConfig?.version ?? '1.0.0';

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('min_version, latest_version, update_url, update_message')
      .eq('id', 'ios')
      .single();

    if (error || !data) return none;

    const url = data.update_url || STORE_URL;
    if (compareVersions(current, data.min_version) < 0) {
      return { type: 'force', url, message: data.update_message };
    }
    if (compareVersions(current, data.latest_version) < 0) {
      return { type: 'soft', url, message: data.update_message };
    }
    return { type: 'none', url };
  } catch {
    // En cas d'erreur réseau, on ne bloque jamais l'utilisateur.
    return none;
  }
}
