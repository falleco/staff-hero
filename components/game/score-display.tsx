import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calculateAccuracy } from '@/utils/music-utils';
import React from 'react';
import { Animated, View } from 'react-native';

interface ScoreDisplayProps {
  score: number;
  streak: number;
  maxStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  showDetailed?: boolean;
  animateStreak?: boolean;
}

export function ScoreDisplay({
  score,
  streak,
  maxStreak,
  totalQuestions,
  correctAnswers,
  showDetailed = false,
  animateStreak = false
}: ScoreDisplayProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  const [streakAnimation] = React.useState(new Animated.Value(1));
  
  React.useEffect(() => {
    if (animateStreak && streak > 0) {
      Animated.sequence([
        Animated.timing(streakAnimation, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [streak, animateStreak, streakAnimation]);

  const accuracy = calculateAccuracy(correctAnswers, totalQuestions);
  const getStreakColor = () => {
    if (streak >= 10) return '#FF6B35'; // Fire orange
    if (streak >= 5) return '#F39C12';  // Golden
    if (streak >= 3) return '#27AE60';  // Green
    return textColor;
  };

  const getStreakEmoji = () => {
    if (streak >= 10) return '🔥';
    if (streak >= 5) return '⭐';
    if (streak >= 3) return '✨';
    return '';
  };

  if (showDetailed) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-md mx-4 mb-4" style={{ backgroundColor }}>
        <View className="flex-row justify-between items-center mb-3">
          <ThemedText className="text-2xl font-bold" style={{ color: tintColor }}>
            Score: {score}
          </ThemedText>
          <View className="items-end">
            <ThemedText className="text-lg font-semibold" style={{ color: textColor }}>
              {accuracy.toFixed(1)}% Accuracy
            </ThemedText>
            <ThemedText className="text-sm opacity-70" style={{ color: textColor }}>
              {correctAnswers}/{totalQuestions} correct
            </ThemedText>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Animated.View 
            className="flex-row items-center"
            style={{ transform: [{ scale: streakAnimation }] }}
          >
            <ThemedText className="text-lg font-bold mr-1" style={{ color: getStreakColor() }}>
              {getStreakEmoji()} Streak: {streak}
            </ThemedText>
          </Animated.View>
          
          <ThemedText className="text-sm opacity-70" style={{ color: textColor }}>
            Best: {maxStreak}
          </ThemedText>
        </View>

        {streak >= 3 && (
          <View className="mt-2 p-2 bg-yellow-100 rounded-lg">
            <ThemedText className="text-xs text-center font-medium" style={{ color: textColor }}>
              {streak >= 10 ? 'ON FIRE! 🔥' : 
               streak >= 5 ? 'Hot Streak! ⭐' : 
               'Great streak! ✨'}
            </ThemedText>
          </View>
        )}
      </View>
    );
  }

  // Compact version for in-game display
  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      <View className="flex-row items-center gap-4">
        <ThemedText className="text-lg font-bold" style={{ color: tintColor }}>
          {score}
        </ThemedText>
        
        <Animated.View 
          className="flex-row items-center"
          style={{ transform: [{ scale: streakAnimation }] }}
        >
          <ThemedText className="text-base font-semibold" style={{ color: getStreakColor() }}>
            {getStreakEmoji()} {streak}
          </ThemedText>
        </Animated.View>
      </View>

      {totalQuestions > 0 && (
        <ThemedText className="text-sm opacity-70" style={{ color: textColor }}>
          {accuracy.toFixed(0)}%
        </ThemedText>
      )}
    </View>
  );
}