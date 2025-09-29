import { ThemedText } from '@/components/themed-text';
import { useGame } from '@/contexts/game-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const { gameSettings } = useGame();

  const handleStartGamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/game-modes');
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <View className="flex-1 justify-center items-center p-6">
        {/* Header with Game Logo */}
        <View className="items-center mb-16">
          <View className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 mb-6 shadow-2xl">
            <ThemedText className="text-6xl">🎼</ThemedText>
          </View>
          <ThemedText className="text-6xl font-black text-white mb-3 text-center shadow-lg">
            STAFF HERO
          </ThemedText>
          <View className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2">
            <ThemedText className="text-lg text-center text-white/90 font-semibold">
              Master Music Notation
            </ThemedText>
          </View>
        </View>

        {/* Main Action Button - Game Style */}
        <Pressable
          className="w-full max-w-sm mb-6"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
          onPress={handleStartGamePress}
        >
          <View className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-6 shadow-2xl border-4 border-white/20">
            <View className="items-center">
              <View className="bg-white/20 rounded-full p-2 mb-3">
                <ThemedText className="text-3xl">🎮</ThemedText>
              </View>
              <ThemedText className="text-2xl font-black text-white mb-1">
                START PLAYING
              </ThemedText>
              <ThemedText className="text-base text-white/90 font-semibold">
                Choose Your Adventure
              </ThemedText>
            </View>
            {/* Shine effect */}
            <View className="absolute top-2 left-2 right-2 h-8 bg-white/20 rounded-2xl opacity-50" />
          </View>
        </Pressable>

        {/* Settings Button - Game Style */}
        <Pressable
          className="w-full max-w-sm mb-8"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
          onPress={handleSettingsPress}
        >
          <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 shadow-xl border-2 border-white/20">
            <View className="flex-row items-center justify-center">
              <View className="bg-white/20 rounded-full p-1 mr-3">
                <ThemedText className="text-xl">⚙️</ThemedText>
              </View>
              <View>
                <ThemedText className="text-lg font-bold text-white">
                  SETTINGS
                </ThemedText>
                <ThemedText className="text-sm text-white/80 font-medium">
                  Customize Game
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Game Stats Panel */}
        <View className="w-full max-w-sm bg-black/30 backdrop-blur-sm rounded-2xl p-5 mb-8 border border-white/10">
          <View className="flex-row items-center justify-center mb-4">
            <View className="bg-blue-500/20 rounded-full p-2 mr-2">
              <ThemedText className="text-lg">📊</ThemedText>
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

        {/* Game Tips Panel */}
        <View className="w-full max-w-sm bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/30">
          <View className="flex-row items-center justify-center mb-3">
            <View className="bg-yellow-500/30 rounded-full p-1 mr-2">
              <ThemedText className="text-base">💡</ThemedText>
            </View>
            <ThemedText className="text-base font-bold text-white">
              PRO TIPS
            </ThemedText>
          </View>
          <View className="space-y-2">
            <View className="flex-row items-center bg-white/5 rounded-lg p-2">
              <View className="bg-green-500/30 rounded-full p-1 mr-2">
                <ThemedText className="text-xs">🎵</ThemedText>
              </View>
              <ThemedText className="text-xs flex-1 text-white/90 font-medium">
                Start with Solfege - perfect for beginners!
              </ThemedText>
            </View>
            <View className="flex-row items-center bg-white/5 rounded-lg p-2">
              <View className="bg-blue-500/30 rounded-full p-1 mr-2">
                <ThemedText className="text-xs">👁️</ThemedText>
              </View>
              <ThemedText className="text-xs flex-1 text-white/90 font-medium">
                Use labels while learning, then go pro without them
              </ThemedText>
            </View>
            <View className="flex-row items-center bg-white/5 rounded-lg p-2">
              <View className="bg-purple-500/30 rounded-full p-1 mr-2">
                <ThemedText className="text-xs">🎯</ThemedText>
              </View>
              <ThemedText className="text-xs flex-1 text-white/90 font-medium">
                Practice daily to build muscle memory
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}