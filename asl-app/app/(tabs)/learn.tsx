import { ScrollView, Text, View } from 'react-native';

import { SignCard } from '../../components/ui';
import { ASL_LETTERS, ASL_NUMBERS, type AslGlyph } from '../../constants/aslLetters';
import { colors, fontSize, spacing } from '../../constants/theme';

function GlyphGrid({
  items,
  accessibilityPrefix,
}: {
  items: AslGlyph[];
  accessibilityPrefix: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.sm,
      }}
    >
      {items.map((item) => (
        <SignCard
          key={item.id}
          sign={item}
          accessibilityPrefix={accessibilityPrefix}
        />
      ))}
    </View>
  );
}

export default function LearnScreen() {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing['2xl'],
      }}
    >
      <Text
        style={{
          fontSize: fontSize['2xl'],
          fontWeight: '700',
          color: colors.text,
          marginBottom: spacing.xs,
        }}
      >
        Learn
      </Text>
      <Text
        style={{
          fontSize: fontSize.base,
          color: colors.textMuted,
          marginBottom: spacing.lg,
        }}
      >
        ASL alphabet and numbers
      </Text>

      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: '700',
          color: colors.text,
          marginBottom: spacing.sm,
        }}
      >
        Alphabet A-Z
      </Text>
      <GlyphGrid items={ASL_LETTERS} accessibilityPrefix="ASL sign for letter" />

      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: '700',
          color: colors.text,
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        }}
      >
        Numbers 0-9
      </Text>
      <GlyphGrid items={ASL_NUMBERS} accessibilityPrefix="ASL sign for number" />
    </ScrollView>
  );
}
