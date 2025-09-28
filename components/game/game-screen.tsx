import { AnswerButtons } from '@/components/game/answer-buttons';
import { ScoreDisplay } from '@/components/game/score-display';
import { MusicStaff } from '@/components/music/music-staff';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameScreenProps {
  onGameEnd?: () => void;
}

// Helper function to determine streak level for animations
function getStreakLevel(streak: number): number {
  if (streak === 0) return 0;
  if (streak < 5) return 1;
  if (streak < 10) return 2;
  return 3;
}

export function GameScreen({ onGameEnd }: GameScreenProps) {
  const { gameState, gameSettings, submitAnswer, nextQuestion, endGame, generateNewQuestion } = useGame();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimeout, setFeedbackTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  // Generate new question when game starts or after answering
  useEffect(() => {
    if (gameState.isGameActive && !gameState.currentQuestion.notes.length) {
      generateNewQuestion();
    }
  }, [gameState.isGameActive, gameState.currentQuestion, generateNewQuestion]);

  const handleAnswerSubmit = (answers: string[]) => {
    submitAnswer(answers);
    setShowFeedback(true);
    
    // Haptic feedback
    const isCorrect = JSON.stringify(answers.sort()) === 
                     JSON.stringify(gameState.currentQuestion.correctAnswer.sort());
    
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Auto-advance timing based on game mode and correctness
    const answerIsCorrect = JSON.stringify(answers.sort()) === 
                           JSON.stringify(gameState.currentQuestion.correctAnswer.sort());
    
    let delay = 2000; // Default delay
    
    if (gameSettings.gameMode === 'single-note') {
      if (answerIsCorrect) {
        delay = 500; // Quick progression for correct answers
      } else {
        delay = 3000; // Longer pause for incorrect answers to learn
      }
    }
    
    const timeout = setTimeout(() => {
      setShowFeedback(false);
      nextQuestion();
      generateNewQuestion();
    }, delay);
    
    setFeedbackTimeout(timeout);
  };

  const handleNextQuestion = () => {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }
    setShowFeedback(false);
    nextQuestion();
    generateNewQuestion();
  };

  const handleEndGame = () => {
    Alert.alert(
      'End Game',
      'Are you sure you want to end the current game?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Game', 
          style: 'destructive',
          onPress: () => {
            endGame();
            onGameEnd?.();
          }
        }
      ]
    );
  };

  const isMultiSelect = gameSettings.gameMode !== 'single-note';

  if (!gameState.isGameActive) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Game Not Active</ThemedText>
        <ThemedText style={styles.subtitle}>
          Please start a new game to continue
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header with score and controls */}
      <View style={styles.header}>
        <ScoreDisplay
          score={gameState.score}
          streak={gameState.streak}
          maxStreak={gameState.maxStreak}
          totalQuestions={gameState.totalQuestions}
          correctAnswers={gameState.correctAnswers}
          animateStreak={showFeedback && gameState.currentQuestion.isCorrect}
        />
        
        <Pressable
          style={[styles.endButton, { borderColor: textColor }]}
          onPress={handleEndGame}
        >
          <ThemedText style={[styles.endButtonText, { color: textColor }]}>
            End Game
          </ThemedText>
        </Pressable>
      </View>

      {/* Game content */}
      <View style={styles.gameContent}>
        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <ThemedText style={[styles.instruction, { color: textColor }]}>
            {gameSettings.gameMode === 'single-note' 
              ? 'Identify the note:'
              : gameSettings.gameMode === 'chord'
              ? 'Identify all notes in the chord:'
              : 'Identify the notes in sequence:'
            }
          </ThemedText>
          
          <ThemedText style={[styles.notationInfo, { color: textColor }]}>
            Using {gameSettings.notationSystem === 'letter' ? 'Letter' : 'Solfege'} notation
          </ThemedText>
        </View>

        {/* Music Staff */}
        <View style={styles.staffContainer}>
          <MusicStaff
            notes={gameState.currentQuestion.notes}
            showFeedback={showFeedback}
            isCorrect={gameState.currentQuestion.isCorrect}
            showNoteLabels={gameSettings.showNoteLabels}
            notationSystem={gameSettings.notationSystem}
            streakLevel={getStreakLevel(gameState.streak)}
            width={350}
            height={180}
          />
        </View>

        {/* Answer Options */}
        <View style={styles.answersContainer}>
          <AnswerButtons
            options={gameState.currentQuestion.options}
            correctAnswers={gameState.currentQuestion.correctAnswer}
            isMultiSelect={isMultiSelect}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={gameState.currentQuestion.answered}
            showFeedback={showFeedback}
          />
        </View>

        {/* Feedback and Next Button */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            {/* Show feedback text only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameMode !== 'single-note' || !gameState.currentQuestion.isCorrect) && (
              <ThemedText 
                style={[
                  styles.feedbackText,
                  { 
                    color: gameState.currentQuestion.isCorrect ? '#4CAF50' : '#F44336' 
                  }
                ]}
              >
                {gameState.currentQuestion.isCorrect ? 'Correct! 🎉' : 'Try again! 💪'}
              </ThemedText>
            )}
            
            {/* Subtle correct indicator for single-note mode */}
            {gameSettings.gameMode === 'single-note' && gameState.currentQuestion.isCorrect && (
              <View style={styles.quickProgressContainer}>
                <ThemedText style={[styles.subtleFeedbackText, { color: '#4CAF50' }]}>
                  ✓
                </ThemedText>
                <ThemedText style={[styles.quickProgressText, { color: textColor }]}>
                  Next question...
                </ThemedText>
              </View>
            )}
            
            {!gameState.currentQuestion.isCorrect && (
              <ThemedText style={[styles.correctAnswerText, { color: textColor }]}>
                Correct answer: {gameState.currentQuestion.correctAnswer.join(', ')}
              </ThemedText>
            )}
            
            {/* Show next button only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameMode !== 'single-note' || !gameState.currentQuestion.isCorrect) && (
              <Pressable
                style={[styles.nextButton, { backgroundColor: tintColor }]}
                onPress={handleNextQuestion}
              >
                <ThemedText style={styles.nextButtonText}>
                  Next Question
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  endButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  gameContent: {
    flex: 1,
    justifyContent: 'space-around',
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  notationInfo: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  staffContainer: {
    alignItems: 'center',
    marginVertical: 30,
    minHeight: 180,
  },
  answersContainer: {
    marginVertical: 20,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtleFeedbackText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  quickProgressContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  quickProgressText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  correctAnswerText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  nextButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
