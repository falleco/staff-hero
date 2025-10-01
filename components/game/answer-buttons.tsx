import * as Haptics from 'expo-haptics';
import React from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { FlatButton, FlatButtonText } from '../core/flat-button';

interface AnswerButtonsProps {
  options: string[];
  correctAnswers: string[];
  isMultiSelect: boolean;
  onAnswerSubmit: (selectedAnswers: string[]) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export function AnswerButtons({
  options,
  correctAnswers,
  isMultiSelect,
  onAnswerSubmit,
  disabled = false,
}: AnswerButtonsProps) {
  const handleButtonPress = (answer: string) => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAnswerSubmit([answer]);
  };

  return (
    <View className="flex-row flex-wrap justify-center gap-4 p-6">
      {options.map((option, index) => {
        return (
          <FlatButton
            key={option}
            size="lg"
            onPress={() => handleButtonPress(option)}
            isDisabled={disabled}
            className="relative overflow-hidden rounded-2xl px-6 py-4 min-w-[80px] border-white/20 border-2 bg-white/10"
            hapticFeedback={false} // We handle haptics manually
          >
            <FlatButtonText className="text-center text-lg font-black text-white">
              {option}
            </FlatButtonText>
          </FlatButton>
        );
      })}
    </View>
  );
}
