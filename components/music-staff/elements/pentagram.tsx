import { useEffect } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useAnimatedSlideTo } from '@/hooks/animations/use-animated-slide-to';
import type { Note } from '@/types/music';
import { TrebleClef } from '../clefs/tremble';
import { SemibreveNote } from '../notes/semibreve';
import { LedgerLines } from './ledger';

interface PentagramProps {
  clef?: 'treble' | 'bass';
  streakLevel: number;
  width: number;
  height: number;
  className?: string;
  color: string;
  renderExtras?: () => React.ReactNode;
  scale?: number;
  notes: Note[];
}

const LINE_COUNT = 5;
const LINE_WIDTH = 2;
const LINES = new Array(LINE_COUNT).fill(null).map((_, i) => i);

const START_X_WITH_CLEF = 60;
const START_X_WITHOUT_CLEF = 15;
const noteSpacing = 30;
const lineSpacing = 12;

export const Pentagram = ({
  clef,
  streakLevel,
  width,
  height,
  className,
  color,
  renderExtras,
  scale = 1,
  notes = [],
}: PentagramProps) => {
  const baseLineY = height / 2 - lineSpacing * 2;

  let clefElement = null;
  if (clef === 'treble') {
    clefElement = (
      <TrebleClef
        color={color}
        streakLevel={streakLevel}
        baseLineY={baseLineY}
        className={`absolute`}
        scale={scale}
      />
    );
  }

  const noteStartX = clef ? START_X_WITH_CLEF : START_X_WITHOUT_CLEF;
  const e4LineY = baseLineY + lineSpacing * 4;

  const getNoteY = (staffPosition: number): number => {
    return e4LineY - (staffPosition + 1) * (lineSpacing / 2);
  };

  const { animationStyle, slideTo } = useAnimatedSlideTo({
    start: width + 100,
    end: 0,
  });

  useEffect(() => {
    slideTo();
  }, [slideTo]);

  return (
    <View className="relative">
      <Svg
        width={width}
        height={height}
        className={className}
        transform={`scale(${scale})`}
      >
        {LINES.map((lineIndex) => (
          <Line
            key={`pentagram-line-${lineIndex}`}
            x1={0}
            y1={baseLineY + lineIndex * lineSpacing}
            x2={width}
            y2={baseLineY + lineIndex * lineSpacing}
            stroke={color}
            strokeWidth={LINE_WIDTH}
          />
        ))}

        {renderExtras?.()}
      </Svg>

      {clefElement}

      <View className="absolute top-0 left-0" style={[{ width, height }]}>
        <Svg width={width} height={height}>
          {notes.map((note, index) => {
            const noteX = noteStartX + index * noteSpacing;
            const noteY = getNoteY(note.staffPosition);

            return (
              <LedgerLines
                key={`ledger-${noteX}-${noteY}`}
                line={note.staffPosition}
                x={noteX}
                y={noteY}
                baseLineY={baseLineY}
                lineSpacing={lineSpacing}
                color={color}
                strokeWidth={2}
              />
            );
          })}
        </Svg>
      </View>

      <Animated.View
        className="absolute top-0 left-0"
        style={[animationStyle, { width, height }]}
      >
        <Svg width={width} height={height}>
          {notes.map((note, index) => {
            const noteX = noteStartX + index * noteSpacing;
            const noteY = getNoteY(note.staffPosition);

            return (
              <SemibreveNote
                key={`note-${noteX}-${noteY}`}
                color={color}
                x={noteX}
                y={noteY}
                scale={0.035}
                onDestroy={() => {}}
              />
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
};
