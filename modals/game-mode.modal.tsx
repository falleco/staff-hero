import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import PopupModal from '@/components/core/popup-modal';
import { ThemedText } from '@/components/themed-text';
import { useGame } from '@/contexts/game-context';
import type { GameSettings } from '@/types/music';

const gameModes: {
  mode: GameSettings['gameMode'];
  title: string;
  description: string;
  icon: string;
  path: string;
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
    path: '/game/rhythm',
  },
];

export interface GameModeModalProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const GameModeModal = ({ isVisible, onDismiss }: GameModeModalProps) => {
  const { updateSettings, startGame } = useGame();
  const handleModeSelect = (mode: GameSettings['gameMode']) => {
    onDismiss();
    updateSettings({ gameMode: mode });
    startGame();
    router.push('/game/single-note');
  };

  return (
    <PopupModal isVisible={isVisible} onDismiss={onDismiss}>
      <View className="space-y-4 bg-red/30 border-2 border-white/20 rounded-3xl p-6">
        {gameModes.map((gameMode, index) => {
          return (
            <FlatButton
              key={gameMode.mode}
              size="xl"
              onPress={() => handleModeSelect(gameMode.mode)}
              className="relative overflow-hidden rounded-3xl p-6"
            >
              <View className="items-center">
                <FlatButtonText className="text-2xl font-black text-white mb-2 text-center">
                  {gameMode.title.toUpperCase()}
                </FlatButtonText>
              </View>

              {/* Play button overlay */}
              <View className="absolute top-4 right-4 bg-white/20 rounded-full p-2">
                <ThemedText className="text-lg">▶️</ThemedText>
              </View>
            </FlatButton>
          );
        })}
      </View>
    </PopupModal>
  );
};
