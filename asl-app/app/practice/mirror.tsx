import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassBackButton, LearningBottomNav, SignGlassFrame } from '../../components/ui';
import {
  LEARNING_MODULES,
  getAllLessons,
  getLesson,
  lessonHasQuizMedia,
} from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';
import { getLessonImageSource } from '../../lib/signImages';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

const CHECKLIST = [
  'Handshape matches the model',
  'Location matches the model',
  'Movement / hold matches the tip',
] as const;

export default function PracticeMirrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonIdParam = getParam(params.lessonId);
  const [permission, requestPermission] = useCameraPermissions();
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const lesson = useMemo(() => {
    if (lessonIdParam) {
      return getLesson(lessonIdParam)?.lesson ?? null;
    }
    return (
      getAllLessons().find((item) => lessonHasQuizMedia(item)) ??
      LEARNING_MODULES[0]?.lessons[0] ??
      null
    );
  }, [lessonIdParam]);

  const modelImage = lesson ? getLessonImageSource(lesson) : undefined;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Mirror unavailable</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const allChecked = checks.every(Boolean);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <GlassBackButton onPress={() => router.back()} />
          <Text style={styles.title}>Practice Mirror</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.subtitle}>
          Compare yourself to {lesson.sign.label}. No AI scoring. You decide.
        </Text>

        <View style={styles.split}>
          <View style={styles.pane}>
            <Text style={styles.paneLabel}>Model</Text>
            <SignGlassFrame style={styles.modelBox}>
              {modelImage ? (
                <Image
                  source={modelImage}
                  style={styles.modelImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholder}>No illustration</Text>
              )}
            </SignGlassFrame>
          </View>
          <View style={styles.pane}>
            <Text style={styles.paneLabel}>You</Text>
            <SignGlassFrame style={styles.modelBox}>
              {Platform.OS === 'web' ? (
                <Text style={styles.placeholder}>
                  Camera mirror works best on iOS / Android. On web, use a
                  phone and this checklist.
                </Text>
              ) : !permission?.granted ? (
                <Pressable
                  style={styles.permissionButton}
                  onPress={() => {
                    void requestPermission();
                  }}
                >
                  <Text style={styles.permissionText}>Allow camera</Text>
                </Pressable>
              ) : (
                <CameraView style={styles.camera} facing="front" />
              )}
            </SignGlassFrame>
          </View>
        </View>

        <Text style={styles.tip}>{lesson.sign.tip}</Text>

        <View style={styles.checklist}>
          {CHECKLIST.map((label, index) => (
            <Pressable
              key={label}
              style={styles.checkRow}
              onPress={() =>
                setChecks((current) =>
                  current.map((value, i) => (i === index ? !value : value)),
                )
              }
            >
              <Ionicons
                name={checks[index] ? 'checkbox' : 'square-outline'}
                size={22}
                color={checks[index] ? colors.success : colors.textMuted}
              />
              <Text style={styles.checkLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.cta, !allChecked && styles.ctaDisabled]}
          disabled={!allChecked}
          onPress={() => router.replace('/(tabs)/practice' as Href)}
        >
          <Text style={styles.ctaText}>I practiced</Text>
        </Pressable>
      </View>
      <LearningBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, padding: spacing.lg, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  split: { flexDirection: 'row', gap: spacing.sm, flex: 1, minHeight: 220 },
  pane: { flex: 1, gap: spacing.xs },
  paneLabel: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xs,
  },
  modelBox: {
    flex: 1,
    borderRadius: borderRadius.lg,
    minHeight: 180,
  },
  modelImage: { width: '100%', height: '100%' },
  camera: { width: '100%', height: '100%' },
  placeholder: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  permissionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  permissionText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
  },
  tip: {
    color: colors.primary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  checklist: { gap: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    flex: 1,
  },
  cta: {
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
  },
});
