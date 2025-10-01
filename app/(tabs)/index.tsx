import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import PopupModal from '@/components/core/popup-modal';
import { GameModeModal } from '@/modals/game-mode.modal';

export default function HomeTab() {
  const { top } = useSafeAreaInsets();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const [isGameModeModalVisible, setIsGameModeModalVisible] = useState(false);
  const handleGameModeModalDismiss = () => {
    setIsGameModeModalVisible(false);
  };

  const handleStartGamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // setIsGameModeModalVisible(true);
    router.push('/game-modes');
  };

  return (
    <>
      <GameModeModal
        isVisible={isGameModeModalVisible}
        onDismiss={handleGameModeModalDismiss}
      />
      <View
        className="flex-1 flex-col justify-center items-center p-6"
        style={{ paddingTop: top }}
      >
        <LinearGradient
          colors={['#9F7FFF', '#8055FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <View className="w-full h-auto flex-grow-0 flex-row justify-between items-center">
          <FlatButton
            size="lg"
            onPress={handleSettingsPress}
            className="p-1 m-1 justify-start flex-col items-center gap-2"
          >
            <Image
              style={{ width: 32, height: 32 }}
              source={require('@/assets/images/hud/cog.svg')}
            />
            <Text className="text-center text-md text-white -mt-2 font-pixelpurl-medium">
              settings
            </Text>
          </FlatButton>
          <FlatButton
            size="lg"
            onPress={handleSettingsPress}
            className="p-1 m-1 justify-start flex-col items-center gap-2"
          >
            <Image
              style={{ width: 32, height: 32 }}
              source={require('@/assets/images/hud/medal.svg')}
            />
            <Text className="text-center text-md text-white -mt-2 font-pixelpurl-medium">
              challenges
            </Text>
          </FlatButton>
        </View>
        <View className="flex-grow justify-center items-center">
          <FlatButton
            size="xl"
            onPress={handleStartGamePress}
            className="w-full max-w-sm mb-6 rounded-2xl px-4 py-2 border-red-400 bg-red-800 text-[#ffffff] border-4"
          >
            <FlatButtonText className="text-2xl text-[#ffffff] font-boldpixels-medium">
              START PLAYING
            </FlatButtonText>
          </FlatButton>
        </View>
      </View>
    </>
  );
}
