import { ThemedText } from '@/components/themed-text';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { NotationSystem } from '@/types/music';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsScreenProps {
  onStartGame: () => void;
}

export function SettingsScreen({ onStartGame }: SettingsScreenProps) {
  const { gameSettings, updateSettings, startGame } = useGame();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const handleStartGame = () => {
    startGame();
    onStartGame();
  };

  const SettingOption = ({ 
    title, 
    options, 
    currentValue, 
    onValueChange 
  }: {
    title: string;
    options: { label: string; value: any }[];
    currentValue: any;
    onValueChange: (value: any) => void;
  }) => (
    <View style={styles.settingGroup}>
      <ThemedText style={[styles.settingTitle, { color: textColor }]}>
        {title}
      </ThemedText>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.optionButton,
              {
                backgroundColor: currentValue === option.value ? tintColor : 'transparent',
                borderColor: currentValue === option.value ? tintColor : '#ccc',
              }
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: currentValue === option.value ? 'white' : textColor,
                  fontWeight: currentValue === option.value ? '600' : '400',
                }
              ]}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            🎵 Staff Hero
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textColor }]}>
            Learn to read music notes
          </ThemedText>
        </View>

        <View style={styles.settingsContainer}>
          {/* Notation System */}
          <SettingOption
            title="Notation System"
            options={[
              { label: 'Letters (C, D, E, F, G, A, B)', value: 'letter' as NotationSystem },
              { label: 'Solfege (Do, Re, Mi, Fa, Sol, La, Si)', value: 'solfege' as NotationSystem },
            ]}
            currentValue={gameSettings.notationSystem}
            onValueChange={(value) => updateSettings({ notationSystem: value })}
          />

          {/* Difficulty */}
          <SettingOption
            title="Difficulty"
            options={[
              { label: 'Beginner (C4-B5)', value: 'beginner' },
              { label: 'Intermediate (C3-B5)', value: 'intermediate' },
              { label: 'Advanced (C3-B6)', value: 'advanced' },
            ]}
            currentValue={gameSettings.difficulty}
            onValueChange={(value) => updateSettings({ difficulty: value })}
          />

          {/* Game Mode */}
          <SettingOption
            title="Game Mode"
            options={[
              { label: 'Single Note', value: 'single-note' },
              { label: 'Multiple Notes (Chord)', value: 'chord' },
              { label: 'Note Sequence', value: 'sequence' },
            ]}
            currentValue={gameSettings.gameMode}
            onValueChange={(value) => updateSettings({ gameMode: value })}
          />
        </View>

        {/* Game Info */}
        <View style={styles.infoContainer}>
          <ThemedText style={[styles.infoTitle, { color: textColor }]}>
            How to Play:
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Look at the musical staff with notes
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Select the correct note name(s)
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Build your streak for bonus points
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Learn both letter names and solfege
          </ThemedText>
        </View>

        {/* Start Game Button */}
        <Pressable
          style={[styles.startButton, { backgroundColor: tintColor }]}
          onPress={handleStartGame}
        >
          <ThemedText style={styles.startButtonText}>
            🎮 Start Game
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingGroup: {
    marginBottom: 25,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  infoContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  startButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});
