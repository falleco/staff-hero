import { AnswerButtons } from '@/components/game/answer-buttons';
import { RhythmHero } from '@/components/game/rhythm-hero';
import { ScoreDisplay } from '@/components/game/score-display';
import { SequenceGame } from '@/components/game/sequence-game';
import { MusicStaff } from '@/components/music/music-staff';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getAutoAdvanceDelay, getStreakLevel, triggerGameHaptics, validateAnswer } from '@/utils/game-logic';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GameScreenProps {
  onGameEnd?: () => void;
}


export function GameScreen({ onGameEnd }: GameScreenProps) {
  const { gameState, gameSettings, submitAnswer, nextQuestion, endGame, generateNewQuestion } = useGame();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimeout, setFeedbackTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  // Generate new question when game starts or after answering
  useEffect(() => {
    if (gameState.isGameActive && !gameState.currentQuestion.notes.length) {
      generateNewQuestion();
    }
  }, [gameState.isGameActive, gameState.currentQuestion, generateNewQuestion]);

  const handleAnswerSubmit = (answers: string[]) => {
    submitAnswer(answers);
    setShowFeedback(true);
    
    // Use extracted business logic
    const isCorrect = validateAnswer(answers, gameState.currentQuestion.correctAnswer);
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
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with score and controls */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <ScoreDisplay
          score={gameState.score}
          streak={gameState.streak}
          maxStreak={gameState.maxStreak}
          totalQuestions={gameState.totalQuestions}
          correctAnswers={gameState.correctAnswers}
          animateStreak={showFeedback && gameState.currentQuestion.isCorrect}
        />
        
        <Pressable
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl px-4 py-2 border-2 border-white/20 shadow-lg"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
          onPress={handleEndGame}
        >
          <ThemedText className="text-sm font-bold text-white">
            END GAME
          </ThemedText>
        </Pressable>
      </View>

      {/* Game content */}
      <View className="flex-1">
        {/* Render different game modes */}
        {gameSettings.gameMode === 'single-note' && (
          <>
            {/* Instructions */}
            <View className="px-6 py-6">
              <View className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-center justify-center mb-2">
                  <View className="bg-yellow-500/20 rounded-full p-2 mr-2">
                    <ThemedText className="text-lg">🎯</ThemedText>
                  </View>
                  <ThemedText className="text-xl font-black text-white">
                    IDENTIFY THE NOTE
                  </ThemedText>
                </View>
                <ThemedText className="text-sm text-center text-white/80 font-semibold">
                  Using {gameSettings.notationSystem === 'letter' ? '🔤 Letter' : '🎵 Solfege'} Notation
                </ThemedText>
              </View>
            </View>

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
                correctAnswers={gameState.currentQuestion.correctAnswer}
                isMultiSelect={false}
                onAnswerSubmit={handleAnswerSubmit}
                disabled={gameState.currentQuestion.answered}
                showFeedback={showFeedback}
              />
            </View>
          </>
        )}

        {gameSettings.gameMode === 'sequence' && (
          <SequenceGame
            question={gameState.currentQuestion}
            gameSettings={gameSettings}
            onAnswerSubmit={handleAnswerSubmit}
            showFeedback={showFeedback}
            streakLevel={getStreakLevel(gameState.streak)}
          />
        )}

        {gameSettings.gameMode === 'rhythm' && (
          <RhythmHero
            question={gameState.currentQuestion}
            gameSettings={gameSettings}
            onAnswerSubmit={(hitNotes, accuracy) => {
              // For rhythm mode, success is based on hitting enough notes with good timing
              const isCorrect = accuracy > 60;
              if (isCorrect) {
                handleAnswerSubmit(hitNotes);
              } else {
                handleAnswerSubmit([]); // Mark as incorrect
              }
            }}
            showFeedback={showFeedback}
            streakLevel={getStreakLevel(gameState.streak)}
          />
        )}

        {/* Feedback and Next Button */}
        {showFeedback && (
          <View className="items-center mt-5 px-6">
            {/* Show feedback text only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameMode !== 'single-note' || !gameState.currentQuestion.isCorrect) && (
              <ThemedText 
                className="text-xl font-bold mb-2"
                style={{ 
                  color: gameState.currentQuestion.isCorrect ? '#4CAF50' : '#F44336' 
                }}
              >
                {gameState.currentQuestion.isCorrect ? 'Correct! 🎉' : 'Try again! 💪'}
              </ThemedText>
            )}
            
            {/* Subtle correct indicator for single-note mode */}
            {gameSettings.gameMode === 'single-note' && gameState.currentQuestion.isCorrect && (
              <View className="items-center my-2">
                <ThemedText className="text-2xl font-bold mb-1" style={{ color: '#4CAF50' }}>
                  ✓
                </ThemedText>
                <ThemedText className="text-sm opacity-70 italic" style={{ color: textColor }}>
                  Next question...
                </ThemedText>
              </View>
            )}
            
            {!gameState.currentQuestion.isCorrect && (
              <ThemedText className="text-base mb-4 text-center" style={{ color: textColor }}>
                Correct answer: {gameState.currentQuestion.correctAnswer.join(', ')}
              </ThemedText>
            )}
            
            {/* Show next button only for incorrect answers in single-note mode, or always for other modes */}
            {(gameSettings.gameMode !== 'single-note' || !gameState.currentQuestion.isCorrect) && (
              <Pressable
                className="px-8 py-3 rounded-full"
                style={{ backgroundColor: tintColor }}
                onPress={handleNextQuestion}
              >
                <ThemedText className="text-white text-base font-semibold">
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
