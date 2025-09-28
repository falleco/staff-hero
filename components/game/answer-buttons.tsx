import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

interface AnswerButtonsProps {
  options: string[];
  correctAnswers: string[];
  isMultiSelect?: boolean;
  onAnswerSubmit: (selectedAnswers: string[]) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export function AnswerButtons({
  options,
  correctAnswers,
  isMultiSelect = false,
  onAnswerSubmit,
  disabled = false,
  showFeedback = false
}: AnswerButtonsProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<number, Animated.Value>>({});

  // Initialize animated values when options change
  React.useEffect(() => {
    const newAnimatedValues: Record<number, Animated.Value> = {};
    options.forEach((_, index) => {
      newAnimatedValues[index] = new Animated.Value(1);
    });
    setAnimatedValues(newAnimatedValues);
  }, [options]);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleAnswerPress = (answer: string, index: number) => {
    if (disabled) return;

    // Animate button press
    if (animatedValues[index]) {
      Animated.sequence([
        Animated.timing(animatedValues[index], {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Always submit immediately (no toggle state)
    onAnswerSubmit([answer]);
  };

  const getButtonStyle = (answer: string) => {
    if (showFeedback) {
      const isCorrect = correctAnswers.includes(answer);
      
      if (isCorrect) {
        return {
          backgroundColor: '#4CAF50',
          borderColor: '#45a049',
        };
      }
    }

    return {
      backgroundColor: '#f0f0f0',
      borderColor: '#ccc',
    };
  };

  const getTextStyle = (answer: string) => {
    if (showFeedback) {
      const isCorrect = correctAnswers.includes(answer);
      
      if (isCorrect) {
        return { ...styles.answerText, color: 'white', fontWeight: '600' as const };
      }
    }
    
    return { ...styles.answerText, color: textColor };
  };

  // Don't render until animated values are ready
  if (Object.keys(animatedValues).length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.optionsGrid}>
        {options.map((option, index) => (
          <Animated.View key={option} style={{ transform: [{ scale: animatedValues[index] }] }}>
            <Pressable
              onPress={() => handleAnswerPress(option, index)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.answerButton,
                getButtonStyle(option),
                pressed && {
                  borderColor: tintColor,
                  borderWidth: 3,
                  backgroundColor: `${tintColor}20`, // 20% opacity tint
                }
              ]}
            >
              {({ pressed }) => (
                <ThemedText style={[
                  getTextStyle(option),
                  pressed && { color: tintColor, fontWeight: '700' }
                ]}>
                  {option}
                </ThemedText>
              )}
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  answerButton: {
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pressable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
