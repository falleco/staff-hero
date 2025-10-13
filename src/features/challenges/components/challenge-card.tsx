import type React from 'react';
import { View } from 'react-native';
import { FlatButton, FlatButtonText } from '~/shared/components/core/flat-button';
import { ThemedText } from '~/shared/components/themed-text';
import { useThemeColor } from '~/shared/hooks/use-theme-color';
import { cn } from '~/shared/lib/cn';
import type { Challenge } from '~/shared/types/music';
import { ChallengeStatus } from '~/shared/types/music';

interface ChallengeCardProps {
  challenge: Challenge;
  onRedeem: (challengeId: string) => void;
}

export function ChallengeCard({ challenge, onRedeem }: ChallengeCardProps) {
  const borderColor = useThemeColor({}, 'outline');

  const getStatusColor = () => {
    switch (challenge.status) {
      case ChallengeStatus.AVAILABLE:
        return '#6B7280';
      case ChallengeStatus.IN_PROGRESS:
        return '#5EF2FF';
      case ChallengeStatus.COMPLETED:
        return '#7CFFB2';
      case ChallengeStatus.REDEEMED:
        return '#FF5DA2';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (challenge.status) {
      case ChallengeStatus.AVAILABLE:
        return 'Tracking';
      case ChallengeStatus.IN_PROGRESS:
        return 'In Progress';
      case ChallengeStatus.COMPLETED:
        return 'Completed';
      case ChallengeStatus.REDEEMED:
        return 'Redeemed';
      default:
        return 'Unknown';
    }
  };

  const isRedeemable = challenge.status === ChallengeStatus.COMPLETED;

  const handleActionPress = () => {
    if (isRedeemable) {
      onRedeem(challenge.id);
    }
  };

  return (
    <View
      className="mb-6 p-5 rounded-3xl bg-[#140F2A] border"
      style={{ borderColor }}
    >
      <View className="absolute -top-4 right-6 px-4 py-2 rounded-full bg-[#31224F] border border-white/10 shadow-lg">
        <ThemedText type="label" tone="secondary">
          {challenge.progress}/{challenge.requirement} Complete
        </ThemedText>
      </View>

      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start mr-4">
          <ThemedText type="heading" tone="accent" className="mr-3 text-3xl">
            {challenge.icon}
          </ThemedText>
          <View>
            <ThemedText type="heading">{challenge.title}</ThemedText>
            <View
              className="mt-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: `${getStatusColor()}1A` }}
            >
              <ThemedText type="label" style={{ color: getStatusColor() }}>
                {getStatusText()}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="items-end">
          <ThemedText type="label" tone="muted">
            Reward
          </ThemedText>
          <ThemedText type="heading" tone="secondary">
            ✨ {challenge.reward}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body" tone="muted" className="mt-3">
        {challenge.description}
      </ThemedText>

      <FlatButton
        size="md"
        className={cn(
          'mt-5 w-full rounded-2xl border-4 shadow-[0_10px_0_#080616]',
          isRedeemable ? 'bg-[#372155] border-[#7CFFB2]' : 'bg-[#1B152C] border-[#35295D]',
        )}
        onPress={handleActionPress}
        isDisabled={!isRedeemable}
      >
        <FlatButtonText tone={isRedeemable ? 'secondary' : 'muted'}>
          {isRedeemable ? 'Redeem Reward' : 'Keep Playing'}
        </FlatButtonText>
      </FlatButton>
    </View>
  );
}
