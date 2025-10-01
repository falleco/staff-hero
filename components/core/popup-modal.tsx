import type React from 'react';
import { useEffect } from 'react';
import { Keyboard, Modal, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface PopupModalProps {
  children: React.ReactNode;
  onDismiss: () => void;
  isVisible: boolean;
}

const PopupModal: React.FC<PopupModalProps> = ({
  children,
  onDismiss,
  isVisible,
}) => {
  const opacity = useSharedValue(0);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.6,
  }));

  useEffect(() => {
    opacity.value = withTiming(isVisible ? 1 : 0);
    if (!isVisible) Keyboard.dismiss();
  }, [isVisible, opacity]);

//   if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible}>
      <View className="flex-1 justify-center items-center">
        <TouchableWithoutFeedback onPress={onDismiss}>
          <Animated.View
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/60 justify-center items-center"
            style={backdropAnimatedStyle}
          />
        </TouchableWithoutFeedback>
        {children}
      </View>
    </Modal>
  );
};

export default PopupModal;
