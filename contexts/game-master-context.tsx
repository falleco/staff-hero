import React, { createContext, type ReactNode, useState } from 'react';

export enum NoteName {
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  A = 'A',
  B = 'B',
}

export enum NoteType {
  SEMIBREVE = 'semibreve',
  BREVE = 'breve',
  WHOLE = 'whole',
  HALF = 'half',
  QUARTER = 'quarter',
  EIGHTH = 'eighth',
  SIXTEENTH = 'sixteenth',
}

export interface Note {
  name: NoteName;
  octave: number;
  type: NoteType;
}

export enum GameMode {
  SINGLE = 'single',
  SEQUENCE = 'sequence',
  RHYTHM = 'rhythm',
}

export interface GameAnswer {
  answer: string;
  isCorrect: boolean;
}

export interface GameQuestion {
  id: string;
  notes: Note[];
  answers: GameAnswer[];
}

export enum Notation {
  LETTER_COMMON = 'letter_common',
  SOLFEGE = 'solfege',
}

export interface GameState {
  startTime: number;
  currentScore: number;
  currentStreak: number;
  maxStreak: number;
  totalQuestions: number;
  totalCorrectAnswers: number;
  currentQuestion: GameQuestion;
  isGameActive: boolean;
  timeRemaining?: number;
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface GameSettings {
  notation: Notation;
  difficulty: Difficulty;
  gameMode: GameMode;
  showNoteLabels: boolean;
  timeLimit?: number;
}

interface GameContextType {
  state: GameState;
  settings: GameSettings;
  setGameState: (state: GameState) => void;
  setGameSettings: (settings: GameSettings) => void;
}

const initialGameState: GameState = {
  startTime: 0,
  currentScore: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalQuestions: 0,
  totalCorrectAnswers: 0,
  currentQuestion: {
    id: '',
    notes: [],
    answers: [],
  },
  isGameActive: false,
};

const initialGameSettings: GameSettings = {
  notation: Notation.SOLFEGE,
  difficulty: Difficulty.BEGINNER,
  gameMode: GameMode.SINGLE,
  showNoteLabels: true,
};

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [gameSettings, setGameSettings] =
    React.useState<GameSettings>(initialGameSettings);

  const value: GameContextType = {
    state: gameState,
    settings: gameSettings,
    setGameState,
    setGameSettings,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
