import { Image, ScrollView, Text, View } from 'react-native';

import { ASL_LETTERS_A_TO_M } from '../../constants/aslLetters';
import { colors, fontSize, spacing } from '../../constants/theme';

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
        Apprendre
      </Text>
      <Text
        style={{
          fontSize: fontSize.base,
          color: colors.textMuted,
          marginBottom: spacing.lg,
        }}
      >
        Alphabet ASL : lettres A a M
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        {ASL_LETTERS_A_TO_M.map((letter) => (
          <View
            key={letter.id}
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
              source={letter.image}
              style={{ width: 72, height: 72, resizeMode: 'contain' }}
              accessibilityLabel={`Signe ASL pour la lettre ${letter.label}`}
            />
            <Text
              style={{
                marginTop: spacing.xs,
                fontSize: fontSize.lg,
                fontWeight: '700',
                color: colors.primary,
              }}
            >
              {letter.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
