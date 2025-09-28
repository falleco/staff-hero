import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings, NotationSystem } from '@/types/music';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export function SettingsModal({ 
  visible, 
  onClose, 
  settings,
  onUpdateSettings 
}: SettingsModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

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

  const SettingOption = ({ 
    title, 
    subtitle,
    options, 
    currentValue, 
    onValueChange 
  }: {
    title: string;
    subtitle?: string;
    options: { label: string; value: any; description?: string }[];
    currentValue: any;
    onValueChange: (value: any) => void;
  }) => (
    <View style={styles.settingGroup}>
      <ThemedText style={[styles.settingTitle, { color: textColor }]}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText style={[styles.settingSubtitle, { color: textColor }]}>
          {subtitle}
        </ThemedText>
      )}
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
            <View style={styles.optionContent}>
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
              {option.description && (
                <ThemedText
                  style={[
                    styles.optionDescription,
                    {
                      color: currentValue === option.value ? 'rgba(255,255,255,0.8)' : textColor,
                      opacity: currentValue === option.value ? 1 : 0.6,
                    }
                  ]}
                >
                  {option.description}
                </ThemedText>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

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
            ⚙️ Settings
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText style={[styles.closeButtonText, { color: textColor }]}>
              Done
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <SettingSection title="🎼 Music Notation">
            <SettingOption
              title="Notation System"
              subtitle="Choose how notes are displayed"
              options={[
                { 
                  label: 'Letter Names', 
                  value: 'letter' as NotationSystem,
                  description: 'C, D, E, F, G, A, B'
                },
                { 
                  label: 'Solfege', 
                  value: 'solfege' as NotationSystem,
                  description: 'Do, Re, Mi, Fa, Sol, La, Si'
                },
              ]}
              currentValue={settings.notationSystem}
              onValueChange={(value) => onUpdateSettings({ notationSystem: value })}
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
              currentValue={settings.difficulty}
              onValueChange={(value) => onUpdateSettings({ difficulty: value })}
            />
          </SettingSection>

          <SettingSection title="🎓 Learning Helpers">
            <SettingOption
              title="Note Labels"
              subtitle="Show note names on staff lines and spaces"
              options={[
                { 
                  label: 'Hidden', 
                  value: false,
                  description: 'Challenge mode - no hints shown'
                },
                { 
                  label: 'Visible', 
                  value: true,
                  description: 'Beginner friendly - shows note names'
                },
              ]}
              currentValue={settings.showNoteLabels}
              onValueChange={(value) => onUpdateSettings({ showNoteLabels: value })}
            />
          </SettingSection>

          <View style={styles.infoSection}>
            <ThemedText style={[styles.infoTitle, { color: textColor }]}>
              💡 Tips
            </ThemedText>
            <View style={styles.tipItem}>
              <ThemedText style={[styles.tipText, { color: textColor }]}>
                • Start with Letter notation if you&apos;re new to reading music
              </ThemedText>
            </View>
            <View style={styles.tipItem}>
              <ThemedText style={[styles.tipText, { color: textColor }]}>
                • Solfege helps with interval recognition and ear training
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
    fontSize: 16,
    fontWeight: '600',
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
  settingGroup: {
    marginBottom: 20,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
  },
  optionContent: {
    gap: 4,
  },
  optionText: {
    fontSize: 16,
  },
  optionDescription: {
    fontSize: 14,
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
