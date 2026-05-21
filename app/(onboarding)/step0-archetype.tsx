import { Redirect } from 'expo-router';

/**
 * Étape ARCHETYPE supprimée du flow d'onboarding.
 *
 * Pourquoi : l'archétype (Guerrier / Artisan / Explorateur) faisait
 * essentiellement doublon avec l'objectif (Prise de masse / Sèche /
 * Recomp / Maintien) demandé deux écrans plus loin. On a fusionné les
 * deux concepts dans l'écran d'objectif enrichi (`step3-objective`).
 *
 * L'archétype reste dérivé automatiquement de l'objectif sélectionné,
 * pour rester compatible avec les écrans qui l'affichent (`ProfileHero`,
 * badges, page de partage, etc.).
 *
 * Ce fichier ne contient plus qu'un redirect vers `step1-identity`
 * (devenu le 1er écran réel) pour gérer les utilisateurs qui
 * reprendraient un onboarding sauvegardé sur l'ancien flow.
 */
export default function Step0ArchetypeRedirect() {
  return <Redirect href="/(onboarding)/step1-identity" />;
}
