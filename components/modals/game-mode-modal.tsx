import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings } from '@/types/music';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface GameModeModalProps {
  visible: boolean;
  onClose: () => void;
  onStartGame: (gameMode: GameSettings['gameMode']) => void;
  currentSettings: GameSettings;
}

export function GameModeModal({ 
  visible, 
  onClose, 
  onStartGame,
  currentSettings 
}: GameModeModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const gameModes = [
    {
      mode: 'single-note' as const,
      title: '🎵 Single Note',
      description: 'Identify one note at a time',
      difficulty: 'Beginner Friendly',
      color: '#4CAF50',
    },
    {
      mode: 'chord' as const,
      title: '🎼 Chord Notes',
      description: 'Identify multiple notes played together',
      difficulty: 'Intermediate',
      color: '#FF9800',
    },
    {
      mode: 'sequence' as const,
      title: '🎶 Note Sequence',
      description: 'Identify notes in a sequence',
      difficulty: 'Advanced',
      color: '#F44336',
    },
  ];

  const handleModeSelect = (mode: GameSettings['gameMode']) => {
    onStartGame(mode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Choose Game Mode
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText style={[styles.closeButtonText, { color: textColor }]}>
              ✕
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.currentSettings}>
            <ThemedText style={[styles.settingsTitle, { color: textColor }]}>
              Current Settings
            </ThemedText>
            <View style={styles.settingsRow}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                Notation: {currentSettings.notationSystem === 'letter' ? 'Letters (C, D, E...)' : 'Solfege (Do, Re, Mi...)'}
              </ThemedText>
            </View>
            <View style={styles.settingsRow}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                Difficulty: {currentSettings.difficulty.charAt(0).toUpperCase() + currentSettings.difficulty.slice(1)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.modesContainer}>
            {gameModes.map((gameMode) => (
              <Pressable
                key={gameMode.mode}
                style={[
                  styles.modeCard,
                  { 
                    borderColor: gameMode.color,
                    backgroundColor: backgroundColor,
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
            style={[styles.settingsButton, { borderColor: tintColor }]}
            onPress={onClose}
          >
            <ThemedText style={[styles.settingsButtonText, { color: tintColor }]}>
              ⚙️ Change Settings First
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
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
