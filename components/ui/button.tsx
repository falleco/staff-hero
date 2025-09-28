import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
  style,
  textStyle,
  hapticFeedback = true,
  icon,
}: ButtonProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const handlePress = () => {
    if (disabled) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

  const getButtonStyle = (pressed: boolean): ViewStyle => {
    const baseStyle = styles[`${size}Button`];
    const variantStyle = styles[`${variant}Button`];
    
    let dynamicStyle: ViewStyle = {};
    
    switch (variant) {
      case 'primary':
        dynamicStyle = {
          backgroundColor: pressed ? `${tintColor}CC` : tintColor,
          borderColor: tintColor,
        };
        break;
      case 'secondary':
        dynamicStyle = {
          backgroundColor: pressed ? `${tintColor}20` : 'transparent',
          borderColor: tintColor,
        };
        break;
      case 'outline':
        dynamicStyle = {
          backgroundColor: pressed ? `${tintColor}10` : 'transparent',
          borderColor: pressed ? tintColor : textColor,
        };
        break;
      case 'ghost':
        dynamicStyle = {
          backgroundColor: pressed ? `${tintColor}10` : 'transparent',
          borderColor: 'transparent',
        };
        break;
    }

    if (disabled) {
      dynamicStyle.opacity = 0.5;
    }

    return {
      ...baseStyle,
      ...variantStyle,
      ...dynamicStyle,
      transform: [{ scale: pressed ? 0.95 : 1 }],
      ...style,
    };
  };

  const getTextStyle = (pressed: boolean): TextStyle => {
    const baseTextStyle = styles[`${size}Text`];
    
    let textColorValue = textColor;
    
    switch (variant) {
      case 'primary':
        textColorValue = 'white';
        break;
      case 'secondary':
        textColorValue = pressed ? 'white' : tintColor;
        break;
      case 'outline':
        textColorValue = pressed ? tintColor : textColor;
        break;
      case 'ghost':
        textColorValue = pressed ? tintColor : textColor;
        break;
    }

    return {
      ...baseTextStyle,
      color: textColorValue,
      fontWeight: pressed ? '700' : baseTextStyle.fontWeight,
      ...textStyle,
    };
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => getButtonStyle(pressed)}
    >
      {({ pressed }) => (
        <ThemedText style={getTextStyle(pressed)}>
          {icon && `${icon} `}{title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Size variants
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  mediumButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  largeButton: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 120,
  },
  
  // Variant base styles
  primaryButton: {
    borderWidth: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  outlineButton: {
    borderWidth: 1,
    elevation: 0,
  },
  ghostButton: {
    borderWidth: 0,
    elevation: 0,
  },
  
  // Text size variants
  smallText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 16,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Common styles
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
