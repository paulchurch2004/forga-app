import { useCallback } from 'react';
import { useSettingsStore, type Locale } from '../store/settingsStore';
import { fr, type TranslationKey } from './locales/fr';
import { en } from './locales/en';

const translations: Record<Locale, Record<TranslationKey, string>> = { fr, en };

/**
 * Translation hook.
 *
 * Usage:
 *   const { t, locale } = useT();
 *   t('loading')                        -> "Chargement..." or "Loading..."
 *   t('caloriesRemaining', { count: 500 }) -> "500 kcal restant"
 */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  const dict = translations[locale];

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let text = dict[key] ?? fr[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    [dict]
  );

  return { t, locale };
}

/**
 * Non-hook version for use outside React components.
 */
export function getTranslation(locale: Locale) {
  const dict = translations[locale];
  return (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let text = dict[key] ?? fr[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };
}

export type { TranslationKey };
