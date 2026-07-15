import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

function TabIcon({ emoji, focused, gradients }: { emoji: string; focused: boolean; gradients: [string, string] }) {
  if (focused) {
    return (
      <LinearGradient
        colors={[gradients[0] + '33', gradients[1] + '33']}
        style={{ width: 36, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </LinearGradient>
    );
  }
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function AppLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_500Medium' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
    </Tabs>
  );
}
