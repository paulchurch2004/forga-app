import { useState, useEffect, useRef } from 'react';

/**
 * Effet "typewriter" pour les messages du coach IA — révèle le texte
 * caractère par caractère, comme ChatGPT.
 *
 * Pourquoi pas du vrai streaming SSE : React Native ne supporte pas
 * proprement les streaming response bodies (Response.body.getReader est
 * flaky sur iOS/Android). Faux streaming = équivalent perceptif à
 * 95%, zéro infra à ajouter, marche partout.
 *
 * Comportements :
 * - Vitesse adaptative : 35 cps pour les messages courts (< 200 chars),
 *   accélère à 60 cps pour les messages longs (sinon trop lent à lire).
 * - Skip auto si le message dépasse 500 chars (gain UX > effet wow).
 * - Le caller peut forcer le skip via `skipRequested` (tap sur la bulle).
 *
 * @param fullText      Le texte complet à révéler progressivement.
 * @param enabled       Si false, le hook retourne `fullText` direct (pour
 *                      les messages user, les bulles déjà animées, etc).
 * @param skipRequested Quand passe à true, jump immédiat au texte complet.
 * @returns Le texte progressivement révélé. Égale `fullText` quand fini.
 */
export function useTypewriter(
  fullText: string,
  enabled: boolean = true,
  skipRequested: boolean = false,
): { displayed: string; isTyping: boolean } {
  const [displayed, setDisplayed] = useState(enabled ? '' : fullText);
  const indexRef = useRef(0);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || skipRequested || fullText.length > 500) {
      setDisplayed(fullText);
      indexRef.current = fullText.length;
      return;
    }

    indexRef.current = 0;
    setDisplayed('');

    // Vitesse adaptative — plus le texte est long, plus on accélère.
    const charsPerSecond = fullText.length < 200 ? 35 : 60;
    const intervalMs = 1000 / charsPerSecond;

    const tick = () => {
      indexRef.current += 1;
      const next = fullText.slice(0, indexRef.current);
      setDisplayed(next);
      if (indexRef.current < fullText.length) {
        rafRef.current = setTimeout(tick, intervalMs);
      }
    };

    rafRef.current = setTimeout(tick, intervalMs);

    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [fullText, enabled, skipRequested]);

  return {
    displayed,
    isTyping: displayed.length < fullText.length,
  };
}
