import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-3xl font-bold text-primary">SIgns</Text>
      <Text className="mt-2 text-base text-muted">Accueil</Text>
    </View>
  );
}
