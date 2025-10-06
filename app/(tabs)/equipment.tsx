import type React from 'react';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { EquipmentCard } from '@/components/ui/equipment-card';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { useChallenges } from '@/hooks/use-challenges';
import { useEquipment } from '@/hooks/use-equipment';
import { useThemeColor } from '@/hooks/use-theme-color';
import { EquipmentCategory } from '@/types/music';

export default function EquipmentTab() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const primaryColor = useThemeColor({}, 'tint');

  const { currency, addGoldenShards } = useChallenges();
  const {
    equipment,
    userEquipment,
    getEquipmentByCategory,
    buyEquipment,
    upgradeEquipment,
    equipItem,
    unequipItem,
    getTotalBonuses,
    resetEquipment,
  } = useEquipment();

  const [activeCategory, setActiveCategory] = useState<EquipmentCategory>(
    EquipmentCategory.MANTLE,
  );

  const handleBuyEquipment = async (equipmentId: string): Promise<boolean> => {
    return await buyEquipment(equipmentId, currency, async (newCurrency) => {
      await addGoldenShards(
        newCurrency.goldenNoteShards - currency.goldenNoteShards,
      );
    });
  };

  const handleUpgradeEquipment = async (
    equipmentId: string,
  ): Promise<boolean> => {
    return await upgradeEquipment(
      equipmentId,
      currency,
      async (newCurrency) => {
        await addGoldenShards(
          newCurrency.goldenNoteShards - currency.goldenNoteShards,
        );
      },
    );
  };

  const handleEquipItem = async (equipmentId: string) => {
    await equipItem(equipmentId);
  };

  const handleUnequipItem = async (equipmentId: string) => {
    await unequipItem(equipmentId);
  };

  const handleResetEquipment = async () => {
    Alert.alert(
      'Reset Equipment',
      'This will reset all equipment to default state. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetEquipment();
          },
        },
      ],
    );
  };

  const totalBonuses = getTotalBonuses();
  const categoryEquipment = getEquipmentByCategory(activeCategory);

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case EquipmentCategory.MANTLE:
        return '🧙‍♂️';
      case EquipmentCategory.ADORNMENTS:
        return '💎';
      case EquipmentCategory.INSTRUMENTS:
        return '🎻';
      default:
        return '⚡';
    }
  };

  const getCategoryName = (category: EquipmentCategory) => {
    switch (category) {
      case EquipmentCategory.MANTLE:
        return 'Mantles';
      case EquipmentCategory.ADORNMENTS:
        return 'Adornments';
      case EquipmentCategory.INSTRUMENTS:
        return 'Instruments';
      default:
        return 'Equipment';
    }
  };

  return (
    <SafeAreaView className="flex-1  pb-20" style={{ backgroundColor }}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-5 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <ThemedText
                className="text-3xl font-bold"
                style={{ color: textColor }}
              >
                ⚔️ Equipment
              </ThemedText>
              <ThemedText
                className="text-sm"
                style={{ color: secondaryTextColor }}
              >
                Enhance your musical abilities with powerful gear
              </ThemedText>
            </View>

            {/* Currency Display */}
            <View className="items-end">
              <View className="flex-row items-center">
                <ThemedText className="text-lg mr-1">✨</ThemedText>
                <ThemedText
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {currency.goldenNoteShards}
                </ThemedText>
              </View>
              <ThemedText
                className="text-xs"
                style={{ color: secondaryTextColor }}
              >
                Golden Shards
              </ThemedText>
            </View>
          </View>

          {/* Total Bonuses Display */}
          <View className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            <ThemedText className="text-lg font-bold text-black mb-2">
              ⚡ Total Equipment Bonuses
            </ThemedText>
            <View className="flex-row justify-between">
              <View className="items-center">
                <ThemedText className="text-2xl font-bold text-black">
                  +{totalBonuses.scoreBonus}
                </ThemedText>
                <ThemedText className="text-xs text-black opacity-80">
                  Score
                </ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="text-2xl font-bold text-black">
                  +{totalBonuses.accuracyBonus}%
                </ThemedText>
                <ThemedText className="text-xs text-black opacity-80">
                  Accuracy
                </ThemedText>
              </View>
              <View className="items-center">
                <ThemedText className="text-2xl font-bold text-black">
                  +{totalBonuses.streakBonus}
                </ThemedText>
                <ThemedText className="text-xs text-black opacity-80">
                  Streak
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Category Navigation */}
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {Object.values(EquipmentCategory).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={activeCategory === category ? 'solid' : 'outline'}
                onPress={() => setActiveCategory(category)}
                className="flex-1 mx-1"
              >
                <ButtonText>
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </ButtonText>
              </Button>
            ))}
          </View>
        </View>

        {/* Currently Equipped in Category */}
        <View className="px-5 pb-3">
          <ThemedText
            className="text-lg font-bold mb-3"
            style={{ color: textColor }}
          >
            🎵 Currently Equipped
          </ThemedText>

          {activeCategory === EquipmentCategory.MANTLE &&
            userEquipment.mantle && (
              <View className="p-3 rounded-lg border-2 border-green-500 bg-green-50 mb-3">
                <View className="flex-row items-center">
                  <ThemedText className="text-xl mr-2">
                    {userEquipment.mantle.icon}
                  </ThemedText>
                  <View className="flex-1">
                    <ThemedText
                      className="font-semibold"
                      style={{ color: textColor }}
                    >
                      {userEquipment.mantle.name}
                    </ThemedText>
                    <ThemedText
                      className="text-xs"
                      style={{ color: secondaryTextColor }}
                    >
                      Level {userEquipment.mantle.level}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}

          {activeCategory === EquipmentCategory.INSTRUMENTS &&
            userEquipment.instruments && (
              <View className="p-3 rounded-lg border-2 border-green-500 bg-green-50 mb-3">
                <View className="flex-row items-center">
                  <ThemedText className="text-xl mr-2">
                    {userEquipment.instruments.icon}
                  </ThemedText>
                  <View className="flex-1">
                    <ThemedText
                      className="font-semibold"
                      style={{ color: textColor }}
                    >
                      {userEquipment.instruments.name}
                    </ThemedText>
                    <ThemedText
                      className="text-xs"
                      style={{ color: secondaryTextColor }}
                    >
                      Level {userEquipment.instruments.level}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}

          {activeCategory === EquipmentCategory.ADORNMENTS &&
            userEquipment.adornments.length > 0 && (
              <View className="mb-3">
                {userEquipment.adornments.map((adornment) => (
                  <View
                    key={adornment.id}
                    className="p-3 rounded-lg border-2 border-green-500 bg-green-50 mb-2"
                  >
                    <View className="flex-row items-center">
                      <ThemedText className="text-xl mr-2">
                        {adornment.icon}
                      </ThemedText>
                      <View className="flex-1">
                        <ThemedText
                          className="font-semibold"
                          style={{ color: textColor }}
                        >
                          {adornment.name}
                        </ThemedText>
                        <ThemedText
                          className="text-xs"
                          style={{ color: secondaryTextColor }}
                        >
                          Level {adornment.level}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

          {((activeCategory === EquipmentCategory.MANTLE &&
            !userEquipment.mantle) ||
            (activeCategory === EquipmentCategory.INSTRUMENTS &&
              !userEquipment.instruments) ||
            (activeCategory === EquipmentCategory.ADORNMENTS &&
              userEquipment.adornments.length === 0)) && (
            <View className="p-4 rounded-lg bg-gray-100 mb-3">
              <ThemedText
                className="text-center"
                style={{ color: secondaryTextColor }}
              >
                No {getCategoryName(activeCategory).toLowerCase()} equipped
              </ThemedText>
            </View>
          )}
        </View>

        {/* Equipment List */}
        <View className="px-5">
          <ThemedText
            className="text-lg font-bold mb-3"
            style={{ color: textColor }}
          >
            {getCategoryIcon(activeCategory)} {getCategoryName(activeCategory)}{' '}
            ({categoryEquipment.length})
          </ThemedText>

          {categoryEquipment.length === 0 ? (
            <View className="p-8 items-center">
              <ThemedText className="text-6xl mb-4">
                {getCategoryIcon(activeCategory)}
              </ThemedText>
              <ThemedText
                className="text-lg font-semibold mb-2"
                style={{ color: textColor }}
              >
                No {getCategoryName(activeCategory)} Available
              </ThemedText>
              <ThemedText
                className="text-sm text-center"
                style={{ color: secondaryTextColor }}
              >
                Check back later for new{' '}
                {getCategoryName(activeCategory).toLowerCase()}!
              </ThemedText>
            </View>
          ) : (
            categoryEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                currency={currency}
                onBuy={handleBuyEquipment}
                onUpgrade={handleUpgradeEquipment}
                onEquip={handleEquipItem}
                onUnequip={handleUnequipItem}
              />
            ))
          )}
        </View>

        {/* Debug Section */}
        {__DEV__ && (
          <View className="p-5 mt-5 border-t border-gray-200">
            <ThemedText
              className="text-lg font-bold mb-3"
              style={{ color: textColor }}
            >
              Debug Actions
            </ThemedText>
            <View className="flex-row space-x-2">
              <Button
                variant="outline"
                onPress={handleResetEquipment}
                className="flex-1"
              >
                <ButtonText>Reset Equipment</ButtonText>
              </Button>
              <Button
                variant="outline"
                onPress={() => addGoldenShards(100)}
                className="flex-1"
              >
                <ButtonText>Add 100 Shards</ButtonText>
              </Button>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
