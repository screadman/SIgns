import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../constants/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function SkeletonLoader() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      accessibilityLabel="Loading learning modules"
    >
      <View style={styles.headerPlaceholder} />
      <View style={styles.list}>
        {[0, 1].map((item) => (
          <View key={item} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.icon} />
              <View style={styles.heading}>
                <View style={[styles.title, item === 1 && styles.secondTitle]} />
                <View style={[styles.meta, item === 1 && styles.secondMeta]} />
              </View>
            </View>
            <View style={styles.progress} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerPlaceholder: {
    width: 100,
    height: 28,
    marginTop: spacing.lg,
    marginLeft: spacing.lg,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  card: {
    width: '100%',
    height: 114,
    padding: spacing['2md'],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.disabled,
  },
  heading: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    width: 140,
    height: 20,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  secondTitle: {
    width: 120,
  },
  meta: {
    width: 180,
    height: 14,
    marginTop: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  secondMeta: {
    width: 160,
  },
  progress: {
    width: '100%',
    height: 10,
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.disabled,
  },
});
