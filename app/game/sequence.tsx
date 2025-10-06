import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import { AnswerButtons } from '@/components/game/answer-buttons';
import { ScoreDisplay } from '@/components/game/score-display';
import { MusicStaff } from '@/components/music-staff';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/hooks/use-game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';
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

export default function SequenceGame() {
  const { gameLogic, gameSettings } = useGameContext();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimeout, setFeedbackTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
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
    gameLogic.gameState.isGameActive,
    gameLogic.gameState.currentQuestion,
    gameLogic.generateNewQuestion,
  ]);

  // Reset sequence when new question
  useEffect(() => {
    setUserSequence([]);
    setCurrentNoteIndex(0);
  }, [
    gameLogic.gameState.currentQuestion.id,
    gameLogic.gameState.currentQuestion.notes,
  ]);

  const handleNoteSelect = (noteName: string) => {
    if (showFeedback) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newSequence = [...userSequence, noteName];
    setUserSequence(newSequence);
    setCurrentNoteIndex(currentNoteIndex + 1);

    // If sequence is complete, submit answer
    if (
      newSequence.length === gameLogic.gameState.currentQuestion.notes.length
    ) {
      handleAnswerSubmit(newSequence);
    }
  };

  const answerSequence = useMemo(() => {
    return Object.assign(
      new Array(gameLogic.gameState.currentQuestion.notes.length).fill(null),
      userSequence,
    );
  }, [gameLogic.gameState.currentQuestion.notes, userSequence]);

  const handleAnswerSubmit = (answers: string[]) => {
    // Convert display names to Notes enum values
    const notesAnswer = convertDisplayNamesToNotes(
      answers,
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

    const timeout = setTimeout(() => {
      setShowFeedback(false);
      gameLogic.nextQuestion();
      gameLogic.generateNewQuestion(gameSettings.gameSettings);
    }, delay);

    setFeedbackTimeout(timeout);
  };

  const handleReset = () => {
    if (showFeedback) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserSequence([]);
    setCurrentNoteIndex(0);
  };

  const handleEndGame = () => {
    Alert.alert('End Game', 'Are you sure you want to end the current game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Game',
        style: 'destructive',
        onPress: () => {
          gameLogic.endGame(gameSettings.gameSettings);
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
          className="rounded-xl px-4 py-2 border-red-400 bg-red-800 text-[#ffffff] border-2"
        >
          <FlatButtonText className="text-sm font-bold text-white">
            END GAME
          </FlatButtonText>
        </FlatButton>
      </View>

      {/* Game content */}
      <View className="flex-1">
        {/* Instructions */}
        <View className="px-6 py-4">
          <ThemedText
            className="text-xl font-bold text-center mb-2"
            style={{ color: textColor }}
          >
            Identify the sequence:
          </ThemedText>
          <ThemedText
            className="text-sm text-center opacity-70 mb-2"
            style={{ color: textColor }}
          >
            Select notes from left to right ({userSequence.length}/
            {gameLogic.gameState.currentQuestion.notes.length})
          </ThemedText>

          {/* Progress indicator */}
          <View className="flex-row justify-center items-center gap-2 mt-2">
            {gameLogic.gameState.currentQuestion.notes.map((note, index) => (
              <View
                key={`${note.name}-${index}`}
                className={cn(
                  'w-3 h-3 rounded-full',
                  index < userSequence.length
                    ? 'bg-green-500'
                    : index === userSequence.length
                      ? 'bg-blue-500'
                      : 'bg-gray-300',
                )}
              />
            ))}
          </View>
        </View>

        {/* Music Staff */}
        <View className="flex-1 justify-center items-center px-4">
          <MusicStaff
            notes={gameLogic.gameState.currentQuestion.notes}
            showFeedback={showFeedback}
            isCorrect={isAnswerCorrect(gameLogic.gameState.currentQuestion)}
            showNoteLabels={gameSettings.gameSettings.showNoteLabels}
            notationSystem={gameSettings.gameSettings.notationSystem}
            streakLevel={getStreakLevel(gameLogic.gameState.streak)}
            width={350}
            height={180}
          />
        </View>

        {/* Selected sequence display */}
        {answerSequence.length > 0 && (
          <View className="px-6 py-2">
            <ThemedText
              className="text-center text-sm opacity-70 mb-2"
              style={{ color: textColor }}
            >
              Your Answer:
            </ThemedText>
            <View className="flex-row justify-center gap-2">
              {answerSequence.map((note, index) => (
                <View
                  key={`selected-${note}-${Date.now()}-${index}`}
                  className="px-3 py-1 bg-green-100 rounded-lg"
                >
                  <ThemedText
                    className="text-sm font-medium"
                    style={{ color: '#000' }}
                  >
                    {note ?? '?'}
                  </ThemedText>
                </View>
              ))}
              {/* Reset button */}
              {userSequence.length > 0 && !showFeedback && (
                <FlatButton
                  size="xs"
                  onPress={handleReset}
                  className="p-0 m-0 rounded-lg"
                >
                  <Image
                    style={{ width: 16, height: 16 }}
                    source={require('@/assets/images/hud/close.png')}
                  />
                </FlatButton>
              )}
            </View>
          </View>
        )}

        {/* Answer Options */}
        <View className="pb-8">
          <AnswerButtons
            options={gameLogic.gameState.currentQuestion.options}
            onAnswerSubmit={handleNoteSelect}
          />
        </View>
      </View>
    </>
  );
}
