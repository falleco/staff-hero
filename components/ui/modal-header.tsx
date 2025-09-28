import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  closeButtonText?: string;
}

/**
 * Reusable Modal Header component with consistent styling
 * Provides title and close button functionality
 */
export function ModalHeader({ 
  title, 
  onClose, 
  closeButtonText = "✕" 
}: ModalHeaderProps) {
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.header}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        {title}
      </ThemedText>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <ThemedText style={[styles.closeButtonText, { color: textColor }]}>
          {closeButtonText}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
});
