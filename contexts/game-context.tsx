import React, { createContext, type ReactNode, useEffect } from 'react';
import { useChallenges } from '@/hooks/use-challenges';
import type { UseGameLogicReturn } from '@/hooks/use-game-logic';
import { useGameLogic } from '@/hooks/use-game-logic';
import type { UseGameSettingsReturn } from '@/hooks/use-game-settings';
import { useGameSettings } from '@/hooks/use-game-settings';

interface GameContextType {
  gameLogic: UseGameLogicReturn;
  gameSettings: UseGameSettingsReturn;
}

/**
 * Game context that provides access to game logic and settings hooks
 * This context serves as a centralized provider for game-related functionality
 */

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

/**
 * Game provider component that initializes and provides game logic and settings hooks
 *
 * This provider creates instances of the game logic and settings hooks and makes them
 * available through context to all child components. It serves as the single source
 * of truth for game state and configuration.
 *
 * @param children - Child components that need access to game functionality
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <GameProvider>
 *       <GameScreen />
 *       <SettingsScreen />
 *     </GameProvider>
 *   );
 * }
 * ```
 */
export function GameProvider({ children }: { children: ReactNode }) {
  const gameLogic = useGameLogic();
  const gameSettings = useGameSettings();
  const { updateChallengeProgress } = useChallenges();

  // Connect challenge tracking to game logic
  useEffect(() => {
    gameLogic.setChallengeProgressCallback(updateChallengeProgress);
  }, [gameLogic, updateChallengeProgress]);

  const value: GameContextType = {
    gameLogic,
    gameSettings,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
