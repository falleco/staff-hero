# Game Analytics System

The Staff Hero app uses a comprehensive analytics system in Supabase for tracking game sessions, achievements, and player statistics.

## Architecture

Instead of storing aggregated statistics, the system:
- **Stores individual game sessions** with full details
- **Calculates analytics on-demand** from session data
- **Tracks achievement unlocks** automatically
- **Provides real-time statistics** without data staleness

## Database Schema

### `game_sessions` Table

Stores individual game play sessions with detailed stats.

```sql
- id: uuid (primary key)
- user_id: uuid (references user_profiles)
- game_mode: text ('single-note', 'sequence', 'rhythm')
- difficulty: text ('beginner', 'intermediate', 'advanced')
- notation_system: text ('letter', 'solfege')
- score: integer
- streak: integer
- max_streak: integer
- total_questions: integer
- correct_answers: integer
- accuracy: integer (percentage 0-100)
- duration: integer (seconds)
- created_at: timestamp
```

### `achievements` Table

Master list of all available achievements.

```sql
- id: text (primary key)
- title: text
- description: text
- icon: text (emoji)
- unlock_condition: text
- created_at: timestamp
- updated_at: timestamp
```

### `user_achievements` Table

Tracks which achievements each user has unlocked.

```sql
- id: uuid (primary key)
- user_id: uuid (references user_profiles)
- achievement_id: text (references achievements)
- unlocked_at: timestamp
- unique(user_id, achievement_id)
```

## Database Functions

### `get_user_analytics(user_id)`

Returns aggregated analytics calculated from all game sessions.

**Returns:**
```json
{
  "totalGamesPlayed": 42,
  "totalScore": 15230,
  "bestStreak": 15,
  "averageAccuracy": 87,
  "totalPlayTime": 3600,
  "favoriteGameMode": "single-note",
  "favoriteNotation": "letter",
  "favoriteDifficulty": "intermediate",
  "gamesPerMode": {
    "single-note": 30,
    "sequence": 10,
    "rhythm": 2
  },
  "gamesPerNotation": {
    "letter": 25,
    "solfege": 17
  },
  "gamesPerDifficulty": {
    "beginner": 15,
    "intermediate": 20,
    "advanced": 7
  }
}
```

### `add_game_session(...)`

Adds a game session and automatically checks for achievement unlocks.

**Parameters:**
- `user_id`: UUID
- `game_mode`: text
- `difficulty`: text
- `notation_system`: text
- `score`: integer
- `streak`: integer
- `max_streak`: integer
- `total_questions`: integer
- `correct_answers`: integer
- `accuracy`: integer
- `duration`: integer

**Returns:** Session UUID

**Automatic Achievement Checks:**
- First game → unlocks "First Steps"
- Streak ≥ 5 → unlocks "Hot Streak"
- Streak ≥ 10 → unlocks "Blazing Notes"
- Accuracy = 100% → unlocks "Perfect Pitch"
- Played both notations → unlocks "Notation Master"
- Total games ≥ 50 → unlocks "Dedicated Player"

### `get_user_achievements(user_id)`

Returns all achievements with unlock status for a user.

**Returns:** Array of achievements with:
- `id`, `title`, `description`, `icon`
- `is_unlocked`: boolean
- `unlocked_at`: timestamp (if unlocked)

### `get_recent_sessions(user_id, limit)`

Returns recent game sessions for a user.

**Parameters:**
- `user_id`: UUID
- `limit`: integer (default: 20)

**Returns:** Array of game sessions

### `unlock_achievement(user_id, achievement_id)`

Manually unlocks an achievement.

**Returns:** boolean (true if newly unlocked, false if already unlocked)

## TypeScript API

### Add Game Session

```typescript
import { addGameSession } from '~/features/supabase';

// Add a game session (auto-checks achievements)
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
  duration: 180, // 3 minutes
});
```

### Get User Analytics

```typescript
import { getUserAnalytics } from '~/features/supabase';

const analytics = await getUserAnalytics(userId);

console.log(`Total games: ${analytics.totalGamesPlayed}`);
console.log(`Best streak: ${analytics.bestStreak}`);
console.log(`Average accuracy: ${analytics.averageAccuracy}%`);
console.log(`Total play time: ${analytics.totalPlayTime}s`);
```

### Get Achievements

```typescript
import { getUserAchievements } from '~/features/supabase';

const achievements = await getUserAchievements(userId);

achievements.forEach(achievement => {
  if (achievement.isUnlocked) {
    console.log(`✅ ${achievement.title} - unlocked ${achievement.unlockedAt}`);
  } else {
    console.log(`🔒 ${achievement.title} - ${achievement.description}`);
  }
});
```

### Get Recent Sessions

```typescript
import { getRecentSessions } from '~/features/supabase';

const recentSessions = await getRecentSessions(userId, 10);

recentSessions.forEach(session => {
  console.log(`${session.gameMode}: ${session.score} pts (${session.accuracy}%)`);
});
```

### Clear Analytics

```typescript
import { clearUserAnalytics } from '~/features/supabase';

// Delete all sessions and achievements (for testing)
await clearUserAnalytics(userId);
```

## Usage in React

### With Context

```typescript
import { GameContext } from '@/contexts/game-context';
import { useContext } from 'react';

function MyComponent() {
  const { analytics, analyticsLoading } = useContext(GameContext);

  if (analyticsLoading) return <Loading />;

  return (
    <View>
      <Text>Games Played: {analytics.totalGamesPlayed}</Text>
      <Text>Best Streak: {analytics.bestStreak}</Text>
      <Text>Average Accuracy: {analytics.averageAccuracy}%</Text>
    </View>
  );
}
```

### Refactored Analytics Storage

The `utils/analytics-storage.ts` has been refactored to use Supabase:

```typescript
import { addGameSession, getAnalytics } from '@/utils/analytics-storage';

// Get analytics
const analytics = await getAnalytics(userId);

// Add session
await addGameSession(sessionData, userId);
```

## Achievements

### Default Achievements

Six default achievements are included:

| ID | Title | Condition | Icon |
|----|-------|-----------|------|
| `first_game` | First Steps | Complete 1 game | 🎵 |
| `streak_5` | Hot Streak | Achieve streak of 5 | 🔥 |
| `streak_10` | Blazing Notes | Achieve streak of 10 | 🔥🔥 |
| `perfect_game` | Perfect Pitch | 100% accuracy game | ⭐ |
| `notation_master` | Notation Master | Play both notations | 🎼 |
| `dedicated_player` | Dedicated Player | Complete 50 games | 🏆 |

### Automatic Unlocking

Achievements are automatically checked and unlocked when:
1. A game session is added via `add_game_session()`
2. The unlock condition is met
3. The achievement hasn't been unlocked before

### Manual Unlocking

```typescript
import { unlockAchievement } from '~/features/supabase';

// Manually unlock (admin/testing)
const newlyUnlocked = await unlockAchievement(userId, 'perfect_game');
```

## Analytics Screen

The `AnalyticsScreen` component has been updated to:
- Use `GameContext` for analytics data
- Use `useAuth` for user ID
- Load analytics from Supabase
- Display real-time calculated stats
- Show unlocked achievements
- Display recent game sessions

```typescript
import { AnalyticsScreen } from '@/components/screens/analytics-screen';

// Screen displays:
// - Total games, score, best streak
// - Average accuracy
// - Total play time
// - Favorite game mode, notation, difficulty
// - Achievement progress
// - Recent game sessions
// - Clear data button (dev)
```

## Benefits

### ✅ Real-time Accuracy

Analytics are calculated on-demand from session data, always accurate.

### ✅ Complete History

All game sessions are stored with full details for future analysis.

### ✅ Automatic Achievements

No manual tracking needed - achievements unlock automatically.

### ✅ Audit Trail

Every game session is recorded with timestamp.

### ✅ Flexible Queries

Can generate any statistic from session data.

### ✅ Scalable

Database efficiently handles thousands of sessions per user.

## Performance

### Indexed Queries

All queries are optimized with indexes:
- `user_id` (fast user lookups)
- `created_at` (recent sessions)
- `game_mode` (mode-specific queries)

### Aggregation

Analytics are calculated server-side using PostgreSQL:
- Fast SUM/AVG/MAX queries
- Efficient grouping (mode, notation, difficulty)
- Minimal data transfer

### Caching

Analytics are loaded once and stored in `GameContext`:
- No repeated database calls
- Instant access across components
- Refreshed after new sessions

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Server-side validation
- ✅ Automatic achievement verification
- ✅ Immutable sessions (no updates)

## Testing

### View Sessions in Supabase

1. Go to **Table Editor**
2. Select `game_sessions` table
3. Filter by `user_id`

### Reset Analytics

```typescript
import { clearUserAnalytics } from '~/features/supabase';

// For testing - clears all sessions and achievements
await clearUserAnalytics(userId);
```

## Future Enhancements

### Leaderboards

```sql
-- Top players by total score
SELECT user_id, SUM(score) as total_score
FROM game_sessions
GROUP BY user_id
ORDER BY total_score DESC
LIMIT 10;
```

### Daily/Weekly Stats

```sql
-- Games played today
SELECT COUNT(*) FROM game_sessions
WHERE user_id = $1
  AND created_at >= CURRENT_DATE;
```

### Advanced Achievements

Add more complex achievements:
- Play every difficulty level
- 100 perfect games
- 1000 total games
- Specific note mastery

### Session Replay

Store question history to replay sessions:
```json
{
  "session_id": "...",
  "questions": [
    { "note": "C4", "answer": "C", "correct": true, "time": 2.5 }
  ]
}
```

## Resources

- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Aggregation](https://www.postgresql.org/docs/current/functions-aggregate.html)

