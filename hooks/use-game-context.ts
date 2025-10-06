import { useContext } from 'react';
import { GameContext } from '@/contexts/game-context';

/**
 * Hook to access the game context
 *
 * Provides access to both game logic and settings hooks through the context.
 * This is the main hook components should use to interact with game functionality.
 *
 * @returns Object containing gameLogic and gameSettings hooks
 * @throws Error if used outside of GameProvider
 *
 * @example
 * ```tsx
 * function GameScreen() {
 *   const { gameLogic, gameSettings } = useGameContext();
 *
 *   const handleStartGame = () => {
 *     gameLogic.startGame(gameSettings.gameSettings);
 *   };
 *
 *   const handleUpdateDifficulty = (difficulty: Difficulty) => {
 *     gameSettings.updateDifficulty(difficulty);
 *   };
 *
 *   return (
 *     <div>
 *       <p>Score: {gameLogic.gameState.score}</p>
 *       <p>Difficulty: {gameSettings.gameSettings.difficulty}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
