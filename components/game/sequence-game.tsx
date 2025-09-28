import { MusicStaff } from '@/components/music/music-staff';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GameSettings, Question } from '@/types/music';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserSequence([]);
    setCurrentNoteIndex(0);
  };

  const getButtonStyle = (noteName: string) => {
    if (showFeedback) {
      const correctSequence = question.correctAnswer;
      const userIndex = userSequence.indexOf(noteName);
      const correctIndex = correctSequence.indexOf(noteName);
      
      if (userIndex !== -1) {
        // User selected this note
        if (userIndex === correctIndex) {
          return { backgroundColor: '#4CAF50', borderColor: '#45a049' }; // Correct position
        } else {
          return { backgroundColor: '#F44336', borderColor: '#da190b' }; // Wrong position
        }
      } else if (correctSequence.includes(noteName)) {
        return { backgroundColor: '#FFC107', borderColor: '#FF8F00' }; // Should have been selected
      }
    }
    
    return { backgroundColor: '#f0f0f0', borderColor: '#ccc' };
  };

  const getTextStyle = (noteName: string) => {
    const isSelected = userSequence.includes(noteName);
    
    if (showFeedback) {
      const correctSequence = question.correctAnswer;
      const userIndex = userSequence.indexOf(noteName);
      const correctIndex = correctSequence.indexOf(noteName);
      
      if (userIndex !== -1 && (userIndex === correctIndex || correctSequence.includes(noteName))) {
        return { color: 'white', fontWeight: '600' as const };
      }
    }
    
    if (isSelected) {
      return { color: 'white', fontWeight: '600' as const };
    }
    
    return { color: textColor };
  };

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <ThemedText style={[styles.instruction, { color: textColor }]}>
          Identify the notes in sequence (left to right):
        </ThemedText>
        <ThemedText style={[styles.sequenceProgress, { color: tintColor }]}>
          {userSequence.length} / {question.notes.length} selected
        </ThemedText>
      </View>

      {/* Music Staff */}
      <View style={styles.staffContainer}>
        <MusicStaff
          notes={question.notes}
          showFeedback={showFeedback}
          isCorrect={question.isCorrect}
          showNoteLabels={gameSettings.showNoteLabels}
          notationSystem={gameSettings.notationSystem}
          streakLevel={streakLevel}
          width={350}
          height={180}
        />
      </View>

      {/* Sequence Display */}
      <View style={styles.sequenceContainer}>
        <ThemedText style={[styles.sequenceTitle, { color: textColor }]}>
          Your sequence:
        </ThemedText>
        <View style={styles.sequenceDisplay}>
          {Array.from({ length: question.notes.length }, (_, index) => (
            <View
              key={index}
              style={[
                styles.sequenceSlot,
                {
                  backgroundColor: userSequence[index] ? tintColor : 'transparent',
                  borderColor: index === currentNoteIndex ? tintColor : '#ccc',
                  borderWidth: index === currentNoteIndex ? 2 : 1,
                }
              ]}
            >
              <ThemedText
                style={[
                  styles.sequenceSlotText,
                  {
                    color: userSequence[index] ? 'white' : textColor,
                    opacity: userSequence[index] ? 1 : 0.5,
                  }
                ]}
              >
                {userSequence[index] || '?'}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        <View style={styles.optionsGrid}>
          {question.options.map((option) => (
            <Pressable
              key={option}
              style={[styles.optionButton, getButtonStyle(option)]}
              onPress={() => handleNoteSelect(option)}
              disabled={showFeedback}
            >
              <ThemedText style={getTextStyle(option)}>
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Reset Button */}
        {userSequence.length > 0 && !showFeedback && (
          <Pressable
            style={[styles.resetButton, { borderColor: textColor }]}
            onPress={handleReset}
          >
            <ThemedText style={[styles.resetButtonText, { color: textColor }]}>
              🔄 Reset Sequence
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  sequenceProgress: {
    fontSize: 14,
    fontWeight: '500',
  },
  staffContainer: {
    alignItems: 'center',
    marginVertical: 20,
    minHeight: 180,
  },
  sequenceContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sequenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sequenceDisplay: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  sequenceSlot: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sequenceSlotText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    alignItems: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    minWidth: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
