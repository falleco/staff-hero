import { GameScreen } from '@/components/game/game-screen';
import { useGame } from '@/contexts/game-context';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

export default function GameModal() {
  const { gameState, endGame } = useGame();

  // If game is not active, go back to home
  useEffect(() => {
    if (!gameState.isGameActive) {
      router.back();
    }
  }, [gameState.isGameActive]);

  const handleGameEnd = () => {
    endGame();
    router.back();
  };

  // Don't render anything if game is not active
  if (!gameState.isGameActive) {
    return null;
  }

  return <GameScreen onGameEnd={handleGameEnd} />;
}

