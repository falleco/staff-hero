import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';

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
  showFeedback = false
}: AnswerButtonsProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleButtonPress = (answer: string) => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAnswerSubmit([answer]);
  };

  return (
    <View className="flex-row flex-wrap justify-center gap-3 p-4">
      {options.map((option) => (
        <Pressable
          key={option}
          className="px-6 py-3 rounded-xl border-2 min-w-[80px]"
          style={({ pressed }) => ({
            backgroundColor: pressed ? `${tintColor}20` : 'transparent',
            borderColor: pressed ? tintColor : '#ccc',
            transform: [{ scale: pressed ? 0.95 : 1 }],
            opacity: disabled ? 0.5 : 1,
          })}
          onPress={() => handleButtonPress(option)}
          disabled={disabled}
        >
          <ThemedText
            className={cn(
              "text-center text-lg",
              "font-semibold"
            )}
            style={{
              color: textColor,
            }}
          >
            {option}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}