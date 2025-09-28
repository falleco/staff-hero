import { ThemedText } from '@/components/themed-text';
import { ModalHeader } from '@/components/ui/modal-header';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings } from '@/types/music';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameModesScreen() {
  const { gameSettings, updateSettings, startGame } = useGame();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const gameModes = [
    {
      mode: 'single-note' as const,
      title: '🎵 Single Note',
      description: 'Identify one note at a time - quick and simple',
      difficulty: 'Beginner Friendly',
      color: '#4CAF50',
    },
    {
      mode: 'sequence' as const,
      title: '🎼 Note Sequence',
      description: 'Identify multiple notes in the correct order',
      difficulty: 'Intermediate',
      color: '#FF9800',
    },
    {
      mode: 'rhythm' as const,
      title: '🎸 Rhythm Hero',
      description: 'Guitar Hero style - tap notes as they move across the staff',
      difficulty: 'Advanced',
      color: '#F44336',
    },
  ];

  const handleModeSelect = (mode: GameSettings['gameMode']) => {
    updateSettings({ gameMode: mode });
    startGame();
    router.back(); // Navigate back to home, which will trigger game start
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ModalHeader 
        title="Choose Game Mode" 
        onClose={handleClose}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.currentSettings}>
          <ThemedText style={[styles.settingsTitle, { color: textColor }]}>
            Current Settings
          </ThemedText>
          <View style={styles.settingsRow}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Notation: {gameSettings.notationSystem === 'letter' ? 'Letters (C, D, E...)' : 'Solfege (Do, Re, Mi...) ✨'}
            </ThemedText>
          </View>
          <View style={styles.settingsRow}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Note Labels: {gameSettings.showNoteLabels ? 'Visible ✨' : 'Hidden'}
            </ThemedText>
          </View>
          <View style={styles.settingsRow}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Difficulty: {gameSettings.difficulty.charAt(0).toUpperCase() + gameSettings.difficulty.slice(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.modesContainer}>
          {gameModes.map((gameMode) => (
            <Pressable
              key={gameMode.mode}
              style={({ pressed }) => [
                styles.modeCard,
                { 
                  borderColor: gameMode.color,
                  backgroundColor: backgroundColor,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                }
              ]}
              onPress={() => handleModeSelect(gameMode.mode)}
            >
              <View style={styles.modeHeader}>
                <ThemedText style={[styles.modeTitle, { color: textColor }]}>
                  {gameMode.title}
                </ThemedText>
                <View style={[styles.difficultyBadge, { backgroundColor: gameMode.color }]}>
                  <ThemedText style={styles.difficultyText}>
                    {gameMode.difficulty}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.modeDescription, { color: textColor }]}>
                {gameMode.description}
              </ThemedText>
              <View style={styles.startButton}>
                <ThemedText style={[styles.startButtonText, { color: gameMode.color }]}>
                  Start Playing →
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.settingsButton, 
            { 
              borderColor: tintColor,
              backgroundColor: pressed ? `${tintColor}10` : 'transparent',
            }
          ]}
          onPress={() => router.push('/settings')}
        >
          <ThemedText style={[styles.settingsButtonText, { color: tintColor }]}>
            ⚙️ Change Settings First
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  currentSettings: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsRow: {
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  modesContainer: {
    gap: 16,
    marginBottom: 30,
  },
  modeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  startButton: {
    alignItems: 'flex-end',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
