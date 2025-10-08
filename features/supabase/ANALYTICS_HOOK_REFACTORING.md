# Analytics Hook Refactoring

## Overview

Completed the final step of the analytics integration by creating a dedicated `use-analytics` hook that follows the same pattern as other hooks in the application (`use-currency`, `use-challenges`, `use-equipment`, `use-luthier`).

## Architecture Pattern

The analytics system now follows the established centralized state management pattern:

```
┌─────────────────────────────────────────────────┐
│            GameContext (State)                  │
│  - analytics: UserAnalytics | null              │
│  - analyticsLoading: boolean                    │
│  - setAnalytics()                               │
│  - setAnalyticsLoading()                        │
└────────────────┬────────────────────────────────┘
                 │
                 │ consumes state
                 ↓
┌─────────────────────────────────────────────────┐
│         use-analytics Hook (Logic)              │
│  - refresh()                                    │
│  - addSession()                                 │
│  - getRecentSessions()                          │
│  - getUserAchievements()                        │
│  - unlockAchievement()                          │
│  - clearData()                                  │
└────────────────┬────────────────────────────────┘
                 │
                 │ uses hook
                 ↓
┌─────────────────────────────────────────────────┐
│         Components (UI)                         │
│  - AnalyticsScreen                              │
│  - Game screens (to record sessions)            │
│  - Any component needing analytics              │
└─────────────────────────────────────────────────┘
```

## New File: `hooks/use-analytics.ts`

Created a comprehensive hook with the following API:

### Interface

```typescript
export interface UseAnalyticsReturn {
  analytics: UserAnalytics | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addSession: (session: Omit<GameSession, 'id' | 'date'>) => Promise<string>;
  getRecentSessions: (limit?: number) => Promise<GameSession[]>;
  getUserAchievements: () => Promise<UserAnalytics['achievements']>;
  unlockAchievement: (achievementId: string) => Promise<boolean>;
  clearData: () => Promise<void>;
}
```

### Functions

#### `refresh()`
Refreshes analytics data from Supabase and updates GameContext state.

```typescript
const { refresh } = useAnalytics();
await refresh();
```

#### `addSession(session)`
Adds a game session to the database, automatically checks for achievements, and refreshes analytics.

```typescript
const { addSession } = useAnalytics();
const sessionId = await addSession({
  gameMode: GameMode.SINGLE_NOTE,
  difficulty: Difficulty.BEGINNER,
  notationSystem: NotationSystem.LETTER,
  score: 450,
  streak: 8,
  maxStreak: 12,
  totalQuestions: 20,
  correctAnswers: 18,
  accuracy: 90,
  duration: 180,
});
```

#### `getRecentSessions(limit?)`
Gets recent game sessions for the user.

```typescript
const { getRecentSessions } = useAnalytics();
const sessions = await getRecentSessions(10);
```

#### `getUserAchievements()`
Gets all achievements with unlock status.

```typescript
const { getUserAchievements } = useAnalytics();
const achievements = await getUserAchievements();
```

#### `unlockAchievement(achievementId)`
Manually unlocks an achievement and refreshes analytics.

```typescript
const { unlockAchievement } = useAnalytics();
const unlocked = await unlockAchievement('perfect_game');
```

#### `clearData()`
Clears all analytics data (sessions and achievements) and refreshes.

```typescript
const { clearData } = useAnalytics();
await clearData();
```

## Updated Files

### `hooks/use-analytics.ts` (NEW)
- Created dedicated hook for analytics
- Consumes state from GameContext
- Contains all business logic for analytics operations
- Full error handling and type safety
- Auto-refreshes context after mutations

### `hooks/use-game-context.ts` (UPDATED)
- Added `analytics` to the return object
- Components using `useGameContext()` now get analytics access
- Updated documentation with analytics example

### `components/screens/analytics-screen.tsx` (UPDATED)
- Simplified to use `useAnalytics()` hook
- Removed direct context access
- Removed direct API calls
- Cleaner, more maintainable code

## Benefits

### ✅ Consistent Architecture
Follows the same pattern as:
- `use-currency`
- `use-challenges`
- `use-equipment`
- `use-luthier`

### ✅ Separation of Concerns
- **Context** = Pure state storage
- **Hook** = Business logic + API calls
- **Component** = UI rendering

### ✅ Single Source of Truth
- Analytics state in GameContext
- No state duplication
- Automatic sync across components

### ✅ Better Developer Experience
```typescript
// Before: Multiple imports, manual state management
import { GameContext } from '@/contexts/game-context';
import { getUserAnalytics, clearUserAnalytics } from '~/features/supabase';
const context = useContext(GameContext);
const { user } = useAuth();
await getUserAnalytics(user.id);
// ... manual state updates

// After: Single hook, clean API
import { useAnalytics } from '@/hooks/use-analytics';
const { analytics, isLoading, refresh, clearData } = useAnalytics();
await refresh();
```

### ✅ Type Safety
- Fully typed interface
- Type inference for function parameters
- TypeScript enforces correct usage

### ✅ Error Handling
- Consistent error handling across all functions
- Proper error messages
- Throws errors for components to catch

### ✅ Auto-Refresh
- State automatically refreshes after mutations
- No manual context updates needed
- Always in sync with database

## Usage Examples

### Recording a Game Session

```typescript
import { useAnalytics } from '@/hooks/use-analytics';
import { useGameContext } from '@/hooks/use-game-context';

function GameScreen() {
  const { gameLogic, gameSettings } = useGameContext();
  const { addSession } = useAnalytics();

  const handleGameEnd = async () => {
    try {
      const sessionId = await addSession({
        gameMode: gameSettings.gameSettings.gameMode,
        difficulty: gameSettings.gameSettings.difficulty,
        notationSystem: gameSettings.gameSettings.notation,
        score: gameLogic.gameState.score,
        streak: gameLogic.gameState.streak,
        maxStreak: gameLogic.gameState.maxStreak,
        totalQuestions: gameLogic.gameState.totalQuestions,
        correctAnswers: gameLogic.gameState.correctAnswers,
        accuracy: Math.round(
          (gameLogic.gameState.correctAnswers / gameLogic.gameState.totalQuestions) * 100
        ),
        duration: Math.floor((Date.now() - startTime) / 1000),
      });

      console.log('Session recorded:', sessionId);
      // Analytics automatically refreshed, achievements checked!
    } catch (error) {
      console.error('Failed to record session:', error);
    }
  };

  return <GameUI onGameEnd={handleGameEnd} />;
}
```

### Displaying Analytics

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function StatsScreen() {
  const { analytics, isLoading } = useAnalytics();

  if (isLoading) return <Loading />;
  if (!analytics) return <Error />;

  return (
    <View>
      <Text>Total Games: {analytics.totalGamesPlayed}</Text>
      <Text>Best Streak: {analytics.bestStreak}</Text>
      <Text>Average Accuracy: {analytics.averageAccuracy}%</Text>
      <Text>Total Play Time: {formatPlayTime(analytics.totalPlayTime)}</Text>
    </View>
  );
}
```

### Using with useGameContext

```typescript
import { useGameContext } from '@/hooks/use-game-context';

function GameDashboard() {
  const { gameLogic, gameSettings, analytics } = useGameContext();

  return (
    <View>
      {/* Current game state */}
      <Text>Score: {gameLogic.gameState.score}</Text>
      <Text>Streak: {gameLogic.gameState.streak}</Text>
      
      {/* Analytics */}
      <Text>Total Games: {analytics.analytics?.totalGamesPlayed}</Text>
      <Text>Best Ever: {analytics.analytics?.bestStreak}</Text>
    </View>
  );
}
```

### Managing Achievements

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function AchievementsScreen() {
  const { analytics, unlockAchievement } = useAnalytics();

  const handleTestUnlock = async () => {
    const unlocked = await unlockAchievement('perfect_game');
    if (unlocked) {
      showToast('Achievement unlocked!');
    }
  };

  return (
    <View>
      {analytics?.achievements.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          onTest={handleTestUnlock}
        />
      ))}
    </View>
  );
}
```

## Testing

### Verify Hook Works

```typescript
// In a test file or console
import { useAnalytics } from '@/hooks/use-analytics';

// In a component
const { analytics, addSession } = useAnalytics();

// Add a test session
await addSession({
  gameMode: 'single-note',
  difficulty: 'beginner',
  notationSystem: 'letter',
  score: 100,
  streak: 5,
  maxStreak: 8,
  totalQuestions: 10,
  correctAnswers: 9,
  accuracy: 90,
  duration: 60,
});

// Analytics should auto-refresh
console.log('Total games:', analytics?.totalGamesPlayed);
```

## Comparison with Other Hooks

All hooks now follow the same pattern:

| Hook | State in Context | Logic in Hook | Supabase Integration |
|------|------------------|---------------|---------------------|
| `use-currency` | ✅ currency, currencyLoading | ✅ refresh, addGoldenShards, getHistory | ✅ |
| `use-challenges` | ✅ challenges, challengesLoading | ✅ refresh, start, updateProgress, redeem | ✅ |
| `use-equipment` | ✅ equipment, equipmentLoading | ✅ refresh, buy, upgrade, equip/unequip | ✅ |
| `use-luthier` | ✅ instruments, instrumentsLoading | ✅ refresh, buy, upgrade, tune, equip | ✅ |
| `use-analytics` | ✅ analytics, analyticsLoading | ✅ refresh, addSession, clear | ✅ |

## Files Changed

### Created
- ✅ `hooks/use-analytics.ts`

### Modified
- ✅ `hooks/use-game-context.ts` (added analytics to return)
- ✅ `components/screens/analytics-screen.tsx` (simplified to use hook)

### Verification
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ All type safety maintained

## Next Steps

### Integration in Game Flow

1. **Import the hook:**
   ```typescript
   import { useAnalytics } from '@/hooks/use-analytics';
   ```

2. **In game end logic:**
   ```typescript
   const { addSession } = useAnalytics();
   
   await addSession({
     gameMode,
     difficulty,
     notationSystem,
     score,
     streak,
     maxStreak,
     totalQuestions,
     correctAnswers,
     accuracy,
     duration,
   });
   ```

3. **Show achievement popup (optional):**
   ```typescript
   const previousAchievements = analytics?.achievements;
   await addSession(...);
   const newAchievements = analytics?.achievements.filter(
     a => a.isUnlocked && !previousAchievements?.find(
       p => p.id === a.id && p.isUnlocked
     )
   );
   if (newAchievements && newAchievements.length > 0) {
     showAchievementToast(newAchievements[0]);
   }
   ```

## Conclusion

The analytics system now follows the same clean architecture pattern as the rest of the application:

✅ **State Management**: Centralized in GameContext  
✅ **Business Logic**: Isolated in dedicated hook  
✅ **UI Components**: Clean and focused on rendering  
✅ **Type Safety**: Full TypeScript support  
✅ **Error Handling**: Consistent across all functions  
✅ **Auto-Sync**: State automatically refreshes after mutations  

This completes the analytics integration with a clean, maintainable, and scalable architecture! 🎉

