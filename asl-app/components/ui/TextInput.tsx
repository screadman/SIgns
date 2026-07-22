import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import {
  borderRadius,
  borderWidth,
  colors,
  controlHeight,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TextInputProps = Omit<RNTextInputProps, 'style'> & {
  label: string;
  icon?: IoniconName;
};

export function TextInput({
  label,
  icon,
  onFocus,
  onBlur,
  ...inputProps
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.icon}
          />
        )}

        <RNTextInput
          {...inputProps}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  inputWrapper: {
    height: controlHeight.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  icon: {
    marginRight: spacing['2sm'],
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
  },
});