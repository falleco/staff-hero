import { ThemedText } from '@/components/themed-text';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable } from 'react-native';

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
  const baseClasses = "items-center justify-center rounded-xl border";
  
  // Size classes
  const sizeClasses = {
    small: "px-3 py-2 min-w-[60px] rounded-lg",
    medium: "px-5 py-3 min-w-[80px] rounded-xl", 
    large: "px-8 py-4 min-w-[120px] rounded-2xl",
  };

  // Variant classes  
  const variantClasses = {
    primary: "bg-blue-500 border-blue-500 shadow-md",
    secondary: "bg-transparent border-blue-500 border-2",
    outline: "bg-transparent border-gray-300 border",
    ghost: "bg-transparent border-transparent",
  };

  // Text size classes
  const textSizeClasses = {
    small: "text-sm font-medium",
    medium: "text-base font-semibold", 
    large: "text-lg font-bold",
  };

  // Text color classes
  const textColorClasses = {
    primary: "text-white",
    secondary: "text-blue-500",
    outline: "text-gray-700",
    ghost: "text-gray-700",
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50",
        className
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
            pressed && "font-bold",
            textClassName
          )}
        >
          {icon && `${icon} `}{title}
        </ThemedText>
      )}
    </Pressable>
  );
}
