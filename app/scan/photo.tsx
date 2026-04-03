import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { useResponsive } from '../../src/hooks/useResponsive';
import { analyzeFoodPhoto, isVisionAvailable, type FoodAnalysisResult } from '../../src/services/foodVision';

type Status = 'idle' | 'capturing' | 'analyzing' | 'result' | 'error';

// On web/PWA, convert file to base64
async function fileToBase64(uri: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Remove "data:image/...;base64," prefix
        const base64 = dataUrl.split(',')[1] || null;
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function PhotoScanScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();
  const [status, setStatus] = useState<Status>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);

  // Editable fields
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let pickerResult;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
          allowsEditing: Platform.OS !== 'web',
          aspect: [1, 1],
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          base64: true,
          allowsEditing: Platform.OS !== 'web',
          aspect: [1, 1],
        });
      }

      if (pickerResult.canceled || !pickerResult.assets?.[0]) return;

      const asset = pickerResult.assets[0];
      setImageUri(asset.uri);

      // On web, base64 may not be provided by expo-image-picker, so convert manually
      let base64 = asset.base64;
      if (!base64 && Platform.OS === 'web') {
        base64 = await fileToBase64(asset.uri);
      }

      if (!isVisionAvailable() || !base64) {
        setStatus('error');
        return;
      }

      setStatus('analyzing');
      const analysis = await analyzeFoodPhoto(base64);

      if (analysis) {
        setResult(analysis);
        setName(analysis.name);
        setCalories(String(analysis.calories));
        setProtein(String(analysis.protein));
        setCarbs(String(analysis.carbs));
        setFat(String(analysis.fat));
        setStatus('result');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleValidate = () => {
    const params = new URLSearchParams({
      name: name || t('scannedFood'),
      calories: calories || '0',
      protein: protein || '0',
      carbs: carbs || '0',
      fat: fat || '0',
    });
    router.replace(`/meal/custom?${params.toString()}`);
  };

  const handleManual = () => {
    router.replace('/meal/custom');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.headerBack}>{t("back")}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t("photoAI")}</Text>
          <View style={{ width: 60 }} />
        </View>

        {status === 'idle' && (
          <View style={styles.idleContent}>
            <Text style={styles.emptyIcon}>{'🍽️'}</Text>
            <Text style={styles.emptyTitle}>{t("identifyYourMeal")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("identifyYourMealHint")}
            </Text>

            {!isVisionAvailable() && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  {t("openAINotConfigured")}
                </Text>
              </View>
            )}

            <Pressable style={styles.primaryBtn} onPress={() => handlePickImage(true)}>
              <Text style={styles.primaryBtnText}>{t("takePhoto")}</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => handlePickImage(false)}>
              <Text style={styles.secondaryBtnText}>{t("fromGallery")}</Text>
            </Pressable>
          </View>
        )}

        {status === 'analyzing' && (
          <View style={styles.analyzingContent}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
            <Text style={styles.analyzingText}>{t("analyzing")}</Text>
            <Text style={styles.analyzingHint}>{t("gpt4oIdentifying")}</Text>
          </View>
        )}

        {status === 'result' && (
          <View style={styles.resultContent}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImageSmall} />}

            <Text style={styles.fieldLabel}>{t("identifiedFood")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("foodName")}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>{t("estimatedMacros")}</Text>
            <View style={styles.macroGrid}>
              <EditableMacro label={t("caloriesLabel")} unit="kcal" value={calories} onChange={setCalories} color={colors.calories} />
              <EditableMacro label={t("proteinLabel")} unit="g" value={protein} onChange={setProtein} color={colors.protein} />
              <EditableMacro label={t("carbsLabel")} unit="g" value={carbs} onChange={setCarbs} color={colors.carbs} />
              <EditableMacro label={t("fatLabel")} unit="g" value={fat} onChange={setFat} color={colors.fat} />
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleValidate}>
              <Text style={styles.primaryBtnText}>{t("validateMealBtn")}</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => { setStatus('idle'); setImageUri(null); }}>
              <Text style={styles.secondaryBtnText}>{t("retakePhoto")}</Text>
            </Pressable>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.errorContent}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImageSmall} />}
            <Text style={styles.errorIcon}>{'🤔'}</Text>
            <Text style={styles.errorTitle}>{t("identificationFailed")}</Text>
            <Text style={styles.errorSubtitle}>
              {isVisionAvailable()
                ? t("identificationFailedHint")
                : t("configureOpenAI")}
            </Text>
            <Pressable style={styles.primaryBtn} onPress={handleManual}>
              <Text style={styles.primaryBtnText}>{t("manualEntry")}</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => { setStatus('idle'); setImageUri(null); }}>
              <Text style={styles.secondaryBtnText}>{t("retry")}</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </View>
  );
}

function EditableMacro({ label, unit, value, onChange, color }: {
  label: string; unit: string; value: string; onChange: (v: string) => void; color: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.macroInputContainer}>
      <View style={[styles.macroColorDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroInputRow}>
        <TextInput
          style={styles.macroInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <Text style={styles.macroUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerBack: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  idleContent: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  warningBanner: {
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.warning,
    textAlign: 'center',
  },
  analyzingContent: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  previewImageSmall: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  analyzingText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  analyzingHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultContent: {
    paddingTop: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  macroInputContainer: {
    flexBasis: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  macroLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  macroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroInput: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  macroUnit: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  errorContent: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    width: '100%',
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '600',
  },
  backBtn: {
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  backBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
}));
