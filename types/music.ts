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
  'C6': 11,  // 3rd ledger line above
  'B5': 10,  // Space above 2nd ledger line
  'A5': 9,   // 2nd ledger line above
  'G5': 8,   // Space above 1st ledger line
  
  // Main staff (traditional treble clef - EGBDF lines, FACE spaces)
  'F5': 7,   // 5th line (top line) - Fa
  'E5': 6,   // 4th space - Mi
  'D5': 5,   // 4th line - Re
  'C5': 4,   // 3rd space - Do
  'B4': 3,   // 3rd line - Si
  'A4': 2,   // 2nd space - La
  'G4': 1,   // 2nd line - Sol (treble clef reference)
  'F4': 0,   // 1st space - Fa
  'E4': -1,  // 1st line (bottom line) - Mi ← BOTTOM LINE!
  
  // 3 ledger lines below staff
  'D4': -2,  // Space below staff
  'C4': -3,  // 1st ledger line below (middle C)
  'B3': -4,  // Space below 1st ledger line
  'A3': -5,  // 2nd ledger line below
  'G3': -6,  // Space below 2nd ledger line
  'F3': -7,  // 3rd ledger line below
};

// Staff position to note name mapping for labels (consistent with TREBLE_CLEF_POSITIONS)
export const STAFF_POSITION_TO_NOTE: Record<number, { letter: NoteName; octave: number }> = {
  // 3 ledger lines above staff
  11: { letter: 'C', octave: 6 },   // C6 - 3rd ledger line above
  10: { letter: 'B', octave: 5 },   // B5 - Space above 2nd ledger line
  9: { letter: 'A', octave: 5 },    // A5 - 2nd ledger line above
  8: { letter: 'G', octave: 5 },    // G5 - Space above 1st ledger line
  
  // Main staff (traditional treble clef)
  7: { letter: 'F', octave: 5 },    // F5 - 5th line (top line) - Fa
  6: { letter: 'E', octave: 5 },    // E5 - 4th space - Mi
  5: { letter: 'D', octave: 5 },    // D5 - 4th line - Re
  4: { letter: 'C', octave: 5 },    // C5 - 3rd space - Do
  3: { letter: 'B', octave: 4 },    // B4 - 3rd line - Si
  2: { letter: 'A', octave: 4 },    // A4 - 2nd space - La
  1: { letter: 'G', octave: 4 },    // G4 - 2nd line - Sol (treble clef reference)
  0: { letter: 'F', octave: 4 },    // F4 - 1st space - Fa
  [-1]: { letter: 'E', octave: 4 }, // E4 - 1st line (bottom line) - Mi ← BOTTOM LINE!
  
  // 3 ledger lines below staff
  [-2]: { letter: 'D', octave: 4 }, // D4 - Space below staff
  [-3]: { letter: 'C', octave: 4 }, // C4 - 1st ledger line below (middle C)
  [-4]: { letter: 'B', octave: 3 }, // B3 - Space below 1st ledger line
  [-5]: { letter: 'A', octave: 3 }, // A3 - 2nd ledger line below
  [-6]: { letter: 'G', octave: 3 }, // G3 - Space below 2nd ledger line
  [-7]: { letter: 'F', octave: 3 }, // F3 - 3rd ledger line below
};

export const STAFF_LINE_COUNT = 5;
export const STAFF_SPACE_COUNT = 4;
