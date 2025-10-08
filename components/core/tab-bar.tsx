import * as Haptics from 'expo-haptics';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarButton } from './tab-bar-button';

export interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const primaryColor = '#0891b2';
  const greyColor = '#160E22';
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className={`absolute bottom-0 flex-row justify-between items-center bg-[###1B1B3C] pt-4 mx-0`}
      style={{ paddingBottom: bottom + 5 }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        };

        const onLongPress = () => {
          const event = navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? primaryColor : greyColor}
            label={label}
          />
        );
      })}
    </View>
  );
};
