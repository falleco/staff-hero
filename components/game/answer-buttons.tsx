import { ThemedText } from '@/components/themed-text';
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

  const handleButtonPress = (answer: string) => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAnswerSubmit([answer]);
  };

  return (
    <View className="flex-row flex-wrap justify-center gap-4 p-6">
      {options.map((option, index) => {
        const gradients = [
          'from-blue-500 to-blue-600',
          'from-green-500 to-green-600', 
          'from-purple-500 to-purple-600',
          'from-orange-500 to-orange-600',
          'from-pink-500 to-pink-600',
          'from-cyan-500 to-cyan-600',
          'from-yellow-500 to-yellow-600',
          'from-red-500 to-red-600'
        ];
        
        return (
          <Pressable
            key={option}
            className="relative overflow-hidden"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.9 : 1 }],
              opacity: disabled ? 0.5 : 1,
            })}
            onPress={() => handleButtonPress(option)}
            disabled={disabled}
          >
            <View className={`bg-gradient-to-r ${gradients[index % gradients.length]} rounded-2xl px-6 py-4 min-w-[80px] shadow-xl border-2 border-white/20`}>
              <ThemedText className="text-center text-lg font-black text-white">
                {option}
              </ThemedText>
              {/* Shine effect */}
              <View className="absolute top-1 left-1 right-1 h-4 bg-white/20 rounded-xl opacity-60" />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}