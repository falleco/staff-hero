/**
 * Music Utilities
 * 
 * Core utilities for music note generation, question creation, and game logic.
 * This module handles the fundamental music theory and note positioning logic.
 */

import { GameSettings, Note, NOTE_MAPPINGS, NoteName, Question, TREBLE_CLEF_POSITIONS } from '@/types/music';
import { DEFAULT_NOTE_SYMBOL, getNoteSymbolsForDifficulty } from '@/types/note-symbols';

/**
 * Reverse mapping from staff position to note for accurate conversion
 * Built dynamically from TREBLE_CLEF_POSITIONS to ensure consistency
 */
const POSITION_TO_NOTE: Record<number, { name: NoteName; octave: number }> = {};
Object.entries(TREBLE_CLEF_POSITIONS).forEach(([noteKey, position]) => {
  const name = noteKey.slice(0, -1) as NoteName;
  const octave = parseInt(noteKey.slice(-1));
  POSITION_TO_NOTE[position] = { name, octave };
});


/**
 * Generates a random note within the treble clef range
 * @param difficulty - Game difficulty level affecting note range
 * @returns A randomly generated note with proper staff positioning
 */
export function generateRandomNote(difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Note {
  // Use the available positions from TREBLE_CLEF_POSITIONS for consistency
  const availablePositions = Object.values(TREBLE_CLEF_POSITIONS);
  const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
  
  const noteInfo = POSITION_TO_NOTE[randomPosition];
  if (!noteInfo) {
    // Fallback to a safe note
    return {
      name: 'C',
      octave: 5,
      staffPosition: 1,
      requiresLedgerLine: false,
      symbolId: DEFAULT_NOTE_SYMBOL.id,
    };
  }

  // Get available note symbols for the difficulty level
  const availableSymbols = getNoteSymbolsForDifficulty(difficulty);
  const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
  
  return {
    name: noteInfo.name,
    octave: noteInfo.octave,
    staffPosition: randomPosition,
    requiresLedgerLine: randomPosition > 7 || randomPosition < -1,
    symbolId: randomSymbol.id,
  };
}

/**
 * Generates multiple random notes for multi-note game modes
 * @param count - Number of notes to generate
 * @param difficulty - Game difficulty level
 * @returns Array of randomly generated notes
 */
export function generateRandomNotes(count: number, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Note[] {
  const notes: Note[] = [];
  for (let i = 0; i < count; i++) {
    notes.push(generateRandomNote(difficulty));
  }
  return notes;
}

// Convert note name to display string based on notation system
export function getNoteDisplayName(noteName: NoteName, notationSystem: 'letter' | 'solfege'): string {
  return NOTE_MAPPINGS[notationSystem][noteName];
}

// Generate all 7 note options (always show all notes for selection)
export function generateAllNoteOptions(notationSystem: 'letter' | 'solfege'): string[] {
  const allNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return allNotes.map(note => getNoteDisplayName(note, notationSystem));
}

// Generate a complete question based on game settings
export function generateQuestion(settings: GameSettings): Question {
  const noteCount = settings.gameMode === 'single-note' ? 1 : 
                   settings.gameMode === 'sequence' ? Math.floor(Math.random() * 3) + 2 : // 2-4 notes
                   settings.gameMode === 'rhythm' ? Math.floor(Math.random() * 4) + 3 : // 3-6 notes
                   1;
  
  const notes = generateRandomNotes(noteCount, settings.difficulty);
  const correctAnswer = notes.map(note => getNoteDisplayName(note.name, settings.notationSystem));
  
  // Always show all 7 note options for selection
  const allOptions = generateAllNoteOptions(settings.notationSystem);
  
  // Debug logging for question generation
  console.log('🎵 NEW QUESTION GENERATED:');
  console.log('  Notes on staff:', notes.map(n => `${n.name}${n.octave} at position ${n.staffPosition}`));
  console.log('  Expected answer(s):', notes, correctAnswer);
  console.log('  Available options:', allOptions);
  console.log('  Notation system:', settings.notationSystem);
  
  const question: Question = {
    id: `question_${Date.now()}_${Math.random()}`,
    notes,
    correctAnswer,
    options: allOptions,
    answered: false,
  };

  // Add mode-specific properties
  if (settings.gameMode === 'sequence') {
    question.isSequenceMode = true;
    question.userSequence = [];
  } else if (settings.gameMode === 'rhythm') {
    question.isRhythmMode = true;
    question.noteTimings = notes.map((_, index) => (index + 1) * 1000); // Notes every second
    question.userTimings = [];
  }

  return question;
}

// Calculate accuracy percentage
export function calculateAccuracy(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

// Get difficulty-based note range
export function getDifficultyNoteRange(difficulty: 'beginner' | 'intermediate' | 'advanced'): { minOctave: number; maxOctave: number } {
  switch (difficulty) {
    case 'beginner':
      return { minOctave: 4, maxOctave: 5 }; // C4 to B5
    case 'intermediate':
      return { minOctave: 3, maxOctave: 5 }; // C3 to B5
    case 'advanced':
      return { minOctave: 3, maxOctave: 6 }; // C3 to B6
    default:
      return { minOctave: 4, maxOctave: 5 };
  }
}

// Check if a staff position requires ledger lines
export function requiresLedgerLines(staffPosition: number): boolean {
  return Math.abs(staffPosition) > 4;
}

// Get the color for visual feedback
export function getFeedbackColor(isCorrect: boolean): string {
  return isCorrect ? '#4CAF50' : '#F44336'; // Green for correct, red for incorrect
}

// Format time remaining for display
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
