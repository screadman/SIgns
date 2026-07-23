import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../constants/theme';
import { hasSeenOnboarding } from '../lib/onboardingStorage';

export default function IndexScreen() {
  const [hasSeen, setHasSeen] = useState<boolean | null>(null);

  // TEMPORAIRE — dev only : force le retour à l'onboarding pour tester.
  // Retire ce useEffect une fois que t'as fini de tester.
  useEffect(() => {
    void AsyncStorage.removeItem('onboarding_seen');
  }, []);

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