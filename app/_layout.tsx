import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";

import { GameProvider } from '@/contexts/game-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <GameProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="settings" 
              options={{ 
                presentation: 'modal', 
                headerShown: false,
                title: 'Settings'
              }} 
            />
            <Stack.Screen 
              name="game-modes" 
              options={{ 
                presentation: 'modal', 
                headerShown: false,
                title: 'Game Modes'
              }} 
            />
            <Stack.Screen 
              name="game" 
              options={{ 
                presentation: 'fullScreenModal', 
                headerShown: false,
                title: 'Game'
              }} 
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
