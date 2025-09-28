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

// Staff positions for treble clef (E4 bottom line = 0) - NO DUPLICATES!
// Traditional treble clef: Lines are E-G-B-D-F, Spaces are F-A-C-E
export const TREBLE_CLEF_POSITIONS: Record<string, number> = {
  // 3 ledger lines above staff
  'E6': 14,  // 3rd ledger line above
  'D6': 13,  // 2nd ledger line above
  'C6': 12,  // 2nd ledger line above
  'B5': 11,  // Space above 2nd ledger line
  'A5': 10,   // 2nd ledger line above
  'G5': 9,   // Space above 1st ledger line
  
  // Main staff (traditional treble clef - EGBDF lines, FACE spaces)
  'F5': 8,   // 5th line (top line) - Fa
  'E5': 7,   // 4th space - Mi
  'D5': 6,   // 4th line - Re
  'C5': 5,   // 3rd space - Do
  'B4': 4,   // 3rd line - Si
  'A4': 3,   // 2nd space - La
  'G4': 2,   // 2nd line - Sol (treble clef reference)
  'F4': 1,   // 1st space - Fa
  'E4': 0,   // 1st line (bottom line) - Mi ← BOTTOM LINE!
  
  // 3 ledger lines below staff
  'D4': -1,  // Space below staff
  'C4': -2,  // 1st ledger line below (middle C)
  'B3': -3,  // Space below 1st ledger line
  'A3': -4,  // 2nd ledger line below
  'G3': -5,  // Space below 2nd ledger line
  'F3': -6,  // 3rd ledger line below
};

// Staff position to note name mapping for labels (consistent with TREBLE_CLEF_POSITIONS)
export const STAFF_POSITION_TO_NOTE: Record<number, { letter: NoteName; octave: number }> = {
  // 3 ledger lines above staff
  14: { letter: 'E', octave: 6 },   // E6 - 2nd ledger line above
  13: { letter: 'D', octave: 6 },   // D6- Space above 2nd ledger line
  12: { letter: 'C', octave: 6 },   // C6 - 2nd ledger line above
  11: { letter: 'B', octave: 5 },   // B5 - Space above 2nd ledger line
  10: { letter: 'A', octave: 5 },    // A5 - 21st ledger line above
  9: { letter: 'G', octave: 5 },    // G5 - Space above 1st ledger line
  
  // Main staff (traditional treble clef)
  8: { letter: 'F', octave: 5 },    // F5 - 5th line (top line) - Fa
  7: { letter: 'E', octave: 5 },    // E5 - 4th space - Mi
  6: { letter: 'D', octave: 5 },    // D5 - 4th line - Re
  5: { letter: 'C', octave: 5 },    // C5 - 3rd space - Do
  4: { letter: 'B', octave: 4 },    // B4 - 3rd line - Si
  3: { letter: 'A', octave: 4 },    // A4 - 2nd space - La
  2: { letter: 'G', octave: 4 },    // G4 - 2nd line - Sol (treble clef reference)
  1: { letter: 'F', octave: 4 },    // F4 - 1st space - Fa
  0: { letter: 'E', octave: 4 }, // E4 - 1st line (bottom line) - Mi ← BOTTOM LINE!
  
  // 3 ledger lines below staff
  [-1]: { letter: 'D', octave: 4 }, // D4 - Space below staff
  [-2]: { letter: 'C', octave: 4 }, // C4 - 1st ledger line below (middle C)
  [-3]: { letter: 'B', octave: 3 }, // B3 - Space below 1st ledger line
  [-4]: { letter: 'A', octave: 3 }, // A3 - 2nd ledger line below
  [-5]: { letter: 'G', octave: 3 }, // G3 - Space below 2nd ledger line
  [-6]: { letter: 'F', octave: 3 }, // F3 - 3rd ledger line below
};

export const STAFF_LINE_COUNT = 5;
export const STAFF_SPACE_COUNT = 4;
