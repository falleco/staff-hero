import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { MusicStaff } from '@/components/music-staff';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';
import type { GameSettings, Question } from '@/types/music';

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
  streakLevel,
}: SequenceGameProps) {
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);

  const textColor = useThemeColor({}, 'text');

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
        <ThemedText
          className="text-xl font-bold text-center mb-2"
          style={{ color: textColor }}
        >
          Identify the sequence:
        </ThemedText>
        <ThemedText
          className="text-sm text-center opacity-70 mb-2"
          style={{ color: textColor }}
        >
          Select notes from left to right ({userSequence.length}/
          {question.notes.length})
        </ThemedText>

        {/* Progress indicator */}
        <View className="flex-row justify-center items-center gap-2 mt-2">
          {question.notes.map((note, index) => (
            <View
              key={note.name}
              className={cn(
                'w-3 h-3 rounded-full',
                index < userSequence.length
                  ? 'bg-green-500'
                  : index === userSequence.length
                    ? 'bg-blue-500'
                    : 'bg-gray-300',
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
          <ThemedText
            className="text-center text-sm opacity-70 mb-2"
            style={{ color: textColor }}
          >
            Your sequence:
          </ThemedText>
          <View className="flex-row justify-center gap-2">
            {userSequence.map((note, index) => (
              <View
                key={`note-${note}`}
                className="px-3 py-1 bg-green-100 rounded-lg"
              >
                <ThemedText
                  className="text-sm font-medium"
                  style={{ color: textColor }}
                >
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
          {question.options.map((option, index) => {
            const buttonState = getButtonState(option);
            const isDisabled = showFeedback || buttonState === 'selected';
            const isSelected = buttonState === 'selected';

            const actions = [
              'primary',
              'positive',
              'secondary',
              'default',
              'negative',
            ] as const;
            const action = isSelected
              ? 'positive'
              : actions[index % actions.length];

            return (
              <Button
                key={option}
                action={action}
                variant="solid"
                size="lg"
                onPress={() => handleNoteSelect(option)}
                isDisabled={isDisabled}
                className="px-6 py-3 rounded-xl min-w-[80px]"
                hapticFeedback={false} // We handle haptics manually
              >
                <ButtonText className="text-center text-lg font-semibold text-white">
                  {option}
                </ButtonText>
              </Button>
            );
          })}
        </View>

        {/* Reset button */}
        {userSequence.length > 0 && !showFeedback && (
          <View className="items-center mt-4">
            <Button
              action="default"
              variant="outline"
              size="sm"
              onPress={handleReset}
              className="px-4 py-2 rounded-lg"
            >
              <ButtonText className="text-sm font-medium text-white">
                Reset
              </ButtonText>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
