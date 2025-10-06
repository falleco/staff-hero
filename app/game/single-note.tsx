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
import {
  convertDisplayNamesToNotes,
  getNoteDisplayName,
  isAnswerCorrect,
} from '@/utils/music-utils';
import { useNoteAnimations } from '@/hooks/use-note-animations';

interface GameScreenProps {
  onGameEnd?: () => void;
}

export default function SingleNoteGame({ onGameEnd }: GameScreenProps) {
  const { gameLogic, gameSettings } = useGameContext();
  const {
    animatedNotes,
    setNotesWithCreation,
    triggerDestruction,
    handleNoteAnimationComplete,
    isAnimating,
  } = useNoteAnimations();
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimeout, setFeedbackTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { top } = useSafeAreaInsets();

  const textColor = useThemeColor({}, 'text');

  // Generate new question when game starts or after answering
  useEffect(() => {
    if (
      gameLogic.gameState.isGameActive &&
      !gameLogic.gameState.currentQuestion.notes.length
    ) {
      gameLogic.generateNewQuestion(gameSettings.gameSettings);
    }
  }, [
    gameLogic,
    gameSettings.gameSettings,
  ]);

  // Update animated notes when question changes
  useEffect(() => {
    if (gameLogic.gameState.currentQuestion.notes.length > 0) {
      setNotesWithCreation(gameLogic.gameState.currentQuestion.notes);
    }
  }, [gameLogic.gameState.currentQuestion.notes, setNotesWithCreation]);

  const handleAnswerSubmit = (answers: string) => {
    // Convert display name to Notes enum value
    const notesAnswer = convertDisplayNamesToNotes(
      [answers],
      gameSettings.gameSettings.notationSystem,
    );
    gameLogic.submitAnswer(notesAnswer);
    setShowFeedback(true);

    // Use extracted business logic - compare with actual notes
    const correctNotes = gameLogic.gameState.currentQuestion.notes.map(
      (note) => note.name,
    );
    const isCorrect = validateAnswer(notesAnswer, correctNotes);
    triggerGameHaptics(isCorrect);

    // Auto-advance timing based on game mode and correctness
    const delay = getAutoAdvanceDelay(
      gameSettings.gameSettings.gameMode,
      isCorrect,
    );

    // Trigger note destruction animation
    triggerDestruction(isCorrect, () => {
      // Animation complete - proceed to next question
      setShowFeedback(false);
      gameLogic.nextQuestion();
      gameLogic.generateNewQuestion(gameSettings.gameSettings);
    });

    const timeout = setTimeout(() => {
      // Fallback in case animation doesn't complete
      if (!isAnimating) {
        setShowFeedback(false);
        gameLogic.nextQuestion();
        gameLogic.generateNewQuestion(gameSettings.gameSettings);
      }
    }, delay);

    setFeedbackTimeout(timeout);
  };

  const handleNextQuestion = () => {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }
    setShowFeedback(false);
    gameLogic.nextQuestion();
    gameLogic.generateNewQuestion(gameSettings.gameSettings);
  };

  const handleEndGame = () => {
    Alert.alert('End Game', 'Are you sure you want to end the current game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Game',
        style: 'destructive',
        onPress: async () => {
          await gameLogic.endGame(gameSettings.gameSettings);
          router.back();
        },
      },
    ]);
  };

  if (!gameLogic.gameState.isGameActive) {
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
          score={gameLogic.gameState.score}
          streak={gameLogic.gameState.streak}
          maxStreak={gameLogic.gameState.maxStreak}
          totalQuestions={gameLogic.gameState.totalQuestions}
          correctAnswers={gameLogic.gameState.correctAnswers}
          animateStreak={
            showFeedback && isAnswerCorrect(gameLogic.gameState.currentQuestion)
          }
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
            notes={animatedNotes}
            showFeedback={showFeedback}
            isCorrect={isAnswerCorrect(gameLogic.gameState.currentQuestion)}
            showNoteLabels={gameSettings.gameSettings.showNoteLabels}
            notationSystem={gameSettings.gameSettings.notationSystem}
            streakLevel={getStreakLevel(gameLogic.gameState.streak)}
            width={350}
            height={180}
            onNoteAnimationComplete={handleNoteAnimationComplete}
          />
        </View>

        {/* Answer Options */}
        <View className="pb-8">
          <AnswerButtons
            options={gameLogic.gameState.currentQuestion.options}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={gameLogic.gameState.currentQuestion.answered}
          />
        </View>

        {/* Feedback and Next Button */}
        {false && showFeedback && (
          <View className="items-center mt-5 px-6">
            {/* Show feedback text only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameSettings.gameMode !== GameMode.SINGLE_NOTE ||
              !isAnswerCorrect(gameLogic.gameState.currentQuestion)) && (
              <ThemedText
                className="text-xl font-bold mb-2"
                style={{
                  color: isAnswerCorrect(gameLogic.gameState.currentQuestion)
                    ? '#4CAF50'
                    : '#F44336',
                }}
              >
                {isAnswerCorrect(gameLogic.gameState.currentQuestion)
                  ? 'Correct! 🎉'
                  : 'Try again! 💪'}
              </ThemedText>
            )}

            {/* Subtle correct indicator for single-note mode */}
            {gameSettings.gameSettings.gameMode === GameMode.SINGLE_NOTE &&
              isAnswerCorrect(gameLogic.gameState.currentQuestion) && (
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

            {!isAnswerCorrect(gameLogic.gameState.currentQuestion) && (
              <ThemedText
                className="text-base mb-4 text-center"
                style={{ color: textColor }}
              >
                Correct answer:{' '}
                {gameLogic.gameState.currentQuestion.notes
                  .map((note) =>
                    getNoteDisplayName(
                      note.name,
                      gameSettings.gameSettings.notationSystem,
                    ),
                  )
                  .join(', ')}
              </ThemedText>
            )}

            {/* Show next button only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameSettings.gameMode !== GameMode.SINGLE_NOTE ||
              !isAnswerCorrect(gameLogic.gameState.currentQuestion)) && (
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
