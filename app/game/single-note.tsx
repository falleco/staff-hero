import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import { AnswerButtons } from '@/components/game/answer-buttons';
import { ScoreDisplay } from '@/components/game/score-display';
import { MusicStaff } from '@/components/music-staff';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { useGameContext } from '@/hooks/use-game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameMode } from '@/types/music';
import {
  getAutoAdvanceDelay,
  getStreakLevel,
  triggerGameHaptics,
  validateAnswer,
} from '@/utils/game-logic';

interface GameScreenProps {
  onGameEnd?: () => void;
}

export default function SingleNoteGame({ onGameEnd }: GameScreenProps) {
  const {
    gameState,
    gameSettings,
    submitAnswer,
    nextQuestion,
    endGame,
    generateNewQuestion,
  } = useGameContext();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimeout, setFeedbackTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { top } = useSafeAreaInsets();

  const textColor = useThemeColor({}, 'text');

  // Generate new question when game starts or after answering
  useEffect(() => {
    if (gameState.isGameActive && !gameState.currentQuestion.notes.length) {
      generateNewQuestion();
    }
  }, [gameState.isGameActive, gameState.currentQuestion, generateNewQuestion]);

  const handleAnswerSubmit = (answers: string) => {
    submitAnswer([answers]);
    setShowFeedback(true);

    // Use extracted business logic
    const isCorrect = validateAnswer(
      [answers],
      gameState.currentQuestion.correctAnswer,
    );
    triggerGameHaptics(isCorrect);

    // Auto-advance timing based on game mode and correctness
    const delay = getAutoAdvanceDelay(gameSettings.gameMode, isCorrect);

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
    Alert.alert('End Game', 'Are you sure you want to end the current game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Game',
        style: 'destructive',
        onPress: () => {
          endGame();
          router.back();
        },
      },
    ]);
  };

  if (!gameState.isGameActive) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText className="text-2xl font-bold">Game Not Active</ThemedText>
        <ThemedText className="text-sm opacity-70">
          Please start a new game to continue
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <LinearGradient
        colors={['#9F7FFF', '#8055FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {/* Header with score and controls */}
      <View
        className="flex-row justify-between items-center px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10"
        style={{ paddingTop: top }}
      >
        <ScoreDisplay
          score={gameState.score}
          streak={gameState.streak}
          maxStreak={gameState.maxStreak}
          totalQuestions={gameState.totalQuestions}
          correctAnswers={gameState.correctAnswers}
          animateStreak={showFeedback && gameState.currentQuestion.isCorrect}
        />

        <FlatButton
          size="sm"
          onPress={handleEndGame}
          className="rounded-md px-4 py-0 border-red-400 bg-red-800 text-[#ffffff] border-2"
        >
          <FlatButtonText className="text-lg font-bold text-white font-pixelpurl-medium">
            END GAME
          </FlatButtonText>
        </FlatButton>
      </View>

      {/* Game content */}
      <View className="flex-1">
        {/* Music Staff */}
        <View className="flex-1 justify-center items-center px-4">
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
        <View className="pb-8">
          <AnswerButtons
            options={gameState.currentQuestion.options}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={gameState.currentQuestion.answered}
          />
        </View>

        {/* Feedback and Next Button */}
        {false && showFeedback && (
          <View className="items-center mt-5 px-6">
            {/* Show feedback text only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameMode !== GameMode.SINGLE_NOTE ||
              !gameState.currentQuestion.isCorrect) && (
              <ThemedText
                className="text-xl font-bold mb-2"
                style={{
                  color: gameState.currentQuestion.isCorrect
                    ? '#4CAF50'
                    : '#F44336',
                }}
              >
                {gameState.currentQuestion.isCorrect
                  ? 'Correct! 🎉'
                  : 'Try again! 💪'}
              </ThemedText>
            )}

            {/* Subtle correct indicator for single-note mode */}
            {gameSettings.gameMode === GameMode.SINGLE_NOTE &&
              gameState.currentQuestion.isCorrect && (
                <View className="items-center my-2">
                  <ThemedText
                    className="text-2xl font-bold mb-1"
                    style={{ color: '#4CAF50' }}
                  >
                    ✓
                  </ThemedText>
                  <ThemedText
                    className="text-sm opacity-70 italic"
                    style={{ color: textColor }}
                  >
                    Next question...
                  </ThemedText>
                </View>
              )}

            {!gameState.currentQuestion.isCorrect && (
              <ThemedText
                className="text-base mb-4 text-center"
                style={{ color: textColor }}
              >
                Correct answer:{' '}
                {gameState.currentQuestion.correctAnswer.join(', ')}
              </ThemedText>
            )}

            {/* Show next button only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameMode !== GameMode.SINGLE_NOTE ||
              !gameState.currentQuestion.isCorrect) && (
              <Button
                action="primary"
                variant="solid"
                size="lg"
                onPress={handleNextQuestion}
                className="rounded-full px-8 py-3"
              >
                <ButtonText className="text-white text-base font-semibold">
                  Next Question
                </ButtonText>
              </Button>
            )}
          </View>
        )}
      </View>
    </>
  );
}
