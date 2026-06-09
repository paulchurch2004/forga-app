// FORGA — Retour propre vers /nutrition après validation d'un repas.
//
// Problème résolu : le flux de log passe par
//   /nutrition → /(tabs)/meals (onglet biblio) → /meal/[id]
// Mélanger un ONGLET (meals) dans une pile crée un état de navigation
// bancal : après validation, un simple replace/navigate vers /nutrition
// empilait un doublon OU laissait l'onglet "meals" actif → le swipe-back
// retombait sur la bibliothèque au lieu du Home.
//
// Fix : on RÉINITIALISE la pile.
//  1. dismissAll() vide tous les écrans poussés (nutrition, meals, détail)
//     → on revient à la racine (les tabs).
//  2. navigate('/(tabs)/home') force l'onglet Home comme actif (sinon
//     l'onglet meals resterait actif sous nutrition).
//  3. push('/nutrition') ouvre nutrition par-dessus le Home.
// Résultat : pile = [Home, Nutrition]. Le swipe-back ramène au Home,
// et il n'y a qu'une seule instance de nutrition (pas de latence).

import { router } from 'expo-router';

export function returnToNutrition() {
  try {
    router.dismissAll();
  } catch {
    // Pas d'écran à dismiss (cas rare : deep link direct) — on continue.
  }
  // Onglet Home actif, puis nutrition par-dessus.
  router.navigate('/(tabs)/home');
  router.push('/nutrition');
}
