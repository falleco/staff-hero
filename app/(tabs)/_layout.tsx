import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { TabBar } from '@/components/core/tab-bar';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Stats',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Play',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/hud/combat_512.png')}
              className="w-28 h-28"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="luthery"
        options={{
          headerShown: false,
          title: 'Luthery',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="play.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
