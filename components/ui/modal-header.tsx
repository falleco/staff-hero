import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Pressable, View } from 'react-native';

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
    <View className="flex-row justify-between items-center p-5 pt-6 border-b border-gray-200">
      <ThemedText className="text-2xl font-bold" style={{ color: textColor }}>
        {title}
      </ThemedText>
      <Pressable onPress={onClose} className="p-2">
        <ThemedText className="text-xl font-semibold" style={{ color: textColor }}>
          {closeButtonText}
        </ThemedText>
      </Pressable>
    </View>
  );
}