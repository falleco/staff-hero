import { useReducer } from 'react';
import type { GameSession } from '@/types/analytics';
import type { GameSettings, GameState, Notes, Question } from '@/types/music';
import { ChallengeType } from '@/types/music';
import { addGameSession } from '@/utils/analytics-storage';
import { generateQuestion } from '@/utils/music-utils';

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'SUBMIT_ANSWER'; payload: Notes[] }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_STREAK' }
  | { type: 'SET_QUESTION'; payload: Question };

const initialGameState: GameState = {
  score: 0,
  streak: 0,
  maxStreak: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  currentQuestion: {
    id: '',
    notes: [],
    options: [],
    answered: false,
  },
  isGameActive: false,
};

// Track game session for analytics
let gameStartTime = 0;

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      gameStartTime = Date.now();
      return {
        ...state,
        isGameActive: true,
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      };

    case 'END_GAME':
      return {
        ...state,
        isGameActive: false,
        currentQuestion: {
          id: '',
          notes: [],
          options: [],
          answered: false,
        },
      };

    case 'SUBMIT_ANSWER': {
      // Convert user answer from display strings to Notes enum values
      const correctNotes = state.currentQuestion.notes.map((note) => note.name);
      const isCorrect =
        JSON.stringify(action.payload.sort()) ===
        JSON.stringify(correctNotes.sort());

      // Comprehensive answer logging
      console.log('🎯 ANSWER SUBMITTED:');
      console.log('  Question ID:', state.currentQuestion.id);
      console.log(
        '  Notes shown:',
        state.currentQuestion.notes.map(
          (n) => `${n.name}${n.octave} at position ${n.staffPosition}`,
        ),
      );
      console.log('  Expected answer:', correctNotes);
      console.log('  User selected:', action.payload);
      console.log('  Result:', isCorrect ? '✅ CORRECT' : '❌ INCORRECT');
      if (!isCorrect) {
        console.log('  ❗ Mismatch details:');
        console.log('    Expected (sorted):', correctNotes.sort());
        console.log('    User answer (sorted):', action.payload.sort());
      }
      console.log(
        '  Current streak:',
        state.streak,
        '→',
        isCorrect ? state.streak + 1 : 0,
      );
      console.log('---');

      const newStreak = isCorrect ? state.streak + 1 : 0;
      const points = isCorrect ? 10 + state.streak * 2 : 0;

      return {
        ...state,
        currentQuestion: {
          ...state.currentQuestion,
          answered: true,
          userAnswer: action.payload,
        },
        score: state.score + points,
        streak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
        totalQuestions: state.totalQuestions + 1,
        correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
      };
    }

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: {
          id: '',
          notes: [],
          options: [],
          answered: false,
        },
      };

    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
      };

    case 'RESET_STREAK':
      return {
        ...state,
        streak: 0,
      };

    default:
      return state;
  }
}

export interface UseGameLogicReturn {
  /** Current game state including score, streak, and current question */
  gameState: GameState;
  /** Start a new game session and reset all counters */
  startGame: (gameSettings: GameSettings) => void;
  /** End the current game session and save analytics data */
  endGame: (gameSettings: GameSettings) => Promise<void>;
  /** Submit an answer for the current question */
  submitAnswer: (answer: Notes[]) => void;
  /** Move to the next question (clears current question) */
  nextQuestion: () => void;
  /** Reset the current streak to zero */
  resetStreak: () => void;
  /** Generate and set a new question based on current settings */
  generateNewQuestion: (gameSettings: GameSettings) => void;
  /** Set callback for challenge progress updates */
  setChallengeProgressCallback: (
    callback: (type: ChallengeType, amount: number) => void,
  ) => void;
}

/**
 * Custom hook for managing game logic and state
 *
 * Handles all game-related actions including starting/ending games,
 * submitting answers, managing score and streaks, and generating questions.
 *
 * @returns Object containing game state and action methods
 *
 * @example
 * ```tsx
 * const {
 *   gameState,
 *   startGame,
 *   endGame,
 *   submitAnswer,
 *   generateNewQuestion
 * } = useGameLogic();
 *
 * // Start a new game
 * startGame(gameSettings);
 *
 * // Submit an answer
 * submitAnswer(['Do', 'Re', 'Mi']);
 *
 * // Generate next question
 * generateNewQuestion(gameSettings);
 * ```
 */
export function useGameLogic(): UseGameLogicReturn {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  let challengeProgressCallback:
    | ((type: ChallengeType, amount: number) => void)
    | null = null;

  /**
   * Starts a new game session with the provided settings
   * Resets all counters and initializes game state
   *
   * @param gameSettings - Current game configuration
   */
  const startGame = (gameSettings: GameSettings) => {
    console.log('🎮 GAME STARTED:');
    console.log('  Notation system:', gameSettings.notationSystem);
    console.log('  Difficulty:', gameSettings.difficulty);
    console.log('  Game mode:', gameSettings.gameMode);
    console.log('  Show labels:', gameSettings.showNoteLabels);
    console.log('====================');
    dispatch({ type: 'START_GAME' });

    // Update challenge progress for battle count
    if (challengeProgressCallback) {
      challengeProgressCallback(ChallengeType.BATTLE_COUNT, 1);
    }
  };

  /**
   * Ends the current game session and saves analytics data
   * Creates a game session record with performance metrics
   *
   * @param gameSettings - Current game configuration
   */
  const endGame = async (gameSettings: GameSettings) => {
    // Save game session to analytics before ending
    if (gameState.isGameActive && gameStartTime > 0) {
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      const accuracy =
        gameState.totalQuestions > 0
          ? Math.round(
              (gameState.correctAnswers / gameState.totalQuestions) * 100,
            )
          : 0;

      const session: GameSession = {
        id: `session_${Date.now()}`,
        date: new Date().toISOString(),
        gameMode: gameSettings.gameMode,
        difficulty: gameSettings.difficulty,
        notationSystem: gameSettings.notationSystem,
        score: gameState.score,
        streak: gameState.streak,
        maxStreak: gameState.maxStreak,
        totalQuestions: gameState.totalQuestions,
        correctAnswers: gameState.correctAnswers,
        accuracy,
        duration,
      };

      try {
        await addGameSession(session);
      } catch (error) {
        console.error('Error saving game session:', error);
      }
    }

    dispatch({ type: 'END_GAME' });
  };

  /**
   * Submits an answer for the current question
   * Calculates correctness, updates score and streak
   *
   * @param answer - Array of selected note names (Notes enum values)
   */
  const submitAnswer = (answer: Notes[]) => {
    dispatch({ type: 'SUBMIT_ANSWER', payload: answer });

    // Update challenge progress for score points
    if (challengeProgressCallback) {
      const correctNotes = gameState.currentQuestion.notes.map(
        (note) => note.name,
      );
      const isCorrect =
        JSON.stringify(answer.sort()) === JSON.stringify(correctNotes.sort());

      if (isCorrect) {
        const points = 10 + gameState.streak * 2;
        challengeProgressCallback(ChallengeType.SCORE_POINTS, points);
      }
    }
  };

  /**
   * Moves to the next question by clearing the current question state
   * Should be called after processing the current answer
   */
  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  /**
   * Resets the current streak counter to zero
   * Useful for penalty systems or manual streak resets
   */
  const resetStreak = () => {
    dispatch({ type: 'RESET_STREAK' });
  };

  /**
   * Generates a new question based on current game settings
   * Creates a random question appropriate for the difficulty and game mode
   *
   * @param gameSettings - Current game configuration
   */
  const generateNewQuestion = (gameSettings: GameSettings) => {
    const newQuestion = generateQuestion(gameSettings);
    console.log('🔄 GENERATING NEW QUESTION');
    console.log('  Game settings:', gameSettings);
    dispatch({ type: 'SET_QUESTION', payload: newQuestion });

    // Update challenge progress for dominate notes (simplified - just playing counts)
    if (challengeProgressCallback) {
      challengeProgressCallback(ChallengeType.DOMINATE_NOTES, 1);
    }
  };

  /**
   * Sets the callback function for challenge progress updates
   * @param callback - Function to call when challenge progress should be updated
   */
  const setChallengeProgressCallback = (
    callback: (type: ChallengeType, amount: number) => void,
  ) => {
    challengeProgressCallback = callback;
  };

  return {
    gameState,
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    resetStreak,
    generateNewQuestion,
    setChallengeProgressCallback,
  };
}
