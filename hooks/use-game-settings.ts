import type { GameMode } from '@/contexts/game-master-context';
import { useGameContext } from './use-game-context';

export function useGameMaster() {
  const { setGameSettings, settings } = useGameContext();

  const setGameMode = (gameMode: GameMode) => {
    setGameSettings({ ...settings, gameMode });
  };

  return { setGameSettings, setGameMode };
}
