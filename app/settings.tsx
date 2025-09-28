import { ThemedText } from '@/components/themed-text';
import { ModalHeader } from '@/components/ui/modal-header';
import { SettingOption } from '@/components/ui/setting-option';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { NotationSystem } from '@/types/music';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { gameSettings, updateSettings } = useGame();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleClose = () => {
    router.back();
  };

  const SettingSection = ({ 
    title, 
    children 
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.settingSection}>
      <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
        {title}
      </ThemedText>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ModalHeader 
        title="⚙️ Settings" 
        onClose={handleClose}
        closeButtonText="Done"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <SettingSection title="🎼 Music Notation">
          <SettingOption
            title="Notation System"
            subtitle="Choose how notes are displayed"
            options={[
              { 
                label: 'Solfege', 
                value: 'solfege' as NotationSystem,
                description: 'Do, Re, Mi, Fa, Sol, La, Si (Recommended)'
              },
              { 
                label: 'Letter Names', 
                value: 'letter' as NotationSystem,
                description: 'C, D, E, F, G, A, B'
              },
            ]}
            currentValue={gameSettings.notationSystem}
            onValueChange={(value) => updateSettings({ notationSystem: value })}
          />
        </SettingSection>

        <SettingSection title="🎯 Difficulty">
          <SettingOption
            title="Note Range"
            subtitle="Controls which notes appear in the game"
            options={[
              { 
                label: 'Beginner', 
                value: 'beginner',
                description: 'C4 to B5 - Basic treble clef range'
              },
              { 
                label: 'Intermediate', 
                value: 'intermediate',
                description: 'C3 to B5 - Extended range with ledger lines'
              },
              { 
                label: 'Advanced', 
                value: 'advanced',
                description: 'C3 to B6 - Full range with many ledger lines'
              },
            ]}
            currentValue={gameSettings.difficulty}
            onValueChange={(value) => updateSettings({ difficulty: value })}
          />
        </SettingSection>

        <SettingSection title="🎓 Learning Helpers">
          <SettingOption
            title="Note Labels"
            subtitle="Show note names on staff lines and spaces"
            options={[
              { 
                label: 'Visible', 
                value: true,
                description: 'Recommended for beginners - shows note names'
              },
              { 
                label: 'Hidden', 
                value: false,
                description: 'Challenge mode - no hints shown'
              },
            ]}
            currentValue={gameSettings.showNoteLabels}
            onValueChange={(value) => updateSettings({ showNoteLabels: value })}
          />
        </SettingSection>

        <View style={styles.infoSection}>
          <ThemedText style={[styles.infoTitle, { color: textColor }]}>
            💡 Tips
          </ThemedText>
          <View style={styles.tipItem}>
            <ThemedText style={[styles.tipText, { color: textColor }]}>
              • Solfege is great for beginners and ear training
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={[styles.tipText, { color: textColor }]}>
              • Practice regularly to build muscle memory for note positions
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={[styles.tipText, { color: textColor }]}>
              • Higher difficulties include ledger lines above and below the staff
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={[styles.tipText, { color: textColor }]}>
              • Enable note labels when starting out, then turn them off for a challenge
            </ThemedText>
          </View>
        </View>
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
  settingSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
