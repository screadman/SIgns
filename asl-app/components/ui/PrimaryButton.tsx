import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import {
  borderRadius,
  colors,
  controlHeight,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';

type PrimaryButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  loading?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
};

export function PrimaryButton({
  title,
  loading = false,
  fullWidth = false,
  compact = false,
  disabled,
  ...pressableProps
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  

  return (
    <Pressable
       {...pressableProps}
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled, busy: loading }}
  disabled={isDisabled}
  style={[
    styles.button,
    fullWidth ? styles.fullWidth : undefined,
    isDisabled ? styles.disabled : undefined,
  ]}
>
      {loading ? (
        <ActivityIndicator color={colors.textInverse} />
      ) : (
        <Text style={[styles.label, compact && styles.labelCompact]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 197,
    height: controlHeight.md + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  buttonCompact: {
    minWidth: 168,
    height: controlHeight.md,
    paddingHorizontal: spacing.xl,
  },
  label: {
    color: colors.textInverse,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  labelCompact: {
    fontSize: fontSize.base,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
});
