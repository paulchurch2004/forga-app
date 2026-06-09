import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing } from '../../theme';

export interface PostWorkoutFeedbackData {
  rating?: 1 | 2 | 3 | 4 | 5;
  rpe?: number;
  note?: string;
}

interface Props {
  visible: boolean;
  comparisonSummary: string;
  coachMessage: string;
  onSubmit: (feedback: PostWorkoutFeedbackData) => void;
  onSkip: () => void;
}

export function PostWorkoutFeedback({
  visible,
  comparisonSummary,
  coachMessage,
  onSubmit,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit({
      rating: rating ?? undefined,
      rpe: rpe ?? undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top + spacing.lg }]}>
        <Animated.View entering={FadeIn.duration(220)} style={styles.sheet}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing['4xl'] }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Coach message */}
            <Animated.View entering={FadeInUp.duration(280)} style={styles.coachCard}>
              <View style={styles.coachAvatar}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 19 L6 22 L7 15 L2 10 L9 9 Z" fill="#FF6B35" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.coachLabel}>FORGA Coach</Text>
                <Text style={styles.coachText}>{coachMessage}</Text>
              </View>
            </Animated.View>

            {/* Comparison */}
            <Animated.View entering={FadeInUp.delay(80).duration(280)} style={styles.compareCard}>
              <Text style={styles.compareLabel}>Comparaison</Text>
              <Text style={styles.compareText}>{comparisonSummary}</Text>
            </Animated.View>

            {/* Rating stars */}
            <Animated.View entering={FadeInUp.delay(160).duration(280)} style={styles.section}>
              <Text style={styles.sectionLabel}>Comment était cette séance ?</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setRating(s as 1 | 2 | 3 | 4 | 5)}
                    style={styles.starButton}
                    hitSlop={6}
                  >
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 19 L6 22 L7 15 L2 10 L9 9 Z"
                        fill={rating !== null && s <= rating ? '#FF6B35' : 'rgba(255,255,255,0.10)'}
                        stroke={rating !== null && s <= rating ? '#FF6B35' : 'rgba(255,255,255,0.25)'}
                        strokeWidth={1.5}
                      />
                    </Svg>
                  </Pressable>
                ))}
              </View>
              {rating !== null && (
                <Text style={styles.ratingHint}>{RATING_LABELS[rating]}</Text>
              )}
            </Animated.View>

            {/* Difficulté ressentie (RPE) — on explique en clair, le sigle
                "RPE" seul ne parle à personne. Sert au coach à ajuster les
                charges des prochaines séances. */}
            <Animated.View entering={FadeInUp.delay(240).duration(280)} style={styles.section}>
              <Text style={styles.sectionLabel}>À quel point c'était dur ?</Text>
              <Text style={styles.sectionHint}>
                1 = très facile, j'avais beaucoup de réserve · 10 = effort maximal, impossible d'en faire plus. Ça m'aide à ajuster tes charges.
              </Text>
              <View style={styles.rpeRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setRpe(n)}
                    style={[styles.rpeButton, rpe === n && styles.rpeButtonActive]}
                    hitSlop={4}
                  >
                    <Text
                      style={[styles.rpeText, rpe === n && styles.rpeTextActive]}
                    >
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Free note */}
            <Animated.View entering={FadeInUp.delay(320).duration(280)} style={styles.section}>
              <Text style={styles.sectionLabel}>Note libre (optionnel)</Text>
              <Text style={styles.sectionHint}>Ressenti, douleur, contexte... uniquement pour toi.</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Genou un peu douloureux aujourd'hui, sinon top forme..."
                placeholderTextColor="rgba(255,255,255,0.30)"
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </Animated.View>

            {/* Actions */}
            <Pressable style={styles.primaryBtn} onPress={handleSubmit}>
              <Text style={styles.primaryBtnText}>Enregistrer</Text>
            </Pressable>
            <Pressable style={styles.skipBtn} onPress={onSkip}>
              <Text style={styles.skipBtnText}>Passer cette étape</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const RATING_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Mauvaise — sans énergie',
  2: 'Moyenne',
  3: 'Correcte',
  4: 'Bonne',
  5: 'Excellente — peak form',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0F0F12',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  coachText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  compareCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  compareLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  compareText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FF6B35',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rpeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  rpeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  rpeTextActive: {
    color: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  skipBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.50)',
  },
});
