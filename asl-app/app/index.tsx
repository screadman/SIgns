import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../constants/theme';
import { hasSeenOnboarding } from '../lib/onboardingStorage';
import { syncPracticeReminders } from '../lib/reminders';

export default function IndexScreen() {
  const [hasSeen, setHasSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    hasSeenOnboarding()
      .then((seen) => {
        if (isMounted) {
          setHasSeen(seen);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasSeen(false);
        }
      });

    // Fire-and-forget: refresh scheduled reminder copy (and the streak
    // number baked into it) on every app launch, not just when the user
    // touches the toggle. No-ops instantly if reminders are disabled.
    void syncPracticeReminders();

    return () => {
      isMounted = false;
    };
  }, []);

  if (hasSeen === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const destination = (
    hasSeen ? '/(tabs)/home' : '/onboarding'
  ) as Href;

  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});