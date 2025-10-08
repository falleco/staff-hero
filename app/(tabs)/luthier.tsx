import { LinearGradient } from 'expo-linear-gradient';
import type React from 'react';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatButton, FlatButtonText } from '@/components/core/flat-button';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { InstrumentCard } from '@/components/ui/instrument-card';
import { useCurrency } from '@/hooks/use-currency';
import { useLuthier } from '@/hooks/use-luthier';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';

export default function LuthierTab() {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const primaryColor = useThemeColor({}, 'tint');

  const { currency, addGoldenShards } = useCurrency();
  const {
    instruments,
    equippedInstrument,
    ownedInstruments,
    buyInstrument,
    upgradeInstrument,
    tuneInstrument,
    equipInstrument,
    resetInstruments,
  } = useLuthier();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('inventory');

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBuyInstrument = async (
    instrumentId: string,
  ): Promise<boolean> => {
    return await buyInstrument(instrumentId, currency, async (newCurrency) => {
      await addGoldenShards(
        newCurrency.goldenNoteShards - currency.goldenNoteShards,
      );
    });
  };

  const handleUpgradeInstrument = async (
    instrumentId: string,
  ): Promise<boolean> => {
    return await upgradeInstrument(
      instrumentId,
      currency,
      async (newCurrency) => {
        await addGoldenShards(
          newCurrency.goldenNoteShards - currency.goldenNoteShards,
        );
      },
    );
  };

  const handleTuneInstrument = async (
    instrumentId: string,
  ): Promise<boolean> => {
    return await tuneInstrument(instrumentId, currency, async (newCurrency) => {
      await addGoldenShards(
        newCurrency.goldenNoteShards - currency.goldenNoteShards,
      );
    });
  };

  const handleEquipInstrument = async (instrumentId: string) => {
    await equipInstrument(instrumentId);
  };

  const handleResetInstruments = async () => {
    Alert.alert(
      'Reset Instruments',
      'This will reset all instruments to default state. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetInstruments();
          },
        },
      ],
    );
  };

  const availableInstruments = instruments.filter((i) => !i.isOwned);
  const canAffordAny = availableInstruments.some(
    (i) => currency.goldenNoteShards >= i.price,
  );

  return (
    <>
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
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-24"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <ThemedText
            className="text-4xl font-bold mb-8 self-center font-boldpixels-medium"
            style={{ color: textColor }}
          >
            Luthier
          </ThemedText>
          {/* Header */}
          <View className="p-5 pb-3">
            {/* Tab Navigation */}
            <View className="flex-row bg-gray-100 rounded-lg p-1 w-full border-2 border-black/20">
              <FlatButton
                size="sm"
                className={cn(
                  'flex-1 bg-purple-400',
                  activeTab === 'inventory' ? 'border-purple' : '',
                )}
                onPress={() => setActiveTab('inventory')}
              >
                <FlatButtonText className="text-center font-boldpixels-medium text-white">
                  My Instruments
                </FlatButtonText>
              </FlatButton>
              <FlatButton
                size="sm"
                className={cn(
                  'flex-1 bg-purple-400',
                  activeTab === 'shop' ? 'border-purple' : '',
                )}
                onPress={() => setActiveTab('shop')}
              >
                <FlatButtonText className="text-center font-boldpixels-medium text-white">
                  Shop
                </FlatButtonText>
              </FlatButton>
            </View>
          </View>

          {/* Currently Equipped */}
          {equippedInstrument && (
            <View className="px-5 pb-3">
              <ThemedText
                className="text-lg font-bold mb-3"
                style={{ color: textColor }}
              >
                🎵 Currently Equipped
              </ThemedText>
              <View className="p-4 rounded-xl border-2 border-green-500 bg-green-50">
                <View className="flex-row items-center">
                  <ThemedText className="text-2xl mr-3">
                    {equippedInstrument.icon}
                  </ThemedText>
                  <View className="flex-1">
                    <ThemedText
                      className="text-lg font-semibold"
                      style={{ color: textColor }}
                    >
                      {equippedInstrument.name}
                    </ThemedText>
                    <ThemedText
                      className="text-sm"
                      style={{ color: secondaryTextColor }}
                    >
                      Level {equippedInstrument.level} •{' '}
                      {equippedInstrument.tuning}% Tuned
                    </ThemedText>
                  </View>
                  <View className="items-end">
                    <ThemedText
                      className="text-sm font-medium"
                      style={{ color: primaryColor }}
                    >
                      {equippedInstrument.bonuses.scoreMultiplier.toFixed(1)}x
                      Score
                    </ThemedText>
                    <ThemedText
                      className="text-xs"
                      style={{ color: secondaryTextColor }}
                    >
                      +{equippedInstrument.bonuses.accuracyBonus}% Accuracy
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Content based on active tab */}
          <View className="px-5">
            {activeTab === 'inventory' && (
              <View>
                <ThemedText
                  className="text-lg font-bold mb-3"
                  style={{ color: textColor }}
                >
                  🎒 Your Collection ({ownedInstruments.length})
                </ThemedText>

                {ownedInstruments.length === 0 ? (
                  <View className="p-8 items-center">
                    <ThemedText className="text-6xl mb-4">🎻</ThemedText>
                    <ThemedText
                      className="text-lg font-semibold mb-2"
                      style={{ color: textColor }}
                    >
                      No Instruments Yet
                    </ThemedText>
                    <ThemedText
                      className="text-sm text-center"
                      style={{ color: secondaryTextColor }}
                    >
                      Visit the shop to purchase your first instrument!
                    </ThemedText>
                    <Button
                      size="sm"
                      variant="solid"
                      onPress={() => setActiveTab('shop')}
                      className="mt-4"
                    >
                      <ButtonText>Browse Shop</ButtonText>
                    </Button>
                  </View>
                ) : (
                  ownedInstruments.map((instrument) => (
                    <InstrumentCard
                      key={instrument.id}
                      instrument={instrument}
                      currency={currency}
                      onBuy={handleBuyInstrument}
                      onUpgrade={handleUpgradeInstrument}
                      onTune={handleTuneInstrument}
                      onEquip={handleEquipInstrument}
                    />
                  ))
                )}
              </View>
            )}

            {activeTab === 'shop' && (
              <View>
                <ThemedText
                  className="text-lg font-bold mb-3"
                  style={{ color: textColor }}
                >
                  🛒 Instrument Shop ({availableInstruments.length} available)
                </ThemedText>

                {!canAffordAny && (
                  <View className="p-4 mb-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <ThemedText className="text-sm font-medium text-yellow-800 mb-1">
                      💡 Need More Shards?
                    </ThemedText>
                    <ThemedText className="text-xs text-yellow-700">
                      Complete challenges to earn golden note shards and unlock
                      these instruments!
                    </ThemedText>
                  </View>
                )}

                {availableInstruments.length === 0 ? (
                  <View className="p-8 items-center">
                    <ThemedText className="text-6xl mb-4">🏆</ThemedText>
                    <ThemedText
                      className="text-lg font-semibold mb-2"
                      style={{ color: textColor }}
                    >
                      Collection Complete!
                    </ThemedText>
                    <ThemedText
                      className="text-sm text-center"
                      style={{ color: secondaryTextColor }}
                    >
                      You own all available instruments. Check back later for
                      new additions!
                    </ThemedText>
                  </View>
                ) : (
                  availableInstruments.map((instrument) => (
                    <InstrumentCard
                      key={instrument.id}
                      instrument={instrument}
                      currency={currency}
                      onBuy={handleBuyInstrument}
                      onUpgrade={handleUpgradeInstrument}
                      onTune={handleTuneInstrument}
                      onEquip={handleEquipInstrument}
                    />
                  ))
                )}
              </View>
            )}
          </View>

          {/* Debug Section (Remove in production) */}
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
                  onPress={handleResetInstruments}
                  className="flex-1"
                >
                  <ButtonText>Reset Instruments</ButtonText>
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
    </>
  );
}
