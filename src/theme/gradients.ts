// FORGA Design System — Dégradés signature (univers "forge / braises").
//
// Réutilisables partout via expo-linear-gradient :
//   <LinearGradient colors={gradients.forgeGlow} start={{x:0,y:0}} end={{x:1,y:1}} />
//
// Centraliser ici évite les valeurs hex en dur dispersées dans l'app et
// garantit une signature visuelle cohérente.

export const gradients = {
  /** CTA / bouton principal — orange chaud (le "feu" de la forge). */
  forgeGlow: ['#FF8C40', '#FF5A1C'],
  /** Accent doux — braise qui chauffe (orange → doré). Anneaux, highlights. */
  emberHeat: ['#FF6B35', '#FFD27A'],
  /** Métal en fusion — orange profond. Barres de progression, accents forts. */
  molten: ['#FF8A3D', '#E55A28'],
  /** Fondu vers le sombre — overlays de cartes / images. */
  emberDark: ['#FF6B35', '#1A1A1F'],
  /** Voile "verre" subtil — cartes glassmorphism (à poser sur fond sombre). */
  glass: ['rgba(255,255,255,0.06)', 'rgba(255,107,53,0.05)'],
} as const;

export type GradientKey = keyof typeof gradients;
