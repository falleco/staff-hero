import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import { ParallaxBg } from '@/components/parallax-bg';

export default function HomeTab() {
  const { top } = useSafeAreaInsets();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleChallengesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/challenges');
  };

  const handleStartGamePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/game-modes');
  };

  return (
    <>
      <ParallaxBg className="absolute top-0 left-0 right-0 bottom-0" />
      <View
        className="flex-1 flex-col justify-center items-center"
        style={{ paddingTop: top }}
      >
        <View className="w-full h-auto flex-grow-0 flex-row justify-between items-center">
          <FlatButton
            size="lg"
            onPress={handleSettingsPress}
            className="flex-col items-center"
          >
            <Image
              style={{ width: 72, height: 72, marginLeft: -16, marginTop: -12 }}
              source={require('@/assets/images/hud/settings.png')}
            />
            <Text className="text-center text-md text-white -mt-4 font-pixelpurl-medium -ml-4">
              settings
            </Text>
          </FlatButton>
          <FlatButton
            size="lg"
            onPress={handleChallengesPress}
            className="justify-start flex-col items-center"
          >
            <Image
              style={{ width: 48, height: 48, marginTop: 6 }}
              source={require('@/assets/images/hud/book.png')}
            />
            <Text className="text-center text-md text-white font-pixelpurl-medium">
              challenges
            </Text>
          </FlatButton>
        </View>
        <View className="flex-grow" />
        <View className="flex-grow-0 justify-center items-center pb-56">
          <FlatButton
            size="xl"
            onPress={handleStartGamePress}
            className="w-full max-w-sm -mb-6 rounded-2xl px-4 py-2 border-red-400 bg-red-800 text-[#ffffff] border-4"
          >
            <FlatButtonText className="text-2xl text-[#ffffff] font-boldpixels-medium">
              START PLAYING
            </FlatButtonText>
          </FlatButton>
        </View>
      </View>
      <StatusBar style="light" hidden={true} />
    </>
  );
}
