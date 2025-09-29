import { ThemedText } from '@/components/themed-text';
import { ModalHeader } from '@/components/ui/modal-header';
import { useGame } from '@/contexts/game-context';
import { GameSettings } from '@/types/music';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function GameModesScreen() {
  const { gameSettings, updateSettings, startGame } = useGame();

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
    router.push('/game');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <ModalHeader 
        title="Choose Game Mode" 
        onClose={handleClose}
      />

      <ScrollView className="p-5">
        <View className="mb-8 p-5 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10">
          <View className="flex-row items-center justify-center mb-4">
            <View className="bg-blue-500/20 rounded-full p-2 mr-2">
              <ThemedText className="text-lg">⚙️</ThemedText>
            </View>
            <ThemedText className="text-lg font-bold text-white">
              CURRENT SETUP
            </ThemedText>
          </View>
          <View className="space-y-2">
            <View className="flex-row items-center justify-between bg-white/5 rounded-lg p-2">
              <ThemedText className="text-sm text-white/70 font-medium">Notation</ThemedText>
              <ThemedText className="text-sm text-white font-semibold">
                {gameSettings.notationSystem === 'letter' ? '🔤 Letters' : '🎵 Solfege ✨'}
              </ThemedText>
            </View>
            <View className="flex-row items-center justify-between bg-white/5 rounded-lg p-2">
              <ThemedText className="text-sm text-white/70 font-medium">Labels</ThemedText>
              <ThemedText className="text-sm text-white font-semibold">
                {gameSettings.showNoteLabels ? '👁️ Visible ✨' : '🙈 Hidden'}
              </ThemedText>
            </View>
            <View className="flex-row items-center justify-between bg-white/5 rounded-lg p-2">
              <ThemedText className="text-sm text-white/70 font-medium">Difficulty</ThemedText>
              <ThemedText className="text-sm text-white font-semibold">
                🎯 {gameSettings.difficulty.charAt(0).toUpperCase() + gameSettings.difficulty.slice(1)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="space-y-4">
          {gameModes.map((gameMode, index) => {
            const gradients = [
              'from-green-500 to-emerald-600',
              'from-blue-500 to-cyan-600', 
              'from-purple-500 to-violet-600'
            ];
            
            return (
              <Pressable
                key={gameMode.mode}
                className="relative overflow-hidden"
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
                onPress={() => handleModeSelect(gameMode.mode)}
              >
                <View className={`bg-gradient-to-r ${gradients[index]} rounded-3xl p-6 shadow-2xl border-4 border-white/20`}>
                  <View className="items-center">
                    <View className="bg-white/20 rounded-full p-4 mb-4">
                      <ThemedText className="text-4xl">
                        {gameMode.icon}
                      </ThemedText>
                    </View>
                    <ThemedText className="text-2xl font-black text-white mb-2 text-center">
                      {gameMode.title.toUpperCase()}
                    </ThemedText>
                    <ThemedText className="text-base text-white/90 font-semibold text-center">
                      {gameMode.description}
                    </ThemedText>
                  </View>
                  {/* Shine effect */}
                  <View className="absolute top-2 left-2 right-2 h-8 bg-white/20 rounded-2xl opacity-50" />
                  
                  {/* Play button overlay */}
                  <View className="absolute top-4 right-4 bg-white/20 rounded-full p-2">
                    <ThemedText className="text-lg">▶️</ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}