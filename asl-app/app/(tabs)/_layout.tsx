import { Tabs } from 'expo-router';

import { TabsPillTabBar } from '../../components/ui/PillTabBar';
import { colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabsPillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
