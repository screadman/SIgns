import 'react-native-gesture-handler';
import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
<<<<<<< HEAD
import { SafeAreaProvider } from 'react-native-safe-area-context';
=======
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
>>>>>>> fb6ebbe7c0d684919b5ae1be59f4e80780249110

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="module/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="lesson/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="practice-mode/[mode]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="quiz/[lessonId]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="quiz/results"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
