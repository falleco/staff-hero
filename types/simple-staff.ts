import { NoteName } from './music';

// Simple, direct staff mapping - no confusion
// Staff lines are drawn at Y positions: staffStartY + (0,1,2,3,4) * staffLineSpacing
// Let's map directly to these line indices

export interface StaffNote {
  name: NoteName;
  octave: number;
  lineIndex: number; // Direct reference to staff line drawing (0=top, 4=bottom)
  isSpace: boolean;  // true if between lines, false if on line
  isLedger: boolean; // true if requires ledger line
}

// Direct mapping: staff line index to note (traditional treble clef)
export const STAFF_LINE_NOTES: Record<number, { name: NoteName; octave: number }> = {
  0: { name: 'F', octave: 5 }, // Top line - Fa
  1: { name: 'D', octave: 5 }, // 4th line - Re
  2: { name: 'B', octave: 4 }, // 3rd line - Si
  3: { name: 'G', octave: 4 }, // 2nd line - Sol (treble clef)
  4: { name: 'E', octave: 4 }, // Bottom line - Mi
};

// Direct mapping: space index to note (between staff lines)
export const STAFF_SPACE_NOTES: Record<number, { name: NoteName; octave: number }> = {
  0: { name: 'E', octave: 5 }, // Above top line - Mi
  1: { name: 'C', octave: 5 }, // Between F5 and D5 - Do
  2: { name: 'A', octave: 4 }, // Between D5 and B4 - La
  3: { name: 'F', octave: 4 }, // Between B4 and G4 - Fa
  4: { name: 'D', octave: 4 }, // Below bottom line - Re
};

// Simple function to get note from staff position
export function getStaffNote(lineIndex: number, isSpace: boolean): StaffNote {
  if (isSpace) {
    const noteInfo = STAFF_SPACE_NOTES[lineIndex];
    return {
      name: noteInfo.name,
      octave: noteInfo.octave,
      lineIndex,
      isSpace: true,
      isLedger: lineIndex < 0 || lineIndex > 4,
    };
  } else {
    const noteInfo = STAFF_LINE_NOTES[lineIndex];
    return {
      name: noteInfo.name,
      octave: noteInfo.octave,
      lineIndex,
      isSpace: false,
      isLedger: lineIndex < 0 || lineIndex > 4,
    };
  }
}

// All possible notes on extended staff
export const ALL_STAFF_NOTES: StaffNote[] = [
  // Ledger lines above (negative indices)
  { name: 'C', octave: 6, lineIndex: -3, isSpace: false, isLedger: true }, // 3rd ledger above
  { name: 'B', octave: 5, lineIndex: -2.5, isSpace: true, isLedger: true }, // Space
  { name: 'A', octave: 5, lineIndex: -2, isSpace: false, isLedger: true }, // 2nd ledger above
  { name: 'G', octave: 5, lineIndex: -1.5, isSpace: true, isLedger: true }, // Space
  { name: 'F', octave: 5, lineIndex: -1, isSpace: false, isLedger: true }, // 1st ledger above
  
  // Main staff
  { name: 'E', octave: 5, lineIndex: 0, isSpace: true, isLedger: false }, // Above top line
  { name: 'F', octave: 5, lineIndex: 0, isSpace: false, isLedger: false }, // Top line
  { name: 'E', octave: 5, lineIndex: 1, isSpace: true, isLedger: false }, // Space
  { name: 'D', octave: 5, lineIndex: 1, isSpace: false, isLedger: false }, // 4th line
  { name: 'C', octave: 5, lineIndex: 2, isSpace: true, isLedger: false }, // Space
  { name: 'B', octave: 4, lineIndex: 2, isSpace: false, isLedger: false }, // 3rd line
  { name: 'A', octave: 4, lineIndex: 3, isSpace: true, isLedger: false }, // Space
  { name: 'G', octave: 4, lineIndex: 3, isSpace: false, isLedger: false }, // 2nd line
  { name: 'F', octave: 4, lineIndex: 4, isSpace: true, isLedger: false }, // Space
  { name: 'E', octave: 4, lineIndex: 4, isSpace: false, isLedger: false }, // Bottom line
  
  // Ledger lines below
  { name: 'D', octave: 4, lineIndex: 5, isSpace: true, isLedger: true }, // Below staff
  { name: 'C', octave: 4, lineIndex: 5, isSpace: false, isLedger: true }, // 1st ledger below
  { name: 'B', octave: 3, lineIndex: 6, isSpace: true, isLedger: true }, // Space
  { name: 'A', octave: 3, lineIndex: 6, isSpace: false, isLedger: true }, // 2nd ledger below
  { name: 'G', octave: 3, lineIndex: 7, isSpace: true, isLedger: true }, // Space
  { name: 'F', octave: 3, lineIndex: 7, isSpace: false, isLedger: true }, // 3rd ledger below
];
