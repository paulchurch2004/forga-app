import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useUserStore } from '../src/store/userStore';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import { EmptyState } from '../src/components/ui/EmptyState';
import type { ProgressPhoto } from '../src/types/user';
import { syncProgressPhoto } from '../src/services/userSync';

// ──────────── COMPARE VIEW ────────────

function CompareView({ before, after, locale }: { before: ProgressPhoto; after: ProgressPhoto; locale: string }) {
  const styles = useCompareStyles();
  const { width } = useWindowDimensions();
  const imgSize = (width - spacing.lg * 3) / 2;

  const daysBetween = Math.round(
    (new Date(after.date).getTime() - new Date(before.date).getTime()) / 86400000
  );
  const weightDiff = before.weight && after.weight
    ? +(after.weight - before.weight).toFixed(1)
    : null;

  return (
    <View style={styles.compareContainer}>
      <View style={styles.compareRow}>
        <View style={styles.compareCol}>
          <Image source={{ uri: before.uri }} style={[styles.compareImg, { width: imgSize, height: imgSize * 1.3 }]} />
          <Text style={styles.compareDate}>
            {new Date(before.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
          {before.weight && <Text style={styles.compareWeight}>{before.weight} kg</Text>}
        </View>
        <View style={styles.compareCol}>
          <Image source={{ uri: after.uri }} style={[styles.compareImg, { width: imgSize, height: imgSize * 1.3 }]} />
          <Text style={styles.compareDate}>
            {new Date(after.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
          {after.weight && <Text style={styles.compareWeight}>{after.weight} kg</Text>}
        </View>
      </View>
      <View style={styles.compareSummary}>
        <Text style={styles.compareDays}>
          {daysBetween} {locale === 'en' ? 'days apart' : 'jours d\'ecart'}
        </Text>
        {weightDiff !== null && (
          <Text style={[styles.compareChange, { color: weightDiff <= 0 ? '#00C853' : '#FF5252' }]}>
            {weightDiff > 0 ? '+' : ''}{weightDiff} kg
          </Text>
        )}
      </View>
    </View>
  );
}

// ──────────── MAIN SCREEN ────────────

export default function ProgressPhotosScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const styles = useStyles();
  const { locale } = useT();
  const { width: screenWidth } = useWindowDimensions();

  const progressPhotos = useUserStore((s) => s.progressPhotos);
  const addProgressPhoto = useUserStore((s) => s.addProgressPhoto);
  const profile = useUserStore((s) => s.profile);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sorted = useMemo(
    () => [...progressPhotos].sort((a, b) => a.date.localeCompare(b.date)),
    [progressPhotos]
  );

  const numCols = screenWidth > 600 ? 4 : 3;
  const imgWidth = (Math.min(screenWidth, contentMaxWidth) - spacing.lg * 2 - spacing.xs * (numCols - 1)) / numCols;

  const handlePickImage = useCallback(async (source: 'camera' | 'library') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [3, 4] });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [3, 4] });
    }

    if (!result.canceled && result.assets?.[0]) {
      setNewPhotoUri(result.assets[0].uri);
      setNewWeight(profile?.currentWeight?.toString() ?? '');
      setShowAddModal(true);
    }
  }, [profile]);

  const handleSave = () => {
    if (!newPhotoUri) return;
    const photo: ProgressPhoto = {
      id: `pp_${Date.now()}`,
      userId: profile?.id ?? '',
      date: new Date().toISOString().split('T')[0],
      uri: newPhotoUri,
      weight: parseFloat(newWeight) || undefined,
      note: newNote.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    addProgressPhoto(photo);
    syncProgressPhoto(photo);
    setShowAddModal(false);
    setNewPhotoUri(null);
    setNewWeight('');
    setNewNote('');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const comparePhotos = useMemo(() => {
    if (selectedIds.length !== 2) return null;
    const a = sorted.find((p) => p.id === selectedIds[0]);
    const b = sorted.find((p) => p.id === selectedIds[1]);
    if (!a || !b) return null;
    return a.date <= b.date ? { before: a, after: b } : { before: b, after: a };
  }, [selectedIds, sorted]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>{'\u2039'} {locale === 'en' ? 'Profile' : 'Profil'}</Text>
        </Pressable>
        <Text style={styles.title}>{locale === 'en' ? 'Progress Photos' : 'Photos de progression'}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.addBtn} onPress={() => handlePickImage('camera')}>
          <Text style={styles.addBtnText}>{locale === 'en' ? 'Take photo' : 'Prendre une photo'}</Text>
        </Pressable>
        <Pressable style={styles.addBtnSecondary} onPress={() => handlePickImage('library')}>
          <Text style={styles.addBtnSecondaryText}>{locale === 'en' ? 'From gallery' : 'Galerie'}</Text>
        </Pressable>
      </View>

      {sorted.length >= 2 && (
        <Pressable
          style={[styles.compareBtn, compareMode && styles.compareBtnActive]}
          onPress={() => { setCompareMode(!compareMode); setSelectedIds([]); }}
        >
          <Text style={[styles.compareBtnText, compareMode && styles.compareBtnTextActive]}>
            {compareMode
              ? (locale === 'en' ? 'Cancel compare' : 'Annuler')
              : (locale === 'en' ? 'Compare before/after' : 'Comparer avant/apres')}
          </Text>
        </Pressable>
      )}

      {/* Compare view */}
      {compareMode && comparePhotos && (
        <CompareView before={comparePhotos.before} after={comparePhotos.after} locale={locale} />
      )}

      {compareMode && selectedIds.length < 2 && (
        <Text style={styles.compareHint}>
          {locale === 'en'
            ? `Select ${2 - selectedIds.length} photo${selectedIds.length === 1 ? '' : 's'} to compare`
            : `Selectionne ${2 - selectedIds.length} photo${selectedIds.length === 1 ? '' : 's'} a comparer`}
        </Text>
      )}

      {/* Gallery */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={'\uD83D\uDCF7'}
          title={locale === 'en' ? 'No progress photos yet' : 'Aucune photo de progression'}
          subtitle={locale === 'en'
            ? 'Take your first photo to start tracking your visual transformation'
            : 'Prends ta premiere photo pour suivre ta transformation visuelle'}
        />
      ) : (
        <View style={styles.grid}>
          {sorted.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <Animated.View key={photo.id} entering={FadeIn.duration(300)}>
                <Pressable
                  onPress={() => compareMode ? toggleSelect(photo.id) : null}
                  style={[styles.photoCard, isSelected && styles.photoCardSelected]}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={[styles.photoImg, { width: imgWidth, height: imgWidth * 1.3 }]}
                  />
                  <Text style={styles.photoDate}>
                    {new Date(photo.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                  {photo.weight && <Text style={styles.photoWeight}>{photo.weight} kg</Text>}
                  {isSelected && <View style={styles.selectedBadge}><Text style={styles.selectedText}>{selectedIds.indexOf(photo.id) + 1}</Text></View>}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{locale === 'en' ? 'Save photo' : 'Enregistrer la photo'}</Text>
            {newPhotoUri && (
              <Image source={{ uri: newPhotoUri }} style={styles.modalPreview} />
            )}
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>{locale === 'en' ? 'Weight (optional)' : 'Poids (optionnel)'}</Text>
              <TextInput
                style={styles.modalInput}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder="75.0"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>{locale === 'en' ? 'Note (optional)' : 'Note (optionnel)'}</Text>
              <TextInput
                style={styles.modalInput}
                value={newNote}
                onChangeText={setNewNote}
                placeholder={locale === 'en' ? 'e.g. Week 4 of cut' : 'ex. Semaine 4 de seche'}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => { setShowAddModal(false); setNewPhotoUri(null); }}>
                <Text style={styles.cancelText}>{locale === 'en' ? 'Cancel' : 'Annuler'}</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{locale === 'en' ? 'Save' : 'Enregistrer'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

// ──────────── STYLES ────────────

const useCompareStyles = makeStyles((colors) => ({
  compareContainer: { marginBottom: spacing.xl },
  compareRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  compareCol: { alignItems: 'center' },
  compareImg: { borderRadius: borderRadius.lg, backgroundColor: colors.surface },
  compareDate: { fontFamily: fonts.data, fontSize: fontSizes.sm, color: colors.text, marginTop: spacing.sm, fontWeight: '700' },
  compareWeight: { fontFamily: fonts.data, fontSize: fontSizes.xs, color: colors.textSecondary },
  compareSummary: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md },
  compareDays: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary },
  compareChange: { fontFamily: fonts.data, fontSize: fontSizes.sm, fontWeight: '700' },
}));

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl, paddingTop: spacing.md },
  backText: { fontFamily: fonts.body, fontSize: fontSizes.lg, color: colors.primary, fontWeight: '600' },
  title: { fontFamily: fonts.display, fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.text },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  addBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  addBtnText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '700', color: colors.white },
  addBtnSecondary: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  addBtnSecondaryText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  compareBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  compareBtnActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
  compareBtnText: { fontFamily: fonts.body, fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  compareBtnTextActive: { color: colors.primary },
  compareHint: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  photoCard: { borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.xs },
  photoCardSelected: { borderWidth: 2, borderColor: colors.primary },
  photoImg: { backgroundColor: colors.surface },
  photoDate: { fontFamily: fonts.data, fontSize: 10, color: colors.text, paddingHorizontal: spacing.xs, paddingTop: 4, fontWeight: '600' },
  photoWeight: { fontFamily: fonts.data, fontSize: 10, color: colors.textSecondary, paddingHorizontal: spacing.xs, paddingBottom: 4 },
  selectedBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  selectedText: { fontFamily: fonts.data, fontSize: fontSizes.xs, fontWeight: '700', color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl, paddingBottom: spacing['4xl'] },
  modalTitle: { fontFamily: fonts.display, fontSize: fontSizes.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  modalPreview: { width: '100%', height: 200, borderRadius: borderRadius.lg, backgroundColor: colors.surface, marginBottom: spacing.lg },
  modalField: { marginBottom: spacing.md },
  modalLabel: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  modalInput: { fontFamily: fonts.data, fontSize: fontSizes.md, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  cancelBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  cancelText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '600', color: colors.textSecondary },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: spacing.md, alignItems: 'center' },
  saveText: { fontFamily: fonts.body, fontSize: fontSizes.md, fontWeight: '700', color: colors.white },
}));
