import { MusicStaff } from '@/components/music/music-staff';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings, Note, Question } from '@/types/music';
import { DEFAULT_NOTE_SYMBOL, NOTE_SYMBOLS } from '@/types/note-symbols';
import { getNoteDisplayName } from '@/utils/music-utils';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
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
    <View className="flex-1">
      {/* Instructions */}
      <View className="px-6 py-4">
        <ThemedText className="text-lg font-bold text-center mb-3" style={{ color: textColor }}>
          🎸 Rhythm Hero: Hit notes as they cross the target line!
        </ThemedText>
        <View className="flex-row justify-between items-center">
          <ThemedText className="text-base font-semibold" style={{ color: tintColor }}>
            Score: {score}
          </ThemedText>
          <ThemedText className="text-sm" style={{ color: textColor }}>
            Hit: {hitCount} / {question.notes.length}
          </ThemedText>
        </View>
      </View>

      {/* Game Area with Staff and Moving Notes */}
      <View className="relative flex-1 justify-center items-center px-4">
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
        <View 
          className="absolute w-1 h-44 rounded-full"
          style={{ 
            left: targetLineX, 
            backgroundColor: tintColor,
            top: '50%',
            marginTop: -88 // Half of height (176/2)
          }} 
        />
        
        {/* Moving Notes Overlay */}
        <View className="absolute inset-0">
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
                  className="absolute w-5 h-4 items-center justify-center"
                  style={[
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
      <View className="pb-8 px-4">
        <ThemedText className="text-sm text-center mb-2" style={{ color: textColor }}>
          Tap the correct note when it crosses the line:
        </ThemedText>
        <View className="flex-row flex-wrap justify-center gap-3">
          {question.options.map((option) => (
            <Pressable
              key={option}
              className="px-6 py-3 rounded-xl min-w-[80px]"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#0066CC' : '#007AFF',
                borderColor: pressed ? '#fff' : 'transparent',
                borderWidth: pressed ? 3 : 0,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: showFeedback ? 0.5 : 1,
              })}
              onPress={() => handleNoteHit(option)}
              disabled={showFeedback}
            >
              <ThemedText className="text-white text-lg font-semibold text-center">
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

