import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HandGuideOverlay } from '../../components/practice/HandGuideOverlay';
import type { HandGuideOrientation } from '../../components/practice/HandGuideOverlay';
import { GlassBackButton, LearningBottomNav } from '../../components/ui';
import {
  LEARNING_MODULES,
  getAllLessons,
  getLesson,
  lessonHasQuizMedia,
} from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';
import { hasLetterTemplate } from '../../lib/aslHandMatch';
import { initHandFrameProcessor } from '../../lib/handFrameProcessor';
import { useHandTracking } from '../../lib/handTracking';
import { subscribeHandLandmarks } from '../../lib/mediapipeHands';
import { getLessonImageSource } from '../../lib/signImages';
import {
  PARAMETER_LABELS,
  resolveSignParameters,
} from '../../lib/signParameters';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

type GuidePhase = 'align' | 'hold' | 'compare' | 'done';

const HOLD_MS = 1800;

const ABSOLUTE_FILL = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/** Letters / tips that are usually shown with a sideways hand. */
const SIDEWAYS_LETTER_IDS = new Set([
  'g',
  'h',
  'p',
  'q',
]);

function inferHandOrientation(input: {
  letterId: string | null;
  tip: string;
  description: string;
  handshape: string;
}): HandGuideOrientation {
  if (input.letterId && SIDEWAYS_LETTER_IDS.has(input.letterId)) {
    return 'sideways';
  }
  const text =
    `${input.tip} ${input.description} ${input.handshape}`.toLowerCase();
  if (
    text.includes('sideways') ||
    text.includes('horizontal') ||
    text.includes('pointing sideways') ||
    text.includes('point left') ||
    text.includes('point right')
  ) {
    return 'sideways';
  }
  return 'upright';
}

/** Lazy VisionCamera path so Expo Go never loads the native module. */
function DevBuildCamera({
  onLandmarks,
}: {
  onLandmarks: (points: import('../../lib/aslHandMatch').HandLandmark[] | null) => void;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { VisionHandCamera } =
      require('../../components/practice/VisionHandCamera') as typeof import('../../components/practice/VisionHandCamera');
    return (
      <VisionHandCamera style={styles.camera} onLandmarks={onLandmarks} />
    );
  } catch {
    return <CameraView style={styles.camera} facing="front" />;
  }
}

export default function PracticeMirrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonIdParam = getParam(params.lessonId);
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<GuidePhase>('align');
  const [nativeNote, setNativeNote] = useState<string | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const letterId =
    lesson?.moduleId === 'alphabet' ? lesson.sign.id.toLowerCase() : null;
  const canLiveMatch = Boolean(letterId && hasLetterTemplate(letterId));

  const tracking = useHandTracking(canLiveMatch ? letterId : null);
  const modelImage = lesson ? getLessonImageSource(lesson) : undefined;
  const paramsResolved = lesson
    ? resolveSignParameters(lesson.sign)
    : null;
  const guideOrientation = lesson
    ? inferHandOrientation({
        letterId,
        tip: lesson.sign.tip,
        description: lesson.sign.description,
        handshape: paramsResolved?.handshape ?? '',
      })
    : 'upright';
  const guideHint =
    guideOrientation === 'sideways'
      ? 'Hold your hand sideways in this wide frame, like the model.'
      : 'Hold your hand upright in this wide frame, like the model.';

  useEffect(() => {
    let active = true;
    if (!tracking.isDevBuild) {
      return;
    }
    void initHandFrameProcessor().then((bridge) => {
      if (active) {
        setNativeNote(bridge.note);
      }
    });
    const unsubscribe = subscribeHandLandmarks((points) => {
      tracking.reportLandmarks(points);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [tracking.isDevBuild, tracking.reportLandmarks]);

  // Guided flow timers (Phase 1). Live match can skip ahead when score is high.
  useEffect(() => {
    if (phase !== 'align') {
      return;
    }
    if (tracking.mode === 'live' && tracking.inFrame) {
      setPhase('hold');
      return;
    }
    // Without ML: user taps "Hand is in frame" to advance (button below).
  }, [phase, tracking.mode, tracking.inFrame]);

  useEffect(() => {
    if (phase !== 'hold') {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      return;
    }

    holdTimer.current = setTimeout(() => {
      setPhase('compare');
    }, HOLD_MS);

    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (
      tracking.mode === 'live' &&
      tracking.match?.label === 'match' &&
      phase !== 'done'
    ) {
      setPhase('done');
    }
  }, [tracking.mode, tracking.match?.label, phase]);

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

  const statusCopy = (() => {
    if (tracking.mode === 'live' && canLiveMatch) {
      if (tracking.match?.label === 'match') {
        return `Match! That looks like ${lesson.sign.label}.`;
      }
      if (tracking.match?.label === 'close') {
        return `Closer to ${lesson.sign.label}. Adjust fingers.`;
      }
      if (tracking.match?.label === 'far') {
        return `Hand seen. Shape it like ${lesson.sign.label}.`;
      }
      if (!tracking.inFrame) {
        return 'Place your hand inside the oval.';
      }
      return 'Hold steady while we check the handshape.';
    }

    if (phase === 'align') {
      return 'Place your signing hand inside the oval.';
    }
    if (phase === 'hold') {
      return 'Hold steady. Compare your shape to the model.';
    }
    if (phase === 'compare') {
      return 'Check handshape, location, and tip. Then confirm.';
    }
    return `Nice work on ${lesson.sign.label}.`;
  })();

  const guideActive =
    phase === 'hold' ||
    phase === 'compare' ||
    phase === 'done' ||
    (tracking.mode === 'live' && tracking.inFrame);

  return (
    <View style={styles.root}>
      {Platform.OS === 'web' ? (
        <View style={styles.cameraFallback}>
          <Text style={styles.fallbackText}>
            Camera mirror works on iOS / Android. Open this screen on a phone.
          </Text>
        </View>
      ) : tracking.isDevBuild ? (
        <DevBuildCamera onLandmarks={tracking.reportLandmarks} />
      ) : !permission?.granted ? (
        <View style={styles.cameraFallback}>
          <Pressable
            style={styles.permissionButton}
            onPress={() => {
              void requestPermission();
            }}
          >
            <Text style={styles.permissionText}>Allow camera</Text>
          </Pressable>
        </View>
      ) : (
        <CameraView style={styles.camera} facing="front" />
      )}

      <HandGuideOverlay
        pulse={phase === 'align' || (tracking.mode === 'live' && !tracking.inFrame)}
        active={guideActive}
        orientation={guideOrientation}
        hint={
          phase === 'align' || phase === 'hold'
            ? guideHint
            : 'Match the model handshape, then confirm.'
        }
      />

      <SafeAreaView style={styles.overlaySafe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <GlassBackButton onPress={() => router.back()} />
          <View style={styles.topTitles}>
            <Text style={styles.title}>Practice Mirror</Text>
            <Text style={styles.subtitle}>
              {tracking.mode === 'live' && canLiveMatch
                ? 'Live hand check (dev build)'
                : 'Guided practice. You confirm the match.'}
            </Text>
          </View>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.pipRow}>
          <View style={styles.pip}>
            {modelImage ? (
              <Image
                source={modelImage}
                style={styles.pipImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.pipFallback}>{lesson.sign.label}</Text>
            )}
            <Text style={styles.pipLabel}>Model · {lesson.sign.label}</Text>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.statusRow}>
            <Ionicons
              name={
                phase === 'done' || tracking.match?.label === 'match'
                  ? 'checkmark-circle'
                  : phase === 'hold'
                    ? 'hand-left'
                    : 'scan-outline'
              }
              size={22}
              color={
                phase === 'done' || tracking.match?.label === 'match'
                  ? colors.success
                  : colors.primary
              }
            />
            <Text style={styles.statusText}>{statusCopy}</Text>
          </View>

          {tracking.mode === 'live' && canLiveMatch && tracking.match ? (
            <View style={styles.scoreTrack}>
              <View
                style={[
                  styles.scoreFill,
                  { width: `${Math.round(tracking.match.score * 100)}%` },
                ]}
              />
            </View>
          ) : null}

          {paramsResolved ? (
            <Text style={styles.tip} numberOfLines={3}>
              {PARAMETER_LABELS.handshape}: {paramsResolved.handshape}
            </Text>
          ) : null}
          <Text style={styles.tipMuted} numberOfLines={2}>
            {lesson.sign.tip}
          </Text>

          {nativeNote && tracking.isDevBuild ? (
            <Text style={styles.devNote} numberOfLines={2}>
              {nativeNote}
            </Text>
          ) : null}

          {phase === 'align' ? (
            <Pressable
              style={styles.cta}
              onPress={() => setPhase('hold')}
            >
              <Text style={styles.ctaText}>Hand is in the frame</Text>
            </Pressable>
          ) : null}

          {phase === 'compare' ? (
            <Pressable
              style={styles.cta}
              onPress={() => setPhase('done')}
            >
              <Text style={styles.ctaText}>Looks like the model</Text>
            </Pressable>
          ) : null}

          {phase === 'hold' ? (
            <Text style={styles.holdingHint}>Holding… keep your hand steady</Text>
          ) : null}

          {phase === 'done' ? (
            <Pressable
              style={styles.cta}
              onPress={() => router.replace('/(tabs)/practice' as Href)}
            >
              <Text style={styles.ctaText}>I practiced</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>

      <LearningBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    ...ABSOLUTE_FILL,
  },
  cameraFallback: {
    ...ABSOLUTE_FILL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.xl,
  },
  fallbackText: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  permissionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
  },
  permissionText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  overlaySafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  topTitles: {
    flex: 1,
  },
  topSpacer: {
    width: 36,
  },
  title: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  pipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  pip: {
    width: 112,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: spacing.xs,
    alignItems: 'center',
    gap: 4,
  },
  pipImage: {
    width: 96,
    height: 96,
  },
  pipFallback: {
    height: 96,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 40,
  },
  pipLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: 10,
  },
  bottomCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  scoreTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  tip: {
    color: colors.primary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  tipMuted: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  devNote: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 10,
  },
  cta: {
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  ctaText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  holdingHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    paddingVertical: spacing.sm,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
