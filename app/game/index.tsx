import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { GameScreen } from '@/components/game/game-screen';
import { useGame } from '@/contexts/game-context';

export default function GameModal() {
  const { gameState, endGame } = useGame();

  useEffect(() => {
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  // If game is not active, go back to home
  useEffect(() => {
    if (!gameState.isGameActive) {
      router.replace('/');
    }
  }, [gameState.isGameActive]);

  const handleGameEnd = () => {
    endGame();
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    router.replace('/');
  };

  // Don't render anything if game is not active
  if (!gameState.isGameActive) {
    return null;
  }

  return <GameScreen onGameEnd={handleGameEnd} />;
}
