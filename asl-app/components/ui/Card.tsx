import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
} from '../../constants/theme';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardShadow = 'none' | 'sm' | 'md' | 'lg';

type CardProps = {
  children: ReactNode;
  padding?: CardPadding;
  shadow?: CardShadow;
  bordered?: boolean;
  style?: ViewStyle;
};

const paddingMap: Record<CardPadding, number> = {
  none: spacing.none,
  sm: spacing.md,
  md: spacing['2md'],
  lg: spacing.lg,
};

export function Card({
  children,
  padding = 'md',
  shadow = 'sm',
  bordered = true,
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding: paddingMap[padding] },
        shadows[shadow],
        bordered && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
  },
  bordered: {
    borderWidth: borderWidth.thin,
    borderColor: colors.primarySurface,
  },
});