import { GameSettings, Note, NOTE_MAPPINGS, NoteName, Question, TREBLE_CLEF_POSITIONS } from '@/types/music';
import { DEFAULT_NOTE_SYMBOL, getNoteSymbolsForDifficulty } from '@/types/note-symbols';

// Create a reverse mapping from staff position to note for accurate conversion
const POSITION_TO_NOTE: Record<number, { name: NoteName; octave: number }> = {};
Object.entries(TREBLE_CLEF_POSITIONS).forEach(([noteKey, position]) => {
  const name = noteKey.slice(0, -1) as NoteName;
  const octave = parseInt(noteKey.slice(-1));
  POSITION_TO_NOTE[position] = { name, octave };
});

// Generate a random note within the treble clef range
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
    requiresLedgerLine: Math.abs(randomPosition) > 4,
    symbolId: randomSymbol.id,
  };
}

// Generate multiple random notes
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

// Generate wrong answer options for a given correct answer
export function generateWrongOptions(correctAnswer: string[], notationSystem: 'letter' | 'solfege', count: number = 3): string[] {
  const allNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const wrongOptions: string[] = [];
  
  while (wrongOptions.length < count) {
    const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
    const displayName = getNoteDisplayName(randomNote, notationSystem);
    
    if (!correctAnswer.includes(displayName) && !wrongOptions.includes(displayName)) {
      wrongOptions.push(displayName);
    }
  }
  
  return wrongOptions;
}

// Generate a complete question based on game settings
export function generateQuestion(settings: GameSettings): Question {
  const noteCount = settings.gameMode === 'single-note' ? 1 : 
                   settings.gameMode === 'chord' ? Math.floor(Math.random() * 3) + 2 : 
                   Math.floor(Math.random() * 4) + 2;
  
  const notes = generateRandomNotes(noteCount, settings.difficulty);
  const correctAnswer = notes.map(note => getNoteDisplayName(note.name, settings.notationSystem));
  const wrongOptions = generateWrongOptions(correctAnswer, settings.notationSystem);
  
  // Shuffle options
  const allOptions = [...correctAnswer, ...wrongOptions];
  const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
  
  // Debug logging to help identify issues
  console.log('Generated question:', {
    notes: notes.map(n => ({ name: n.name, octave: n.octave, position: n.staffPosition })),
    correctAnswer,
    allOptions: shuffledOptions,
  });
  
  return {
    id: `question_${Date.now()}_${Math.random()}`,
    notes,
    correctAnswer,
    options: shuffledOptions,
    answered: false,
  };
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
