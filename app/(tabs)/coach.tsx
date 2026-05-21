import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SkeletonScreen } from '../../src/components/ui/Skeleton';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useMealStore } from '../../src/store/mealStore';
import { useEngine } from '../../src/hooks/useEngine';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import { useStreak } from '../../src/hooks/useStreak';
import {
  getCoachResponse,
  QUESTION_LABELS,
  DEFAULT_QUICK_REPLIES,
  type QuestionType,
  type CoachContext,
  type QuickReply,
} from '../../src/engine/coachChatEngine';
import { sendCoachMessage, submitCoachFeedback, type ChatHistoryEntry } from '../../src/services/coachAI';
import { syncCoachMemory } from '../../src/services/userSync';
import { events } from '../../src/services/analytics';
import { useQuota } from '../../src/hooks/useQuota';
import { usePremium } from '../../src/hooks/usePremium';
import { useTypewriter } from '../../src/hooks/useTypewriter';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useT } from '../../src/i18n';
import { router } from 'expo-router';
import { CoachModeToggle, type CoachMode } from '../../src/components/coach/CoachModeToggle';
import { PresenceView, type PresenceFocus, type PresenceObservation } from '../../src/components/coach/PresenceView';
import { useCoachObservations } from '../../src/hooks/useCoachObservations';
import { parseCoachActionsAndMemories } from '../../src/services/coachActions';
import { ActionProposalCard } from '../../src/components/coach/ActionProposalCard';
import { useProgramStore } from '../../src/store/programStore';
import { useTrainingStore } from '../../src/store/trainingStore';
import { useWaterStore } from '../../src/store/waterStore';
import { useChatStore } from '../../src/store/chatStore';
import { CoachWelcomeCard } from '../../src/components/coach/CoachWelcomeCard';
import { getProgramDayById, PROGRAMS } from '../../src/data/programs';
import { todayLocalIso } from '../../src/utils/date';
import { impactLight } from '../../src/utils/haptics';

// ──────────── SPEECH HELPERS (Web only) ────────────

const isSpeechSupported = Platform.OS === 'web' && typeof window !== 'undefined';

function speak(text: string, lang = 'fr-FR') {
  if (!isSpeechSupported || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1;
    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
  };

  // Voices may not be loaded yet on first call
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => doSpeak();
  }
}

function createRecognition(lang = 'fr-FR'): any {
  if (!isSpeechSupported) return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const recognition = new SR();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  return recognition;
}

// ──────────── TYPES ────────────

interface ChatMessage {
  id: string;
  text: string;
  isCoach: boolean;
  timestamp: number;
  /** Proposed actions parsed from the coach reply. */
  actions?: import('../../src/services/coachActions').CoachAction[];
  /** System-style notice rendered as a centered card with a CTA. */
  kind?: 'quota_notice';
}

// ──────────── TYPING INDICATOR (iMessage style) ────────────
// Three dots in a small bubble, "wave" animation. No avatar — iMessage
// 1-on-1 chats hide avatars inline.

function TypingIndicator() {
  const styles = useStyles();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const wave = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-3, { duration: 400, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
            withTiming(0, { duration: 400, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
            withTiming(0, { duration: 400 }),
          ),
          -1,
          false,
        ),
      );
    };
    wave(dot1, 0);
    wave(dot2, 200);
    wave(dot3, 400);
    // Cleanup : annule les animations infinies au unmount, sinon
    // elles continuent à tourner sur le UI thread quand l'user quitte
    // le coach → memory leak + frames perdues sur les autres écrans.
    return () => {
      cancelAnimation(dot1);
      cancelAnimation(dot2);
      cancelAnimation(dot3);
    };
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[styles.bubbleRow, styles.coachRow]}
    >
      <View style={[styles.bubble, styles.coachBubble, styles.typingBubble]}>
        <Animated.View style={[styles.typingDot, s1]} />
        <Animated.View style={[styles.typingDot, s2]} />
        <Animated.View style={[styles.typingDot, s3]} />
      </View>
    </Animated.View>
  );
}

// ──────────── SEND BUTTON (iMessage style) ────────────
// Springs in with a slight overshoot when text becomes non-empty.
// Tap also has a brief press-scale to mimic the iOS button feedback.

function SendButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const enterScale = useSharedValue(0.5);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    enterScale.value = withSpring(1, { damping: 10, stiffness: 280, mass: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enterScale.value * pressScale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        onPressIn={() => {
          pressScale.value = withTiming(0.88, { duration: 80 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 8, stiffness: 300 });
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4v16M5 11l7-7 7 7"
            stroke={colors.white}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

// ──────────── TIME SEPARATOR (iMessage style) ────────────
// Shown above clusters with a > 15min gap. Smart label: "14:32" if today,
// "Hier 14:32" if yesterday, "Lundi 14:32" if this week, "12 mai 14:32"
// otherwise.

function formatSeparator(ts: number, locale: string): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const time = d.toLocaleTimeString(locale === 'en' ? 'en-US' : 'fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (sameDay) return time;
  if (isYesterday) return `${locale === 'en' ? 'Yesterday' : 'Hier'} ${time}`;
  // Last 6 days → weekday name
  const ageDays = Math.floor((now.getTime() - ts) / (24 * 60 * 60 * 1000));
  if (ageDays < 7) {
    const weekday = d.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
      weekday: 'long',
    });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${time}`;
  }
  const date = d.toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
  });
  return `${date} ${time}`;
}

function TimeSeparator({ timestamp, locale }: { timestamp: number; locale: string }) {
  const styles = useStyles();
  return (
    <View style={styles.timeSeparator}>
      <Text style={styles.timeSeparatorText}>{formatSeparator(timestamp, locale)}</Text>
    </View>
  );
}

// ──────────── MESSAGE BUBBLE (iMessage style) ────────────
// - Sent (right): FORGA orange tinted, sharp bottom-right corner on tail
// - Received (left): slate gray, sharp bottom-left corner on tail
// - Cluster awareness: tail only on the LAST bubble of a same-sender run
// - Spring scale-in animation matching iMessage send/receive

interface BubbleProps {
  message: ChatMessage;
  /** True if this is the last message in a same-sender cluster — used to
   *  decide whether to render the bubble "tail". */
  isLastInCluster: boolean;
  /** True if this is the first message in a cluster — used to add a
   *  little extra top margin between clusters. */
  isFirstInCluster: boolean;
  /** URI de l'avatar user à afficher à droite des bulles user. Provient
   *  soit du profil custom (avatarUri), soit d'un fallback genré. */
  userAvatarUri?: string;
}

/** Avatar du coach FORGA — portrait fitness pro, sert d'identité visuelle
 *  dans le chat. Une seule URI partagée pour tous les messages (pas
 *  d'avatar custom par "thématique" du coach, on garde une identité
 *  cohérente). Pourrait passer à un asset local en v1.1 pour gagner en
 *  perf/résilience offline. */
const COACH_AVATAR_URI =
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&q=80&auto=format&fit=crop&crop=faces';

function MessageBubble({ message, isLastInCluster, isFirstInCluster, userAvatarUri }: BubbleProps) {
  const styles = useStyles();
  const { t } = useT();

  if (message.kind === 'quota_notice') {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.quotaRow}>
        <View style={styles.quotaCard}>
          <Text style={styles.quotaTitle}>{t('coachQuotaTitle' as any)}</Text>
          <Text style={styles.quotaText}>{message.text}</Text>
          <Pressable
            style={styles.quotaButton}
            onPress={() => router.push('/paywall?trigger=quota_coach_message')}
          >
            <Text style={styles.quotaButtonText}>{t('coachQuotaUpgrade' as any)}</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // Spring scale-in: replicates the iMessage "pop" — bubble appears at
  // ~0.85 scale and springs to 1, matching the iOS send/receive feel.
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220, mass: 0.6 });
    opacity.value = withTiming(1, { duration: 180 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const rowStyle = [
    styles.bubbleRow,
    message.isCoach ? styles.coachRow : styles.userRow,
    isFirstInCluster && styles.clusterFirst,
  ];

  const bubbleStyle = [
    styles.bubble,
    message.isCoach ? styles.coachBubble : styles.userBubble,
    // Tail is the asymmetric corner — only on the last bubble of a cluster.
    isLastInCluster
      ? message.isCoach
        ? styles.coachTail
        : styles.userTail
      : null,
  ];

  // Animation typewriter — uniquement sur les messages COACH RÉCENTS
  // (< 3s depuis l'envoi). Les messages plus anciens, rechargés depuis
  // le storage à l'ouverture du chat, s'affichent direct (sinon l'user
  // verrait toute sa conversation se re-taper à chaque ouverture).
  const isLiveMessage = message.isCoach && Date.now() - message.timestamp < 3000;
  const [skipTyping, setSkipTyping] = useState(false);
  const { displayed: typedText, isTyping } = useTypewriter(
    message.text,
    isLiveMessage,
    skipTyping,
  );

  // Feedback : stocké localement pour persistance pendant la session,
  // submitted vers Supabase via submitCoachFeedback. Pas de UI rollback —
  // une fois voté, l'user voit son vote (peut le retoucher).
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const handleFeedback = (rating: 'up' | 'down') => {
    setFeedback(rating);
    void submitCoachFeedback({
      messageId: message.id,
      messageText: message.text,
      rating,
    });
  };

  // Les boutons feedback n'apparaissent que pour les messages coach,
  // une fois la frappe terminée (sinon ça pollue pendant l'animation),
  // et pas pour les bulles "quota_notice".
  const showFeedback =
    message.isCoach && !isTyping && message.kind !== 'quota_notice' && isLastInCluster;

  // Avatars : iMessage pattern — visible UNIQUEMENT sur la dernière
  // bulle d'un cluster (sinon répétition visuelle). Coach à gauche,
  // user à droite.
  const showCoachAvatar = message.isCoach && isLastInCluster && message.kind !== 'quota_notice';
  const showUserAvatar = !message.isCoach && isLastInCluster && !!userAvatarUri;

  return (
    <Animated.View style={[rowStyle, animStyle]}>
      {/* Réserve la zone avatar à gauche pour TOUS les messages coach
          (avatar affiché ou non), sinon les bulles d'un même cluster
          ne sont pas alignées verticalement. iMessage fait pareil :
          avatar seulement sur la dernière, indent identique sur les
          précédentes. */}
      {message.isCoach && message.kind !== 'quota_notice' && (
        showCoachAvatar ? (
          <Image
            source={{ uri: COACH_AVATAR_URI }}
            style={styles.coachAvatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )
      )}
      <Pressable
        onPress={() => {
          if (isTyping) setSkipTyping(true);
        }}
        style={bubbleStyle}
      >
        <Text style={message.isCoach ? styles.coachText : styles.userText}>
          {typedText}
          {isTyping && message.isCoach && <Text style={styles.cursor}>▋</Text>}
        </Text>
      </Pressable>
      {showUserAvatar && (
        <Image
          source={{ uri: userAvatarUri }}
          style={styles.userAvatar}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      {showFeedback && (
        <View style={styles.feedbackRow}>
          <Pressable
            onPress={() => handleFeedback('up')}
            hitSlop={6}
            style={[styles.feedbackBtn, feedback === 'up' && styles.feedbackBtnActiveUp]}
            accessibilityRole="button"
            accessibilityLabel="Réponse utile"
          >
            <Text
              style={[
                styles.feedbackIcon,
                feedback === 'up' && styles.feedbackIconActiveUp,
              ]}
            >
              👍
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleFeedback('down')}
            hitSlop={6}
            style={[styles.feedbackBtn, feedback === 'down' && styles.feedbackBtnActiveDown]}
            accessibilityRole="button"
            accessibilityLabel="Réponse à améliorer"
          >
            <Text
              style={[
                styles.feedbackIcon,
                feedback === 'down' && styles.feedbackIconActiveDown,
              ]}
            >
              👎
            </Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

// ──────────── MAIN SCREEN ────────────

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const locale = useSettingsStore((s) => s.locale);

  const profile = useUserStore((s) => s.profile);

  // Avatar user pour les bulles : photo custom de l'user si dispo, sinon
  // un portrait Unsplash neutre selon le sexe déclaré. Permet d'incarner
  // visuellement le sender côté UI (avant : bulles orange anonymes).
  const userAvatarUri = useMemo(() => {
    if (profile?.avatarUri) return profile.avatarUri;
    return profile?.sex === 'female'
      ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=faces'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=faces';
  }, [profile?.avatarUri, profile?.sex]);

  const { currentScore } = useScoreStore();
  const { isPremium } = usePremium();
  const coachQuota = useQuota('coach_message');
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const { currentSlot } = useMealSlot();
  const { currentStreak, isTodayValidated } = useStreak();

  const [coachMode, setCoachMode] = useState<CoachMode>('presence');
  // Real observations from the user's stores (replaces hardcoded samples).
  const coachObservations = useCoachObservations();
  // Persisted chat (week-scoped) + memories (long-term).
  const persistedMessages = useChatStore((s) => s.messages);
  const memories = useChatStore((s) => s.memories);
  const appendChatMessage = useChatStore((s) => s.appendMessage);
  const appendMemory = useChatStore((s) => s.appendMemory);
  const welcomeDismissed = useChatStore((s) => s.welcomeDismissed);
  const dismissWelcome = useChatStore((s) => s.dismissWelcome);
  const rotateIfNewWeek = useChatStore((s) => s.rotateIfNewWeek);

  // Trigger rotation on mount (in case onRehydrateStorage missed it).
  React.useEffect(() => {
    rotateIfNewWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local UI state — typing indicator, quick replies, etc.
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [freeText, setFreeText] = useState('');
  const messageIdRef = useRef(0);
  const isAtBottomRef = useRef(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Bridge: messages = the persisted store, setMessages emulates the previous API.
  const messages = persistedMessages as ChatMessage[];
  const setMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    const next = typeof updater === 'function'
      ? (updater as (p: ChatMessage[]) => ChatMessage[])(persistedMessages as ChatMessage[])
      : updater;
    // Only support append-style updates (the only pattern used in this file).
    const newMessages = next.slice(persistedMessages.length);
    for (const m of newMessages) appendChatMessage(m as any);
  };

  // Build chat history from the persisted store on each render so the LLM
  // sees real continuity (replaces the old in-memory chatHistoryRef).
  const chatHistoryRef = useRef<ChatHistoryEntry[]>([]);
  React.useEffect(() => {
    chatHistoryRef.current = persistedMessages.map((m) => ({
      role: m.isCoach ? 'assistant' : 'user',
      content: m.text,
    }));
  }, [persistedMessages]);

  // Pull extended context for the coach so it can take meaningful actions.
  const programState = useProgramStore((s) => s.activePlan);
  const checkIns = useUserStore((s) => s.checkIns);
  const weightLog = useUserStore((s) => s.weightLog);
  const measurements = useUserStore((s) => s.measurements);
  const badges = useUserStore((s) => s.badges);
  const allWorkouts = useTrainingStore((s) => s.workouts);
  const oneRepMaxes = useTrainingStore((s) => s.oneRepMaxByExercise);
  const likedMeals = useMealStore((s) => s.likedMeals);
  const dislikedMeals = useMealStore((s) => s.dislikedMeals);
  const waterToday = useWaterStore((s) => s.history);
  const waterTarget = useWaterStore((s) => s.dailyTargetMl);

  // Build context from current state
  const coachContext = useMemo((): CoachContext | null => {
    if (!profile) return null;

    const consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of todayMeals) {
      consumed.calories += meal.actualMacros.calories;
      consumed.protein += meal.actualMacros.protein;
      consumed.carbs += meal.actualMacros.carbs;
      consumed.fat += meal.actualMacros.fat;
    }

    const target = engine?.dailyMacros ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Today plan
    const todayIso = todayLocalIso();
    const todayPlan = programState?.days.find((d) => d.date === todayIso);
    const todayProgramDay = todayPlan?.programDayId
      ? getProgramDayById(programState!.programId, todayPlan.programDayId)
      : null;
    const activeProgram = programState ? PROGRAMS[programState.programId] : null;

    // Recent workouts (last 5)
    const recentWorkouts: NonNullable<CoachContext['recentWorkouts']> = [];
    const sortedDates = Object.keys(allWorkouts).sort().reverse();
    for (const d of sortedDates) {
      for (const w of allWorkouts[d] ?? []) {
        const vol = (w.exercises ?? []).reduce(
          (acc, ex) =>
            acc + (ex.sets ?? []).reduce((s, set) => s + (set?.weight ?? 0) * (set?.reps ?? 0), 0),
          0
        );
        recentWorkouts.push({
          date: d,
          type: w.type,
          durationMinutes: w.durationMinutes ?? 0,
          volumeKg: vol > 0 ? Math.round(vol) : undefined,
        });
        if (recentWorkouts.length >= 5) break;
      }
      if (recentWorkouts.length >= 5) break;
    }

    // Last weekly check-in
    const sortedCheckIns = [...checkIns].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    const last = sortedCheckIns.at(-1);
    const lastCheckIn = last
      ? {
          weekStart: last.weekStart,
          energy: last.energy,
          sleep: last.sleep,
          performance: last.performance,
          weight: last.weight,
        }
      : undefined;

    // Water today
    const consumedWaterMl = (waterToday[todayIso] ?? []).reduce((s, e) => s + (e?.amount ?? 0), 0);

    // Compute current week (1..4) of the program
    let currentWeek: number | undefined;
    if (programState) {
      const start = new Date(programState.startDate + 'T00:00:00');
      const now = new Date(todayIso + 'T00:00:00');
      const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
      if (diffDays >= 0) currentWeek = Math.min(4, Math.floor(diffDays / 7) + 1);
    }

    // Recent weights — last 14 entries, oldest first. Lets the coach compute
    // deltas ("73kg today, +0.3kg vs last week, on track for cut").
    const recentWeights = [...weightLog]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((w) => ({ date: w.date, weight: w.weight }));

    // Last measurement — pick the row with the most recent date. Partial
    // entries are fine (the coach handles missing fields gracefully).
    const lastMeasurementEntry = [...measurements]
      .sort((a, b) => a.date.localeCompare(b.date))
      .at(-1);
    const lastMeasurement = lastMeasurementEntry
      ? {
          date: lastMeasurementEntry.date,
          waistCm: lastMeasurementEntry.waistCm,
          hipsCm: lastMeasurementEntry.hipsCm,
          chestCm: lastMeasurementEntry.chestCm,
          armsCm: lastMeasurementEntry.armsCm,
          thighsCm: lastMeasurementEntry.thighsCm,
          bodyFatPercent: lastMeasurementEntry.bodyFatPercent,
        }
      : undefined;

    // Top 5 1RM PRs by estimated value. Lets the coach reference real lifts.
    const topOneRepMaxes = Object.entries(oneRepMaxes)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5)
      .map(([exerciseId, rec]) => ({
        exerciseId,
        weight: Math.round(rec.value),
        reps: rec.reps,
      }));

    // Recent badges — last 3 unlocked, ordered most recent first.
    const recentBadges = [...badges]
      .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
      .slice(0, 3)
      .map((b) => b.type);

    return {
      firstName: profile.name?.split(' ')[0] || 'Champion',
      hour: new Date().getHours(),
      currentStreak,
      isTodayValidated,
      mealsValidatedCount: todayMeals.length,
      mealsExpected: profile.mealsPerDay || 4,
      currentSlot: currentSlot?.slot ?? null,
      score: currentScore,
      objective: profile.objective || 'maintain',
      consumedProtein: Math.round(consumed.protein),
      targetProtein: Math.round(target.protein),
      consumedCalories: Math.round(consumed.calories),
      targetCalories: Math.round(target.calories),
      consumedCarbs: Math.round(consumed.carbs),
      targetCarbs: Math.round(target.carbs),
      consumedFat: Math.round(consumed.fat),
      targetFat: Math.round(target.fat),
      activeProgramName: activeProgram?.nameKey,
      currentWeek,
      todayPlanType: todayProgramDay?.type ?? (todayPlan ? 'rest' : 'none'),
      todayPlanName: todayProgramDay?.nameKey,
      todayProgramDayId: todayProgramDay?.id,
      todayDateIso: todayIso,
      recentWorkouts,
      lastCheckIn,
      consumedWaterMl,
      targetWaterMl: waterTarget,
      // ── Newly exposed: profile, body progress, training depth,
      //    preferences, gamification ──
      age: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      currentWeight: profile.currentWeight,
      targetWeight: profile.targetWeight,
      targetDeadline: profile.targetDeadline,
      restrictions: profile.restrictions,
      trackingMode: profile.trackingMode,
      menopauseStatus: profile.menopauseStatus,
      recentWeights,
      lastMeasurement,
      topOneRepMaxes,
      programPausedUntil: (programState as any)?.pausedUntil,
      likedMealsCount: likedMeals.length,
      dislikedMealsCount: dislikedMeals.length,
      recentDislikes: dislikedMeals.slice(-5),
      recentBadges,
    };
  }, [
    profile,
    todayMeals,
    engine,
    currentSlot,
    currentStreak,
    isTodayValidated,
    currentScore,
    programState,
    checkIns,
    allWorkouts,
    waterToday,
    waterTarget,
    weightLog,
    measurements,
    badges,
    oneRepMaxes,
    likedMeals,
    dislikedMeals,
  ]);

  // Add coach messages with typing delay
  const addCoachMessages = useCallback((texts: string[], replies: QuickReply[]) => {
    setIsTyping(true);
    setQuickReplies([]);

    let delay = 0;
    texts.forEach((text, index) => {
      const msgDelay = index === 0 ? 800 : 600 + text.length * 8;
      delay += msgDelay;

      setTimeout(() => {
        const id = String(++messageIdRef.current);
        setMessages((prev) => [...prev, { id, text, isCoach: true, timestamp: Date.now() }]);

        // Scroll to bottom
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

        // Show typing for next message, or show replies after last
        if (index === texts.length - 1) {
          setIsTyping(false);
          setQuickReplies(replies);
        }
      }, delay);
    });
  }, []);

  // Initial greeting — fire ONCE per chat lifetime, not per component mount.
  // The chat is persisted in chatStore, so checking `persistedMessages.length`
  // prevents stacking duplicate greetings every time the user relaunches the
  // app or switches tabs.
  const greetingSentRef = useRef(false);
  useEffect(() => {
    if (!coachContext || greetingSentRef.current) return;
    // Already have history (any prior session, including a past greeting) →
    // skip the auto-greeting entirely. The user can just keep talking.
    if (persistedMessages.length > 0) {
      greetingSentRef.current = true;
      return;
    }
    // Persisted guard : si on a déjà envoyé un greeting aujourd'hui (même
    // si les messages ont été clear pour rotation hebdo), on ne re-greete
    // pas. Évite aussi le double-emission sur remount rapide du composant
    // (le ref local seul ne suffit pas — il est reset à chaque mount).
    const today = new Date().toISOString().slice(0, 10);
    const lastGreetingDate = useChatStore.getState().lastGreetingDate;
    if (lastGreetingDate === today) {
      greetingSentRef.current = true;
      return;
    }
    greetingSentRef.current = true;
    useChatStore.setState({ lastGreetingDate: today });
    const response = getCoachResponse('greeting', coachContext);
    addCoachMessages(response.messages, response.quickReplies);
  }, [coachContext, addCoachMessages, persistedMessages.length]);

  // Send message to Groq AI with fallback to templates
  const sendToAI = useCallback(async (userText: string, fallbackType: QuestionType) => {
    if (!coachContext) return;

    setIsTyping(true);
    setQuickReplies([]);

    // Track user message in history
    chatHistoryRef.current.push({ role: 'user', content: userText });

    // Fresh context au moment de l'envoi : `coachContext` est memoized
    // et son `hour` reste figé à l'ouverture du chat. Si l'user reste
    // 2h sur l'écran, on enverrait "11h" même à 13h → conseils décalés
    // ("ton petit-déj" alors qu'on est au déj). On override juste le
    // champ hour ici, le reste du contexte est de toute façon valable.
    const freshContext: CoachContext = {
      ...coachContext,
      hour: new Date().getHours(),
    };

    const result = await sendCoachMessage(userText, freshContext, chatHistoryRef.current, memories);

    if (result.kind === 'quota_exceeded') {
      setIsTyping(false);
      events.quotaExceeded('coach_message');
      const id = String(++messageIdRef.current);
      setMessages((prev) => [
        ...prev,
        {
          id,
          text: result.message ?? 'Tu as atteint ta limite de messages aujourd\'hui. Passe à FORGA Pro pour des échanges illimités avec ton coach.',
          isCoach: true,
          timestamp: Date.now(),
          kind: 'quota_notice',
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    if (result.kind === 'ok') {
      events.coachMessageSent({
        cached: result.cached,
        remaining: result.quota.remaining,
        cap: result.quota.cap,
      });
      const aiReply = result.reply;
      // Parse [[ACTION:...]] AND [[MEMORY]] blocks → cleaned text + actions + memories
      const { text, actions, memories: parsedMemories } = parseCoachActionsAndMemories(aiReply);
      // Silently store any new memories the coach extracted from this turn.
      // appendMemory retourne la mémoire créée (null si déduplique) pour
      // qu'on puisse sync à Supabase — sans ça, perdu au logout/réinstall.
      const uid = profile?.id;
      for (const m of parsedMemories) {
        const created = appendMemory(m);
        if (created && uid) {
          syncCoachMemory(created, uid);
        }
      }
      // History keeps the cleaned text (no point sending action JSON back to the LLM)
      chatHistoryRef.current.push({ role: 'assistant', content: text });
      const id = String(++messageIdRef.current);
      // Fallback si le LLM a oublié de mettre du texte avant l'action :
      // on AFFICHE un message neutre plutôt que le JSON brut "[[ACTION:..."
      // qui serait incompréhensible pour l'user.
      const displayText = text.trim().length > 0
        ? text
        : (actions.length > 0
            ? (locale === 'en' ? 'Got it.' : "C'est noté.")
            : (locale === 'en' ? '...' : '...'));
      setMessages((prev) => [
        ...prev,
        {
          id,
          text: displayText,
          isCoach: true,
          timestamp: Date.now(),
          actions: actions.length > 0 ? actions : undefined,
        },
      ]);
      setIsTyping(false);
      setQuickReplies((DEFAULT_QUICK_REPLIES[locale] ?? DEFAULT_QUICK_REPLIES.fr));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      // Read response aloud — utilise le texte CLEAN (sans [[ACTION:...]] JSON)
      // sinon le TTS lit le JSON en bulle bizarre sur Web.
      speak(displayText, locale === 'en' ? 'en-US' : 'fr-FR');
    } else {
      // Fallback to template responses (error / unauthenticated)
      events.coachMessageFailed(result.kind === 'unauthenticated' ? 'auth' : 'server');
      events.coachFallbackUsed();
      const response = getCoachResponse(fallbackType, coachContext);
      addCoachMessages(response.messages, response.quickReplies);
    }
  }, [coachContext, locale, addCoachMessages]);

  // Handle user question (quick reply)
  const handleQuestion = useCallback((type: QuestionType) => {
    if (!coachContext || isTyping) return;

    const userText = (QUESTION_LABELS[locale] ?? QUESTION_LABELS.fr)[type];
    const userMsg: ChatMessage = {
      id: String(++messageIdRef.current),
      text: userText,
      isCoach: false,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    sendToAI(userText, type);
  }, [coachContext, isTyping, locale, sendToAI]);

  // Handle voice input toggle
  const handleMicPress = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = createRecognition(locale === 'en' ? 'en-US' : 'fr-FR');
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript && coachContext && !isTyping) {
        const userMsg: ChatMessage = {
          id: String(++messageIdRef.current),
          text: transcript,
          isCoach: false,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        sendToAI(transcript, 'motivation');
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [isListening, locale, coachContext, isTyping, sendToAI]);

  // Handle free text message
  const handleSendFreeText = useCallback(() => {
    const text = freeText.trim();
    if (!text || !coachContext || isTyping) return;

    impactLight();

    const userMsg: ChatMessage = {
      id: String(++messageIdRef.current),
      text,
      isCoach: false,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setFreeText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    sendToAI(text, 'motivation');
  }, [freeText, coachContext, isTyping, sendToAI]);

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
        <SkeletonScreen />
      </View>
    );
  }

  // `behavior: undefined` sur Android laissait le clavier couvrir
  // l'input du coach. `behavior: 'height'` est le bon comportement
  // Android selon les docs RN officielles.
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={[styles.container, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Header — gradient sobre (gris foncé) avec un léger highlight
          orange en haut-droite. Avant : full orange dégradé qui saturait
          l'interface du coach. */}
      <LinearGradient
        colors={['#1A1B23', '#0D0E13']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Retour explicite vers Home \u2014 `router.back()` peut foirer si
            Coach a \u00e9t\u00e9 ouvert via une tuile Home (le stack ne contient
            pas forc\u00e9ment Home dans l'historique de navigation). */}
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/home')}
          hitSlop={16}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={styles.backText}>{'\u2039'}</Text>
        </Pressable>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarLetter}>F</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('coachForga')}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSubtitle}>{t('online')}</Text>
          </View>
        </View>
        {!isPremium && !coachQuota.loading && (
          <View style={styles.quotaPill}>
            <Text style={styles.quotaPillText}>
              {Math.max(0, coachQuota.cap - coachQuota.used) + coachQuota.bonus}/{coachQuota.cap + coachQuota.bonus}
            </Text>
            <Text style={styles.quotaPillSub}>messages</Text>
          </View>
        )}
      </LinearGradient>

      {/* New: mode toggle Présence vs Conversation (résout friction UX #1 audit) */}
      <CoachModeToggle mode={coachMode} onChange={setCoachMode} />

      {coachMode === 'presence' ? (
        <PresenceView
          focus={{
            timeLabel: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            message: coachContext
              ? `Tu as ${Math.max(0, (coachContext.targetCalories ?? 0) - (coachContext.consumedCalories ?? 0))} kcal et ${Math.max(0, (coachContext.targetProtein ?? 0) - (coachContext.consumedProtein ?? 0))}g de prot restants. Le dîner est ton levier.`
              : 'On démarre la journée. Logge ton premier repas pour calibrer.',
            highlights: coachContext
              ? [
                  `${Math.max(0, (coachContext.targetCalories ?? 0) - (coachContext.consumedCalories ?? 0))} kcal`,
                  `${Math.max(0, (coachContext.targetProtein ?? 0) - (coachContext.consumedProtein ?? 0))}g`,
                ]
              : [],
            primaryAction: { label: 'Ouvrir nutrition', onPress: () => router.push('/nutrition') },
            secondaryAction: { label: 'Suggère un dîner', onPress: () => setCoachMode('conversation') },
          }}
          observations={coachObservations}
          onSwitchToConversation={() => setCoachMode('conversation')}
        />
      ) : (
      <View style={styles.messagesContainer}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => {
            const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
            const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
            // Pin to bottom when user is within ~60px of the end. Lets them
            // scroll back through history without getting yanked down on
            // every new message.
            isAtBottomRef.current = distanceFromBottom < 60;
          }}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (isAtBottomRef.current) {
              scrollRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          {/* Welcome card — shown until user dismisses, reset on logout. */}
          {!welcomeDismissed && (
            <CoachWelcomeCard
              firstName={profile?.name?.split(' ')[0]}
              onDismiss={dismissWelcome}
            />
          )}
          {messages.map((msg, i) => {
            // Cluster detection: a message is "last in cluster" when the
            // next message has a different sender (or doesn't exist).
            const next = messages[i + 1];
            const prev = messages[i - 1];
            const isLastInCluster =
              !next || next.kind === 'quota_notice' || next.isCoach !== msg.isCoach;
            const isFirstInCluster =
              !prev || prev.kind === 'quota_notice' || prev.isCoach !== msg.isCoach;
            // iMessage-style time separator: shown above the first message
            // of a cluster when there's a gap > 15 min from the previous one
            // (or always above the first message of the conversation).
            const TIME_GAP_MS = 15 * 60 * 1000;
            const showTimeSeparator =
              !prev || msg.timestamp - prev.timestamp > TIME_GAP_MS;
            return (
              <View key={msg.id}>
                {showTimeSeparator && <TimeSeparator timestamp={msg.timestamp} locale={locale} />}
                <MessageBubble
                  message={msg}
                  isLastInCluster={isLastInCluster}
                  isFirstInCluster={isFirstInCluster}
                  userAvatarUri={userAvatarUri}
                />
                {msg.actions?.map((a, ai) => (
                  <ActionProposalCard key={`${msg.id}-action-${ai}`} action={a} />
                ))}
              </View>
            );
          })}
          {isTyping && <TypingIndicator />}
        </ScrollView>
      </View>
      )}

      {/* Quick Replies + Input — visible only in conversation mode */}
      {coachMode === 'conversation' && (
      <View style={[styles.repliesContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
        {quickReplies.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.repliesScroll}
          >
            {quickReplies.map((reply) => (
              <Pressable
                key={reply.type}
                style={({ pressed }) => [
                  styles.replyButton,
                  pressed && styles.replyButtonPressed,
                ]}
                onPress={() => handleQuestion(reply.type)}
              >
                <Text style={styles.replyText}>{reply.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={styles.inputRow}>
          <View style={styles.inputPill}>
            <TextInput
              style={styles.textInput}
              value={freeText}
              onChangeText={setFreeText}
              placeholder={isListening ? (locale === 'en' ? 'Listening...' : '\u00c9coute...') : t('typeMessage')}
              placeholderTextColor={isListening ? colors.primary : colors.textMuted}
              returnKeyType="send"
              onSubmitEditing={handleSendFreeText}
              multiline
            />
            {isSpeechSupported && !freeText.trim() && (
              <Pressable
                style={[styles.micEmbedded, isListening && styles.micEmbeddedActive]}
                onPress={handleMicPress}
                disabled={isTyping}
                hitSlop={8}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" fill={isListening ? colors.white : colors.textSecondary} />
                  <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke={isListening ? colors.white : colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            )}
          </View>
          {!!freeText.trim() && (
            <SendButton onPress={handleSendFreeText} disabled={isTyping} />
          )}
        </View>
      </View>
      )}
    </View>
    </KeyboardAvoidingView>
  );
}

// ──────────── STYLES ────────────

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignSelf: 'center',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },

  // Header — warm gradient
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    paddingRight: spacing.xs,
  },
  backText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.white,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  quotaPill: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    marginLeft: 8,
  },
  quotaPillText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  quotaPillSub: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.85)',
  },

  // Header avatar (iMessage-style monogram)
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarLetter: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },

  // Messages — solid background, iMessage style
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Time separator — centered, all-caps, muted
  timeSeparator: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timeSeparatorText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  // Bubble row — common to coach and user
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 2, // tight by default — clusters of same-sender messages
    maxWidth: '78%',
  },
  // First bubble in a cluster gets extra top margin (visual separator
  // between clusters of different senders).
  clusterFirst: {
    marginTop: spacing.sm,
  },
  coachRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },

  // Bubble — base style
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },

  // Coach (received) bubble — slate gray, iMessage dark-mode style
  coachBubble: {
    backgroundColor: 'rgba(120,120,128,0.24)',
  },
  coachTail: {
    borderBottomLeftRadius: 6,
  },
  coachText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    lineHeight: 21,
  },
  /** Curseur blinkant pendant l'animation typewriter du coach. */
  cursor: {
    color: colors.primary,
    fontWeight: '700' as const,
    opacity: 0.7,
  },
  /** Ligne de feedback thumbs up/down sous chaque bulle du coach. */
  feedbackRow: {
    flexDirection: 'row' as const,
    gap: 4,
    marginTop: 6,
    marginLeft: 4,
  },
  feedbackBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
  },
  feedbackBtnActiveUp: {
    backgroundColor: 'rgba(0,212,170,0.12)',
  },
  feedbackBtnActiveDown: {
    // Rouge dilué (sémantique "négatif") au lieu d'orange (qui se
    // confondait avec les bulles user et la branding primaire).
    backgroundColor: 'rgba(255, 80, 80, 0.14)',
  },
  feedbackIcon: {
    fontSize: 14,
    opacity: 0.35,
  },
  feedbackIconActiveUp: {
    opacity: 1,
  },
  feedbackIconActiveDown: {
    opacity: 1,
  },

  // User (sent) bubble — FORGA orange, iMessage shape
  userBubble: {
    backgroundColor: colors.primary,
  },
  userTail: {
    borderBottomRightRadius: 6,
  },
  userText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.white,
    lineHeight: 21,
  },
  /** Avatar user (photo de profil) affiché à droite de la dernière
   *  bulle d'un cluster. Si avatarUri custom dispo on l'affiche,
   *  sinon fallback genré (portrait Unsplash homme/femme). */
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 6,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  /** Avatar coach FORGA affiché à gauche de la dernière bulle d'un
   *  cluster coach (iMessage pattern). Donne une identité visuelle
   *  au coach IA plutôt qu'une suite de bulles anonymes. */
  coachAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  /** Placeholder transparent — réserve la zone avatar sur les bulles
   *  coach intermédiaires d'un cluster, pour que toutes les bulles
   *  soient alignées sur la même verticale (l'avatar n'apparaît que
   *  sur la dernière du cluster mais l'indent reste constant). */
  avatarPlaceholder: {
    width: 28,
    marginRight: 6,
  },

  // Quota notice — system-style centered card
  quotaRow: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  quotaCard: {
    backgroundColor: 'rgba(255, 107, 44, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 44, 0.35)',
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  quotaTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  quotaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  quotaButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  quotaButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },

  // Typing — iMessage 3-dot wave inside a small slate bubble
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 5,
    borderBottomLeftRadius: 6,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  // Quick replies — style neutre (gris) avec accent orange uniquement
  // au press. Avant : bordure + bg orange permanents qui rendaient la
  // zone trop chargée visuellement.
  repliesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
  },
  repliesScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  replyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  replyButtonPressed: {
    backgroundColor: 'rgba(255,107,53,0.18)',
    borderColor: colors.primary,
    transform: [{ scale: 0.96 }],
  },
  replyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },

  // Input — iMessage pill with embedded mic + circular send button
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.16)',
    borderRadius: 20,
    minHeight: 36,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 2,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
  },
  micEmbedded: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  micEmbeddedActive: {
    backgroundColor: colors.primary,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
}));
