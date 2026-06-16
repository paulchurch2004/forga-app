import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { makeStyles, fonts, fontSizes, fontWeights, spacing, borderRadius, MAX_CONTENT_WIDTH } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { supabase, isDemoMode } from '../src/services/supabase';
import { toast } from '../src/store/toastStore';
import { shareUserDataExport } from '../src/services/dataExport';
import { isRestSoundEnabled, setRestSoundEnabled } from '../src/services/audioService';
import { useAppleHealth } from '../src/hooks/useAppleHealth';
import { calculateTDEE } from '../src/engine/tdee';
import { calculateMacros } from '../src/engine/macros';
import { determineMealCount } from '../src/engine/mealPlanner';
import type { Sex, Objective, ActivityLevel, Budget, Restriction } from '../src/types/user';

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, locale } = useT();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const user = useAuthStore((s) => s.user);

  const OBJECTIVE_OPTIONS: { value: Objective; label: string }[] = [
    { value: 'bulk', label: t('objectiveBulk') },
    { value: 'cut', label: t('objectiveCut') },
    { value: 'maintain', label: t('objectiveMaintain') },
    { value: 'recomp', label: t('objectiveRecomp') },
  ];

  const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
    { value: 'sedentary', label: t('activitySedentary') },
    { value: 'light', label: t('activityLight') },
    { value: 'moderate', label: t('activityModerate') },
    { value: 'active', label: t('activityActive') },
    { value: 'very_active', label: t('activityVeryActive') },
  ];

  const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
    { value: 'eco', label: t('budgetEco') },
    { value: 'premium', label: t('budgetPremium') },
    { value: 'both', label: t('budgetBoth') },
  ];

  const RESTRICTION_OPTIONS: { value: Restriction; label: string }[] = [
    { value: 'vegetarian', label: t('restrictionVegetarian') },
    { value: 'vegan', label: t('restrictionVegan') },
    { value: 'gluten_free', label: t('restrictionGlutenFree') },
    { value: 'lactose_free', label: t('restrictionLactoseFree') },
    { value: 'halal', label: t('restrictionHalal') },
    { value: 'pork_free', label: t('restrictionPorkFree') },
  ];

  const [name, setName] = useState(profile?.name ?? '');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [age, setAge] = useState(String(profile?.age ?? 25));
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? 175));
  const [currentWeight, setCurrentWeight] = useState(String(profile?.currentWeight ?? 75));
  const [targetWeight, setTargetWeight] = useState(String(profile?.targetWeight ?? 75));
  const [objective, setObjective] = useState<Objective>(profile?.objective ?? 'maintain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [budget, setBudget] = useState<Budget>(profile?.budget ?? 'both');
  const [restrictions, setRestrictions] = useState<Restriction[]>(profile?.restrictions ?? []);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState(new Set(['body', 'goals', 'preferences']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Real-time validation
  const ageVal = parseInt(age);
  const ageError = age.length > 0 && (isNaN(ageVal) || ageVal < 16 || ageVal > 65);
  const heightVal = parseInt(heightCm);
  const heightError = heightCm.length > 0 && (isNaN(heightVal) || heightVal < 120 || heightVal > 220);
  const weightVal = parseFloat(currentWeight);
  const weightError = currentWeight.length > 0 && (isNaN(weightVal) || weightVal < 30 || weightVal > 250);
  const targetVal = parseFloat(targetWeight);
  const targetError = targetWeight.length > 0 && (isNaN(targetVal) || targetVal < 30 || targetVal > 250);

  const computed = useMemo(() => {
    const ageNum = parseInt(age) || 25;
    const heightNum = parseInt(heightCm) || 175;
    const weightNum = parseFloat(currentWeight) || 75;

    const tdeeResult = calculateTDEE({
      sex,
      age: ageNum,
      heightCm: heightNum,
      weightKg: weightNum,
      activityLevel,
    });

    const macros = calculateMacros({
      tdee: tdeeResult.tdee,
      weightKg: weightNum,
      objective,
    });

    const mealsPerDay = determineMealCount({
      objective,
      dailyCalories: macros.calories,
    });

    return { tdee: tdeeResult.tdee, ...macros, mealsPerDay };
  }, [sex, age, heightCm, currentWeight, objective, activityLevel]);

  const toggleRestriction = (r: Restriction) => {
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleSave = async () => {
    const ageNum = parseInt(age);
    const heightNum = parseInt(heightCm);
    const weightNum = parseFloat(currentWeight);
    const targetNum = parseFloat(targetWeight);

    if (!ageNum || ageNum < 16 || ageNum > 65) {
      showMessage(t('error'), t('validationAgeRange' as any) as string);
      return;
    }
    if (!heightNum || heightNum < 120 || heightNum > 220) {
      showMessage(t('error'), t('validationHeightRange' as any) as string);
      return;
    }
    if (!weightNum || weightNum < 30 || weightNum > 250) {
      showMessage(t('error'), t('validationWeightRange' as any) as string);
      return;
    }
    if (!targetNum || targetNum < 30 || targetNum > 250) {
      showMessage(t('error'), t('validationTargetRange' as any) as string);
      return;
    }

    setSaving(true);
    try {
      const userId = user?.id ?? profile?.id;
      if (!userId) throw new Error(t('validationUserNotLogged' as any) as string);

      const now = new Date().toISOString();

      if (!isDemoMode) {
        const { error } = await supabase
          .from('users')
          .update({
            name: name.trim() || profile?.name || 'Utilisateur',
            sex,
            age: ageNum,
            height_cm: heightNum,
            current_weight: weightNum,
            target_weight: targetNum,
            objective,
            activity_level: activityLevel,
            budget,
            restrictions,
            tdee: computed.tdee,
            daily_calories: computed.calories,
            daily_protein: computed.protein,
            daily_carbs: computed.carbs,
            daily_fat: computed.fat,
            meals_per_day: computed.mealsPerDay,
          })
          .eq('id', userId);

        if (error) throw error;
      }

      if (profile) {
        setProfile({
          ...profile,
          name: name.trim() || profile.name || 'Utilisateur',
          sex,
          age: ageNum,
          heightCm: heightNum,
          currentWeight: weightNum,
          targetWeight: targetNum,
          objective,
          activityLevel,
          budget,
          restrictions,
          tdee: computed.tdee,
          dailyCalories: computed.calories,
          dailyProtein: computed.protein,
          dailyCarbs: computed.carbs,
          dailyFat: computed.fat,
          mealsPerDay: computed.mealsPerDay,
          updatedAt: now,
        });
      }

      toast.success(t('save') + ' ✓');
      router.back();
    } catch (err: any) {
      toast.error(err?.message ?? t('errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>{'\u2190'} {t('back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MORPHOLOGIE ── */}
        <Pressable onPress={() => toggleSection('body')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{t('sectionBody' as any)}</Text>
          <Text style={styles.groupChevron}>{openSections.has('body') ? '\u2212' : '+'}</Text>
        </Pressable>
        {openSections.has('body') && (
          <>
            <Text style={styles.sectionTitle}>{locale === 'en' ? 'First name' : 'Prénom'}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={locale === 'en' ? 'Your first name' : 'Ton prénom'}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
            />

            <Text style={styles.sectionTitle}>{t('sex')}</Text>
            <View style={styles.chipRow}>
              {(['male', 'female'] as Sex[]).map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, sex === s && styles.chipActive]}
                  onPress={() => setSex(s)}
                >
                  <Text style={[styles.chipText, sex === s && styles.chipTextActive]}>
                    {s === 'male' ? t('male') : t('female')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('age')}</Text>
            <TextInput
              style={[styles.input, ageError && styles.inputError]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor={colors.textMuted}
            />
            {ageError && <Text style={styles.validationHint}>{t('validationAgeError' as any)}</Text>}

            <Text style={styles.sectionTitle}>{t('height')}</Text>
            <TextInput
              style={[styles.input, heightError && styles.inputError]}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="175"
              placeholderTextColor={colors.textMuted}
            />
            {heightError && <Text style={styles.validationHint}>{t('validationHeightError' as any)}</Text>}

            <Text style={styles.sectionTitle}>{t('currentWeight')}</Text>
            <TextInput
              style={[styles.input, weightError && styles.inputError]}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="decimal-pad"
              placeholder="75"
              placeholderTextColor={colors.textMuted}
            />
            {weightError && <Text style={styles.validationHint}>{t('validationWeightError' as any)}</Text>}

            <Text style={styles.sectionTitle}>{t('targetWeight')}</Text>
            <TextInput
              style={[styles.input, targetError && styles.inputError]}
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="decimal-pad"
              placeholder="70"
              placeholderTextColor={colors.textMuted}
            />
            {targetError && <Text style={styles.validationHint}>{t('validationWeightError' as any)}</Text>}
          </>
        )}

        <View style={styles.rule} />

        {/* ── OBJECTIFS ── */}
        <Pressable onPress={() => toggleSection('goals')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{t('sectionGoals' as any)}</Text>
          <Text style={styles.groupChevron}>{openSections.has('goals') ? '\u2212' : '+'}</Text>
        </Pressable>
        {openSections.has('goals') && (
          <>
            <Text style={styles.sectionTitle}>{t('objective')}</Text>
            <View style={styles.chipRow}>
              {OBJECTIVE_OPTIONS.map((o) => (
                <Pressable
                  key={o.value}
                  style={[styles.chip, objective === o.value && styles.chipActive]}
                  onPress={() => setObjective(o.value)}
                >
                  <Text style={[styles.chipText, objective === o.value && styles.chipTextActive]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('activityLevel')}</Text>
            <View style={styles.chipRow}>
              {ACTIVITY_OPTIONS.map((a) => (
                <Pressable
                  key={a.value}
                  style={[styles.chip, activityLevel === a.value && styles.chipActive]}
                  onPress={() => setActivityLevel(a.value)}
                >
                  <Text style={[styles.chipText, activityLevel === a.value && styles.chipTextActive]}>
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={styles.rule} />

        {/* ── PREFERENCES ── */}
        <Pressable onPress={() => toggleSection('preferences')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{t('sectionPreferences' as any)}</Text>
          <Text style={styles.groupChevron}>{openSections.has('preferences') ? '\u2212' : '+'}</Text>
        </Pressable>
        {openSections.has('preferences') && (
          <>
            <Text style={styles.sectionTitle}>{t('budget')}</Text>
            <View style={styles.chipRow}>
              {BUDGET_OPTIONS.map((b) => (
                <Pressable
                  key={b.value}
                  style={[styles.chip, budget === b.value && styles.chipActive]}
                  onPress={() => setBudget(b.value)}
                >
                  <Text style={[styles.chipText, budget === b.value && styles.chipTextActive]}>
                    {b.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('dietaryRestrictions')}</Text>
            <View style={styles.chipRow}>
              {RESTRICTION_OPTIONS.map((r) => (
                <Pressable
                  key={r.value}
                  style={[styles.chip, restrictions.includes(r.value) && styles.chipActive]}
                  onPress={() => toggleRestriction(r.value)}
                >
                  <Text style={[styles.chipText, restrictions.includes(r.value) && styles.chipTextActive]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Preview macros */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{t('yourNewPlan')}</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('caloriesLabel')}</Text>
            <Text style={styles.previewValue}>{computed.calories} kcal</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('proteinLabel')}</Text>
            <Text style={styles.previewValue}>{computed.protein}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('carbsLabel')}</Text>
            <Text style={styles.previewValue}>{computed.carbs}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('fatLabel')}</Text>
            <Text style={styles.previewValue}>{computed.fat}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('mealsPerDay')}</Text>
            <Text style={styles.previewValue}>{computed.mealsPerDay}</Text>
          </View>
        </View>

        {/* Training calibration */}
        <View style={styles.rule} />
        <Pressable style={styles.linkRow} onPress={() => router.push('/calibration-test')} hitSlop={4}>
          <Text style={styles.linkText}>Test de calibration</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>

        {/* Tracking mode (FORGA Score scope) */}
        <TrackingModeSelector />

        {/* Rest-end sound toggle */}
        <RestSoundToggle />

        {/* Apple Health sync (iOS, Premium-only) */}
        {Platform.OS === 'ios' && <AppleHealthToggle />}


        {/* GDPR data export */}
        <Pressable
          style={styles.linkRow}
          onPress={async () => {
            try {
              await shareUserDataExport();
              toast.success('Export prêt');
            } catch {
              toast.error('Export impossible');
            }
          }}
          hitSlop={4}
        >
          <Text style={styles.linkText}>Exporter mes données</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>

        {/* About / legal links */}
        <View style={styles.rule} />
        <Pressable style={styles.linkRow} onPress={() => router.push('/contact')} hitSlop={4}>
          <Text style={styles.linkText}>Contact & support</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/faq')} hitSlop={4}>
          <Text style={styles.linkText}>FAQ</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/privacy')} hitSlop={4}>
          <Text style={styles.linkText}>Politique de confidentialité</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/terms')} hitSlop={4}>
          <Text style={styles.linkText}>Conditions d'utilisation</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>

        {/* Hidden dev toggle: long-press the version line to enable
            the FORGA Core State debug card on the profile. */}
        <VersionFooter />
      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonLoading]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function RestSoundToggle() {
  const styles = useStyles();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    isRestSoundEnabled().then(setEnabled);
  }, []);

  const onToggle = async (value: boolean) => {
    setEnabled(value);
    await setRestSoundEnabled(value);
  };

  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkText}>Son fin de repos</Text>
        <Text style={styles.toggleHint}>Bip + vibration quand le timer du repos se termine</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#FF6B35' }}
      />
    </View>
  );
}

/** Tracking mode picker. Re-balances the FORGA Score so users who follow
 *  their own training program elsewhere (or who only care about training,
 *  not nutrition) aren't unfairly penalised on the metric they don't track. */
function TrackingModeSelector() {
  const styles = useStyles();
  const { t } = useT();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const current = profile?.trackingMode ?? 'both';

  const options: Array<{ value: 'both' | 'nutrition_only' | 'training_only'; labelKey: string; descKey: string }> = [
    { value: 'both', labelKey: 'trackingModeBoth', descKey: 'trackingModeBothDesc' },
    { value: 'nutrition_only', labelKey: 'trackingModeNutritionOnly', descKey: 'trackingModeNutritionOnlyDesc' },
    { value: 'training_only', labelKey: 'trackingModeTrainingOnly', descKey: 'trackingModeTrainingOnlyDesc' },
  ];

  const handleSelect = (value: 'both' | 'nutrition_only' | 'training_only') => {
    if (value === current) return;
    updateProfile({ trackingMode: value });
  };

  return (
    <View style={styles.trackingModeWrap}>
      <Text style={styles.trackingModeTitle}>{t('trackingModeTitle' as any)}</Text>
      <Text style={styles.trackingModeSubtitle}>{t('trackingModeSubtitle' as any)}</Text>
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.trackingModeOption, active && styles.trackingModeOptionActive]}
            onPress={() => handleSelect(opt.value)}
            hitSlop={4}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.trackingModeRadio, active && styles.trackingModeRadioActive]}>
              {active && <View style={styles.trackingModeRadioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.trackingModeLabel, active && styles.trackingModeLabelActive]}>
                {t(opt.labelKey as any)}
              </Text>
              <Text style={styles.trackingModeDesc}>{t(opt.descKey as any)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function AppleHealthToggle() {
  const styles = useStyles();
  const { t } = useT();
  const { available, enabled, isPremium, lastSyncAt, enable, disable, syncNow } = useAppleHealth();
  const [busy, setBusy] = useState(false);

  if (available === false) {
    return (
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.linkText}>{t('appleHealthTitle' as any)}</Text>
          <Text style={styles.toggleHint}>{t('appleHealthNotAvailable' as any)}</Text>
        </View>
      </View>
    );
  }

  const onToggle = async (value: boolean) => {
    if (busy) return;
    if (value && !isPremium) {
      router.push('/paywall' as any);
      return;
    }
    setBusy(true);
    try {
      if (value) {
        const ok = await enable();
        if (!ok) {
          showMessage(
            t('appleHealthTitle' as any),
            t('appleHealthPermissionDenied' as any),
          );
        } else {
          toast.success(t('appleHealthSyncSuccess' as any));
        }
      } else {
        disable();
      }
    } finally {
      setBusy(false);
    }
  };

  const onSyncNow = async () => {
    if (busy || !enabled) return;
    setBusy(true);
    const result = await syncNow();
    setBusy(false);
    if (result.ok) toast.success(t('appleHealthSyncSuccess' as any));
    else toast.error(t('appleHealthSyncFailed' as any));
  };

  const lastSyncLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleString()
    : t('appleHealthLastSyncNever' as any);

  return (
    <>
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.linkText}>
            {t('appleHealthTitle' as any)}{!isPremium ? '  🔒' : ''}
          </Text>
          <Text style={styles.toggleHint}>
            {enabled
              ? (t('appleHealthHintEnabled' as any) as string).replace('{{time}}', lastSyncLabel)
              : t('appleHealthHint' as any)}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          disabled={busy}
          trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#FF6B35' }}
        />
      </View>
      {enabled && (
        <Pressable style={styles.linkRow} onPress={onSyncNow} hitSlop={4} disabled={busy}>
          <Text style={styles.linkText}>{t('appleHealthSyncNow' as any)}</Text>
          <Text style={styles.linkChevron}>›</Text>
        </Pressable>
      )}
    </>
  );
}

function VersionFooter() {
  const showDebug = useSettingsStore((s) => s.showCoreStateDebug);
  const setShowDebug = useSettingsStore((s) => s.setShowCoreStateDebug);
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build =
    (Constants.expoConfig?.ios as any)?.buildNumber ??
    (Constants.expoConfig?.android as any)?.versionCode ??
    '—';

  const handleLongPress = () => {
    // Menu dev (toggle premium / debug) — JAMAIS exposé en production : sans
    // ce garde, n'importe quel utilisateur pouvait débloquer le contenu
    // premium par un appui long sur la version. (audit sécurité)
    if (!__DEV__) return;
    const isPremiumNow = !!profile?.isPremium;
    const togglePremium = () => {
      updateProfile({
        isPremium: !isPremiumNow,
        // When turning OFF, expire the trial so the paywall opens up.
        // When turning ON, give a 7-day window so the app behaves like trial.
        premiumUntil: !isPremiumNow
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() - 1000).toISOString(),
      });
      Alert.alert(
        'Premium dev',
        !isPremiumNow ? 'Premium activé (trial 7j).' : 'Premium désactivé. Le paywall est maintenant accessible.'
      );
    };
    const toggleDebug = () => {
      const next = !showDebug;
      setShowDebug(next);
      Alert.alert('Core State', next ? 'Debug activé sur le profil.' : 'Debug désactivé.');
    };
    Alert.alert(
      'Dev menu',
      `Build ${build} · ${isPremiumNow ? 'Premium ON' : 'Premium OFF'} · ${showDebug ? 'Debug ON' : 'Debug OFF'}`,
      [
        { text: isPremiumNow ? 'Désactiver Premium' : 'Activer Premium (7j)', onPress: togglePremium },
        { text: showDebug ? 'Désactiver Core State Debug' : 'Activer Core State Debug', onPress: toggleDebug },
        { text: 'Annuler', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const flags = [
    showDebug ? 'debug' : null,
    profile?.isPremium ? 'PRO' : null,
  ].filter(Boolean).join(' · ');

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={1500}
      style={{ alignItems: 'center', marginTop: 24, paddingVertical: 12 }}
      hitSlop={8}
    >
      <Text style={{ fontFamily: 'System', fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>
        FORGA · v{version} (build {build}){flags ? ` · ${flags}` : ''}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  validationHint: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  groupChevron: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    color: colors.textMuted,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  linkChevron: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  toggleHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackingModeWrap: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  trackingModeTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text,
  },
  trackingModeSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  trackingModeOption: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  trackingModeOptionActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  trackingModeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  trackingModeRadioActive: {
    borderColor: '#FF6B35',
  },
  trackingModeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  trackingModeLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text,
  },
  trackingModeLabelActive: {
    color: '#FF6B35',
  },
  trackingModeDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.white,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginTop: spacing['2xl'],
  },
  previewTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  previewValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  bottomBar: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonLoading: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
}));
