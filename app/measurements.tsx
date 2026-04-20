import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';
import { LineChart, type DataPoint } from '../src/components/charts/LineChart';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import type { BodyMeasurement } from '../src/types/user';
import { syncMeasurement } from '../src/services/userSync';

// ──────────── TYPES ────────────

type MeasureField = 'waistCm' | 'hipsCm' | 'chestCm' | 'armsCm' | 'thighsCm' | 'bodyFatPercent';

interface FieldConfig {
  key: MeasureField;
  labelFr: string;
  labelEn: string;
  unit: string;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'waistCm', labelFr: 'Tour de taille', labelEn: 'Waist', unit: 'cm', placeholder: '80' },
  { key: 'hipsCm', labelFr: 'Tour de hanches', labelEn: 'Hips', unit: 'cm', placeholder: '95' },
  { key: 'chestCm', labelFr: 'Tour de poitrine', labelEn: 'Chest', unit: 'cm', placeholder: '100' },
  { key: 'armsCm', labelFr: 'Tour de bras', labelEn: 'Arms', unit: 'cm', placeholder: '35' },
  { key: 'thighsCm', labelFr: 'Tour de cuisse', labelEn: 'Thighs', unit: 'cm', placeholder: '55' },
  { key: 'bodyFatPercent', labelFr: 'Masse grasse', labelEn: 'Body fat', unit: '%', placeholder: '15' },
];

// ──────────── MAIN SCREEN ────────────

export default function MeasurementsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, locale } = useT();

  const measurements = useUserStore((s) => s.measurements);
  const addMeasurement = useUserStore((s) => s.addMeasurement);
  const profile = useUserStore((s) => s.profile);

  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedChart, setSelectedChart] = useState<MeasureField>('waistCm');

  const sorted = useMemo(() =>
    [...measurements].sort((a, b) => a.date.localeCompare(b.date)),
    [measurements]
  );

  const latest = sorted[sorted.length - 1];
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  const chartData: DataPoint[] = useMemo(() =>
    sorted
      .filter((m) => m[selectedChart] != null)
      .map((m) => ({ date: m.date, value: m[selectedChart] as number })),
    [sorted, selectedChart]
  );

  const handleSave = () => {
    const hasValue = FIELDS.some((f) => formValues[f.key]?.trim());
    if (!hasValue) {
      const msg = t('enterOneMeasurement');
      Platform.OS === 'web' ? alert(msg) : Alert.alert('', msg);
      return;
    }

    const entry: BodyMeasurement = {
      id: `m_${Date.now()}`,
      userId: profile?.id ?? '',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    for (const field of FIELDS) {
      const val = parseFloat(formValues[field.key] ?? '');
      if (!isNaN(val) && val > 0) {
        (entry as any)[field.key] = val;
      }
    }

    addMeasurement(entry);
    syncMeasurement(entry);
    setFormValues({});
    setShowForm(false);
  };

  const getDiff = (field: MeasureField): string | null => {
    if (!latest || !previous) return null;
    const a = latest[field];
    const b = previous[field];
    if (a == null || b == null) return null;
    const diff = +(a - b).toFixed(1);
    if (diff === 0) return '=';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top, maxWidth: contentMaxWidth }]} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>{'\u2039'} {locale === 'en' ? 'Profile' : 'Profil'}</Text>
        </Pressable>
        <Text style={styles.title}>{locale === 'en' ? 'Measurements' : 'Mensurations'}</Text>
      </View>

      {/* Latest measurements */}
      {latest ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? 'Latest' : 'Derniere mesure'} — {new Date(latest.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
          <View style={styles.measureGrid}>
            {FIELDS.map((field) => {
              const val = latest[field.key];
              if (val == null) return null;
              const diff = getDiff(field.key);
              return (
                <Pressable
                  key={field.key}
                  style={[styles.measureCard, selectedChart === field.key && styles.measureCardActive]}
                  onPress={() => setSelectedChart(field.key)}
                >
                  <Text style={styles.measureLabel}>{locale === 'en' ? field.labelEn : field.labelFr}</Text>
                  <Text style={styles.measureValue}>{val} {field.unit}</Text>
                  {diff && (
                    <Text style={[styles.measureDiff, {
                      color: diff.startsWith('-') ? colors.success : diff === '=' ? colors.textMuted : colors.error
                    }]}>
                      {diff} {field.unit}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{'\uD83D\uDCCF'}</Text>
          <Text style={styles.emptyTitle}>
            {locale === 'en' ? 'No measurements yet' : 'Aucune mesure'}
          </Text>
          <Text style={styles.emptySub}>
            {locale === 'en'
              ? 'Track your body changes beyond the scale'
              : 'Suis tes changements corporels au-dela de la balance'}
          </Text>
        </View>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locale === 'en'
              ? FIELDS.find((f) => f.key === selectedChart)?.labelEn
              : FIELDS.find((f) => f.key === selectedChart)?.labelFr}
          </Text>
          <LineChart
            data={chartData}
            width={Math.min(contentMaxWidth, 400) - spacing.lg * 2}
            height={160}
            unit={` ${FIELDS.find((f) => f.key === selectedChart)?.unit ?? 'cm'}`}
            formatValue={(v) => v.toFixed(1)}
          />
        </View>
      )}

      {/* Add measurement form */}
      {showForm ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? 'New measurement' : 'Nouvelle mesure'}
          </Text>
          {FIELDS.map((field) => (
            <View key={field.key} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{locale === 'en' ? field.labelEn : field.labelFr}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formValues[field.key] ?? ''}
                  onChangeText={(v) => setFormValues((prev) => ({ ...prev, [field.key]: v }))}
                  keyboardType="decimal-pad"
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputUnit}>{field.unit}</Text>
              </View>
            </View>
          ))}
          <View style={styles.formButtons}>
            <Pressable style={styles.cancelBtn} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>{locale === 'en' ? 'Cancel' : 'Annuler'}</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>{locale === 'en' ? 'Save' : 'Enregistrer'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>
            + {locale === 'en' ? 'Add measurement' : 'Ajouter une mesure'}
          </Text>
        </Pressable>
      )}

      {/* History */}
      {sorted.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{locale === 'en' ? 'History' : 'Historique'}</Text>
          {[...sorted].reverse().map((m) => (
            <View key={m.id} style={styles.historyRow}>
              <Text style={styles.historyDate}>
                {new Date(m.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <View style={styles.historyValues}>
                {FIELDS.map((f) => {
                  const val = m[f.key];
                  if (val == null) return null;
                  return (
                    <Text key={f.key} style={styles.historyValue}>
                      {locale === 'en' ? f.labelEn : f.labelFr}: {val}{f.unit}
                    </Text>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ──────────── STYLES ────────────

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, alignSelf: 'center', width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  backText: { fontFamily: fonts.body, fontSize: fontSizes.lg, color: colors.primary, fontWeight: '600' },
  title: { fontFamily: fonts.display, fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.text },
  section: { marginBottom: spacing['2xl'] },
  sectionTitle: {
    fontFamily: fonts.display, fontSize: fontSizes.lg, fontWeight: '700',
    color: colors.text, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 1,
  },
  measureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  measureCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md,
    minWidth: '30%', flex: 1, alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  measureCardActive: { borderColor: colors.primary },
  measureLabel: { fontFamily: fonts.body, fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 },
  measureValue: { fontFamily: fonts.data, fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  measureDiff: { fontFamily: fonts.data, fontSize: fontSizes.xs, fontWeight: '600', marginTop: 2 },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.display, fontSize: fontSizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptySub: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center' },
  addBtn: {
    backgroundColor: `${colors.primary}12`, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.primary, padding: spacing.lg, alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  addBtnText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '700', color: colors.primary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: `${colors.border}60`,
  },
  inputLabel: { fontFamily: fonts.body, fontSize: fontSizes.md, color: colors.text, flex: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  input: {
    fontFamily: fonts.data, fontSize: fontSizes.lg, color: colors.text,
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, width: 80, textAlign: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  inputUnit: { fontFamily: fonts.data, fontSize: fontSizes.sm, color: colors.textSecondary, width: 24 },
  formButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  cancelText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '600', color: colors.textSecondary },
  saveBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  saveText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '700', color: colors.white },
  historyRow: {
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: `${colors.border}40`,
  },
  historyDate: { fontFamily: fonts.data, fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  historyValues: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  historyValue: { fontFamily: fonts.body, fontSize: fontSizes.xs, color: colors.textSecondary },
}));
