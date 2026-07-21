import { Image, ScrollView, Text, View } from 'react-native';

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
        <View
          key={item.id}
          style={{
            width: '30%',
            backgroundColor: colors.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: spacing.sm,
            alignItems: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <Image
            source={item.image}
            style={{ width: 72, height: 72, resizeMode: 'contain' }}
            accessibilityLabel={`${accessibilityPrefix} ${item.label}`}
          />
          <Text
            style={{
              marginTop: spacing.xs,
              fontSize: fontSize.lg,
              fontWeight: '700',
              color: colors.primary,
            }}
          >
            {item.label}
          </Text>
        </View>
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
