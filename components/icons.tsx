import { AntDesign, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';

export const icons = {
  index: (props: any) => (
    <Image
      contentFit="cover"
      transition={1000}
      source={require('@/assets/images/hud/combat_512.png')}
      style={{ width: 56, height: 56 }}
    />
  ),
  explore: (props: any) => (
    <Image
      contentFit="cover"
      transition={1000}
      source={require('@/assets/images/hud/bag_512.png')}
      style={{ width: 56, height: 56 }}
    />
  ),
  create: (props: any) => <AntDesign name="pluscircleo" size={26} {...props} />,
  profile: (props: any) => <AntDesign name="user" size={26} {...props} />,
  luthery: (props: any) => (
    <Image
      contentFit="cover"
      transition={1000}
      source={require('@/assets/images/hud/shop_512.png')}
      style={{ width: 56, height: 56 }}
    />
  ),
};
