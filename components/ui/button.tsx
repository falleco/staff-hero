import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  hapticFeedback?: boolean;
  icon?: string;
}

/**
 * Reusable Button component with consistent styling and behavior
 * Supports multiple variants, sizes, and haptic feedback
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className,
  textClassName,
  hapticFeedback = true,
  icon,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  // Base classes for all buttons
  const baseClasses = 'items-center justify-center rounded-xl border';

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 min-w-[60px] rounded-lg',
    medium: 'px-5 py-3 min-w-[80px] rounded-xl',
    large: 'px-8 py-4 min-w-[120px] rounded-2xl',
  };

  // Variant classes - Game UI Style
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-600 border-white/20 border-2 shadow-2xl',
    secondary:
      'bg-gradient-to-r from-purple-500 to-pink-500 border-white/20 border-2 shadow-xl',
    outline: 'bg-black/20 backdrop-blur-sm border-white/30 border-2',
    ghost: 'bg-white/10 backdrop-blur-sm border-transparent',
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-sm font-bold',
    medium: 'text-base font-black',
    large: 'text-lg font-black',
  };

  // Text color classes
  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-white',
    ghost: 'text-white',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50',
        className,
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      {({ pressed }) => (
        <ThemedText
          className={cn(
            textSizeClasses[size],
            textColorClasses[variant],
            pressed && 'font-bold',
            textClassName,
          )}
        >
          {icon && `${icon} `}
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}
