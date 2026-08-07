import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Use</Text>
        <Text style={styles.updated}>Last updated: August 5, 2026</Text>
        <Text style={styles.body}>
          SIGNS is an educational practice app for American Sign Language
          vocabulary using still illustrations and quizzes. It is a learning
          aid, not a substitute for instruction from qualified Deaf educators or
          live conversation practice.
        </Text>
        <Text style={styles.body}>
          Content media may come from third-party licensed sources. Do not
          redistribute assets outside the app. Report inaccurate signs via the
          project maintainers.
        </Text>
        <Text style={styles.body}>
          The app is provided as-is for personal learning. Progress data stays
          on your device unless you export it.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
  },
  updated: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
  body: {
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
});
