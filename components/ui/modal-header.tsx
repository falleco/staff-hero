import { ThemedText } from '@/components/themed-text';
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

  return (
    <View className="flex-row justify-between items-center p-5 pt-16 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <ThemedText className="text-2xl font-black text-white">
        {title}
      </ThemedText>
      <Pressable 
        onPress={onClose} 
        className="bg-red-500/20 rounded-full p-2 border border-red-500/30"
        style={({ pressed }) => ({
          backgroundColor: pressed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <ThemedText className="text-lg font-bold text-white">
          {closeButtonText}
        </ThemedText>
      </Pressable>
    </View>
  );
}