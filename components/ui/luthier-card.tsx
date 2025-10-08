import type React from 'react';
import { Alert, type StyleProp, View, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';
import type { Instrument, UserCurrency } from '@/types/music';
import { InstrumentRarity } from '@/types/music';

interface InstrumentCardProps {
  className?: string;
  instrument: Instrument;
  style?: ViewStyle;
  currency: UserCurrency;
  onBuy: (instrumentId: string) => Promise<boolean>;
  onUpgrade: (instrumentId: string) => Promise<boolean>;
  onTune: (instrumentId: string) => Promise<boolean>;
  onEquip: (instrumentId: string) => Promise<void>;
}

/**
 * Instrument card component for the luthier shop
 *
 * Displays instrument details, stats, and available actions based on ownership status.
 * Handles purchasing, upgrading, tuning, and equipping instruments.
 *
 * @param instrument - The instrument data to display
 * @param currency - Current user currency
 * @param onBuy - Callback when user buys an instrument
 * @param onUpgrade - Callback when user upgrades an instrument
 * @param onTune - Callback when user tunes an instrument
 * @param onEquip - Callback when user equips an instrument
 */
export function LuthierCard({
  style,
  className,
  instrument,
  currency,
  onBuy,
  onUpgrade,
  onTune,
  onEquip,
}: InstrumentCardProps) {
  const cardBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');

  const getRarityColor = () => {
    switch (instrument.rarity) {
      case InstrumentRarity.COMMON:
        return '#6B7280'; // Gray
      case InstrumentRarity.RARE:
        return '#3B82F6'; // Blue
      case InstrumentRarity.EPIC:
        return '#8B5CF6'; // Purple
      case InstrumentRarity.LEGENDARY:
        return '#F59E0B'; // Gold
      default:
        return '#6B7280';
    }
  };

  return (
    <View
      className={cn(
        ' rounded-2xl border-2 border-gray-200 justify-center items-center bg-white',
        className,
      )}
      style={{ ...(style ?? {}) }}
    >
      <View className="flex-row  justify-center items-center">
        <View className="flex-col flex-1 relative  flex-grow-1 h-full min-h-[150px] ">
          <View className="flex-1 justify-center items-center pb-6">
            <ThemedText className="text-6xl mr-3">{instrument.icon}</ThemedText>
          </View>
          <View className="flex-1 absolute bottom-[-2px] left-[-2px] right-[-2px] bg-black/80 rounded-b-xl">
            <ThemedText className="text-2xl font-semibold text-center text-white font-pixelpurl-medium">
              {instrument.name}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}
