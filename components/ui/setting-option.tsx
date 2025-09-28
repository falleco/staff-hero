import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface OptionItem {
  label: string;
  value: any;
  description?: string;
}

interface SettingOptionProps {
  title: string;
  subtitle?: string;
  options: OptionItem[];
  currentValue: any;
  onValueChange: (value: any) => void;
}

/**
 * Reusable Setting Option component for consistent option selection UI
 * Used in settings modals and configuration screens
 */
export function SettingOption({ 
  title, 
  subtitle,
  options, 
  currentValue, 
  onValueChange 
}: SettingOptionProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
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
            style={({ pressed }) => [
              styles.optionButton,
              {
                backgroundColor: currentValue === option.value ? tintColor : 'transparent',
                borderColor: currentValue === option.value ? tintColor : '#ccc',
                borderWidth: pressed ? 3 : 2,
                transform: [{ scale: pressed ? 0.98 : 1 }],
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
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    alignItems: 'center',
  },
  optionContent: {
    gap: 4,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});
