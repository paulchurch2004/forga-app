import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export interface PresenceFocus {
  timeLabel: string; // e.g. "16:04"
  message: string;
  highlights?: string[]; // substrings of message to color in primary
  primaryAction: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}

export interface PresenceObservation {
  id: string;
  timeLabel: string; // "Il y a 8 min", "Hier"
  tag: string; // "Nutrition", "Workout", "Check-in"
  color: string;
  title: string;
  body: string;
}

interface PresenceViewProps {
  focus: PresenceFocus;
  observations: PresenceObservation[];
  onSwitchToConversation: () => void;
}

export function PresenceView({ focus, observations, onSwitchToConversation }: PresenceViewProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FocusCard focus={focus} />

      <Text style={styles.sectionLabel}>CE QU'IL A OBSERVÉ</Text>

      <View style={styles.timelineWrap}>
        <View style={styles.timelineLine} pointerEvents="none" />
        <View style={styles.timelineList}>
          {observations.map((obs) => (
            <ObservationCard key={obs.id} observation={obs} />
          ))}
        </View>
      </View>

      <Pressable onPress={onSwitchToConversation} style={styles.switchButton}>
        <ChatIcon />
        <Text style={styles.switchButtonText}>Une question ? Passe en conversation</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ─── FOCUS CARD ─────────────────────────────────── */

function FocusCard({ focus }: { focus: PresenceFocus }) {
  // Render the message highlighting the parts in focus.highlights
  const renderMessage = () => {
    if (!focus.highlights || focus.highlights.length === 0) {
      return <Text style={styles.focusMessage}>{focus.message}</Text>;
    }

    // Build a regex that captures any of the highlights
    const escaped = focus.highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const parts = focus.message.split(new RegExp(`(${escaped.join('|')})`, 'g'));
    const isHighlight = (s: string) => focus.highlights!.includes(s);

    return (
      <Text style={styles.focusMessage}>
        {parts.map((part, i) =>
          isHighlight(part) ? (
            <Text key={i} style={styles.focusHighlight}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <View style={styles.focusCard}>
      <View style={styles.focusGlow} pointerEvents="none" />
      <View>
        <Text style={styles.focusEyebrow}>FOCUS DU JOUR · {focus.timeLabel}</Text>
        {renderMessage()}

        <View style={styles.focusActions}>
          {focus.secondaryAction && (
            <Pressable onPress={focus.secondaryAction.onPress} style={styles.focusSecondary}>
              <Text style={styles.focusSecondaryText}>{focus.secondaryAction.label}</Text>
            </Pressable>
          )}
          <Pressable onPress={focus.primaryAction.onPress} style={{ flex: 1 }}>
            <View style={styles.focusPrimary}>
              <Text style={styles.focusPrimaryText}>{focus.primaryAction.label} →</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ─── OBSERVATION (timeline item) ──────────────── */

function ObservationCard({ observation }: { observation: PresenceObservation }) {
  return (
    <View style={styles.obsRow}>
      <View
        style={[
          styles.obsDotOuter,
          { borderColor: observation.color, shadowColor: observation.color },
        ]}
      >
        <View style={[styles.obsDotInner, { backgroundColor: observation.color }]} />
      </View>
      <View style={styles.obsCard}>
        <View style={styles.obsHeader}>
          <Text style={[styles.obsTag, { color: observation.color }]}>{observation.tag.toUpperCase()}</Text>
          <Text style={styles.obsTime}>{observation.timeLabel}</Text>
        </View>
        <Text style={styles.obsTitle}>{observation.title}</Text>
        <Text style={styles.obsBody}>{observation.body}</Text>
      </View>
    </View>
  );
}

function ChatIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12Z"
        stroke="rgba(255,255,255,0.62)"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 180,
  },
  /* Focus card */
  focusCard: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  focusGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,107,53,0.40)',
    opacity: 0.4,
  },
  focusEyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  focusMessage: {
    fontFamily: fonts.display,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 8,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 27,
  },
  focusHighlight: {
    color: '#FF6B35',
  },
  focusActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  focusSecondary: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    alignItems: 'center',
  },
  focusSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  focusPrimary: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  focusPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Section label */
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.4,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 12,
  },
  /* Timeline */
  timelineWrap: {
    paddingLeft: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 8,
    bottom: 8,
    width: 1,
    backgroundColor: 'rgba(255,107,53,0.20)',
  },
  timelineList: {
    gap: 10,
  },
  obsRow: {
    position: 'relative',
  },
  obsDotOuter: {
    position: 'absolute',
    left: -20,
    top: 14,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#07070D',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 2,
  },
  obsDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  obsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 14,
  },
  obsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  obsTag: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  obsTime: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  obsTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  obsBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    lineHeight: 17,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
  },
  switchButtonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
  },
});
