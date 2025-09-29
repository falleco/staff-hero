import { HomeScreen } from '@/components/screens/home-screen';
import { ThemedView } from '@/components/themed-view';
import React from 'react';

export default function HomeTab() {
  return (
    <ThemedView className="flex-1">
      <HomeScreen />
    </ThemedView>
  );
}
