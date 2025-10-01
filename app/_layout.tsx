import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { useEffect } from 'react';
import { GameProvider } from '@/contexts/game-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'PixelPurl-Medium': require('@/assets/fonts/pixelpurl.ttf'),
    'Tchaikovsky-Medium': require('@/assets/fonts/tchaikovsky.ttf'),
    'PCSenior-Medium': require('@/assets/fonts/pcsenior.ttf'),
    'November-Medium': require('@/assets/fonts/november.ttf'),
    'BoldPixels-Medium': require('@/assets/fonts/boldpixels.ttf'),
    'Manaspace-Medium': require('@/assets/fonts/manaspace.ttf'),
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                headerShown: false,
                title: 'Settings',
              }}
            />
            <Stack.Screen
              name="game-modes"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                animation: 'fade'
              }}
            />
            <Stack.Screen
              name="game"
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
