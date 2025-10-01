import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { FlatButton } from '../core/flat-button';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

/**
 * Reusable Modal Header component with consistent styling
 * Provides title and close button functionality
 */
export function ModalHeader({
  title,
  onClose,
}: ModalHeaderProps) {
  return (
    <View className="flex-row justify-between items-center p-5 pt-16 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <ThemedText className="text-2xl font-black text-white">
        {title}
      </ThemedText>
      <FlatButton
        size="lg"
        onPress={onClose}
        className="p-1 m-1 justify-start flex-col items-center gap-2"
      >
        <Image
          style={{ width: 32, height: 32 }}
          source={require('@/assets/images/hud/close.svg')}
        />
      </FlatButton>
    </View>
  );
}
