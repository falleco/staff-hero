import { GameScreen } from '@/components/game/game-screen';
import { HomeScreen } from '@/components/screens/home-screen';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';

type AppState = 'home' | 'game';

export default function HomeTab() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('home');

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleEndGame = () => {
    setCurrentScreen('home');
  };

  return (
    <ThemedView className="flex-1">
      {currentScreen === 'home' ? (
        <HomeScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen onGameEnd={handleEndGame} />
      )}
    </ThemedView>
  );
}
