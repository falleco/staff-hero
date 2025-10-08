import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import { AnswerButtons } from '@/components/game/answer-buttons';
import { ScoreDisplay } from '@/components/game/score-display';
import { MusicStaff } from '@/components/music-staff';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGameContext } from '@/hooks/use-game-context';
import { useNoteAnimations } from '@/hooks/use-note-animations';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Note, Notes } from '@/types/music';
import { getStreakLevel, triggerGameHaptics } from '@/utils/game-logic';
import {
  convertDisplayNamesToNotes,
  generateRandomNote,
  getNoteDisplayName,
} from '@/utils/music-utils';

// Configuration
const COUNTDOWN_SECONDS = 3;
const NOTE_COUNT = 10;
const LINE_SPEED = 5000; // Time in ms for line to cross the staff (slower = easier)
const HIT_WINDOW = 150; // Time window in ms to hit the note (larger = easier)
const STAFF_WIDTH = 350; // Should match MusicStaff width

interface NoteStatus {
  note: Note;
  hit: boolean;
  missed: boolean;
  answered: boolean;
}

export default function RhythmGame() {
  const { gameLogic, gameSettings } = useGameContext();
  const {
    animatedNotes,
    setNotesWithCreation,
    highlightNoteAtIndex,
    handleNoteAnimationComplete,
  } = useNoteAnimations();

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false); // Show results screen after all notes
  const [noteStatuses, setNoteStatuses] = useState<NoteStatus[]>([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [linePosition] = useState(new Animated.Value(0));
  const lineAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverRef = useRef(false); // Track game over state to prevent multiple alerts

  const { top } = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');

  // Initialize game on mount
  useEffect(() => {
    // Ensure game is active
    if (!gameLogic.gameState.isGameActive) {
      gameLogic.startGame(gameSettings.gameSettings);
    }
  }, []);

  // Generate 10 notes when game starts
  useEffect(() => {
    if (gameLogic.gameState.isGameActive && noteStatuses.length === 0) {
      generateRhythmNotes();
    }
  }, [gameLogic.gameState.isGameActive, noteStatuses.length]);

  // Update animated notes when noteStatuses change
  useEffect(() => {
    if (noteStatuses.length > 0) {
      const notes = noteStatuses.map((status) => status.note);
      setNotesWithCreation(notes);
    }
  }, [noteStatuses, setNotesWithCreation]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && noteStatuses.length > 0 && !gameStarted) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && !gameStarted && noteStatuses.length > 0) {
      startLineAnimation();
    }
  }, [countdown, gameStarted, noteStatuses.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      gameOverRef.current = true;
      
      if (lineAnimationRef.current) {
        lineAnimationRef.current.stop();
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      
      // Remove all listeners from animated value
      linePosition.removeAllListeners();
    };
  }, []);

  const generateRhythmNotes = () => {
    // Generate 10 different notes directly
    const notes: NoteStatus[] = [];
    
    for (let i = 0; i < NOTE_COUNT; i++) {
      const note = generateRandomNote(gameSettings.gameSettings.difficulty);
      notes.push({
        note,
        hit: false,
        missed: false,
        answered: false,
      });
    }

    setNoteStatuses(notes);
    
    // Generate a question to populate the answer options
    gameLogic.generateNewQuestion(gameSettings.gameSettings);
  };

  const startLineAnimation = () => {
    setGameStarted(true);

    // Animate line from 0 to STAFF_WIDTH
    lineAnimationRef.current = Animated.timing(linePosition, {
      toValue: STAFF_WIDTH,
      duration: LINE_SPEED,
      useNativeDriver: false,
    });

    lineAnimationRef.current.start(({ finished }) => {
      if (finished) {
        // Line animation finished - results will show automatically if all notes answered
        // Any unanswered notes will be marked as missed by the checker
      }
    });

    // Start checking for missed notes
    startMissedNoteChecker();
  };

  const startMissedNoteChecker = () => {
    // Add a single listener to check for missed notes as line moves
    const listenerId = linePosition.addListener(({ value }) => {
      if (!gameOverRef.current) {
        checkForMissedNotes(value);
      }
    });
    
    // Store the listener ID for cleanup
    return listenerId;
  };

  const checkForMissedNotes = (linePos: number) => {
    if (gameOverRef.current || gameOver) return;

    // Calculate which note should be at this position
    const noteWidth = STAFF_WIDTH / NOTE_COUNT;
    const expectedIndex = Math.floor(linePos / noteWidth);

    // Check if we've passed a note that wasn't answered
    if (expectedIndex > currentNoteIndex) {
      const missedNote = noteStatuses[currentNoteIndex];
      if (missedNote && !missedNote.answered) {
        handleMissedNote(currentNoteIndex);
      }
      setCurrentNoteIndex(expectedIndex);
    }
  };

  const handleMissedNote = (index: number) => {
    // Mark note as missed
    setNoteStatuses((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], missed: true, answered: true };
      }
      
      // Check if all notes completed
      const allAnswered = updated.every((n) => n.answered);
      if (allAnswered) {
        // Show results after a short delay
        setTimeout(() => {
          setShowResults(true);
        }, 500);
      }
      
      return updated;
    });

    // Trigger feedback (red animation)
    highlightNoteAtIndex(index);
    triggerGameHaptics(false);

    // Don't end game - let it continue
  };

  const handleAnswerSubmit = (answer: string) => {
    if (gameOver || !gameStarted || showResults) return;

    // Get current line position
    const currentPos = (linePosition as any)._value;
    const noteWidth = STAFF_WIDTH / NOTE_COUNT;
    
    // Find which note the line is closest to
    let closestNoteIndex = Math.round(currentPos / noteWidth);
    
    // Clamp to valid range
    closestNoteIndex = Math.max(0, Math.min(NOTE_COUNT - 1, closestNoteIndex));
    
    // Calculate distance to that note's center
    const noteCenter = closestNoteIndex * noteWidth + noteWidth / 2;
    const distance = Math.abs(currentPos - noteCenter);

    // Check if we're within the hit window
    if (distance > noteWidth / 2) {
      // Too far from any note - ignore input
      return;
    }

    // Check if this note was already answered
    const currentNote = noteStatuses[closestNoteIndex];
    if (!currentNote || currentNote.answered) {
      return; // Note already answered
    }

    // Convert display name to Notes enum value
    const notesAnswer = convertDisplayNamesToNotes(
      [answer],
      gameSettings.gameSettings.notationSystem,
    );

    // Check if answer matches the note
    const isCorrect = notesAnswer[0] === currentNote.note.name;

    if (isCorrect) {
      handleCorrectAnswer(closestNoteIndex);
    } else {
      handleWrongAnswer(closestNoteIndex);
    }
  };

  const handleCorrectAnswer = (index: number) => {
    // Mark note as hit
    setNoteStatuses((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], hit: true, answered: true };
      }
      
      // Check if all notes completed
      const allAnswered = updated.every((n) => n.answered);
      if (allAnswered) {
        // Show results after a short delay
        setTimeout(() => {
          setShowResults(true);
        }, 500);
      }
      
      return updated;
    });

    // Trigger feedback (green animation)
    highlightNoteAtIndex(index);
    triggerGameHaptics(true);

    // Update score
    gameLogic.submitAnswer([noteStatuses[index].note.name]);
  };

  const handleWrongAnswer = (index: number) => {
    // Mark note as missed
    setNoteStatuses((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], missed: true, answered: true };
      }
      
      // Check if all notes completed
      const allAnswered = updated.every((n) => n.answered);
      if (allAnswered) {
        // Show results after a short delay
        setTimeout(() => {
          setShowResults(true);
        }, 500);
      }
      
      return updated;
    });

    // Trigger feedback (red animation)
    highlightNoteAtIndex(index);
    triggerGameHaptics(false);

    // Don't end game - let it continue
  };

  const handleExitGame = async () => {
    // End the game and navigate back
    await gameLogic.endGame(gameSettings.gameSettings);
    router.back();
  };

  const handleGameEnd = (success: boolean) => {
    // Prevent multiple calls
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    
    // Stop animations
    if (lineAnimationRef.current) {
      lineAnimationRef.current.stop();
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    setGameOver(true);

    const message = success
      ? 'Great job! You completed all notes!'
      : 'Game Over! You missed a note.';

    Alert.alert(
      success ? 'Success!' : 'Game Over',
      `${message}\nScore: ${gameLogic.gameState.score}`,
      [
        {
          text: 'OK',
          onPress: async () => {
            await gameLogic.endGame(gameSettings.gameSettings);
            router.back();
          },
        },
      ],
    );
  };

  const handleEndGame = () => {
    Alert.alert('End Game', 'Are you sure you want to end the current game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Game',
        style: 'destructive',
        onPress: async () => {
          if (lineAnimationRef.current) {
            lineAnimationRef.current.stop();
          }
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
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
        colors={['#FF6B6B', '#FF8E53']}
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
          totalQuestions={noteStatuses.filter((n) => n.answered).length}
          correctAnswers={noteStatuses.filter((n) => n.hit).length}
          animateStreak={false}
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
        {/* Instructions / Countdown / Results */}
        <View className="px-6 py-4">
          {!gameStarted ? (
            <View className="items-center">
              <ThemedText
                className="text-4xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {countdown}
              </ThemedText>
              <ThemedText
                className="text-xl font-bold text-center"
                style={{ color: textColor }}
              >
                Get Ready!
              </ThemedText>
              <ThemedText
                className="text-sm text-center opacity-70 mt-2"
                style={{ color: textColor }}
              >
                Press the correct note when the red line is over it
              </ThemedText>
            </View>
          ) : showResults ? (
            <View className="items-center">
              <ThemedText
                className="text-2xl font-bold text-center mb-3"
                style={{ color: textColor }}
              >
                🎵 Results 🎵
              </ThemedText>
              <View className="flex-row gap-6">
                <View className="items-center">
                  <ThemedText
                    className="text-3xl font-bold text-green-400"
                  >
                    {noteStatuses.filter((n) => n.hit).length}
                  </ThemedText>
                  <ThemedText
                    className="text-sm opacity-70"
                    style={{ color: textColor }}
                  >
                    Correct
                  </ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText
                    className="text-3xl font-bold text-red-400"
                  >
                    {noteStatuses.filter((n) => n.missed).length}
                  </ThemedText>
                  <ThemedText
                    className="text-sm opacity-70"
                    style={{ color: textColor }}
                  >
                    Missed
                  </ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText
                    className="text-3xl font-bold"
                    style={{ color: textColor }}
                  >
                    {gameLogic.gameState.score}
                  </ThemedText>
                  <ThemedText
                    className="text-sm opacity-70"
                    style={{ color: textColor }}
                  >
                    Score
                  </ThemedText>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center">
              <ThemedText
                className="text-xl font-bold text-center"
                style={{ color: textColor }}
              >
                Hit the notes!
              </ThemedText>
              <ThemedText
                className="text-sm text-center opacity-70 mt-1"
                style={{ color: textColor }}
              >
                {noteStatuses.filter((n) => n.hit).length} / {NOTE_COUNT} notes
                hit
              </ThemedText>
            </View>
          )}
        </View>

        {/* Music Staff with moving line */}
        <View className="flex-1 justify-center items-center px-4">
          <View style={{ position: 'relative', width: STAFF_WIDTH }}>
            <MusicStaff
              notes={animatedNotes}
              showFeedback={false}
              isCorrect={false}
              showNoteLabels={gameSettings.gameSettings.showNoteLabels}
              notationSystem={gameSettings.gameSettings.notationSystem}
              streakLevel={getStreakLevel(gameLogic.gameState.streak)}
              width={STAFF_WIDTH}
              height={180}
              onNoteAnimationComplete={handleNoteAnimationComplete}
            />

            {/* Moving red line */}
            <Animated.View
              style={{
                position: 'absolute',
                left: linePosition,
                top: 0,
                bottom: 0,
                width: 3,
                backgroundColor: '#FF0000',
                zIndex: 100,
                shadowColor: '#FF0000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
          </View>
        </View>

        {/* Answer Options or Exit Button */}
        <View className="pb-8 px-6">
          {!showResults ? (
            <AnswerButtons
              options={gameLogic.gameState.currentQuestion.options}
              onAnswerSubmit={handleAnswerSubmit}
              disabled={gameOver || !gameStarted}
            />
          ) : (
            <FlatButton
              size="xl"
              onPress={handleExitGame}
              className="rounded-xl px-6 py-4 border-green-400 bg-green-800 text-[#ffffff] border-2"
            >
              <FlatButtonText className="text-xl font-bold text-white">
                EXIT & SAVE RESULTS
              </FlatButtonText>
            </FlatButton>
          )}
        </View>
      </View>
    </>
  );
}
