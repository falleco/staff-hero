import { useCallback, useState } from 'react';
import type { Note, Notes } from '@/types/music';
import { GameMode } from '@/types/music';
import {
  areNotesAnimating,
  highlightNote,
  prepareNotesForDisplay,
  resetNotesToIdle,
  triggerCreationAnimation,
  triggerDestructionAnimation,
  triggerSequenceFeedback,
} from '@/utils/note-manager';

export interface UseNoteAnimationsReturn {
  /** Current notes with animation states */
  animatedNotes: Note[];
  /** Set new notes and trigger creation animation */
  setNotesWithCreation: (notes: Note[]) => void;
  /** Trigger destruction animation for all notes */
  triggerDestruction: (isCorrect: boolean, onComplete?: () => void) => void;
  /** Trigger individual note feedback for sequence mode */
  triggerSequenceNoteFeedback: (
    userAnswer: Notes[],
    correctAnswer: Notes[],
  ) => void;
  /** Highlight a specific note (for sequence progression) */
  highlightNoteAtIndex: (index: number) => void;
  /** Reset all notes to idle state */
  resetNotes: () => void;
  /** Check if any notes are currently animating */
  isAnimating: boolean;
  /** Handle animation completion for a specific note */
  handleNoteAnimationComplete: (noteId?: string) => void;
}

/**
 * Custom hook for managing note animations and states
 *
 * Provides centralized control over note visual states and animations.
 * Handles creation, destruction, feedback, and sequence-specific animations.
 * Integrates with game mechanics for visual feedback.
 *
 * @returns Object containing animated notes and control functions
 *
 * @example
 * ```tsx
 * const {
 *   animatedNotes,
 *   setNotesWithCreation,
 *   triggerDestruction,
 *   triggerSequenceNoteFeedback
 * } = useNoteAnimations();
 *
 * // Set new notes with creation animation
 * setNotesWithCreation(newNotes);
 *
 * // Trigger destruction on answer
 * triggerDestruction(isCorrect, () => console.log('All destroyed'));
 *
 * // Individual note feedback for sequence
 * triggerSequenceNoteFeedback(userAnswer, correctAnswer);
 * ```
 */
export function useNoteAnimations(): UseNoteAnimationsReturn {
  const [animatedNotes, setAnimatedNotes] = useState<Note[]>([]);

  /**
   * Sets new notes and triggers creation animation
   * @param notes - New notes to display
   */
  const setNotesWithCreation = useCallback((notes: Note[]) => {
    const preparedNotes = prepareNotesForDisplay(notes);
    const notesWithCreation = triggerCreationAnimation(preparedNotes);
    setAnimatedNotes(notesWithCreation);
  }, []);

  /**
   * Triggers destruction animation for all notes
   * @param isCorrect - Whether the answer was correct
   * @param onComplete - Callback when destruction is complete
   */
  const triggerDestruction = useCallback(
    (isCorrect: boolean, onComplete?: () => void) => {
      setAnimatedNotes((currentNotes) =>
        triggerDestructionAnimation(currentNotes, isCorrect, onComplete),
      );
    },
    [],
  );

  /**
   * Triggers individual note feedback for sequence mode
   * @param userAnswer - User's answer sequence
   * @param correctAnswer - Correct answer sequence
   */
  const triggerSequenceNoteFeedback = useCallback(
    (userAnswer: Notes[], correctAnswer: Notes[]) => {
      setAnimatedNotes((currentNotes) =>
        triggerSequenceFeedback(currentNotes, userAnswer, correctAnswer),
      );
    },
    [],
  );

  /**
   * Highlights a specific note at the given index
   * @param index - Index of note to highlight
   */
  const highlightNoteAtIndex = useCallback((index: number) => {
    setAnimatedNotes((currentNotes) => highlightNote(currentNotes, index));
  }, []);

  /**
   * Resets all notes to idle state
   */
  const resetNotes = useCallback(() => {
    setAnimatedNotes((currentNotes) => resetNotesToIdle(currentNotes));
  }, []);

  /**
   * Handles animation completion for a specific note
   * @param noteId - ID of the note that completed animation
   */
  const handleNoteAnimationComplete = useCallback((noteId?: string) => {
    console.log(`Note animation completed: ${noteId}`);
    // Additional logic can be added here for specific note completion handling
  }, []);

  const isAnimating = areNotesAnimating(animatedNotes);

  return {
    animatedNotes,
    setNotesWithCreation,
    triggerDestruction,
    triggerSequenceNoteFeedback,
    highlightNoteAtIndex,
    resetNotes,
    isAnimating,
    handleNoteAnimationComplete,
  };
}
