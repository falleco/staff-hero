import { GameSession } from '@/types/analytics';
import { GameSettings, GameState, NotationSystem, Question } from '@/types/music';
import { addGameSession } from '@/utils/analytics-storage';
import { generateQuestion } from '@/utils/music-utils';
import React, { createContext, ReactNode, useContext, useReducer } from 'react';

interface GameContextType {
  gameState: GameState;
  gameSettings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => void;
  endGame: () => void;
  submitAnswer: (answer: string[]) => void;
  nextQuestion: () => void;
  resetStreak: () => void;
  generateNewQuestion: () => void;
}

type GameAction = 
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'SUBMIT_ANSWER'; payload: string[] }
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
    correctAnswer: [],
    options: [],
    answered: false,
  },
  isGameActive: false,
};

// Track game session for analytics
let gameStartTime: number = 0;

const initialGameSettings: GameSettings = {
  notationSystem: 'letter' as NotationSystem,
  difficulty: 'beginner',
  gameMode: 'single-note',
  showNoteLabels: false, // Default to hidden for challenge
};

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
      };
    
    case 'SUBMIT_ANSWER': {
      const isCorrect = JSON.stringify(action.payload.sort()) === 
                       JSON.stringify(state.currentQuestion.correctAnswer.sort());
      
      const newStreak = isCorrect ? state.streak + 1 : 0;
      const points = isCorrect ? (10 + state.streak * 2) : 0;
      
      return {
        ...state,
        currentQuestion: {
          ...state.currentQuestion,
          answered: true,
          isCorrect,
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
          correctAnswer: [],
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

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [gameSettings, setGameSettings] = React.useState<GameSettings>(initialGameSettings);

  const updateSettings = (settings: Partial<GameSettings>) => {
    setGameSettings(prev => ({ ...prev, ...settings }));
  };

  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const endGame = async () => {
    // Save game session to analytics before ending
    if (gameState.isGameActive && gameStartTime > 0) {
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      const accuracy = gameState.totalQuestions > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) 
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

  const submitAnswer = (answer: string[]) => {
    dispatch({ type: 'SUBMIT_ANSWER', payload: answer });
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const resetStreak = () => {
    dispatch({ type: 'RESET_STREAK' });
  };

  const generateNewQuestion = () => {
    const newQuestion = generateQuestion(gameSettings);
    dispatch({ type: 'SET_QUESTION', payload: newQuestion });
  };

  const value: GameContextType = {
    gameState,
    gameSettings,
    updateSettings,
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    resetStreak,
    generateNewQuestion,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
