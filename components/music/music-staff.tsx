import { useThemeColor } from '@/hooks/use-theme-color';
import { NotationSystem, Note, NOTE_MAPPINGS, STAFF_POSITION_TO_NOTE } from '@/types/music';
import { DEFAULT_NOTE_SYMBOL, NOTE_SYMBOLS } from '@/types/note-symbols';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';

interface MusicStaffProps {
  notes: Note[];
  width?: number;
  height?: number;
  showFeedback?: boolean;
  isCorrect?: boolean;
  showNoteLabels?: boolean;
  notationSystem?: NotationSystem;
}

export function MusicStaff({ 
  notes, 
  width = 300, 
  height = 200, 
  showFeedback = false, 
  isCorrect,
  showNoteLabels = false,
  notationSystem = 'letter'
}: MusicStaffProps) {
  const textColor = useThemeColor({}, 'text');
  const staffColor = useThemeColor({}, 'text');
  
  // Staff configuration
  const staffLineSpacing = 12;
  const staffStartY = height / 2 - (staffLineSpacing * 2);
  const clefX = 20;
  const noteStartX = 80;
  const noteSpacing = 40;
  
  // Professional treble clef path from SVG
  const trebleClefPath = "M 592.10873,1275.9669 C 461.75172,1268.3902 328.65904,1186.6265 249.0601,1092.783 C 156.77394,983.97782 118.72592,836.04683 128.47199,714.56357 C 157.10277,357.61288 545.27831,146.63848 688.97108,-9.280262 C 785.15294,-113.64625 805.31643,-164.52308 826.79977,-218.19949 C 868.39181,-322.09965 875.09166,-443.8341 792.63375,-452.92251 C 713.90712,-461.59988 649.13737,-337.79201 620.20973,-253.17845 C 594.19587,-177.07331 576.90507,-100.71696 592.5563,13.979673 C 599.58954,65.50958 793.18636,1503.9125 796.45179,1526.2088 C 829.05589,1749.0255 701.63092,1841.2249 571.55248,1857.6251 C 290.65671,1893.038 200.52617,1607.5843 326.4212,1499.1719 C 423.34291,1415.7001 564.35026,1487.3615 556.73245,1624.5919 C 549.98693,1746.1391 430.80546,1749.7197 400.35244,1746.9429 C 447.10065,1830.7846 799.52998,1874.5871 745.41513,1495.7923 C 737.811,1442.5634 558.91549,90.842953 554.53112,60.595454 C 521.71238,-165.84753 516.71147,-345.08557 634.69182,-554.25141 C 678.24767,-631.46637 747.0821,-681.3156 780.87362,-674.7893 C 788.29962,-673.35526 795.69824,-670.62872 801.57144,-664.56827 C 892.07191,-571.31845 919.83494,-364.53202 909.9199,-245.74332 C 899.76736,-124.11391 894.1088,1.7993735 773.16902,148.63428 C 726.36601,205.45738 583.54553,330.63538 501.65851,402.55255 C 386.60107,503.59831 303.14756,591.85179 257.99323,698.31862 C 207.24886,817.97506 198.65826,968.6006 313.27268,1102.2505 C 379.20247,1177.7619 488.59222,1231.3424 580.65459,1232.4842 C 836.63719,1235.6628 911.39048,1109.4801 913.77904,966.58197 C 917.71126,731.28351 633.64596,642.32214 516.85762,804.10953 C 449.14212,897.92109 478.90552,996.66049 524.38411,1043.6371 C 539.99424,1059.7587 557.43121,1072.0395 573.92734,1078.8855 C 579.9056,1081.3654 593.96751,1087.9054 589.97593,1097.4779 C 586.6557,1105.4428 580.20702,1105.8904 574.33381,1105.1871 C 500.68573,1096.3544 419.13667,1025.958 399.0828,904.87212 C 369.86288,728.38801 525.6035,519.0349 747.9133,553.274 C 893.45572,575.68903 1028.5853,700.92182 1016.7338,934.11946 C 1006.5722,1133.9822 840.87996,1290.4262 592.10873,1275.9669 z";

  // Calculate note Y position based on staff position
  const getNoteY = (staffPosition: number): number => {
    const middleLineY = staffStartY + (staffLineSpacing * 2);
    return middleLineY - (staffPosition * (staffLineSpacing / 2));
  };

  // Get note color based on feedback
  const getNoteColor = (): string => {
    if (!showFeedback) return textColor;
    return isCorrect ? '#4CAF50' : '#F44336';
  };

  // Render ledger lines for notes that need them
  const renderLedgerLines = (note: Note, noteX: number) => {
    if (!note.requiresLedgerLine) return null;
    
    const lines = [];
    
    // Determine which ledger lines to draw
    if (note.staffPosition > 4) {
      // Above staff
      for (let i = 5; i <= note.staffPosition; i++) {
        if (i % 2 === 1) { // Only odd positions need ledger lines
          const lineY = getNoteY(i);
          lines.push(
            <Line
              key={`ledger-above-${i}`}
              x1={noteX - 15}
              y1={lineY}
              x2={noteX + 15}
              y2={lineY}
              stroke={staffColor}
              strokeWidth="1"
            />
          );
        }
      }
    } else if (note.staffPosition < -4) {
      // Below staff
      for (let i = -5; i >= note.staffPosition; i--) {
        if (i % 2 === 1) { // Only odd positions need ledger lines
          const lineY = getNoteY(i);
          lines.push(
            <Line
              key={`ledger-below-${i}`}
              x1={noteX - 15}
              y1={lineY}
              x2={noteX + 15}
              y2={lineY}
              stroke={staffColor}
              strokeWidth="1"
            />
          );
        }
      }
    }
    
    return lines;
  };

  // Render note labels for lines and spaces
  const renderNoteLabels = () => {
    if (!showNoteLabels) return null;

    const labels: React.ReactElement[] = [];
    const labelPositions = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4]; // Staff positions to label
    
    labelPositions.forEach((position) => {
      const noteInfo = STAFF_POSITION_TO_NOTE[position];
      if (noteInfo) {
        const y = getNoteY(position);
        const noteName = NOTE_MAPPINGS[notationSystem][noteInfo.letter];
        
        // Check if this position is on a line or space
        // Lines are at even positions (relative to staff): -4, -2, 0, 2, 4
        // Spaces are at odd positions: -5, -3, -1, 1, 3, and extended positions
        const isOnLine = [-4, -2, 0, 2, 4].includes(position);
        const baseX = width - 25; // Right side positioning
        const x = isOnLine ? baseX : baseX - 15; // Offset spaces to the left
        
        labels.push(
          <SvgText
            key={`label-${position}`}
            x={x}
            y={y + 4} // Offset for text centering
            fontSize="10"
            fill="#F44336" // Red color
            textAnchor="middle"
          >
            {noteName}
          </SvgText>
        );
      }
    });

    return labels;
  };

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map((lineIndex) => (
          <Line
            key={`staff-line-${lineIndex}`}
            x1={0}
            y1={staffStartY + (lineIndex * staffLineSpacing)}
            x2={width}
            y2={staffStartY + (lineIndex * staffLineSpacing)}
            stroke={staffColor}
            strokeWidth="2"
          />
        ))}
        
        {/* Treble clef */}
        <G
          transform={`translate(${clefX - 20}, ${-3 + staffStartY + staffLineSpacing * 1}) scale(0.03, 0.03)`}
        >
          <Path
            d={trebleClefPath}
            fill={staffColor}
          />
        </G>

        {/* Note labels (if enabled) */}
        {renderNoteLabels()}
        
        {/* Notes and ledger lines */}
        {notes.map((note, index) => {
          const noteX = noteStartX + (index * noteSpacing);
          const noteY = getNoteY(note.staffPosition);
          
          // Get the note symbol (fallback to default if not found)
          const noteSymbol = NOTE_SYMBOLS[note.symbolId || DEFAULT_NOTE_SYMBOL.id] || DEFAULT_NOTE_SYMBOL;
          
          return (
            <React.Fragment key={`note-${index}`}>
              {/* Ledger lines */}
              {renderLedgerLines(note, noteX)}
              
              {/* Note symbol */}
              <G
                transform={`translate(${noteX - noteSymbol.width/2}, ${noteY - noteSymbol.height/2}) scale(0.035, 0.035)`}
              >
                <Path
                  d={noteSymbol.pathData}
                  fill={getNoteColor()}
                />
              </G>
              
              {/* Note stem (if required by the symbol) */}
              {noteSymbol.stemRequired && (
                <Line
                  x1={noteX + noteSymbol.width/2}
                  y1={noteY}
                  x2={noteX + noteSymbol.width/2}
                  y2={noteY - 30}
                  stroke={getNoteColor()}
                  strokeWidth="2"
                />
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
