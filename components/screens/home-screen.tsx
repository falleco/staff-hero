import { ThemedText } from '@/components/themed-text';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* App Title */}
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.appTitle, { color: textColor }]}>
            🎵 Staff Hero
          </ThemedText>
          <ThemedText style={[styles.appSubtitle, { color: textColor }]}>
            Master Music Note Reading
          </ThemedText>
        </View>

        {/* Musical Staff Decoration */}
        <View style={styles.decorationContainer}>
          <View style={styles.staffLines}>
            {[0, 1, 2, 3, 4].map((line) => (
              <View 
                key={line} 
                style={[styles.staffLine, { backgroundColor: textColor }]} 
              />
            ))}
          </View>
          <ThemedText style={[styles.musicNote, { color: tintColor }]}>
            ♪ ♫ ♪ ♫
          </ThemedText>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.playButton, { backgroundColor: tintColor }]}
            onPress={handleStartGamePress}
          >
            <ThemedText style={styles.playButtonText}>
              🎮 Start Playing
            </ThemedText>
            <ThemedText style={styles.playButtonSubtext}>
              Choose your game mode
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.settingsButton, { borderColor: textColor }]}
            onPress={handleSettingsPress}
          >
            <ThemedText style={[styles.settingsButtonText, { color: textColor }]}>
              ⚙️ Settings
            </ThemedText>
          </Pressable>
        </View>

        {/* Current Settings Preview */}
        <View style={styles.currentSettingsContainer}>
          <ThemedText style={[styles.currentSettingsTitle, { color: textColor }]}>
            Current Settings
          </ThemedText>
          <View style={styles.settingsPreview}>
            <View style={styles.settingItem}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                Notation
              </ThemedText>
              <ThemedText style={[styles.settingValue, { color: tintColor }]}>
                {gameSettings.notationSystem === 'letter' ? 'Letters' : 'Solfege ✨'}
              </ThemedText>
            </View>
            <View style={styles.settingItem}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                Difficulty
              </ThemedText>
              <ThemedText style={[styles.settingValue, { color: tintColor }]}>
                {gameSettings.difficulty.charAt(0).toUpperCase() + gameSettings.difficulty.slice(1)}
              </ThemedText>
            </View>
            <View style={styles.settingItem}>
              <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                Note Labels
              </ThemedText>
              <ThemedText style={[styles.settingValue, { color: tintColor }]}>
                {gameSettings.showNoteLabels ? 'Visible ✨' : 'Hidden'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <ThemedText style={[styles.tipsTitle, { color: textColor }]}>
            💡 Quick Tips
          </ThemedText>
          <ThemedText style={[styles.tipText, { color: textColor }]}>
            • Build streaks for bonus points
          </ThemedText>
          <ThemedText style={[styles.tipText, { color: textColor }]}>
            • Start with solfege (Do, Re, Mi...)
          </ThemedText>
          <ThemedText style={[styles.tipText, { color: textColor }]}>
            • Practice daily for best results
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-around',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
  },
  decorationContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  staffLines: {
    width: width * 0.7,
    height: 60,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  staffLine: {
    height: 2,
    opacity: 0.3,
  },
  musicNote: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 16,
    marginVertical: 20,
  },
  playButton: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  playButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  playButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  settingsButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  currentSettingsContainer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    marginVertical: 10,
  },
  currentSettingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  settingsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  settingItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  settingLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'center',
  },
});
