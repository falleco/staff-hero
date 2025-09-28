import { ThemedText } from '@/components/themed-text';
import { ModalHeader } from '@/components/ui/modal-header';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings } from '@/types/music';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function GameModesScreen() {
  const { gameSettings, updateSettings, startGame } = useGame();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const gameModes: {
    mode: GameSettings['gameMode'];
    title: string;
    description: string;
    icon: string;
  }[] = [
    {
      mode: 'single-note',
      title: 'Single Note',
      description: 'Identify individual notes on the staff. Perfect for beginners!',
      icon: '🎵'
    },
    {
      mode: 'sequence',
      title: 'Note Sequence',
      description: 'Identify multiple notes in the correct order. Build your skills!',
      icon: '🎼'
    },
    {
      mode: 'rhythm',
      title: 'Rhythm Hero',
      description: 'Guitar Hero style! Hit notes as they cross the line.',
      icon: '🎸'
    }
  ];

  const handleModeSelect = (mode: GameSettings['gameMode']) => {
    updateSettings({ gameMode: mode });
    startGame();
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ModalHeader 
        title="Choose Game Mode" 
        onClose={handleClose}
      />

      <ScrollView className="p-5">
        <View className="mb-8 p-4 bg-gray-100 rounded-xl">
          <ThemedText className="text-base font-semibold mb-2" style={{ color: textColor }}>
            Current Settings
          </ThemedText>
          <View className="mb-1">
            <ThemedText className="text-sm opacity-70" style={{ color: textColor }}>
              Notation: {gameSettings.notationSystem === 'letter' ? 'Letters (C, D, E...)' : 'Solfege (Do, Re, Mi...) ✨'}
            </ThemedText>
          </View>
          <View className="mb-1">
            <ThemedText className="text-sm opacity-70" style={{ color: textColor }}>
              Note Labels: {gameSettings.showNoteLabels ? 'Visible ✨' : 'Hidden'}
            </ThemedText>
          </View>
          <View className="mb-1">
            <ThemedText className="text-sm opacity-70" style={{ color: textColor }}>
              Difficulty: {gameSettings.difficulty.charAt(0).toUpperCase() + gameSettings.difficulty.slice(1)}
            </ThemedText>
          </View>
        </View>

        <View className="gap-4">
          {gameModes.map((gameMode) => (
            <Pressable
              key={gameMode.mode}
              className="p-5 border-2 rounded-xl"
              style={({ pressed }) => ({
                backgroundColor: pressed ? `${tintColor}20` : 'transparent',
                borderColor: tintColor,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
              onPress={() => handleModeSelect(gameMode.mode)}
            >
              <View className="items-center gap-2">
                <ThemedText className="text-3xl" style={{ color: textColor }}>
                  {gameMode.icon}
                </ThemedText>
                <ThemedText className="text-lg font-bold text-center" style={{ color: textColor }}>
                  {gameMode.title}
                </ThemedText>
                <ThemedText className="text-sm text-center opacity-70" style={{ color: textColor }}>
                  {gameMode.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}