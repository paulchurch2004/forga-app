// FORGA — Champ d'adresse avec autocomplete Nominatim.
//
// Pourquoi pas un simple TextInput :
//  - L'user tape une adresse approximative, Nominatim ne la trouve
//    pas → erreur frustrante. L'autocomplete corrige avant l'envoi.
//  - On stocke lat/lng directement quand l'user pick une suggestion,
//    donc on skip la 2e passe geocoding et on ne se cogne pas le
//    rate-limit fair-use.
//  - Les suggestions multiples lèvent les ambiguïtés ("12 rue X" peut
//    exister dans plusieurs villes).

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchAddresses, type AddressSuggestion } from '../../services/cyclingRouting';
import { useTheme } from '../../context/ThemeContext';
import { fonts, fontSizes, fontWeights } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';

interface Props {
  label: string;
  placeholder: string;
  value: string;
  /** Quand l'user tape/édite manuellement (avant pick de suggestion). */
  onChangeText: (text: string) => void;
  /** Quand l'user pick une suggestion dans la dropdown. Reçoit
   *  l'adresse normalisée + lat/lng. */
  onSelect: (suggestion: AddressSuggestion) => void;
  /** True si une suggestion a été sélectionnée — l'app peut alors
   *  griser ou afficher un check pour rassurer l'user. */
  isResolved: boolean;
}

const DEBOUNCE_MS = 400;

export function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChangeText,
  onSelect,
  isResolved,
}: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  // Quand on vient juste de pick une suggestion, on bloque la prochaine
  // recherche déclenchée par le `setValue` programmatique. Sinon la
  // dropdown se rouvre immédiatement avec les mêmes suggestions.
  const skipNextSearchRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce + recherche
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (isResolved) {
      // Une suggestion a déjà été retenue → pas besoin de chercher.
      return;
    }
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const handle = setTimeout(async () => {
      // Annule la requête précédente si toujours en vol — évite que
      // une réponse lente d'une vieille requête écrase les résultats
      // d'une nouvelle.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      try {
        const results = await searchAddresses(value, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setShowDropdown(results.length > 0);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          // Réseau KO ou Nominatim down — on cache la dropdown,
          // l'user pourra toujours taper l'adresse en entier et
          // tenter le bouton Calculer.
          setSuggestions([]);
          setShowDropdown(false);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
    };
  }, [value, isResolved]);

  const handlePick = useCallback(
    (s: AddressSuggestion) => {
      skipNextSearchRef.current = true;
      setShowDropdown(false);
      setSuggestions([]);
      // Remonte au parent l'adresse normalisée et les coordonnées.
      onSelect(s);
    },
    [onSelect],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isResolved && styles.inputResolved]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="next"
        />
        {/* Indicateur d'état à droite du champ */}
        <View style={styles.indicator}>
          {isSearching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : isResolved ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : null}
        </View>
      </View>

      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((s, i) => (
            <Pressable
              key={`${s.lat}-${s.lng}-${i}`}
              style={({ pressed }) => [
                styles.suggestionItem,
                pressed && { backgroundColor: colors.border },
                i === suggestions.length - 1 && styles.suggestionItemLast,
              ]}
              onPress={() => handlePick(s)}
              accessibilityRole="button"
              accessibilityLabel={s.displayName}
            >
              <Text style={styles.suggestionText} numberOfLines={2}>
                {s.displayName}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    wrap: {
      marginBottom: spacing.md,
    },
    label: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold as any,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.md,
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      color: colors.text,
    },
    inputResolved: {
      // Léger feedback visuel quand une suggestion a été pickée
      color: colors.text,
    },
    indicator: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      fontSize: 18,
      color: '#00D4AA',
      fontWeight: '700',
    },
    dropdown: {
      marginTop: 4,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    suggestionItem: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    suggestionItemLast: {
      borderBottomWidth: 0,
    },
    suggestionText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: fontSizes.sm * 1.4,
    },
  });
