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
};

export function PrimaryButton({
  title,
  loading = false,
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
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverse} />
      ) : (
        <Text style={styles.label}>{title}</Text>
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
  label: {
    color: colors.textInverse,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.lg,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  disabled: {
    opacity: opacity.disabled,
  },
});
