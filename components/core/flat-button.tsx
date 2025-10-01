import { useAnimatedBounce } from '@/hooks/animations/use-animated-bounce';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { Pressable, type StyleProp, Text, type TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';

type FlatButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface FlatButtonProps {
  children: React.ReactNode;
  size?: FlatButtonSize;
  isDisabled?: boolean;
  onPress?: () => void;
  className?: string;
  hapticFeedback?: boolean;
}

interface FlatButtonTextProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<TextStyle>;
}

const getSizeStyles = (size: FlatButtonSize) => {
  switch (size) {
    case 'xs':
      return 'px-3 py-2 rounded-lg';
    case 'sm':
      return 'px-4 py-2 rounded-xl';
    case 'md':
      return 'px-5 py-3 rounded-xl';
    case 'lg':
      return 'px-6 py-4 rounded-2xl';
    case 'xl':
      return 'px-8 py-4 rounded-2xl';
  }
};

export function FlatButton({
  children,
  size = 'md',
  isDisabled = false,
  onPress,
  className,
  hapticFeedback = true,
}: FlatButtonProps) {
  const { bounce, rStyle } = useAnimatedBounce();

  const handlePress = () => {
    if (isDisabled || !onPress) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const baseStyles = 'flex-row items-center justify-center';
  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View style={rStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={bounce}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          sizeStyles,
          isDisabled && 'opacity-50',
          className,
        )}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.55 : 1 }],
        })}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function FlatButtonText({
  children,
  className,
  style,
}: FlatButtonTextProps) {
  return (
    <Text className={cn('text-center', className)} style={style}>
      {children}
    </Text>
  );
}
