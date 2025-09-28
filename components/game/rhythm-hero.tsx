import { MusicStaff } from '@/components/music/music-staff';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings, Note, Question } from '@/types/music';
import { DEFAULT_NOTE_SYMBOL, NOTE_SYMBOLS } from '@/types/note-symbols';
import { getNoteDisplayName } from '@/utils/music-utils';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface RhythmHeroProps {
  question: Question;
  gameSettings: GameSettings;
  onAnswerSubmit: (hitNotes: string[], accuracy: number) => void;
  showFeedback: boolean;
  streakLevel: number;
}

interface MovingNote {
  id: string;
  note: Note;
  displayName: string;
  startTime: number;
  animationX: SharedValue<number>;
  animationOpacity: SharedValue<number>;
  hit: boolean;
  accuracy?: number;
}

export function RhythmHero({
  question,
  gameSettings,
  onAnswerSubmit,
  showFeedback,
  streakLevel
}: RhythmHeroProps) {
  const [movingNotes, setMovingNotes] = useState<MovingNote[]>([]);
  const [score, setScore] = useState<number>(0);
  const [hitCount, setHitCount] = useState<number>(0);
  const gameTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteGeneratorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Animation settings
  const noteSpeed = 3000; // 3 seconds to cross screen
  const noteInterval = 1000; // New note every 1 second (configurable)
  const targetLineX = 120; // Position of target line (near clef)

  // Pre-create animated values for all possible notes (max 10)
  const animationX1 = useSharedValue(screenWidth + 50);
  const animationX2 = useSharedValue(screenWidth + 50);
  const animationX3 = useSharedValue(screenWidth + 50);
  const animationX4 = useSharedValue(screenWidth + 50);
  const animationX5 = useSharedValue(screenWidth + 50);
  const animationX6 = useSharedValue(screenWidth + 50);
  const animationX7 = useSharedValue(screenWidth + 50);
  const animationX8 = useSharedValue(screenWidth + 50);
  const animationX9 = useSharedValue(screenWidth + 50);
  const animationX10 = useSharedValue(screenWidth + 50);

  // Pre-create opacity values for disappearing effect
  const animationOpacity1 = useSharedValue(1);
  const animationOpacity2 = useSharedValue(1);
  const animationOpacity3 = useSharedValue(1);
  const animationOpacity4 = useSharedValue(1);
  const animationOpacity5 = useSharedValue(1);
  const animationOpacity6 = useSharedValue(1);
  const animationOpacity7 = useSharedValue(1);
  const animationOpacity8 = useSharedValue(1);
  const animationOpacity9 = useSharedValue(1);
  const animationOpacity10 = useSharedValue(1);

  const animations = [animationX1, animationX2, animationX3, animationX4, animationX5, animationX6, animationX7, animationX8, animationX9, animationX10];
  const opacityAnimations = [animationOpacity1, animationOpacity2, animationOpacity3, animationOpacity4, animationOpacity5, animationOpacity6, animationOpacity7, animationOpacity8, animationOpacity9, animationOpacity10];

  // Pre-create animated styles for all possible notes
  const animatedStyle1 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX1.value }], opacity: animationOpacity1.value }));
  const animatedStyle2 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX2.value }], opacity: animationOpacity2.value }));
  const animatedStyle3 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX3.value }], opacity: animationOpacity3.value }));
  const animatedStyle4 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX4.value }], opacity: animationOpacity4.value }));
  const animatedStyle5 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX5.value }], opacity: animationOpacity5.value }));
  const animatedStyle6 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX6.value }], opacity: animationOpacity6.value }));
  const animatedStyle7 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX7.value }], opacity: animationOpacity7.value }));
  const animatedStyle8 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX8.value }], opacity: animationOpacity8.value }));
  const animatedStyle9 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX9.value }], opacity: animationOpacity9.value }));
  const animatedStyle10 = useAnimatedStyle(() => ({ transform: [{ translateX: animationX10.value }], opacity: animationOpacity10.value }));

  const animatedStyles = [animatedStyle1, animatedStyle2, animatedStyle3, animatedStyle4, animatedStyle5, animatedStyle6, animatedStyle7, animatedStyle8, animatedStyle9, animatedStyle10];

  // Start the rhythm game
  useEffect(() => {
    if (!question.notes.length || showFeedback) return;

    setScore(0);
    setHitCount(0);
    setMovingNotes([]);

    let noteIndex = 0;

    // Generate notes at intervals
    const generateNote = () => {
      if (noteIndex >= question.notes.length) {
        if (noteGeneratorRef.current) {
          clearInterval(noteGeneratorRef.current);
        }
        
        // End game after last note has had time to cross
        gameTimeRef.current = setTimeout(() => {
          const accuracy = Math.round((hitCount / question.notes.length) * 100);
          const hitNotes = Array(hitCount).fill('hit'); // Simplified for now
          onAnswerSubmit(hitNotes, accuracy);
        }, noteSpeed + 1000);
        
        return;
      }

      const note = question.notes[noteIndex];
      const animationX = animations[noteIndex];
      const animationOpacity = opacityAnimations[noteIndex];
      
      // Reset animations
      animationX.value = screenWidth + 50;
      animationOpacity.value = 1;
      
      const movingNote: MovingNote = {
        id: `${note.name}${note.octave}_${noteIndex}_${Date.now()}`,
        note,
        displayName: getNoteDisplayName(note.name, gameSettings.notationSystem),
        startTime: Date.now(),
        animationX,
        animationOpacity,
        hit: false,
      };

      // Start animation
      animationX.value = withTiming(-100, {
        duration: noteSpeed,
        easing: Easing.linear,
      });

      setMovingNotes(prev => [...prev, movingNote]);
      noteIndex++;
    };

    // Generate first note immediately
    generateNote();

    // Generate subsequent notes at intervals
    noteGeneratorRef.current = setInterval(generateNote, noteInterval);

    return () => {
      if (gameTimeRef.current) {
        clearTimeout(gameTimeRef.current);
      }
      if (noteGeneratorRef.current) {
        clearInterval(noteGeneratorRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, showFeedback]);

  const handleNoteHit = (noteName: string) => {
    if (showFeedback) return;

    const currentTime = Date.now();
    
    // Find notes that are currently near the target line
    const activeNotes = movingNotes.filter(mn => {
      if (mn.hit || mn.displayName !== noteName) return false;
      
      const elapsedTime = currentTime - mn.startTime;
      const progress = elapsedTime / noteSpeed;
      const currentX = screenWidth + 50 - (progress * (screenWidth + 150));
      
      // Check if note is within hitting range of target line
      const distance = Math.abs(currentX - targetLineX);
      return distance <= 50; // 50px hitting zone
    });

    if (activeNotes.length > 0) {
      // Hit the closest note
      const closestNote = activeNotes[0];
      const elapsedTime = currentTime - closestNote.startTime;
      const progress = elapsedTime / noteSpeed;
      const currentX = screenWidth + 50 - (progress * (screenWidth + 150));
      const distance = Math.abs(currentX - targetLineX);
      
      // Calculate accuracy based on distance from target
      const accuracy = Math.max(0, 100 - (distance / 50) * 100);
      
      closestNote.hit = true;
      closestNote.accuracy = accuracy;
      
      // Trigger disappearing animation
      closestNote.animationOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      
      setScore(prev => prev + Math.round(accuracy));
      setHitCount(prev => prev + 1);
      
      // Haptic feedback
      if (accuracy > 80) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (accuracy > 50) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      // Miss
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <ThemedText style={[styles.instruction, { color: textColor }]}>
          🎸 Rhythm Hero: Hit notes as they cross the target line!
        </ThemedText>
        <View style={styles.scoreContainer}>
          <ThemedText style={[styles.scoreText, { color: tintColor }]}>
            Score: {score}
          </ThemedText>
          <ThemedText style={[styles.hitText, { color: textColor }]}>
            Hit: {hitCount} / {question.notes.length}
          </ThemedText>
        </View>
      </View>

      {/* Game Area with Staff and Moving Notes */}
      <View style={styles.gameArea}>
        {/* Static Staff */}
        <MusicStaff
          notes={[]} // No static notes, they're moving
          showNoteLabels={gameSettings.showNoteLabels}
          notationSystem={gameSettings.notationSystem}
          streakLevel={streakLevel}
          width={350}
          height={180}
        />
        
        {/* Target Line Overlay */}
        <View style={[styles.targetLine, { left: targetLineX, backgroundColor: tintColor }]} />
        
        {/* Moving Notes Overlay */}
        <View style={styles.movingNotesOverlay}>
          <Svg width={350} height={180}>
            {movingNotes.map((movingNote, index) => {
              // Calculate Y position using same logic as MusicStaff component
              const staffLineSpacing = 12;
              const staffStartY = 90 / 2 - (staffLineSpacing * 2);
              const e4LineY = staffStartY + (staffLineSpacing * 4);
              const noteY = e4LineY - ((movingNote.note.staffPosition + 1) * (staffLineSpacing / 2));
              const animatedStyle = animatedStyles[index % animatedStyles.length];
              const noteSymbol = NOTE_SYMBOLS[movingNote.note.symbolId || DEFAULT_NOTE_SYMBOL.id] || DEFAULT_NOTE_SYMBOL;
              
              // Get note color based on hit status
              const getNoteColor = () => {
                if (movingNote.hit) {
                  return movingNote.accuracy! > 80 ? '#4CAF50' : '#FFC107';
                }
                return textColor;
              };

              return (
                <Animated.View
                  key={movingNote.id}
                  style={[
                    styles.movingNoteContainer,
                    animatedStyle,
                    { top: noteY - 8 }
                  ]}
                >
                  <Svg width={20} height={16}>
                    {/* Musical note symbol */}
                    <G transform={`translate(-8, -8) scale(0.035, 0.035)`}>
                      <Path
                        d={noteSymbol.pathData}
                        fill={getNoteColor()}
                      />
                    </G>
                  </Svg>
                </Animated.View>
              );
            })}
          </Svg>
        </View>
      </View>

      {/* Note Hit Buttons */}
      <View style={styles.buttonContainer}>
        <ThemedText style={[styles.buttonInstructions, { color: textColor }]}>
          Tap the correct note when it crosses the line:
        </ThemedText>
        <ThemedText style={[{ color: textColor, fontSize: 12 }]}>
          Debug: {question.options.length} buttons available
        </ThemedText>
        <View style={styles.noteButtons}>
          {question.options.map((option) => (
            <Pressable
              key={option}
              style={({ pressed }) => [
                styles.noteButton,
                { 
                  backgroundColor: pressed ? '#0066CC' : '#007AFF',
                  borderColor: pressed ? '#fff' : 'transparent',
                  borderWidth: pressed ? 3 : 0,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                }
              ]}
              onPress={() => handleNoteHit(option)}
              disabled={showFeedback}
            >
              <ThemedText style={styles.noteButtonText}>
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  hitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  gameArea: {
    height: 200,
    marginVertical: 20,
    position: 'relative',
    alignItems: 'center',
  },
  targetLine: {
    position: 'absolute',
    width: 4,
    height: 160,
    top: 20,
    borderRadius: 2,
    opacity: 0.8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  movingNotesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 350,
    height: 180,
  },
  movingNoteContainer: {
    position: 'absolute',
    width: 20,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  buttonInstructions: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  noteButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  noteButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  noteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
