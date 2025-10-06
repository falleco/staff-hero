import { router } from 'expo-router';
import type React from 'react';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ChallengeCard } from '@/components/ui/challenge-card';
import { Button, ButtonText } from '@/components/ui/gluestack-button';
import { ModalHeader } from '@/components/ui/modal-header';
import { useChallenges } from '@/hooks/use-challenges';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ChallengesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const primaryColor = useThemeColor({}, 'tint');

  const {
    challenges,
    currency,
    startChallenge,
    redeemChallenge,
    resetChallenges,
  } = useChallenges();

  const [refreshing, setRefreshing] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await startChallenge(challengeId);
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const handleRedeemChallenge = async (challengeId: string) => {
    try {
      await redeemChallenge(challengeId);
    } catch (error) {
      console.error('Error redeeming challenge:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh challenges data (already handled by the hook)
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleResetChallenges = async () => {
    try {
      await resetChallenges();
    } catch (error) {
      console.error('Error resetting challenges:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ModalHeader title="🏆 Challenges" onClose={handleClose} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Currency Display */}
        <View className="p-5 pb-3">
          <View className="flex-row items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500">
            <View className="flex-row items-center">
              <ThemedText className="text-3xl mr-3">✨</ThemedText>
              <View>
                <ThemedText className="text-lg font-bold text-white">
                  Golden Note Shards
                </ThemedText>
                <ThemedText className="text-sm text-white opacity-80">
                  Your current balance
                </ThemedText>
              </View>
            </View>
            <ThemedText className="text-3xl font-bold text-white">
              {currency.goldenNoteShards}
            </ThemedText>
          </View>
        </View>

        {/* Challenges Header */}
        <View className="px-5 pb-3">
          <ThemedText
            className="text-2xl font-bold mb-2"
            style={{ color: textColor }}
          >
            Active Challenges
          </ThemedText>
          <ThemedText className="text-sm" style={{ color: secondaryTextColor }}>
            Complete challenges to earn golden note shards and unlock rewards!
          </ThemedText>
        </View>

        {/* Challenges List */}
        <View className="px-5">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onStart={handleStartChallenge}
              onRedeem={handleRedeemChallenge}
            />
          ))}
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
            <Button variant="outline" onPress={handleResetChallenges}>
              <ButtonText>Reset All Challenges</ButtonText>
            </Button>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
