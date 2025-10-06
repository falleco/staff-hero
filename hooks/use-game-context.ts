import { useContext } from 'react';
import { GameContext } from '@/contexts/game-context';

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
