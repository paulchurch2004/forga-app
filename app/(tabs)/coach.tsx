import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  DEFAULT_QUICK_REPLIES,
  type QuestionType,
  type CoachContext,
  type QuickReply,
} from '../../src/engine/coachChatEngine';
import { sendCoachMessage, type ChatHistoryEntry } from '../../src/services/coachAI';
import { fonts, fontSizes, spacing, borderRadius, makeStyles, shadows } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useT } from '../../src/i18n';
import { router } from 'expo-router';

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
}

const COACH_AVATAR = 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=200&q=80';
const CHAT_BG_IMAGE = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=30';

// ──────────── COACH AVATAR ────────────

function CoachAvatar({ size = 36 }: { size?: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <ImageBackground
        source={{ uri: COACH_AVATAR }}
        style={{ width: size, height: size }}
        imageStyle={{ borderRadius: size / 2 }}
      />
      <View style={styles.avatarOnline} />
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
  const chatHistoryRef = useRef<ChatHistoryEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  // Initial greeting — run once when context becomes available
  const greetingSentRef = useRef(false);
  useEffect(() => {
    if (!coachContext || greetingSentRef.current) return;
    greetingSentRef.current = true;
    const response = getCoachResponse('greeting', coachContext);
    addCoachMessages(response.messages, response.quickReplies);
  }, [coachContext, addCoachMessages]);

  // Send message to Groq AI with fallback to templates
  const sendToAI = useCallback(async (userText: string, fallbackType: QuestionType) => {
    if (!coachContext) return;

    setIsTyping(true);
    setQuickReplies([]);

    // Track user message in history
    chatHistoryRef.current.push({ role: 'user', content: userText });

    const aiReply = await sendCoachMessage(userText, coachContext, chatHistoryRef.current);

    if (aiReply) {
      // AI responded successfully
      chatHistoryRef.current.push({ role: 'assistant', content: aiReply });
      const id = String(++messageIdRef.current);
      setMessages((prev) => [...prev, { id, text: aiReply, isCoach: true, timestamp: Date.now() }]);
      setIsTyping(false);
      setQuickReplies((DEFAULT_QUICK_REPLIES[locale] ?? DEFAULT_QUICK_REPLIES.fr));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      // Read response aloud
      speak(aiReply, locale === 'en' ? 'en-US' : 'fr-FR');
    } else {
      // Fallback to template responses
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
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[styles.container, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2039'}</Text>
        </Pressable>
        <CoachAvatar size={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('coachForga')}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSubtitle}>{t('online')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Messages with sport background */}
      <ImageBackground
        source={{ uri: CHAT_BG_IMAGE }}
        style={styles.messagesContainer}
        imageStyle={styles.bgImage}
      >
        <View style={styles.bgOverlay}>
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </ScrollView>
        </View>
      </ImageBackground>

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
            placeholder={isListening ? (locale === 'en' ? 'Listening...' : '\u00c9coute...') : t('typeMessage')}
            placeholderTextColor={isListening ? colors.primary : colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSendFreeText}
          />
          {isSpeechSupported && (
            <Pressable
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={handleMicPress}
              disabled={isTyping}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" fill={isListening ? colors.white : colors.primary} />
                <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke={isListening ? colors.white : colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          )}
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
    backgroundColor: '#00FF88',
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.85)',
  },

  // Messages — sport background
  messagesContainer: {
    flex: 1,
  },
  bgImage: {
    opacity: 0.08,
  },
  bgOverlay: {
    flex: 1,
    backgroundColor: `${colors.background}E6`,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Coach bubble — more contrast
  coachRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    maxWidth: '88%',
  },
  avatar: {
    marginRight: spacing.sm,
    flexShrink: 0,
    position: 'relative',
    overflow: 'visible',
  },
  avatarOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF88',
    borderWidth: 2,
    borderColor: colors.background,
  },
  coachBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flex: 1,
    ...shadows.card,
  },
  coachText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },

  // User bubble — bold primary
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    maxWidth: '82%',
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.card,
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
    marginBottom: spacing.md,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6,
    ...shadows.card,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // Quick replies — warmer
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
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,53,0.1)',
  },
  replyButtonPressed: {
    backgroundColor: 'rgba(255,107,53,0.25)',
    transform: [{ scale: 0.96 }],
  },
  replyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },

  // Input — larger touch targets for mobile
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    maxHeight: 100,
    minHeight: 44,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,107,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
}));
