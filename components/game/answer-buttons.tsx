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
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
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

    let newSelectedAnswers: string[];

    if (isMultiSelect) {
      if (selectedAnswers.includes(answer)) {
        newSelectedAnswers = selectedAnswers.filter(a => a !== answer);
      } else {
        newSelectedAnswers = [...selectedAnswers, answer];
      }
      setSelectedAnswers(newSelectedAnswers);
    } else {
      newSelectedAnswers = [answer];
      setSelectedAnswers(newSelectedAnswers);
      // Auto-submit for single select
      setTimeout(() => {
        onAnswerSubmit(newSelectedAnswers);
      }, 150);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    onAnswerSubmit(selectedAnswers);
  };

  const getButtonStyle = (answer: string, index: number) => {
    const isSelected = selectedAnswers.includes(answer);
    let backgroundColor = '#f0f0f0';
    let borderColor = '#ccc';
    
    if (showFeedback) {
      const isCorrect = correctAnswers.includes(answer);
      const wasSelected = selectedAnswers.includes(answer);
      
      if (isCorrect) {
        backgroundColor = '#4CAF50';
        borderColor = '#45a049';
      } else if (wasSelected) {
        backgroundColor = '#F44336';
        borderColor = '#da190b';
      }
    } else if (isSelected) {
      backgroundColor = tintColor;
      borderColor = tintColor;
    }

    return {
      ...styles.answerButton,
      backgroundColor,
      borderColor,
      transform: [{ scale: animatedValues[index] }],
    };
  };

  const getTextStyle = (answer: string) => {
    const isSelected = selectedAnswers.includes(answer);
    
    if (showFeedback) {
      const isCorrect = correctAnswers.includes(answer);
      const wasSelected = selectedAnswers.includes(answer);
      
      if (isCorrect || wasSelected) {
        return { ...styles.answerText, color: 'white', fontWeight: '600' as const };
      }
    } else if (isSelected) {
      return { ...styles.answerText, color: 'white', fontWeight: '600' as const };
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
          <Animated.View key={option} style={getButtonStyle(option, index)}>
            <Pressable
              onPress={() => handleAnswerPress(option, index)}
              disabled={disabled}
              style={styles.pressable}
            >
              <ThemedText style={getTextStyle(option)}>
                {option}
              </ThemedText>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      
      {isMultiSelect && selectedAnswers.length > 0 && !showFeedback && (
        <Pressable
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
        >
          <ThemedText style={styles.submitText}>
            Submit Answer{selectedAnswers.length > 1 ? 's' : ''}
          </ThemedText>
        </Pressable>
      )}
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
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
