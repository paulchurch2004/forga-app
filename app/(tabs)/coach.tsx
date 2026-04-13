import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
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
  type QuestionType,
  type CoachContext,
  type QuickReply,
} from '../../src/engine/coachChatEngine';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useT } from '../../src/i18n';
import { router } from 'expo-router';

// ──────────── TYPES ────────────

interface ChatMessage {
  id: string;
  text: string;
  isCoach: boolean;
  timestamp: number;
}

// ──────────── COACH AVATAR ────────────

function CoachAvatar() {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.avatar}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10Z" fill={colors.primary} opacity={0.9} />
        <Path d="M12 8c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5Z" fill="#FFD93D" />
      </Svg>
    </View>
  );
}

// ──────────── TYPING INDICATOR ────────────

function TypingIndicator() {
  const styles = useStyles();
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      dot1.value = withTiming(1, { duration: 400 }, () => {
        dot1.value = withTiming(0.3, { duration: 400 });
      });
      dot2.value = withDelay(150, withTiming(1, { duration: 400 }, () => {
        dot2.value = withTiming(0.3, { duration: 400 });
      }));
      dot3.value = withDelay(300, withTiming(1, { duration: 400 }, () => {
        dot3.value = withTiming(0.3, { duration: 400 });
      }));
    };
    animate();
    const interval = setInterval(animate, 1200);
    return () => clearInterval(interval);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.typingRow}>
      <CoachAvatar />
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, s1]} />
        <Animated.View style={[styles.typingDot, s2]} />
        <Animated.View style={[styles.typingDot, s3]} />
      </View>
    </View>
  );
}

// ──────────── MESSAGE BUBBLE ────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const styles = useStyles();

  if (message.isCoach) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.coachRow}>
        <CoachAvatar />
        <View style={styles.coachBubble}>
          <Text style={styles.coachText}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.text}</Text>
      </View>
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
  const { currentScore } = useScoreStore();
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const { currentSlot } = useMealSlot();
  const { currentStreak, isTodayValidated } = useStreak();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [freeText, setFreeText] = useState('');
  const messageIdRef = useRef(0);

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

    return {
      firstName: profile.name.split(' ')[0],
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
    };
  }, [profile, todayMeals, engine, currentSlot, currentStreak, isTodayValidated, currentScore]);

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

  // Initial greeting
  useEffect(() => {
    if (!coachContext) return;
    const response = getCoachResponse('greeting', coachContext);
    addCoachMessages(response.messages, response.quickReplies);
  }, [coachContext !== null]); // Only run once when context becomes available

  // Handle user question
  const handleQuestion = useCallback((type: QuestionType) => {
    if (!coachContext || isTyping) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: String(++messageIdRef.current),
      text: (QUESTION_LABELS[locale] ?? QUESTION_LABELS.fr)[type],
      isCoach: false,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Scroll to show user message
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Get and display coach response
    const response = getCoachResponse(type, coachContext);
    addCoachMessages(response.messages, response.quickReplies);
  }, [coachContext, isTyping, addCoachMessages]);

  // Handle free text message
  const handleSendFreeText = useCallback(() => {
    const text = freeText.trim();
    if (!text || !coachContext || isTyping) return;

    const userMsg: ChatMessage = {
      id: String(++messageIdRef.current),
      text,
      isCoach: false,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setFreeText('');

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const response = getCoachResponse('motivation', coachContext);
    addCoachMessages(response.messages, response.quickReplies);
  }, [freeText, coachContext, isTyping, addCoachMessages]);

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2039'}</Text>
        </Pressable>
        <View style={styles.headerIcon}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10Z" fill={colors.primary} opacity={0.9} />
            <Path d="M12 8c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5Z" fill="#FFD93D" />
          </Svg>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('coachForga')}</Text>
          <Text style={styles.headerSubtitle}>{t('online')}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Quick Replies + Input */}
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
          <TextInput
            style={styles.textInput}
            value={freeText}
            onChangeText={setFreeText}
            placeholder={t('typeMessage')}
            placeholderTextColor={colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSendFreeText}
          />
          <Pressable
            style={[styles.sendButton, (!freeText.trim() || isTyping) && styles.sendButtonDisabled]}
            onPress={handleSendFreeText}
            disabled={!freeText.trim() || isTyping}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
      </View>
    </View>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  backButton: {
    paddingRight: spacing.xs,
  },
  backText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.primary,
    lineHeight: 32,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.success,
    marginTop: 1,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Coach bubble
  coachRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    maxWidth: '85%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  coachBubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  coachText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },

  // User bubble
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.white,
    lineHeight: 22,
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },

  // Quick replies
  repliesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
  },
  repliesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  replyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  replyButtonPressed: {
    backgroundColor: 'rgba(255,107,53,0.2)',
  },
  replyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Free text input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
}));
