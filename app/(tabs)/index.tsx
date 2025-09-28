import { GameScreen } from '@/components/game/game-screen';
import { HomeScreen } from '@/components/screens/home-screen';
import { ThemedView } from '@/components/themed-view';
import { GameProvider } from '@/contexts/game-context';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

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
    <GameProvider>
      <ThemedView style={styles.container}>
        {currentScreen === 'home' ? (
          <HomeScreen onStartGame={handleStartGame} />
        ) : (
          <GameScreen onGameEnd={handleEndGame} />
        )}
      </ThemedView>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
