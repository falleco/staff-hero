import type React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/cn';
import type { Challenge } from '@/types/music';
import { ChallengeStatus } from '@/types/music';
import { FlatButton, FlatButtonText } from '../core/flat-button';

interface ChallengeCardProps {
  challenge: Challenge;
  onStart: (challengeId: string) => void;
  onRedeem: (challengeId: string) => void;
}

/**
 * Challenge card component that displays challenge information and actions
 *
 * Shows challenge details, progress, and appropriate action buttons based on status.
 * Handles navigation to target routes and challenge state management.
 *
 * @param challenge - The challenge data to display
 * @param onStart - Callback when user starts a challenge
 * @param onRedeem - Callback when user redeems a completed challenge
 */
export function ChallengeCard({
  challenge,
  onStart,
  onRedeem,
}: ChallengeCardProps) {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const primaryColor = useThemeColor({}, 'tint');

  const getStatusColor = () => {
    switch (challenge.status) {
      case ChallengeStatus.AVAILABLE:
        return '#6B7280'; // Gray
      case ChallengeStatus.IN_PROGRESS:
        return '#3B82F6'; // Blue
      case ChallengeStatus.COMPLETED:
        return '#10B981'; // Green
      case ChallengeStatus.REDEEMED:
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (challenge.status) {
      case ChallengeStatus.AVAILABLE:
        return 'Available';
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

  const handleActionPress = () => {
    if (challenge.status === ChallengeStatus.AVAILABLE) {
      onStart(challenge.id);
      // Note: Navigation handled by parent component or user manually
    } else if (challenge.status === ChallengeStatus.COMPLETED) {
      onRedeem(challenge.id);
    } else if (
      challenge.status === ChallengeStatus.IN_PROGRESS &&
      challenge.targetRoute
    ) {
      // Note: Navigation handled by parent component or user manually
    }
  };

  const getActionButtonText = () => {
    switch (challenge.status) {
      case ChallengeStatus.AVAILABLE:
        return 'Go';
      case ChallengeStatus.IN_PROGRESS:
        return 'Continue';
      case ChallengeStatus.COMPLETED:
        return 'Redeem';
      case ChallengeStatus.REDEEMED:
        return 'Completed';
      default:
        return 'Go';
    }
  };

  const isActionDisabled = challenge.status === ChallengeStatus.REDEEMED;

  return (
    <View className="mb-8 p-4 rounded-2xl border-2 border-gray-200 bg-white">
      <View className="absolute top-0 right-5 left-40">
        <View className="bg-red-400 rounded-3xl border-2 px-2 border-black/20 -mt-4 w-[150px] text-center items-center self-end">
          <ThemedText className="text-lg font-pixelpurl-medium text-white">
            Progress: {challenge.progress}/{challenge.requirement}
          </ThemedText>
        </View>
      </View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <ThemedText className="text-2xl mr-3">{challenge.icon}</ThemedText>
          <View className="flex-1">
            <ThemedText className="text-xl font-semibold">
              {challenge.title}
            </ThemedText>
            <View className="flex-row items-center mt-1">
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: `${getStatusColor()}20` }}
              >
                <ThemedText
                  className="text-xs font-medium"
                  style={{ color: getStatusColor() }}
                >
                  {getStatusText()}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Reward */}
        <View className="items-end">
          <View className="flex-row items-center">
            <ThemedText className="text-lg mr-1">✨</ThemedText>
            <ThemedText
              className="text-lg font-bold"
              style={{ color: primaryColor }}
            >
              {challenge.reward}
            </ThemedText>
          </View>
          <ThemedText className="text-sm" style={{ color: secondaryTextColor }}>
            Golden Shards
          </ThemedText>
        </View>
      </View>

      {/* Description */}
      <ThemedText
        className="text-md mb-3"
        style={{ color: secondaryTextColor }}
      >
        {challenge.description}
      </ThemedText>

      {/* Action Button */}
      <FlatButton
        size="sm"
        className={cn(
          'w-full rounded-2xl px-2 py-1 border-purple-400 bg-purple-800 text-[#ffffff] border-4',
          challenge.status === ChallengeStatus.COMPLETED ? 'border-green' : '',
        )}
        onPress={handleActionPress}
        isDisabled={isActionDisabled}
      >
        <FlatButtonText className="text-2xl text-[#ffffff] font-boldpixels-medium">
          {getActionButtonText()}
        </FlatButtonText>
      </FlatButton>
    </View>
  );
}
