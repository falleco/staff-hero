import { router } from 'expo-router';
import type React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ModalHeader } from '@/components/ui/modal-header';
import { SettingOption } from '@/components/ui/setting-option';
import { useGameContext } from '@/hooks/use-game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Difficulty, NotationSystem } from '@/types/music';

export default function SettingsScreen() {
  const { gameSettings } = useGameContext();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleClose = () => {
    router.back();
  };

  const SettingSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-8">
      <ThemedText
        className="text-xl font-bold mb-4"
        style={{ color: textColor }}
      >
        {title}
      </ThemedText>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ModalHeader title="⚙️ Settings" onClose={handleClose} />

      <ScrollView className="p-5">
        <SettingSection title="🎼 Music Notation">
          <SettingOption
            title="Notation System"
            subtitle="Choose how notes are displayed"
            options={[
              {
                label: 'Solfege',
                value: NotationSystem.SOLFEGE,
                description: 'Do, Re, Mi, Fa, Sol, La, Si (Recommended)',
              },
              {
                label: 'Letter Names',
                value: NotationSystem.LETTER,
                description: 'C, D, E, F, G, A, B',
              },
            ]}
            currentValue={gameSettings.gameSettings.notationSystem}
            onValueChange={(value) => gameSettings.updateNotationSystem(value)}
          />
        </SettingSection>

        <SettingSection title="🎯 Difficulty">
          <SettingOption
            title="Note Range"
            subtitle="Controls which notes appear in the game"
            options={[
              {
                label: 'Beginner',
                value: Difficulty.BEGINNER,
                description: 'C4 to B5 - Basic treble clef range',
              },
              {
                label: 'Intermediate',
                value: Difficulty.INTERMEDIATE,
                description: 'C3 to B5 - Extended range with ledger lines',
              },
              {
                label: 'Advanced',
                value: Difficulty.ADVANCED,
                description: 'C3 to B6 - Full range with many ledger lines',
              },
            ]}
            currentValue={gameSettings.gameSettings.difficulty}
            onValueChange={(value) => gameSettings.updateDifficulty(value)}
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
                description: 'Recommended for beginners - shows note names',
              },
              {
                label: 'Hidden',
                value: false,
                description: 'Challenge mode - no hints shown',
              },
            ]}
            currentValue={gameSettings.gameSettings.showNoteLabels}
            onValueChange={(value) =>
              gameSettings.updateSettings({ showNoteLabels: value })
            }
          />
        </SettingSection>

        <View className="mt-5 p-5 bg-gray-100 rounded-xl">
          <ThemedText
            className="text-lg font-semibold mb-3"
            style={{ color: textColor }}
          >
            💡 Tips
          </ThemedText>
          <View className="mb-2">
            <ThemedText
              className="text-sm opacity-80"
              style={{ color: textColor }}
            >
              • Solfege is great for beginners and ear training
            </ThemedText>
          </View>
          <View className="mb-2">
            <ThemedText
              className="text-sm opacity-80"
              style={{ color: textColor }}
            >
              • Practice regularly to build muscle memory for note positions
            </ThemedText>
          </View>
          <View className="mb-2">
            <ThemedText
              className="text-sm opacity-80"
              style={{ color: textColor }}
            >
              • Higher difficulties include ledger lines above and below the
              staff
            </ThemedText>
          </View>
          <View className="mb-2">
            <ThemedText
              className="text-sm opacity-80"
              style={{ color: textColor }}
            >
              • Enable note labels when starting out, then turn them off for a
              challenge
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
