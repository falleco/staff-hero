export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export type SolfegeName = 'Do' | 'Re' | 'Mi' | 'Fa' | 'Sol' | 'La' | 'Si';

export type NotationSystem = 'letter' | 'solfege';

export interface Note {
  name: NoteName;
  octave: number;
  // Position on the staff (0 = middle line, negative = below, positive = above)
  staffPosition: number;
  // Whether the note requires a ledger line
  requiresLedgerLine: boolean;
  // Note symbol type (for different note durations)
  symbolId?: string;
}

export interface GameSettings {
  notationSystem: NotationSystem;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gameMode: 'single-note' | 'chord' | 'sequence';
  showNoteLabels: boolean; // Helper for beginners
  timeLimit?: number; // in seconds
}

export interface GameState {
  score: number;
  streak: number;
  maxStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  currentQuestion: Question;
  isGameActive: boolean;
  timeRemaining?: number;
}

export interface Question {
  id: string;
  notes: Note[];
  correctAnswer: string[];
  options: string[];
  answered: boolean;
  isCorrect?: boolean;
  userAnswer?: string[];
}

export interface ScoreHistory {
  date: string;
  score: number;
  streak: number;
  accuracy: number;
  gameMode: string;
  difficulty: string;
}

// Mapping for note names in different notation systems
export const NOTE_MAPPINGS: Record<NotationSystem, Record<NoteName, string>> = {
  letter: {
    'C': 'C',
    'D': 'D', 
    'E': 'E',
    'F': 'F',
    'G': 'G',
    'A': 'A',
    'B': 'B'
  },
  solfege: {
    'C': 'Do',
    'D': 'Re',
    'E': 'Mi', 
    'F': 'Fa',
    'G': 'Sol',
    'A': 'La',
    'B': 'Si'
  }
};

// Staff positions for treble clef (middle line = 0)
export const TREBLE_CLEF_POSITIONS: Record<string, number> = {
  'F5': 4,   // Top line
  'E5': 3,   // Fourth line
  'D5': 2,   // Third line  
  'C5': 1,   // Second line
  'B4': 0,   // Middle line (staff line 1)
  'A4': -1,  // Below first line
  'G4': -2,  // Second line from bottom
  'F4': -3,  // Third line from bottom
  'E4': -4,  // Fourth line from bottom
  'D4': -5,  // Bottom line
  'C4': -6,  // Below bottom line (middle C)
};

// Staff position to note name mapping for labels (consistent with TREBLE_CLEF_POSITIONS)
export const STAFF_POSITION_TO_NOTE: Record<number, { letter: NoteName; octave: number }> = {
  4: { letter: 'F', octave: 5 },   // F5 - Top line
  3: { letter: 'E', octave: 5 },   // E5 - Fourth space  
  2: { letter: 'D', octave: 5 },   // D5 - Third line
  1: { letter: 'C', octave: 5 },   // C5 - Second space
  0: { letter: 'B', octave: 4 },   // B4 - Middle line
  [-1]: { letter: 'A', octave: 4 }, // A4 - First space
  [-2]: { letter: 'G', octave: 4 }, // G4 - Second line from bottom
  [-3]: { letter: 'F', octave: 4 }, // F4 - Space below staff
  [-4]: { letter: 'E', octave: 4 }, // E4 - Fourth line from bottom
  [-5]: { letter: 'D', octave: 4 }, // D4 - Bottom line
  [-6]: { letter: 'C', octave: 4 }, // C4 - Below staff (middle C)
};

export const STAFF_LINE_COUNT = 5;
export const STAFF_SPACE_COUNT = 4;
