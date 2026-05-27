import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';
import type { TrainingProgram, ProgramId } from '../../types/program';
import type { Sex } from '../../types/user';

/**
 * Sélecteur de programmes — affichage en cards riches plutôt que liste
 * texte. Chaque card montre :
 *   - Image hero (catégorisée par objectif × niveau pour pertinence visuelle)
 *   - Nom du programme + tag d'identification (PPL, PHUL, UL, FB, 5/3/1)
 *   - Meta : nb séances/sem + niveau
 *   - Description (3 lignes max)
 *   - Badge "RECOMMANDÉ" ou "ACTUEL" si applicable
 *
 * Pourquoi le redesign : l'ancienne liste texte (1 ligne par programme)
 * ne donnait aucun visuel ni indication claire du type d'entraînement
 * (PPL vs Full Body vs Upper/Lower). L'user devait deviner d'après le
 * nom marketing. Maintenant la card communique tout en 1 coup d'œil.
 */

interface ProgramSelectorSheetProps {
  open: boolean;
  onClose: () => void;
  programs: TrainingProgram[];
  currentId?: ProgramId;
  recommendedId?: ProgramId;
  onSelect: (id: ProgramId) => void;
  /** i18n resolver pour nameKey / levelKey / descriptionKey */
  t: (key: string) => string;
  /** Sexe de l'user — détermine l'image affichée pour les programmes
   *  unisexes. Sans ça on showrait une femme à un homme (et vice-versa)
   *  ce qui casse l'identification visuelle ("ce programme c'est pour
   *  moi ou pas ?"). */
  userSex?: Sex;
}

/**
 * Détermine le tag court (PPL, PHUL, UL, FB, 5/3/1) à partir des
 * caractéristiques du programme. C'est ce que l'user cherche en premier
 * quand il regarde un programme — l'archétype technique de la méthode.
 */
function inferProgramTag(p: TrainingProgram): string {
  const id = p.id.toUpperCase();
  if (id.includes('531')) return '5/3/1';
  if (id.includes('PPL_UL')) return 'PPL+UL';
  if (id.includes('PPL')) return 'PPL';
  if (id.includes('PHUL')) return 'PHUL';
  if (id.includes('HYB')) return 'HYB';
  if (id.includes('UL')) return 'UPPER/LOWER';
  if (id.includes('FB')) return 'FULL BODY';
  if (id.includes('GLUTE')) return 'GLUTE FOCUS';
  return p.daysPerWeek + 'J/SEM';
}

/**
 * Image hero spécifiquement choisie pour CHAQUE programme. Stockée en
 * couple {male, female} pour que la card affiche un visuel cohérent
 * avec le sexe de l'user — même pour les programmes "unisex" qui sont
 * proposés aux deux genres.
 *
 * Pourquoi : avant on avait une seule URL par programme. Pour les
 * programmes unisex (BULK_DEB, MAINTAIN, RECOMP_DEB, 5/3/1…), un user
 * homme voyait potentiellement une photo de femme et vice-versa — c'est
 * mauvais pour l'identification ("je me sens pas concerné par ce
 * programme") ET pour le marketing.
 *
 * Pour les programmes qui ont déjà un `sexVariant` 'male' ou 'female'
 * dans leur définition, le parent filtre ne montre que le bon variant
 * mais on garde quand même un couple par sécurité (pour le cas où le
 * fallback de catégorie tape ici).
 *
 * NOTE : les URLs Unsplash listées ici sont des PROPOSITIONS. Si une
 * image ne correspond pas au genre voulu sur ton device, signale-le et
 * on swap par une autre URL — j'ai pas de prévisualisation en édition.
 * Toutes pondérées 1200px / qualité 75%.
 */
// V4 (60 programmes) : la table PROGRAM_IMAGES par ID a été retirée.
// Les nouveaux IDs encodent objectif/sexe/lieu/niveau, on choisit l'image
// dynamiquement via p.objective + sexe dans getProgramImage().

/**
 * Récupère l'image d'un programme en respectant le sexe de l'user.
 *
 * Règle de priorité pour choisir male vs female :
 *   1. Si le programme a un `sexVariant` explicite ('male'/'female'),
 *      il gagne — c'est qu'il a été calibré pour ce sexe et il ne
 *      devrait pas être affiché à l'autre (filtré par le parent).
 *   2. Sinon (programme 'unisex' ou undefined) → on utilise le sexe de
 *      l'user. C'est CRUCIAL pour l'identification visuelle : un homme
 *      ne doit jamais voir une femme s'entraîner pour son programme, et
 *      inversement.
 *   3. Fallback : male (cas où userSex est undefined, ex: profil pas
 *      encore complet).
 */
function getProgramImage(p: TrainingProgram, userSex?: Sex): string {
  // Détermine quel "côté" de la paire d'images on doit utiliser
  const effectiveSex: Sex =
    p.sexVariant === 'male' || p.sexVariant === 'female'
      ? p.sexVariant
      : (userSex ?? 'male');

  // V4 (60 programmes) : on choisit l'image selon p.objective + sexe.
  // Plus de mapping par ID — la convention de nommage encode déjà tout.
  const isFemale = effectiveSex === 'female';
  const obj = p.objective ?? 'bulk';

  if (obj === 'force') {
    return isFemale
      ? 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=75'
      : 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=75';
  }
  if (obj === 'cut') {
    return isFemale
      ? 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1200&q=75'
      : 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=1200&q=75';
  }
  if (obj === 'recomp') {
    return isFemale
      ? 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1200&q=75'
      : 'https://images.unsplash.com/photo-1581122584612-713f89daa8eb?w=1200&q=75';
  }
  if (obj === 'maintain') {
    return isFemale
      ? 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1200&q=75'
      : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=75';
  }
  // bulk (default)
  return isFemale
    ? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=75'
    : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=75';
}

export function ProgramSelectorSheet({
  open,
  onClose,
  programs,
  currentId,
  recommendedId,
  onSelect,
  t,
  userSex,
}: ProgramSelectorSheetProps) {
  // `selectingId` empêche le double-tap (l'user qui hammer en attendant
  // que la sheet se ferme) et donne un feedback visuel. La sheet se
  // ferme immédiatement après onSelect, mais reset au cas où elle est
  // ré-ouverte rapidement.
  const [selectingId, setSelectingId] = useState<ProgramId | null>(null);
  useEffect(() => {
    if (!open) setSelectingId(null);
  }, [open]);

  return (
    <ProfileSheet
      open={open}
      onClose={onClose}
      title="Changer de programme"
      subtitle="Choisis le plan qui te correspond"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {programs.map((p) => {
          const isCurrent = p.id === currentId;
          const isRecommended = p.id === recommendedId;
          const tag = inferProgramTag(p);
          const imageUri = getProgramImage(p, userSex);

          const isSelectingThis = selectingId === p.id;
          const isAnySelecting = selectingId !== null;
          return (
            <Pressable
              key={p.id}
              disabled={isAnySelecting}
              onPress={() => {
                if (selectingId) return;
                setSelectingId(p.id);
                onSelect(p.id);
                // Petit délai pour que le user voie le spinner avant
                // que la sheet ne disparaisse (sinon flicker invisible).
                setTimeout(() => onClose(), 120);
              }}
              style={({ pressed }) => [
                styles.card,
                isCurrent && styles.cardCurrent,
                pressed && styles.pressed,
                isAnySelecting && !isSelectingThis && { opacity: 0.4 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${t(p.nameKey)}, ${t(p.levelKey)}, ${p.daysPerWeek} séances par semaine`}
            >
              {/* Image hero avec tag overlay */}
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={180}
                />
                {/* Dégradé bas pour faire ressortir le tag */}
                <LinearGradient
                  colors={['transparent', 'rgba(7,7,13,0.92)']}
                  style={styles.imageGradient}
                />
                {/* Tag méthode (PPL, PHUL, 5/3/1) en bas-gauche */}
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
                {/* Status badge (RECOMMANDÉ / ACTUEL) en haut-droite */}
                {isCurrent ? (
                  <View style={styles.currentBadge}>
                    <CheckIcon />
                    <Text style={styles.currentBadgeText}>ACTUEL</Text>
                  </View>
                ) : isRecommended ? (
                  <View style={styles.recoBadge}>
                    <Text style={styles.recoBadgeText}>RECOMMANDÉ</Text>
                  </View>
                ) : null}
                {isSelectingThis ? (
                  <View style={styles.selectingOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                ) : null}
              </View>

              {/* Bloc texte */}
              <View style={styles.body}>
                <Text style={[styles.name, isCurrent && styles.nameCurrent]} numberOfLines={2}>
                  {t(p.nameKey)}
                </Text>
                <Text style={styles.meta}>
                  {p.daysPerWeek} séances/sem · {t(p.levelKey)}
                  {p.sexVariant === 'male' ? ' · ♂' : p.sexVariant === 'female' ? ' · ♀' : ''}
                </Text>
                <Text style={styles.description} numberOfLines={3}>
                  {t(p.descriptionKey)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ProfileSheet>
  );
}

function CheckIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12 L10 17 L19 7"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardCurrent: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  selectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,7,13,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Tag méthode (PPL, PHUL, 5/3/1, etc.) overlay en bas-gauche.
   *  C'est ce que l'user reconnaît avant tout. */
  tagBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 6,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  currentBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
  },
  currentBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  recoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,212,170,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.55)',
    borderRadius: 999,
  },
  recoBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '800',
    color: '#00D4AA',
    letterSpacing: 1,
  },
  body: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  nameCurrent: {
    color: '#FF6B35',
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    fontWeight: '600',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 8,
    lineHeight: 17,
  },
});
