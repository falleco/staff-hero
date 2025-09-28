import { Text, View } from "react-native";

export function TestNativeWind() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        NativeWind is working! 🎉
      </Text>
      <Text className="text-base text-gray-600 mt-2">
        Tailwind CSS classes are now available
      </Text>
    </View>
  );
}
