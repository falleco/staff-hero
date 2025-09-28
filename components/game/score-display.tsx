import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calculateAccuracy } from '@/utils/music-utils';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

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
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(streakAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [streak, animateStreak, streakAnimation]);

  const accuracy = calculateAccuracy(correctAnswers, totalQuestions);
  
  const getStreakColor = () => {
    if (streak === 0) return textColor;
    if (streak < 5) return '#FFA726'; // Orange
    if (streak < 10) return '#FF7043'; // Deep orange
    return '#F44336'; // Red (fire!)
  };

  const getStreakEmoji = () => {
    if (streak === 0) return '';
    if (streak < 3) return '⚡';
    if (streak < 5) return '🔥';
    if (streak < 10) return '🔥🔥';
    return '🔥🔥🔥';
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.mainStats}>
        <View style={styles.scoreContainer}>
          <ThemedText style={[styles.scoreLabel, { color: textColor }]}>
            Score
          </ThemedText>
          <ThemedText style={[styles.scoreValue, { color: tintColor }]}>
            {score.toLocaleString()}
          </ThemedText>
        </View>
        
        <Animated.View 
          style={[
            styles.streakContainer,
            { transform: [{ scale: streakAnimation }] }
          ]}
        >
          <ThemedText style={[styles.streakLabel, { color: textColor }]}>
            Streak
          </ThemedText>
          <View style={styles.streakValue}>
            <ThemedText style={[styles.streakNumber, { color: getStreakColor() }]}>
              {streak}
            </ThemedText>
            {streak > 0 && (
              <ThemedText style={styles.streakEmoji}>
                {getStreakEmoji()}
              </ThemedText>
            )}
          </View>
        </Animated.View>
      </View>
      
      {showDetailed && (
        <View style={styles.detailedStats}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statLabel, { color: textColor }]}>
              Accuracy
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {accuracy}%
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statLabel, { color: textColor }]}>
              Correct
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: '#4CAF50' }]}>
              {correctAnswers}/{totalQuestions}
            </ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statLabel, { color: textColor }]}>
              Best Streak
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {maxStreak}
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  streakEmoji: {
    fontSize: 20,
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
