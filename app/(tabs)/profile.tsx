import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
  Switch,
  Linking,
  useWindowDimensions,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { resolveLocalUri } from '../../src/utils/persistImage';
import { getScoreColor, getScoreLabel } from '../../src/theme/colors';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useUserStore } from '../../src/store/userStore';
import { ProfileHeroCard } from '../../src/components/profile/ProfileHeroCard';
import { MetalDays30Card, type MetalKey } from '../../src/components/profile/MetalDays30Card';
import { PrList, type PrItem } from '../../src/components/profile/PrCard';
import { UserStateDebugCard } from '../../src/components/profile/UserStateDebugCard';
import { PremiumUpgradeCard } from '../../src/components/home/PremiumUpgradeCard';
import { useBiometricCapabilities, usePromptBiometric } from '../../src/hooks/useBiometricAuth';
import { ProfileSheet, SheetOptionRow } from '../../src/components/profile/ProfileSheet';
import { useTopPRs } from '../../src/hooks/useTopPRs';
import { useMetalHistoryStore } from '../../src/store/metalHistoryStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useMealStore } from '../../src/store/mealStore';
import { useWaterStore } from '../../src/store/waterStore';
import { useSettingsStore, type ThemeMode, type Locale } from '../../src/store/settingsStore';
import { useStreak } from '../../src/hooks/useStreak';
import { usePremium } from '../../src/hooks/usePremium';
import { useActionBadges } from '../../src/hooks/useActionBadges';
import { NotifDot } from '../../src/components/ui/NotifDot';
import { supabase } from '../../src/services/supabase';
import { processQueue, clearQueue } from '../../src/services/syncQueue';
import { captureException } from '../../src/services/sentry';
import { useAuthStore } from '../../src/store/authStore';
import { BADGE_INFO, type BadgeType } from '../../src/types/user';
import { BadgeCard } from '../../src/components/gamification/BadgeCard';
import { LineChart, type DataPoint } from '../../src/components/charts/LineChart';
import * as ImagePicker from 'expo-image-picker';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SkeletonScreen } from '../../src/components/ui/Skeleton';
import { useNotifications } from '../../src/hooks/useNotifications';
import { events } from '../../src/services/analytics';
import appJson from '../../app.json';

const APP_VERSION = appJson.expo.version;
const PROFILE_HEADER_IMAGE =
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=60';

function CoreStateDebugMount() {
  const showDebug = useSettingsStore((s) => s.showCoreStateDebug);
  if (!__DEV__ && !showDebug) return null;
  return <UserStateDebugCard />;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { t, locale } = useT();
  const styles = useStyles();

  const scrollRef = useRef<ScrollView>(null);

  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const badges = useUserStore((s) => s.badges);
  const score = useScoreStore((s) => s.currentScore);
  const { currentStreak, bestStreak, streakFreezeUsedThisWeek } = useStreak();
  const { isPremium, isTrialActive, isTrialExpired, daysLeft } = usePremium();
  const { checkinDue, trialEndingSoon } = useActionBadges();
  const checkIns = useUserStore((s) => s.checkIns);
  const weightLog = useUserStore((s) => s.weightLog);
  const { isEnabled: notifEnabled, toggle: toggleNotif } = useNotifications();
  const { width: screenWidth } = useWindowDimensions();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const biometricLockEnabled = useSettingsStore((s) => s.biometricLockEnabled);
  const setBiometricLockEnabled = useSettingsStore((s) => s.setBiometricLockEnabled);
  // Compteur de pas — flag opt-in pour activer la lecture Apple Health.
  // L'user le toggle dans la section Réglages plus bas. Reactivement
  // sélectionné pour que le texte "Activé/Désactivé" se rafraîchisse
  // dès qu'on change l'état.
  const stepsEnabled = useSettingsStore((s) => s.stepsEnabled);
  const setStepsEnabled = useSettingsStore((s) => s.setStepsEnabled);
  const bioCaps = useBiometricCapabilities();
  const promptBiometric = usePromptBiometric();
  const [exporting, setExporting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [sheet, setSheet] = useState<null | 'theme' | 'language' | 'logout' | 'delete'>(null);
  const topPRs = useTopPRs(3);
  const metalHistory = useMetalHistoryStore((s) => s.history);
  const metal30 = useMemo(() => {
    const result: Array<{ date: string; metal: string | null }> = [];
    const today = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      result.push({ date: key, metal: metalHistory[key] ?? null });
    }
    return result;
  }, [metalHistory]);

  const chartWidth = Math.min(screenWidth - spacing['2xl'] * 2, contentMaxWidth) - spacing.md * 2;

  const weightChartData: DataPoint[] = useMemo(() => {
    if (weightLog.length === 0) return [];
    const sorted = [...weightLog].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    // Last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const recent = sorted.filter((e) => new Date(e.date) >= cutoff);
    const data = recent.length >= 2 ? recent : sorted.slice(-10);
    return data.map((e) => ({ date: e.date, value: e.weight }));
  }, [weightLog]);

  const lastAdjustment = [...checkIns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find((c) => c.calorieAdjustment !== 0);

  /**
   * Ouvre le picker système (caméra ou bibliothèque selon le choix
   * de l'user) puis met à jour l'avatarUri dans le profile store.
   * Le storage Supabase Storage upload est volontairement skip pour
   * v1 — l'URI locale persiste via Zustand persist, ce qui suffit
   * jusqu'à ce que l'user change d'appareil. À muscler en v1.1.
   */
  /** Handler partagé entre "Prendre une photo" et "Choisir dans la bibliothèque".
   *  Flow en 3 temps :
   *  1) Persistance LOCALE immédiate → l'user voit sa photo tout de
   *     suite, sans attendre l'upload réseau.
   *  2) Upload Supabase Storage en background → la photo devient
   *     cross-device et survit aux rebuilds/réinstalls (le local seul
   *     ne suffisait pas : le container iOS change parfois entre 2
   *     sessions et invalide les paths).
   *  3) Quand l'upload OK, on remplace l'URI locale par l'URL publique
   *     dans le profile + sync Supabase (déjà fait via updateProfile
   *     + syncProfile).
   *
   *  Si l'upload échoue (offline, bucket non configuré), on garde
   *  l'URI locale en fallback — l'user voit la photo sur ce device au
   *  moins jusqu'au prochain rebuild.
   */
  const persistAndUpload = useCallback(
    async (localPickerUri: string) => {
      const { persistImage } = await import('../../src/utils/persistImage');
      const persistedLocal = await persistImage(localPickerUri, 'avatars');
      // Affichage immédiat avec l'URI locale
      updateProfile({ avatarUri: persistedLocal });

      // Upload cloud en background (non bloquant pour l'UI)
      const userId = profile?.id;
      if (!userId) {
        Alert.alert('Debug', 'Pas de userId — l\'upload Supabase a été skippé. Es-tu en mode démo ?');
        return;
      }
      const { uploadAvatar } = await import('../../src/services/avatarStorage');
      const result = await uploadAvatar(localPickerUri, userId);
      if (result.ok) {
        // Remplace par l'URL cloud (stable, cross-device)
        updateProfile({ avatarUri: result.url });
        const { syncProfile } = await import('../../src/services/userSync');
        const { error: syncError } = await supabase
          .from('users')
          .update({ avatar_uri: result.url })
          .eq('id', userId);
        if (syncError) {
          Alert.alert('⚠️ Photo uploadée mais NON sauvegardée en DB', `Cause : ${syncError.message}\n\nL'URL de la photo : ${result.url.slice(0, 60)}...`);
        } else {
          Alert.alert('✅ Photo sauvegardée', `Tout OK !\n\n${result.url.slice(0, 60)}...`);
        }
      } else {
        Alert.alert('⚠️ Upload échoué', `Raison précise :\n\n${result.reason}\n\nUserId : ${userId.slice(0, 8)}...`);
      }
    },
    [updateProfile, profile?.id],
  );

  const handleChangeAvatar = useCallback(async () => {
    // Action sheet natif : caméra ou bibliothèque
    Alert.alert(
      t('profileChangePhoto' as any) as string,
      undefined,
      [
        {
          text: t('profileTakePhoto' as any) as string,
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) return;
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              await persistAndUpload(result.assets[0].uri);
            }
          },
        },
        {
          text: t('profilePickFromLibrary' as any) as string,
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) return;
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              await persistAndUpload(result.assets[0].uri);
            }
          },
        },
        // Bouton "retirer" uniquement si une photo custom existe
        ...(profile?.avatarUri
          ? [
              {
                text: t('profileRemovePhoto' as any) as string,
                style: 'destructive' as const,
                onPress: () => updateProfile({ avatarUri: undefined }),
              },
            ]
          : []),
        { text: t('cancel') as string, style: 'cancel' as const },
      ],
    );
  }, [updateProfile, profile?.avatarUri, t]);

  const handleCopyCode = useCallback(async () => {
    const code = profile?.referralCode;
    if (!code) return;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCodeCopied(true);
      events.referralCodeShared('copy');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      if (__DEV__) console.warn('[Profile] Copy referral code failed:', error);
    }
  }, [profile?.referralCode]);

  const handleShareCode = useCallback(async () => {
    const code = profile?.referralCode;
    if (!code) return;
    try {
      await Share.share({
        message: t('shareReferralMessage', { code }),
      });
      events.referralCodeShared('share');
    } catch (error) {
      if (__DEV__) console.warn('[Profile] Share referral code failed:', error);
    }
  }, [profile?.referralCode]);

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <SkeletonScreen />
      </View>
    );
  }

  const handleExportData = async () => {
    setExporting(true);
    try {
      const weightLog = useUserStore.getState().weightLog;
      const mealHistory = useMealStore.getState().mealHistory;
      const scoreHistory = useScoreStore.getState().history;
      const { id: _id, email: _email, referralCode: _ref, referredBy: _refBy, ...safeProfile } = profile;
      const data = {
        profile: safeProfile,
        badges,
        score,
        weightLog,
        checkIns,
        mealHistory,
        scoreHistory,
        exportedAt: new Date().toISOString(),
      };
      const json = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forga-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ message: json, title: 'Export FORGA' });
      }
    } catch {
      Alert.alert(t('error'), t('cannotExportData'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => setSheet('delete');

  const performDeleteAccount = async () => {
    try {
      // RGPD art.17 : la cascade DB n'efface PAS le Storage. On supprime
      // explicitement l'avatar (donnée perso) AVANT le RPC, tant que le
      // JWT est encore valide. (audit sécurité)
      try {
        const uid = useAuthStore.getState().session?.user?.id;
        if (uid) {
          await supabase.storage.from('avatars').remove([
            `${uid}/avatar.jpg`, `${uid}/avatar.jpeg`, `${uid}/avatar.png`,
            `${uid}/avatar.webp`, `${uid}/avatar.heic`,
          ]);
        }
      } catch (err) {
        if (__DEV__) console.warn('[DeleteAccount] avatar remove failed:', err);
      }

      // Appelle la fonction RPC server-side `delete_my_account` (cf
      // migration 016). Elle supprime UN SEUL row dans auth.users, et
      // le ON DELETE CASCADE propage à TOUTES les sous-tables —
      // garantit qu'aucune donnée orpheline ne reste, et que le compte
      // disparaît bien de Supabase Authentication (pas que de
      // public.users). Conformité RGPD complète.
      const { error: rpcError } = await supabase.rpc('delete_my_account');
      if (rpcError) {
        if (__DEV__) console.error('[DeleteAccount] RPC failed:', rpcError.message);
        captureException(new Error(`delete_my_account RPC failed: ${rpcError.message}`), { component: 'DeleteAccount' });
        Alert.alert(t('error'), t('errorOccurred'));
        return;
      }

      // À ce point l'user n'existe plus côté serveur. On nettoie le
      // local et on déclenche le signOut (qui sera de toute façon
      // forcé au prochain appel API vu que le JWT est plus valide).
      await supabase.auth.signOut();
      useUserStore.getState().reset();
      useMealStore.getState().reset();
      useScoreStore.getState().reset();
      useAuthStore.getState().reset();
      useWaterStore.getState().reset();
      const { useChatStore } = await import('../../src/store/chatStore');
      useChatStore.getState().resetOnLogout();
      // Reset training store + shopping list aussi — sinon les
      // PR/listes du user supprimé persistent en local et seraient
      // sync à un autre compte au prochain login.
      const { useTrainingStore } = await import('../../src/store/trainingStore');
      useTrainingStore.getState().reset();
      const { useShoppingListStore } = await import('../../src/store/shoppingListStore');
      useShoppingListStore.getState().reset();
      // ⚠ BUG corrigé : ces 3 stores n'étaient PAS reset → après
      // suppression + recréation de compte, l'ancien PROGRAMME
      // d'entraînement (programStore.activePlan) persistait, et l'écran
      // training refusait de reconfigurer (il croyait avoir déjà un
      // plan). Idem frise métaux + plan repas hebdo.
      const { useProgramStore } = await import('../../src/store/programStore');
      useProgramStore.getState().reset();
      const { useMetalHistoryStore } = await import('../../src/store/metalHistoryStore');
      useMetalHistoryStore.getState().reset();
      const { useWeeklyPlanStore } = await import('../../src/store/weeklyPlanStore');
      useWeeklyPlanStore.getState().reset();
      // Reset prompts user-scoped + clear sync queue (cf signOut).
      useSettingsStore.setState({
        firstActiveDate: null,
        reviewPromptShownAt: null,
        referralPromptShownAt: null,
      });
      try {
        await clearQueue();
      } catch (err) {
        if (__DEV__) console.warn('[DeleteAccount] clearQueue failed:', err);
      }
    } catch (error: any) {
      Alert.alert(t('error'), t('errorOccurred'));
    }
  };

  const handleManageSubscription = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      await Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      Alert.alert(
        t('manageSubscription'),
        t('contactSupport'),
      );
    }
  };

  const handleSignOut = () => setSheet('logout');

  const performSignOut = async () => {
    // ⚠ ÉTAPE CRITIQUE — drainer la sync queue AVANT le reset.
    //
    // Sans ça, tout ce que l'user a logué depuis le dernier foreground
    // (repas, séances, poids, mesures) est encore en pending dans la
    // queue locale et JAMAIS pushé vers Supabase. Le reset qui suit
    // wipe le cache local → la donnée est perdue pour toujours.
    //
    // En cas d'échec réseau, on tente quand même le signOut — l'user
    // ne doit pas rester coincé en attente d'une queue qui drain pas.
    // Les actions resteront dans la queue (AsyncStorage persistant)
    // et seront re-tentées au prochain login. C'est OK : `processQueue`
    // est idempotent (`upsert` partout).
    try {
      await processQueue();
    } catch (err) {
      if (__DEV__) console.warn('[SignOut] processQueue failed before logout:', err);
    }

    await supabase.auth.signOut();
    useUserStore.getState().reset();
    useMealStore.getState().reset();
    useScoreStore.getState().reset();
    useAuthStore.getState().reset();
    useWaterStore.getState().reset();
    // Reset coach chat + memories + welcome card so the next user/session
    // (or the same user logging back in) sees the welcome again.
    const { useChatStore } = await import('../../src/store/chatStore');
    useChatStore.getState().resetOnLogout();
    // Reset des 5 stores user-scoped qui étaient OUBLIÉS ici → cross-user
    // contamination sur device partagé (gym, famille). Sans ce reset,
    // user B voyait les workouts/programme/listes/gamification de user A.
    const { useTrainingStore } = await import('../../src/store/trainingStore');
    useTrainingStore.getState().reset();
    const { useProgramStore } = await import('../../src/store/programStore');
    useProgramStore.getState().reset?.();
    const { useWeeklyPlanStore } = await import('../../src/store/weeklyPlanStore');
    useWeeklyPlanStore.getState().reset?.();
    const { useShoppingListStore } = await import('../../src/store/shoppingListStore');
    useShoppingListStore.getState().reset();
    // Frise gamification métaux — sinon user B voit les 30 derniers
    // jours de user A sur le profil.
    const { useMetalHistoryStore } = await import('../../src/store/metalHistoryStore');
    useMetalHistoryStore.getState().reset();
    // Reset des settings USER-scoped (Apple Health timestamp, biometric,
    // steps), tout en gardant le thème + locale qui sont device-level.
    // Les timestamps de prompts (review/referral) sont aussi user-scoped :
    // sans reset, user B sur le même device hériterait des compteurs de
    // user A → soit prompt loupé (déjà "shown" pour A), soit prompt
    // immédiat (firstActiveDate trop ancien).
    useSettingsStore.setState({
      appleHealthEnabled: false,
      lastHealthSyncAt: null,
      stepsEnabled: false,
      biometricLockEnabled: false,
      firstActiveDate: null,
      reviewPromptShownAt: null,
      referralPromptShownAt: null,
    });

    // Wipe la sync queue : tout ce qui restait dedans est perdu
    // intentionnellement pour éviter que des actions de user A soient
    // push-sync sous le user_id de user B au prochain login.
    try {
      await clearQueue();
    } catch (err) {
      if (__DEV__) console.warn('[SignOut] clearQueue failed:', err);
    }
  };

  const objectiveLabels: Record<string, string> = {
    bulk: t('objectiveBulk'),
    cut: t('objectiveCut'),
    maintain: t('objectiveMaintain'),
    recomp: t('objectiveRecomp'),
  };

  const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: t('themeDark') },
    { value: 'light', label: t('themeLight') },
    { value: 'system', label: t('themeSystem') },
  ];

  const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
    { value: 'fr', label: t('languageFr') },
    { value: 'en', label: t('languageEn') },
  ];

  // Le ScrollView prend TOUTE la largeur de l'écran (pas de maxWidth
  // au niveau contentContainer). Avant : maxWidth=500 sur le content
  // → le hero était centré et avait des bandes vides à gauche/droite
  // sur iPhone Pro Max + iPad → l'app avait l'air d'un site web mal
  // responsive. Maintenant le hero est full-width comme attendu.
  // Les sections internes qui ont besoin d'être contraintes en
  // largeur (cards stats, blocs centrés) le font via leur propre
  // maxWidth — pas via le wrapper global.
  // ScrollView SANS paddingTop : on veut que le hero soit edge-to-edge
  // (sous la Dynamic Island / Notch / Status Bar) comme Instagram, Twitter,
  // etc. Le hero a sa propre hauteur incluant `insets.top` pour que les
  // éléments UI internes (back button, name, email) ne soient pas
  // cachés par l'encoche. Sans ce pattern, sur iPhone Pro Max le hero
  // s'arrête sous la caméra → bande noire visible en haut = aspect
  // "site web" au lieu de "app native".
  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Header — full-bleed, passe SOUS la Dynamic Island */}
      <ImageBackground
        source={{ uri: PROFILE_HEADER_IMAGE }}
        style={[styles.heroImage, { height: styles.heroImage.height + insets.top }]}
        imageStyle={styles.heroImageInner}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)']}
          style={styles.heroOverlay}
        >
          {/* `top` géré par le style — le ScrollView a déjà paddingTop:
              insets.top, donc on n'ajoute PAS insets.top une 2e fois ici
              (sinon le bouton se retrouvait à 2× insets.top du haut écran,
              soit en plein milieu du hero, par-dessus le pseudo). */}
          {/* Position absolute pour ne pas pousser name+email plus bas.
              `top` calcul\u00e9 dynamiquement = insets.top (sous Dynamic
              Island / encoche) + petite marge respiratoire. Sans
              insets.top, le back button serait masqu\u00e9 par l'encoche
              sur iPhone Pro Max maintenant que le hero est edge-to-edge. */}
          <View style={[styles.headerTopRow, { top: insets.top + 4 }]}>
            <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backRow}>
              <Text style={styles.backText}>{'\u2039'} {t('home')}</Text>
            </Pressable>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>
                {isTrialActive ? t('premiumTrialActive', { days: daysLeft }) : 'FORGA PRO'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </ImageBackground>

      {/* Redesign hero — archétype + identité + 3 stats key */}
      <View style={{ paddingHorizontal: 0, marginTop: 16 }}>
        <ProfileHeroCard
          name={profile.name}
          archetype={useUserStore.getState().onboardingData.archetype}
          cycleLabel={t('profileCycleLabel', { streak: currentStreak })}
          streak={currentStreak}
          formScore={score.total}
          weight={weightLog[weightLog.length - 1]?.weight ?? profile.currentWeight ?? 0}
          avatarUri={resolveLocalUri(profile.avatarUri)}
          onAvatarPress={handleChangeAvatar}
        />
      </View>

      {/* À COMPLÉTER — encart en haut du profil : c'est ici que le point
          rouge de l'onglet "atterrit" (fil d'Ariane), visible immédiatement
          sans scroller, et qui mène droit à l'action. */}
      {(checkinDue || trialEndingSoon) && (
        <View style={[styles.section, { marginTop: 20 }]}>
          {checkinDue && (
            <Pressable
              style={[styles.progressionButton, { marginBottom: spacing.sm }]}
              onPress={() => router.push('/checkin')}
            >
              <View style={styles.progressionLeft}>
                <NotifDot style={{ marginLeft: 4, marginRight: 12 }} />
                <View>
                  <Text style={styles.progressionTitle}>{t('weeklyCheckIn')}</Text>
                  <Text style={styles.progressionSubtitle}>{t('checkInSubtitle')}</Text>
                </View>
              </View>
              <Text style={styles.progressionArrow}>{'›'}</Text>
            </Pressable>
          )}
          {trialEndingSoon && (
            <Pressable style={styles.progressionButton} onPress={handleManageSubscription}>
              <View style={styles.progressionLeft}>
                <NotifDot style={{ marginLeft: 4, marginRight: 12 }} />
                <View>
                  <Text style={styles.progressionTitle}>
                    {locale === 'en' ? 'Your trial ends soon' : 'Ton essai expire bientôt'}
                  </Text>
                  <Text style={styles.progressionSubtitle}>
                    {locale === 'en' ? 'Manage your subscription' : 'Gère ton abonnement'}
                  </Text>
                </View>
              </View>
              <Text style={styles.progressionArrow}>{'›'}</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* 30 derniers jours — vraies check-ins métaux du Morning Ritual */}
      <View style={{ marginTop: 24 }}>
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>{t('profileLast30DaysLabel')}</Text>
        <MetalDays30Card
          days={metal30.map((d) => (d.metal ?? 'repos') as MetalKey)}
        />
      </View>

      {/* PRs forgés — vraies données extraites des workouts validés */}
      {topPRs.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>{t('profilePrsLabel')}</Text>
          <PrList items={topPRs} />
        </View>
      )}

      {/* FORGA Core State debug — observation panel (Phase 1).
          Visible if __DEV__ OR if the hidden settings toggle is on. */}
      <CoreStateDebugMount />

      {/* Rapport hebdo — CTA vers la revue de semaine */}
      <Pressable style={styles.weeklyReportBtn} onPress={() => router.push('/weekly-review')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.weeklyReportEyebrow}>{t('profileWeeklyReportEyebrow')}</Text>
          <Text style={styles.weeklyReportTitle}>{t('profileWeeklyReportTitle')}</Text>
        </View>
        <Text style={styles.weeklyReportArrow}>{'›'}</Text>
      </Pressable>

      {/* Score + Streak */}
      <View style={styles.statsRow}>
        <Pressable style={styles.statCard} onPress={() => router.push('/share?type=score')}>
          <Text style={[styles.statValue, { color: getScoreColor(score.total) }]}>
            {score.total}
          </Text>
          <Text style={styles.statLabel}>{getScoreLabel(score.total, locale)}</Text>
          <Text style={styles.shareHint}>{t('share')}</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push('/share?type=streak')}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {currentStreak}
          </Text>
          <Text style={styles.statLabel}>{t('daysStreak')}</Text>
          {isPremium && (
            <Text style={[styles.freezeHint, { color: streakFreezeUsedThisWeek ? colors.textMuted : colors.success }]}>
              {streakFreezeUsedThisWeek ? t('streakFreezeUsed') : t('streakFreezeAvailable')}
            </Text>
          )}
          <Text style={styles.shareHint}>{t('share')}</Text>
        </Pressable>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {bestStreak}
          </Text>
          <Text style={styles.statLabel}>{t('bestStreak')}</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('myBadges')}</Text>
        <View style={styles.badgeGrid}>
          {(Object.keys(BADGE_INFO) as BadgeType[]).map((type) => {
            const unlockedBadge = badges.find((b) => b.type === type);
            // Badge progress for locked badges
            let progress: string | undefined;
            if (!unlockedBadge) {
              if (type === 'first_week') progress = `${Math.min(currentStreak, 7)}/7`;
              else if (type === 'month_of_forge') progress = `${Math.min(currentStreak, 30)}/30`;
              else if (type === 'forgeron') progress = `${Math.min(score.total, 70)}/70`;
              else if (type === 'first_kilo' && weightLog.length > 0) {
                const latest = [...weightLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const delta = Math.abs(profile.currentWeight - latest.weight);
                progress = `${Math.min(delta, 1).toFixed(1)}/1 kg`;
              }
            }
            return (
              <View key={type}>
                <BadgeCard
                  type={type}
                  unlocked={!!unlockedBadge}
                  unlockedAt={unlockedBadge?.unlockedAt}
                  progress={progress}
                />
                {unlockedBadge && (
                  <Pressable
                    style={styles.badgeShareBtn}
                    onPress={() => router.push(`/share?type=badge&badgeType=${type}`)}
                  >
                    <Text style={styles.badgeShareText}>{t('share')}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Referral */}
      {profile.referralCode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('referral')}</Text>
          <View style={styles.referralCard}>
            <Text style={styles.referralLabel}>{t('yourReferralCode')}</Text>
            <Text style={styles.referralCode}>{profile.referralCode}</Text>
            <Text style={styles.referralReward}>{t('referralReward')}</Text>
            <View style={styles.referralButtons}>
              <Pressable style={styles.referralCopyBtn} onPress={handleCopyCode}>
                <Text style={styles.referralCopyText}>
                  {codeCopied ? t('copied') : t('copy')}
                </Text>
              </Pressable>
              <Pressable style={styles.referralShareBtn} onPress={handleShareCode}>
                <Text style={styles.referralShareText}>{t('share')}</Text>
              </Pressable>
            </View>
            {(profile.referralCount ?? 0) > 0 && (
              <Text style={styles.referralStats}>
                {t('friendsReferred', { count: profile.referralCount ?? 0 })}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Check-in + Progression */}
      <View style={styles.section}>
        <Pressable
          style={[styles.progressionButton, { marginBottom: spacing.sm }]}
          onPress={() => router.push('/checkin')}
        >
          <View style={styles.progressionLeft}>
            {/* Avant : mix d'emojis Unicode (\uD83D\uDCCA, \u2197, \uD83D\uDCCF, \uD83D\uDCF7) qui rendaient
                avec des styles diff\u00E9rents (couleur native vs glyphe noir).
                Maintenant tout en Ionicons pour coh\u00E9rence visuelle. */}
            <Ionicons name="stats-chart-outline" size={20} color={colors.primary} style={styles.progressionIconV2} />
            <View>
              <Text style={styles.progressionTitle}>{t('weeklyCheckIn')}</Text>
              <Text style={styles.progressionSubtitle}>{t('checkInSubtitle')}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {checkinDue && <NotifDot />}
            <Text style={styles.progressionArrow}>{'\u203A'}</Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.progressionButton}
          onPress={() => router.push('/progression')}
        >
          <View style={styles.progressionLeft}>
            <Ionicons name="trending-up-outline" size={20} color={colors.primary} style={styles.progressionIconV2} />
            <View>
              <Text style={styles.progressionTitle}>{t('myProgress')}</Text>
              <Text style={styles.progressionSubtitle}>{t('progressSubtitle')}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
        <Pressable
          style={[styles.progressionButton, { marginTop: spacing.sm }]}
          onPress={() => router.push('/measurements')}
        >
          <View style={styles.progressionLeft}>
            <Ionicons name="resize-outline" size={20} color={colors.primary} style={styles.progressionIconV2} />
            <View>
              <Text style={styles.progressionTitle}>{t('measurementsLabel' as any)}</Text>
              <Text style={styles.progressionSubtitle}>{locale === 'en' ? 'Waist, chest, arms...' : 'Taille, poitrine, bras...'}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Progress photos */}
      <View style={styles.section}>
        <Pressable
          style={styles.progressionButton}
          onPress={() => router.push('/progress-photos')}
        >
          <View style={styles.progressionLeft}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} style={styles.progressionIconV2} />
            <View>
              <Text style={styles.progressionTitle}>{t('progressPhotosLabel' as any)}</Text>
              <Text style={styles.progressionSubtitle}>{locale === 'en' ? 'Track your visual transformation' : 'Suis ta transformation visuelle'}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Weight chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('weightEvolution')}</Text>
        {weightChartData.length >= 2 ? (
          <>
            <LineChart
              data={weightChartData}
              width={chartWidth}
              height={160}
              unit=" kg"
              formatValue={(v) => v.toFixed(1)}
            />
            <Pressable
              style={styles.seeAllBtn}
              onPress={() => router.push('/progression')}
            >
              <Text style={styles.seeAllText}>{t('weightSeeAll')} {'\u2192'}</Text>
            </Pressable>
          </>
        ) : (
          <EmptyState
            icon={'\u2696'}
            title={t('weightFirstEntry')}
            subtitle={t('startCheckInForChart')}
            actionLabel={t('weeklyCheckIn')}
            onAction={() => router.push('/checkin')}
          />
        )}
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('myProfile')}</Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Text style={styles.editLink}>{t('edit')}</Text>
          </Pressable>
        </View>
        <ProfileRow label={t('objective')} value={objectiveLabels[profile.objective]} styles={styles} />
        <ProfileRow label={t('currentWeight')} value={`${profile.currentWeight} kg`} styles={styles} />
        <ProfileRow label={t('targetWeight')} value={`${profile.targetWeight} kg`} styles={styles} />
        <ProfileRow label={`${t('caloriesLabel')}/jour`} value={`${profile.dailyCalories} kcal`} styles={styles} />
        <ProfileRow label={t('proteinLabel')} value={`${profile.dailyProtein}g`} styles={styles} />
        <ProfileRow label={t('carbsLabel')} value={`${profile.dailyCarbs}g`} styles={styles} />
        <ProfileRow label={t('fatLabel')} value={`${profile.dailyFat}g`} styles={styles} />
        {lastAdjustment && (
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentIcon}>{'\u26A1'}</Text>
            <Text style={styles.adjustmentText}>
              {t('planAdjusted', { adjustment: `${lastAdjustment.calorieAdjustment > 0 ? '+' : ''}${lastAdjustment.calorieAdjustment}` })}
              {' '}({new Date(lastAdjustment.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })})
            </Text>
          </View>
        )}
      </View>

      {/* Apparence : RETIRÉE en v1 — FORGA est dark-only (cf ThemeContext).
          La rangée "Apparence" + son sheet ne servent plus tant que le
          mode clair n'est pas re-supporté (v1.1). On garde le code du
          sheet plus bas (mort) pour le réactiver facilement plus tard. */}
      <View style={styles.section}>
        {/* Language — opens sheet */}
        <Pressable style={styles.actionRow} onPress={() => setSheet('language')}>
          <Text style={styles.actionText}>{t('language')}</Text>
          <Text style={styles.actionValue}>
            {LOCALE_OPTIONS.find((o) => o.value === locale)?.label ?? ''} {'›'}
          </Text>
        </Pressable>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        {!isPremium && (
          <PremiumUpgradeCard
            onPress={() => router.push('/paywall')}
            headline="Passer à FORGA PRO"
          />
        )}

        {isPremium && (
          <Pressable style={styles.actionRow} onPress={handleManageSubscription}>
            <Text style={styles.actionText}>{t('manageSubscription')}</Text>
          </Pressable>
        )}

        {Platform.OS !== 'web' && (
          <Pressable style={styles.actionRow} onPress={() => router.push('/notifications-setup')}>
            <Text style={styles.actionText}>{t('notifications')}</Text>
            <Text style={styles.actionValue}>{notifEnabled ? t('notifsEnabled') : t('notifsDisabled')} {'›'}</Text>
          </Pressable>
        )}

        {/* Toggle compteur de pas (iOS only, lit Apple Health).
            Demande la permission HealthKit au tap si pas déjà accordée.
            Si refus ou HealthKit indisponible : on prévient l'user pour
            qu'il sache POURQUOI rien ne se passe (avant, silence radio
            → impression de "row qui ne réagit pas au tap"). */}
        {Platform.OS === 'ios' && (
          <Pressable
            style={styles.actionRow}
            onPress={async () => {
              if (stepsEnabled) {
                setStepsEnabled(false);
                return;
              }
              const { requestHealthPermissions, isHealthAvailable } =
                await import('../../src/services/appleHealth');
              const availability = await isHealthAvailable();
              if (!availability.available) {
                // Pas de HealthKit sur ce device → on l'explique au lieu
                // de rester silencieux. L'user comprend qu'il ne peut pas
                // activer cette feature ici, mais peut au moins savoir
                // pourquoi.
                Alert.alert(
                  t('stepsCounterLabel' as any),
                  t('stepsCounterUnavailable' as any),
                );
                return;
              }
              const granted = await requestHealthPermissions();
              if (granted) {
                setStepsEnabled(true);
              } else {
                // L'user a refusé OU iOS a déjà refusé une fois (le
                // sheet de permission ne s'affiche plus). On guide vers
                // Réglages > Confidentialité > Santé pour ré-autoriser.
                Alert.alert(
                  t('stepsCounterLabel' as any),
                  t('stepsCounterPermissionDenied' as any),
                  [
                    { text: t('cancel') ?? 'Annuler', style: 'cancel' },
                    {
                      text: t('openSettings' as any) ?? 'Ouvrir Réglages',
                      onPress: () => Linking.openURL('app-settings:'),
                    },
                  ],
                );
              }
            }}
          >
            <Text style={styles.actionText}>{t('stepsCounterLabel' as any)}</Text>
            <Text style={styles.actionValue}>
              {stepsEnabled ? t('stepsCounterEnabled' as any) : t('stepsCounterDisabled' as any)} {'›'}
            </Text>
          </Pressable>
        )}

        {Platform.OS !== 'web' && bioCaps.available && (
          <Pressable
            style={styles.actionRow}
            onPress={async () => {
              if (biometricLockEnabled) {
                setBiometricLockEnabled(false);
                return;
              }
              // Verify the user can actually authenticate before turning the lock on.
              const ok = await promptBiometric(`Activer le verrouillage par ${bioCaps.label}`);
              if (ok) setBiometricLockEnabled(true);
            }}
          >
            <Text style={styles.actionText}>Verrouillage {bioCaps.label}</Text>
            <Text style={styles.actionValue}>
              {biometricLockEnabled ? 'Activé' : 'Désactivé'} {'›'}
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.actionRow} onPress={() => router.push('/tdee-calculator')}>
          <Text style={styles.actionText}>{t('recalculateTDEE')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleExportData}>
          <Text style={styles.actionText}>{t('exportData')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={() => {
          if (Platform.OS === 'web') {
            window.open('mailto:support.forga@gmail.com', '_blank');
          } else {
            import('expo-linking').then((L) => L.openURL('mailto:support.forga@gmail.com')).catch(() => {});
          }
        }}>
          <Text style={styles.actionText}>{t('contactSupportBtn')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleSignOut}>
          <Text style={styles.actionText}>{t('signOut')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleDeleteAccount}>
          <Text style={[styles.actionText, { color: colors.error }]}>
            {t('deleteAccount')}
          </Text>
        </Pressable>
      </View>

      {/* Legal */}
      <View style={styles.legal}>
        <Text style={styles.legalText}>{t('legalDisclaimer')}</Text>
        <Pressable onPress={() => router.push('/privacy')}>
          <Text style={[styles.legalText, { color: colors.primary, marginTop: spacing.sm }]}>
            {t('privacyPolicy')}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/terms')}>
          <Text style={[styles.legalText, { color: colors.primary, marginTop: spacing.xs }]}>
            {locale === 'en' ? 'Terms of Service' : "Conditions d'utilisation"}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/sources')}>
          <Text style={[styles.legalText, { color: colors.primary, marginTop: spacing.xs }]}>
            {locale === 'en' ? 'Scientific sources' : 'Sources scientifiques'}
          </Text>
        </Pressable>
        <Text style={[styles.legalText, { marginTop: spacing.lg }]}>
          FORGA v{APP_VERSION}
        </Text>
      </View>

      {/* Theme picker sheet */}
      <ProfileSheet open={sheet === 'theme'} onClose={() => setSheet(null)} title={t('appearance')} subtitle="Sombre, clair ou automatique">
        {THEME_OPTIONS.map((opt) => (
          <SheetOptionRow
            key={opt.value}
            label={opt.label}
            selected={themeMode === opt.value}
            onPress={() => {
              setThemeMode(opt.value);
              setSheet(null);
            }}
          />
        ))}
      </ProfileSheet>

      {/* Language picker sheet */}
      <ProfileSheet open={sheet === 'language'} onClose={() => setSheet(null)} title={t('language')} subtitle="Choisis ta langue">
        {LOCALE_OPTIONS.map((opt) => (
          <SheetOptionRow
            key={opt.value}
            label={opt.label}
            selected={locale === opt.value}
            onPress={() => {
              setLocale(opt.value);
              setSheet(null);
            }}
          />
        ))}
      </ProfileSheet>

      {/* Logout confirm sheet */}
      <ProfileSheet open={sheet === 'logout'} onClose={() => setSheet(null)} title={t('signOut')} subtitle="Tu pourras te reconnecter quand tu veux.">
        <Pressable
          style={({ pressed }) => [confirmStyles.danger, pressed && { opacity: 0.85 }]}
          onPress={() => {
            setSheet(null);
            performSignOut();
          }}
        >
          <Text style={confirmStyles.dangerText}>{t('signOut')}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [confirmStyles.cancel, pressed && { opacity: 0.85 }]} onPress={() => setSheet(null)}>
          <Text style={confirmStyles.cancelText}>{t('cancel')}</Text>
        </Pressable>
      </ProfileSheet>

      {/* Delete account confirm sheet */}
      <ProfileSheet
        open={sheet === 'delete'}
        onClose={() => setSheet(null)}
        title={t('deleteAccount')}
        subtitle={t('deleteAccountConfirm')}
      >
        <Pressable
          style={({ pressed }) => [confirmStyles.danger, pressed && { opacity: 0.85 }]}
          onPress={() => {
            setSheet(null);
            performDeleteAccount();
          }}
        >
          <Text style={confirmStyles.dangerText}>{t('delete')}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [confirmStyles.cancel, pressed && { opacity: 0.85 }]} onPress={() => setSheet(null)}>
          <Text style={confirmStyles.cancelText}>{t('cancel')}</Text>
        </Pressable>
      </ProfileSheet>
    </ScrollView>
  );
}

const confirmStyles = StyleSheet.create({
  danger: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,71,87,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.40)',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FF4757',
  },
  cancel: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

function ProfileRow({ label, value, styles }: { label: string; value: string; styles: any }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  heroImage: {
    width: '100%',
    // Hauteur réduite à 170 (avant 220) — la ProfileHeroCard juste en
    // dessous porte déjà l'identité (nom, archétype, stats), donc le
    // hero peut être plus compact. On garde assez de marge pour le
    // back button (top=insets.top+sm) sans empiéter sur name + email.
    height: 170,
    marginBottom: spacing.xl,
  },
  heroImageInner: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  /** Ligne supérieure du hero : bouton retour (gauche) + roue
   *  dentée réglages (droite). Position absolue pour ne pas pousser
   *  le titre name + email plus bas. Le hero est déjà positionné à
   *  insets.top via le paddingTop du ScrollView — `top: spacing.sm`
   *  donne juste assez de marge pour passer sous la Dynamic Island. */
  headerTopRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backRow: {
    // L'absolute positioning d'origine est maintenant dans headerTopRow.
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.white,
    fontWeight: '600',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  premiumText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  shareHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  freezeHint: {
    fontFamily: fonts.data,
    fontSize: 9,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badgeShareBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  badgeShareText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  weeklyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    marginTop: 24,
  },
  weeklyReportEyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  weeklyReportTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  weeklyReportArrow: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '300',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}80`,
  },
  profileLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  profileValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chipActive: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  actionRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}80`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  actionValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.sm,
  },
  adjustmentIcon: {
    fontSize: 14,
  },
  adjustmentText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    flex: 1,
  },
  legal: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: `${colors.border}80`,
  },
  legalText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  referralCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  referralLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  referralCode: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  referralReward: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  referralButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  referralCopyBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  referralCopyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  referralShareBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  referralShareText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.white,
  },
  referralStats: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  progressionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  progressionIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  /** Wrapper width: 24 pour aligner les Ionicons (qui n'ont pas
   *  d'ascent/descent comme des emojis) avec le texte voisin. */
  progressionIconV2: {
    width: 24,
    textAlign: 'center',
  },
  progressionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  progressionSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressionArrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes['2xl'],
    color: colors.primary,
  },
  seeAllBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  seeAllText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
