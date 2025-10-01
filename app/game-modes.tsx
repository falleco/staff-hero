import { type Href, router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import PopupModal from '@/components/core/popup-modal';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { ModalHeader } from '@/components/ui/modal-header';
import { useGame } from '@/contexts/game-context';
import type { GameSettings } from '@/types/music';

const gameModes: {
  mode: GameSettings['gameMode'];
  title: string;
  description: string;
  icon: string;
  path: Href;
}[] = [
  {
    mode: 'single-note',
    title: 'Single Note',
    description:
      'Identify individual notes on the staff. Perfect for beginners!',
    icon: '🎵',
    path: '/game/single-note',
  },
  {
    mode: 'sequence',
    title: 'Note Sequence',
    description:
      'Identify multiple notes in the correct order. Build your skills!',
    icon: '🎼',
    path: '/game/sequence',
  },
  {
    mode: 'rhythm',
    title: 'Rhythm Hero',
    description: 'Guitar Hero style! Hit notes as they cross the line.',
    icon: '🎸',
    path: '/game/sequence',
  },
];

export default function GameModesScreen() {
  const { updateSettings, startGame } = useGame();

  const opacity = useSharedValue(0);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.6,
  }));

  useEffect(() => {
    opacity.value = withTiming(1);
  }, [opacity]);

  const handleModeSelect = (mode: GameSettings['gameMode']) => {
    const gameMode = gameModes.find((gameMode) => gameMode.mode === mode)!;
    updateSettings({ gameMode: mode });
    startGame();
    router.replace(gameMode.path);
  };

  return (
    // <PopupModal isVisible={true} onDismiss={() => router.back()}>
    <View className="flex-1 justify-center items-center">
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <Animated.View
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/60 justify-center items-center"
          style={backdropAnimatedStyle}
        />
      </TouchableWithoutFeedback>
      <View className="space-y-4 bg-red-600 border-2 border-white/20 rounded-3xl p-6">
        {gameModes.map((gameMode, index) => {
          return (
            <FlatButton
              key={gameMode.mode}
              size="xl"
              onPress={() => handleModeSelect(gameMode.mode)}
              className="relative overflow-hidden rounded-3xl p-6"
            >
              <View className="items-center">
                <FlatButtonText className="text-2xl font-black text-white mb-2 text-center font-boldpixels-medium">
                  {gameMode.title.toUpperCase()}
                </FlatButtonText>
              </View>
            </FlatButton>
          );
        })}
      </View>
    </View>
  );
}
