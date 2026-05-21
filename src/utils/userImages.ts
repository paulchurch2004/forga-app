import type { Sex } from '../types/user';

/**
 * Helper transverse pour sélectionner une image / un asset visuel en
 * fonction du sexe de l'utilisateur.
 *
 * Pourquoi : FORGA est une app où l'identification corporelle est
 * centrale. Un user qui voit en permanence des visuels de l'autre
 * sexe a du mal à se projeter. On adapte donc systématiquement les
 * images "lifestyle" (paywall, home, écrans de motivation, etc.).
 *
 * Les images PRODUIT (food, exercices, code-barres) restent neutres
 * — ce sont des données, pas du marketing.
 *
 * Pattern d'usage :
 *   const hero = pickByUserSex({
 *     male: 'https://.../homme.jpg',
 *     female: 'https://.../femme.jpg',
 *   }, userSex);
 */

export interface SexedAsset<T = string> {
  male: T;
  female: T;
}

/** Retourne la variante adaptée au sexe. Fallback `male` si non défini
 *  (au moment où l'user n'a pas encore renseigné son sexe, sur le
 *  landing par exemple). */
export function pickByUserSex<T>(asset: SexedAsset<T>, sex: Sex | undefined): T {
  return sex === 'female' ? asset.female : asset.male;
}

/** Retourne un tableau d'items adapté au sexe. Pratique pour les
 *  collections (ex. les 22 clips du VideoMontage paywall). */
export function pickArrayByUserSex<T>(asset: SexedAsset<T[]>, sex: Sex | undefined): T[] {
  return sex === 'female' ? asset.female : asset.male;
}
