# Analytics Integration Summary

## Overview

Successfully migrated the game analytics system from AsyncStorage to Supabase, implementing a comprehensive database-backed solution for tracking game sessions, achievements, and player statistics.

## What Changed

### Database Layer

#### Migration File: `features/supabase/migrations/20251008053514_analytics.sql`

Created three new tables:
1. **`game_sessions`** - Stores individual game play sessions
   - Tracks score, streak, accuracy, duration
   - Links to user profile
   - Records game mode, difficulty, notation system

2. **`achievements`** - Master list of available achievements
   - Predefined achievement definitions
   - Icons, descriptions, unlock conditions

3. **`user_achievements`** - Tracks unlocked achievements per user
   - Many-to-many relationship
   - Records unlock timestamp

#### Database Functions

Created five RPC functions:

1. **`get_user_analytics(user_id)`**
   - Calculates real-time statistics from session data
   - Returns aggregated analytics (total games, best streak, averages, favorites)
   - Includes breakdowns by mode, notation, difficulty

2. **`add_game_session(...)`**
   - Inserts a new game session
   - Automatically checks for achievement unlocks
   - Returns session ID

3. **`unlock_achievement(user_id, achievement_id)`**
   - Unlocks an achievement for a user
   - Prevents duplicate unlocks
   - Returns true if newly unlocked

4. **`get_user_achievements(user_id)`**
   - Returns all achievements with unlock status
   - Includes unlock timestamps

5. **`get_recent_sessions(user_id, limit)`**
   - Returns recent game sessions
   - Ordered by date (newest first)

#### Seed Data: `features/supabase/seeds/achievements.sql`

Populated six default achievements:
- First Steps (complete first game)
- Hot Streak (5-note streak)
- Blazing Notes (10-note streak)
- Perfect Pitch (100% accuracy)
- Notation Master (play both notations)
- Dedicated Player (50 games)

### API Layer

#### New File: `features/supabase/api/analytics.ts`

Created TypeScript API functions:
- `addGameSession()` - Add a game session
- `getUserAnalytics()` - Get aggregated analytics
- `getRecentSessions()` - Get recent sessions
- `getUserAchievements()` - Get achievements with status
- `unlockAchievement()` - Manually unlock achievement
- `clearUserAnalytics()` - Clear all analytics (testing)

All functions use proper error handling and type safety.

### State Management

#### Updated: `contexts/game-context.tsx`

Added analytics state:
```typescript
analytics: UserAnalytics | null
analyticsLoading: boolean
setAnalytics: Dispatch<SetStateAction<UserAnalytics | null>>
setAnalyticsLoading: Dispatch<SetStateAction<boolean>>
```

Added analytics loading in `loadInitialData()`:
- Fetches analytics when user becomes available
- Stores in centralized context
- Available to all components

### Utility Layer

#### Refactored: `utils/analytics-storage.ts`

Completely refactored to use Supabase:

**Before:** Used AsyncStorage to save/load analytics

**After:** Uses Supabase API:
- `getAnalytics(userId)` - Gets from Supabase
- `addGameSession(session, userId)` - Adds to Supabase
- `clearAnalytics(userId)` - Clears from Supabase
- `saveAnalytics()` - Deprecated (analytics auto-calculated)

Kept utility functions:
- `formatPlayTime()` - Format seconds to human-readable
- `getStreakEmoji()` - Get emoji for streak value

### UI Layer

#### Updated: `components/screens/analytics-screen.tsx`

Refactored to use Supabase:
- Uses `GameContext` for analytics data
- Uses `useAuth` for user ID
- Loads analytics from Supabase if context unavailable
- Clears analytics via Supabase API
- Refreshes context after clear

**Key Improvements:**
- No more AsyncStorage
- Real-time calculated statistics
- Automatically unlocks achievements
- Full game history available

## Architecture Benefits

### ✅ Centralized State

Analytics stored in `GameContext`:
- Single source of truth
- No prop drilling
- Consistent across components

### ✅ Real-time Calculations

Analytics calculated on-demand from sessions:
- Always accurate
- No stale data
- No manual aggregation

### ✅ Complete History

All game sessions stored:
- Full audit trail
- Can generate any statistic
- Can analyze trends

### ✅ Automatic Achievements

Achievements unlock automatically:
- No manual tracking
- Instant unlock detection
- Consistent logic

### ✅ Type Safety

Full TypeScript support:
- Typed API functions
- Typed database responses
- Type-safe state management

## How It Works

### Recording a Game Session

```typescript
import { addGameSession } from '~/features/supabase';

// In game logic, when game ends:
await addGameSession(userId, {
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

// Automatically:
// 1. Inserts session to database
// 2. Checks for achievement unlocks
// 3. Returns session ID
```

### Displaying Analytics

```typescript
import { GameContext } from '@/contexts/game-context';
import { useContext } from 'react';

function StatsScreen() {
  const { analytics, analyticsLoading } = useContext(GameContext);

  if (analyticsLoading) return <Loading />;

  return (
    <View>
      <Text>Total Games: {analytics.totalGamesPlayed}</Text>
      <Text>Best Streak: {analytics.bestStreak}</Text>
      <Text>Average Accuracy: {analytics.averageAccuracy}%</Text>
    </View>
  );
}
```

### Achievement System

Achievements automatically unlock when:
1. A game session is added
2. The unlock condition is met
3. The achievement hasn't been unlocked before

**Unlock Conditions:**
- `first_game`: totalGamesPlayed === 1
- `streak_5`: maxStreak >= 5
- `streak_10`: maxStreak >= 10
- `perfect_game`: accuracy === 100
- `notation_master`: played both 'letter' and 'solfege'
- `dedicated_player`: totalGamesPlayed >= 50

## Database Structure

```
user_profiles (existing)
  ↓
game_sessions
  - Stores each game play
  - Links to user_profile
  - Contains full game details
  ↓
Analytics (calculated)
  - Total games played
  - Total score
  - Best streak
  - Average accuracy
  - Total play time
  - Favorite mode/notation/difficulty
  - Games per mode/notation/difficulty
  
achievements (master list)
  ↓
user_achievements
  - Links user to achievement
  - Records unlock timestamp
```

## Security

All tables have Row Level Security (RLS):
- Users can only access their own sessions
- Everyone can read achievement definitions
- Users can only unlock their own achievements

## Next Steps

To integrate analytics recording in the game:

1. **Import the API function:**
   ```typescript
   import { addGameSession } from '~/features/supabase';
   import { useAuth } from '~/features/supabase';
   ```

2. **In game end logic:**
   ```typescript
   const { user } = useAuth();
   
   // When game ends
   await addGameSession(user.id, {
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
   
   // Refresh analytics in context
   const updatedAnalytics = await getUserAnalytics(user.id);
   setAnalytics(updatedAnalytics);
   ```

3. **Show achievement unlock popup (optional):**
   ```typescript
   // After adding session, check for new achievements
   const newAchievements = updatedAnalytics.achievements.filter(
     a => a.isUnlocked && !previousAnalytics.achievements.find(
       p => p.id === a.id && p.isUnlocked
     )
   );
   
   if (newAchievements.length > 0) {
     showAchievementToast(newAchievements[0]);
   }
   ```

## Testing

### Test Adding a Session

```typescript
// In your test file or console
import { addGameSession } from '~/features/supabase';

await addGameSession(userId, {
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
```

### View in Supabase

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `game_sessions` table
4. Filter by your `user_id`

### Reset Analytics

```typescript
import { clearUserAnalytics } from '~/features/supabase';

// Clears all sessions and achievements
await clearUserAnalytics(userId);
```

## Files Changed

### Created
- ✅ `features/supabase/migrations/20251008053514_analytics.sql`
- ✅ `features/supabase/seeds/achievements.sql`
- ✅ `features/supabase/api/analytics.ts`
- ✅ `features/supabase/ANALYTICS_SYSTEM.md`
- ✅ `docs/ANALYTICS_INTEGRATION.md`

### Modified
- ✅ `features/supabase/index.ts` (exported analytics API)
- ✅ `contexts/game-context.tsx` (added analytics state)
- ✅ `utils/analytics-storage.ts` (refactored to use Supabase)
- ✅ `components/screens/analytics-screen.tsx` (use Supabase)

### TypeScript & Linting
- ✅ All TypeScript checks pass
- ✅ All linting checks pass
- ✅ Full type safety maintained

## Documentation

📚 See `features/supabase/ANALYTICS_SYSTEM.md` for:
- Detailed database schema
- Function documentation
- API usage examples
- Security details
- Performance considerations
- Future enhancements

## Conclusion

The analytics system is now fully integrated with Supabase, providing:
- Real-time calculated statistics
- Complete game history
- Automatic achievement tracking
- Type-safe API
- Centralized state management
- Scalable architecture

All TypeScript and linting checks pass. The system is ready for use! 🎉

