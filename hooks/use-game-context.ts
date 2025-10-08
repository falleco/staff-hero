import { useGameLogic } from './use-game-logic';
import { useGameSettings } from './use-game-settings';

/**
 * Hook to access game logic and settings
 *
 * Provides access to both game logic and settings hooks.
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
  const gameLogic = useGameLogic();
  const gameSettings = useGameSettings();

  return {
    gameLogic,
    gameSettings,
  };
}
