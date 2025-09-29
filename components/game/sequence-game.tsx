import { MusicStaff } from '@/components/music/music-staff';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';
import { GameSettings, Question } from '@/types/music';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

interface SequenceGameProps {
  question: Question;
  gameSettings: GameSettings;
  onAnswerSubmit: (sequence: string[]) => void;
  showFeedback: boolean;
  streakLevel: number;
}

export function SequenceGame({
  question,
  gameSettings,
  onAnswerSubmit,
  showFeedback,
  streakLevel
}: SequenceGameProps) {
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Reset sequence when new question
  useEffect(() => {
    setUserSequence([]);
    setCurrentNoteIndex(0);
  }, [question.id]);

  const handleNoteSelect = (noteName: string) => {
    if (showFeedback) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSequence = [...userSequence, noteName];
    setUserSequence(newSequence);
    setCurrentNoteIndex(currentNoteIndex + 1);

    // If sequence is complete, submit answer
    if (newSequence.length === question.notes.length) {
      onAnswerSubmit(newSequence);
    }
  };

  const handleReset = () => {
    if (showFeedback) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserSequence([]);
    setCurrentNoteIndex(0);
  };


  const getButtonState = (noteName: string) => {
    const indexInSequence = userSequence.indexOf(noteName);
    if (indexInSequence >= 0) {
      return 'selected';
    }
    return 'default';
  };

  return (
    <View className="flex-1">
      {/* Instructions */}
      <View className="px-6 py-4">
        <ThemedText className="text-xl font-bold text-center mb-2" style={{ color: textColor }}>
          Identify the sequence:
        </ThemedText>
        <ThemedText className="text-sm text-center opacity-70 mb-2" style={{ color: textColor }}>
          Select notes from left to right ({userSequence.length}/{question.notes.length})
        </ThemedText>
        
        {/* Progress indicator */}
        <View className="flex-row justify-center items-center gap-2 mt-2">
          {question.notes.map((_, index) => (
            <View
              key={index}
              className={cn(
                "w-3 h-3 rounded-full",
                index < userSequence.length ? "bg-green-500" : 
                index === userSequence.length ? "bg-blue-500" : "bg-gray-300"
              )}
            />
          ))}
        </View>
      </View>

      {/* Music Staff */}
      <View className="flex-1 justify-center items-center px-4">
        <MusicStaff
          notes={question.notes}
          showNoteLabels={gameSettings.showNoteLabels}
          notationSystem={gameSettings.notationSystem}
          streakLevel={streakLevel}
          width={350}
          height={180}
        />
      </View>

      {/* Selected sequence display */}
      {userSequence.length > 0 && (
        <View className="px-6 py-2">
          <ThemedText className="text-center text-sm opacity-70 mb-2" style={{ color: textColor }}>
            Your sequence:
          </ThemedText>
          <View className="flex-row justify-center gap-2">
            {userSequence.map((note, index) => (
              <View
                key={index}
                className="px-3 py-1 bg-green-100 rounded-lg"
              >
                <ThemedText className="text-sm font-medium" style={{ color: textColor }}>
                  {note}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Answer Options */}
      <View className="pb-8">
        <View className="flex-row flex-wrap justify-center gap-3 px-4">
          {question.options.map((option) => {
            const buttonState = getButtonState(option);
            const isDisabled = showFeedback || (buttonState === 'selected');
            
            return (
              <Pressable
                key={option}
                className={cn(
                  "px-6 py-3 rounded-xl border-2 min-w-[80px]",
                  buttonState === 'selected' 
                    ? "bg-green-500 border-green-500" 
                    : "bg-transparent border-gray-300"
                )}
                style={({ pressed }) => ({
                  backgroundColor: buttonState === 'selected' ? '#22C55E' :
                                 pressed && !isDisabled ? `${tintColor}20` : 'transparent',
                  borderColor: buttonState === 'selected' ? '#22C55E' :
                              pressed && !isDisabled ? tintColor : '#ccc',
                  transform: [{ scale: pressed && !isDisabled ? 0.95 : 1 }],
                  opacity: isDisabled ? 0.7 : 1,
                })}
                onPress={() => handleNoteSelect(option)}
                disabled={isDisabled}
              >
                <ThemedText
                  className={cn(
                    "text-center text-lg font-semibold",
                    buttonState === 'selected' ? "text-white" : ""
                  )}
                  style={{
                    color: buttonState === 'selected' ? 'white' : textColor,
                  }}
                >
                  {option}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        
        {/* Reset button */}
        {userSequence.length > 0 && !showFeedback && (
          <View className="items-center mt-4">
            <Pressable
              className="px-4 py-2 border border-gray-400 rounded-lg"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f3f4f6' : 'transparent',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
              onPress={handleReset}
            >
              <ThemedText className="text-sm font-medium" style={{ color: textColor }}>
                Reset
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}