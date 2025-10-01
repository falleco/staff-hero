import Svg, { G, Line, Path } from 'react-native-svg';
import type { Note } from '@/types/music';
import { TrebleClef } from '../clefs/tremble';

interface PentagramSymbolProps {
  notes: Note[];
  width: number;
  height: number;
  noteStartX: number;
  noteSpacing: number;
  getNoteY: (staffPosition: number) => number;
  getNoteColor: () => string;
}

const PentagramSymbol = ({
  notes,
  width,
  height,
  noteStartX,
  noteSpacing,
  getNoteY,
  getNoteColor,
}: PentagramSymbolProps) => {
  return (
    <Svg width={width} height={height}>
      {notes.map((note, index) => {
        const noteX = noteStartX + index * noteSpacing;
        const noteY = getNoteY(note.staffPosition);

        // Get the note symbol (fallback to default if not found)
        const noteSymbol =
          NOTE_SYMBOLS[note.symbolId || DEFAULT_NOTE_SYMBOL.id] ||
          DEFAULT_NOTE_SYMBOL;

        return (
          <G key={`note-${note.name}-${index}`}>
            {renderLedgerLines(note, noteX)}

            {/* Note symbol */}
            <G
              transform={`translate(${noteX - noteSymbol.width - 11}, ${noteY - noteSymbol.height / 2}) scale(0.035, 0.035)`}
            >
              <Path d={noteSymbol.pathData} fill={getNoteColor()} />
            </G>

            {/* Note stem (if required by the symbol) */}
            {noteSymbol.stemRequired && (
              <Line
                x1={noteX + noteSymbol.width / 2}
                y1={noteY}
                x2={noteX + noteSymbol.width / 2}
                y2={noteY - 30}
                stroke={getNoteColor()}
                strokeWidth="2"
              />
            )}
          </G>
        );
      })}
    </Svg>
  );
};
