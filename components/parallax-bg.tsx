import { Image } from 'expo-image';
import { View } from 'react-native';

export const ParallaxBg = ({ className }: { className?: string }) => {
  const images = [
    <Image
      key="bg-parallax-6"
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
      source={require('@/assets/images/parallax/layer6.png')}
    />,
    <Image
      key="bg-parallax-5"
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: -30
      }}
      source={require('@/assets/images/parallax/layer5.png')}
    />,
    <Image
      key="bg-parallax-4"
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
      source={require('@/assets/images/parallax/layer4.png')}
    />,
    <Image
      key="bg-parallax-3"
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
      source={require('@/assets/images/parallax/layer3.png')}
    />,
    <Image
      key="bg-parallax-2"
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
      source={require('@/assets/images/parallax/layer2.png')}
    />,
    <Image
      key="bg-parallax-1"
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
      }}
      source={require('@/assets/images/parallax/layer1.png')}
    />,
  ];

  return <View className={className}>{images}</View>;
};
