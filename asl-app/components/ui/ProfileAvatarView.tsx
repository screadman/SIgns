import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getAvatarById } from '../../constants/avatars';
import {
  borderWidth,
  colors,
  fontFamily,
} from '../../constants/theme';
import { initialsFromName } from '../../lib/profileIdentity';

type ProfileAvatarViewProps = {
  name: string | null;
  avatarId?: string | null;
  photoUri?: string | null;
  size?: number;
  showEditBadge?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ProfileAvatarView({
  name,
  avatarId,
  photoUri,
  size = 96,
  showEditBadge = false,
  onPress,
  accessibilityLabel = 'Change profile photo or avatar',
}: ProfileAvatarViewProps) {
  const avatar = avatarId ? getAvatarById(avatarId) : undefined;
  const hasCustomImage = Boolean(photoUri || avatar);
  const content = photoUri ? (
    <Image source={{ uri: photoUri }} style={styles.image} />
  ) : avatar ? (
    <Image source={avatar.source} style={styles.image} />
  ) : (
    <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
      {initialsFromName(name)}
    </Text>
  );

  const body = (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            // Cartoon / photo fills the circle; avoid a second ring around it.
            borderWidth: hasCustomImage ? 0 : borderWidth.thick,
          },
        ]}
      >
        {content}
      </View>
      {showEditBadge ? (
        <View style={styles.badge}>
          <Ionicons name="camera" size={14} color={colors.white} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
  },
  badge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pressed: {
    opacity: 0.88,
  },
});
