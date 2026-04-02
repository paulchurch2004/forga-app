import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { fetchProductByBarcode, type OpenFoodFactsProduct } from '../../src/services/openFoodFacts';

export default function BarcodeScanScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [status, setStatus] = useState<'scanning' | 'loading' | 'found' | 'not_found'>('scanning');
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setStatus('loading');

    const result = await fetchProductByBarcode(data);
    if (result) {
      setProduct(result);
      setQuantity(String(result.servingSize));
      setStatus('found');
    } else {
      setStatus('not_found');
    }
  }, [scanned]);

  const qty = parseFloat(quantity) || 0;
  const macros = product
    ? {
        calories: Math.round((product.caloriesPer100g * qty) / 100),
        protein: Math.round((product.proteinPer100g * qty) / 100),
        carbs: Math.round((product.carbsPer100g * qty) / 100),
        fat: Math.round((product.fatPer100g * qty) / 100),
      }
    : null;

  const handleValidate = () => {
    if (!product || !macros) return;
    const params = new URLSearchParams({
      name: product.name,
      calories: String(macros.calories),
      protein: String(macros.protein),
      carbs: String(macros.carbs),
      fat: String(macros.fat),
    });
    router.replace(`/meal/custom?${params.toString()}`);
  };

  const handleRetry = () => {
    setScanned(false);
    setProduct(null);
    setStatus('scanning');
  };

  // On web/PWA: manual barcode entry instead of camera
  if (Platform.OS === 'web') {
    return <WebBarcodeEntry
      insets={insets}
      contentMaxWidth={contentMaxWidth}
      status={status}
      product={product}
      quantity={quantity}
      setQuantity={setQuantity}
      macros={macros}
      handleBarcodeScanned={handleBarcodeScanned}
      handleValidate={handleValidate}
      handleRetry={handleRetry}
    />;
  }

  // Dynamic import for CameraView (avoids web build errors)
  const CameraViewComponent = require('expo-camera').CameraView;
  const { useCameraPermissions } = require('expo-camera');

  return <ScannerContent
    insets={insets}
    contentMaxWidth={contentMaxWidth}
    status={status}
    product={product}
    quantity={quantity}
    setQuantity={setQuantity}
    macros={macros}
    handleBarcodeScanned={handleBarcodeScanned}
    handleValidate={handleValidate}
    handleRetry={handleRetry}
    CameraViewComponent={CameraViewComponent}
    useCameraPermissions={useCameraPermissions}
  />;
}

function ScannerContent({
  insets,
  contentMaxWidth,
  status,
  product,
  quantity,
  setQuantity,
  macros,
  handleBarcodeScanned,
  handleValidate,
  handleRetry,
  CameraViewComponent,
  useCameraPermissions,
}: any) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl }]}>
        <Text style={styles.webTitle}>Acces camera requis</Text>
        <Text style={styles.webSubtitle}>
          FORGA a besoin de ta camera pour scanner les codes-barres.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Autoriser la camera</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.headerBack}>Retour</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Scanner</Text>
        <View style={{ width: 60 }} />
      </View>

      {status === 'scanning' && (
        <View style={styles.cameraContainer}>
          <CameraViewComponent
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
          <Text style={styles.scanHint}>Place le code-barres dans le cadre</Text>
        </View>
      )}

      {status === 'loading' && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Recherche du produit...</Text>
        </View>
      )}

      {status === 'not_found' && (
        <View style={styles.centerContent}>
          <Text style={styles.notFoundIcon}>{'🔍'}</Text>
          <Text style={styles.notFoundTitle}>Produit non trouve</Text>
          <Text style={styles.notFoundSubtitle}>
            Ce code-barres n'est pas dans la base Open Food Facts.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.replace('/meal/custom')}>
            <Text style={styles.primaryBtnText}>Saisie manuelle</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleRetry}>
            <Text style={styles.secondaryBtnText}>Reessayer</Text>
          </Pressable>
        </View>
      )}

      {status === 'found' && product && macros && (
        <View style={[styles.resultContainer, { maxWidth: contentMaxWidth }]}>
          {product.imageUrl && (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          )}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Macros per 100g */}
          <Text style={styles.per100gLabel}>Pour 100g</Text>
          <View style={styles.macroRow}>
            <MacroPill label="Cal" value={product.caloriesPer100g} unit="kcal" />
            <MacroPill label="P" value={product.proteinPer100g} unit="g" />
            <MacroPill label="G" value={product.carbsPer100g} unit="g" />
            <MacroPill label="L" value={product.fatPer100g} unit="g" />
          </View>

          {/* Quantity input */}
          <Text style={styles.qtyLabel}>Quantite consommee</Text>
          <View style={styles.qtyRow}>
            <TextInput
              style={styles.qtyInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <Text style={styles.qtyUnit}>g</Text>
          </View>

          {/* Computed macros */}
          <Text style={styles.computedLabel}>Macros pour {quantity}g</Text>
          <View style={styles.macroRow}>
            <MacroPill label="Cal" value={macros.calories} unit="kcal" highlight />
            <MacroPill label="P" value={macros.protein} unit="g" highlight />
            <MacroPill label="G" value={macros.carbs} unit="g" highlight />
            <MacroPill label="L" value={macros.fat} unit="g" highlight />
          </View>

          <Pressable style={styles.primaryBtn} onPress={handleValidate}>
            <Text style={styles.primaryBtnText}>Valider</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleRetry}>
            <Text style={styles.secondaryBtnText}>Scanner un autre</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function WebBarcodeEntry({
  insets,
  contentMaxWidth,
  status,
  product,
  quantity,
  setQuantity,
  macros,
  handleBarcodeScanned,
  handleValidate,
  handleRetry,
}: any) {
  const [barcode, setBarcode] = useState('');

  const handleSearch = () => {
    const trimmed = barcode.trim();
    if (!trimmed) return;
    handleBarcodeScanned({ data: trimmed });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.resultContainer,
          { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.headerBack}>Retour</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Scanner</Text>
          <View style={{ width: 60 }} />
        </View>

        {status === 'scanning' && (
          <View style={{ alignItems: 'center', paddingTop: spacing['2xl'] }}>
            <Text style={styles.webIcon}>{'🔢'}</Text>
            <Text style={styles.webTitle}>Saisis le code-barres</Text>
            <Text style={styles.webSubtitle}>
              Entre le numero sous le code-barres de ton produit.
            </Text>
            <TextInput
              style={styles.barcodeInput}
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Ex: 3017620422003"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              autoFocus
              onSubmitEditing={handleSearch}
            />
            <Pressable style={styles.primaryBtn} onPress={handleSearch}>
              <Text style={styles.primaryBtnText}>Rechercher</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/meal/custom')}>
              <Text style={styles.secondaryBtnText}>Saisie manuelle</Text>
            </Pressable>
          </View>
        )}

        {status === 'loading' && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Recherche du produit...</Text>
          </View>
        )}

        {status === 'not_found' && (
          <View style={styles.centerContent}>
            <Text style={styles.notFoundIcon}>{'🔍'}</Text>
            <Text style={styles.notFoundTitle}>Produit non trouve</Text>
            <Text style={styles.notFoundSubtitle}>
              Ce code-barres n'est pas dans la base Open Food Facts.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.replace('/meal/custom')}>
              <Text style={styles.primaryBtnText}>Saisie manuelle</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={handleRetry}>
              <Text style={styles.secondaryBtnText}>Reessayer</Text>
            </Pressable>
          </View>
        )}

        {status === 'found' && product && macros && (
          <View>
            {product.imageUrl && (
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            )}
            <Text style={styles.productName}>{product.name}</Text>

            <Text style={styles.per100gLabel}>Pour 100g</Text>
            <View style={styles.macroRow}>
              <MacroPill label="Cal" value={product.caloriesPer100g} unit="kcal" />
              <MacroPill label="P" value={product.proteinPer100g} unit="g" />
              <MacroPill label="G" value={product.carbsPer100g} unit="g" />
              <MacroPill label="L" value={product.fatPer100g} unit="g" />
            </View>

            <Text style={styles.qtyLabel}>Quantite consommee</Text>
            <View style={styles.qtyRow}>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Text style={styles.qtyUnit}>g</Text>
            </View>

            <Text style={styles.computedLabel}>Macros pour {quantity}g</Text>
            <View style={styles.macroRow}>
              <MacroPill label="Cal" value={macros.calories} unit="kcal" highlight />
              <MacroPill label="P" value={macros.protein} unit="g" highlight />
              <MacroPill label="G" value={macros.carbs} unit="g" highlight />
              <MacroPill label="L" value={macros.fat} unit="g" highlight />
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleValidate}>
              <Text style={styles.primaryBtnText}>Valider</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={handleRetry}>
              <Text style={styles.secondaryBtnText}>Scanner un autre</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </View>
  );
}

function MacroPill({ label, value, unit, highlight }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return (
    <View style={[styles.macroPill, highlight && styles.macroPillHighlight]}>
      <Text style={styles.macroPillLabel}>{label}</Text>
      <Text style={[styles.macroPillValue, highlight && styles.macroPillValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.macroPillUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    zIndex: 10,
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  scanHint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  notFoundTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notFoundSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  productName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  per100gLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  macroPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroPillHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  macroPillLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  macroPillValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  macroPillValueHighlight: {
    color: colors.primary,
  },
  macroPillUnit: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  qtyLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  qtyInput: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: spacing.md,
  },
  qtyUnit: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  computedLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
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
  webIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  webTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  webSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  barcodeInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    width: '100%',
    marginTop: spacing.xl,
    letterSpacing: 2,
  },
});
