import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useT } from '../../i18n';

export function OfflineBanner() {
  const { isOnline } = useConnectivity();
  const { t } = useT();
  const styles = useStyles();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t('offlineMode')}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  banner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.background,
  },
}));
