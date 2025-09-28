import { ThemedText } from '@/components/themed-text';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeScreenProps {
  onStartGame: () => void;
}

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  const { gameSettings, gameState } = useGame();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Listen for game state changes to trigger navigation
  useEffect(() => {
    if (gameState.isGameActive) {
      onStartGame();
    }
  }, [gameState.isGameActive, onStartGame]);

  const handleStartGamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/game-modes');
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 justify-center items-center p-6">
        {/* Header */}
        <View className="items-center mb-12">
          <ThemedText className="text-5xl font-bold mb-2" style={{ color: textColor }}>
            🎼 Staff Hero
          </ThemedText>
          <ThemedText className="text-lg text-center opacity-80" style={{ color: textColor }}>
            Master music notation with fun games!
          </ThemedText>
        </View>

        {/* Main Action Button */}
        <Pressable
          className="w-full max-w-xs p-6 mb-8 rounded-2xl shadow-lg"
          style={({ pressed }) => ({
            backgroundColor: pressed ? `${tintColor}CC` : tintColor,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
          onPress={handleStartGamePress}
        >
          <View className="items-center">
            <ThemedText className="text-2xl font-bold text-white mb-2">
              🎮 Start Playing
            </ThemedText>
            <ThemedText className="text-base text-white opacity-90 text-center">
              Choose your game mode
            </ThemedText>
          </View>
        </Pressable>

        {/* Settings Button */}
        <Pressable
          className="w-full max-w-xs p-4 mb-8 rounded-xl border-2"
          style={({ pressed }) => ({
            backgroundColor: pressed ? `${tintColor}20` : 'transparent',
            borderColor: tintColor,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
          onPress={handleSettingsPress}
        >
          <View className="items-center">
            <ThemedText className="text-lg font-semibold mb-1" style={{ color: tintColor }}>
              ⚙️ Settings
            </ThemedText>
            <ThemedText className="text-sm opacity-70 text-center" style={{ color: textColor }}>
              Customize your experience
            </ThemedText>
          </View>
        </Pressable>

        {/* Current Settings Preview */}
        <View className="w-full max-w-xs p-4 bg-gray-100 rounded-xl mb-8">
          <ThemedText className="text-sm font-semibold mb-2 text-center" style={{ color: textColor }}>
            Current Settings
          </ThemedText>
          <View className="gap-1">
            <ThemedText className="text-xs text-center opacity-70" style={{ color: textColor }}>
              🎵 {gameSettings.notationSystem === 'letter' ? 'Letters (C, D, E...)' : 'Solfege (Do, Re, Mi...) ✨'}
            </ThemedText>
            <ThemedText className="text-xs text-center opacity-70" style={{ color: textColor }}>
              👁️ Labels {gameSettings.showNoteLabels ? 'Visible ✨' : 'Hidden'}
            </ThemedText>
            <ThemedText className="text-xs text-center opacity-70" style={{ color: textColor }}>
              🎯 {gameSettings.difficulty.charAt(0).toUpperCase() + gameSettings.difficulty.slice(1)}
            </ThemedText>
          </View>
        </View>

        {/* Quick Tips */}
        <View className="w-full max-w-xs">
          <ThemedText className="text-sm font-semibold mb-2 text-center" style={{ color: textColor }}>
            💡 Quick Tips
          </ThemedText>
          <View className="gap-2">
            <View className="flex-row items-start">
              <ThemedText className="text-xs mr-2" style={{ color: textColor }}>
                •
              </ThemedText>
              <ThemedText className="text-xs flex-1 opacity-80" style={{ color: textColor }}>
                Start with Solfege (Do, Re, Mi) - it&apos;s great for beginners!
              </ThemedText>
            </View>
            <View className="flex-row items-start">
              <ThemedText className="text-xs mr-2" style={{ color: textColor }}>
                •
              </ThemedText>
              <ThemedText className="text-xs flex-1 opacity-80" style={{ color: textColor }}>
                Enable note labels while learning, then turn them off for a challenge
              </ThemedText>
            </View>
            <View className="flex-row items-start">
              <ThemedText className="text-xs mr-2" style={{ color: textColor }}>
                •
              </ThemedText>
              <ThemedText className="text-xs flex-1 opacity-80" style={{ color: textColor }}>
                Practice regularly to build muscle memory for note positions
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}