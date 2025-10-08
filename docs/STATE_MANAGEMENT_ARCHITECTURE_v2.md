# State Management Architecture v2

## Complete State Centralization

All application state is now managed centrally in `GameContext`, with hooks providing business logic.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   GameContext                        │
│               (Pure State Container)                 │
│                                                      │
│  ✅ gameState + dispatchGameAction                   │
│  ✅ gameSettings + setGameSettings                   │
│  ✅ currency + setCurrency                           │
│  ✅ challenges + setChallenges                       │
│  ✅ loading states + setters                         │
│                                                      │
│  ❌ NO business logic                                │
│  ❌ NO operations                                     │
└─────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┬───────────────┐
           │               │               │               │
           ▼               ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │useGameLogic│  │useGameSettings│ │useCurrency│  │useChallenges│
    │            │  │            │  │            │  │            │
    │ Business   │  │ Business   │  │ Business   │  │ Business   │
    │ Logic      │  │ Logic      │  │ Logic      │  │ Logic      │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

## State in Context

### Game Logic State
```typescript
// In GameContext
const [gameState, dispatchGameAction] = useReducer(gameReducer, initialGameState);

// Exposed to hooks
interface GameContextType {
  gameState: GameState;  // score, streak, questions, etc.
  dispatchGameAction: Dispatch<GameAction>;
}
```

### Game Settings State
```typescript
// In GameContext
const [gameSettings, setGameSettings] = useState<GameSettings>(initialGameSettings);

// Exposed to hooks
interface GameContextType {
  gameSettings: GameSettings;  // notation, difficulty, mode, etc.
  setGameSettings: Dispatch<SetStateAction<GameSettings>>;
}
```

### Currency State
```typescript
// In GameContext
const [currency, setCurrency] = useState<UserCurrency>({ goldenNoteShards: 0 });
const [currencyLoading, setCurrencyLoading] = useState(true);

// Exposed to hooks
interface GameContextType {
  currency: UserCurrency;
  currencyLoading: boolean;
  setCurrency: Dispatch<SetStateAction<UserCurrency>>;
  setCurrencyLoading: Dispatch<SetStateAction<boolean>>;
}
```

### Challenges State
```typescript
// In GameContext
const [challenges, setChallenges] = useState<Challenge[]>([]);
const [challengesLoading, setChallengesLoading] = useState(true);

// Exposed to hooks
interface GameContextType {
  challenges: Challenge[];
  challengesLoading: boolean;
  setChallenges: Dispatch<SetStateAction<Challenge[]>>;
  setChallengesLoading: Dispatch<SetStateAction<boolean>>;
}
```

## Hooks (Business Logic)

### useGameLogic Hook

**Uses:**
- `gameState` from context (read)
- `dispatchGameAction` from context (write)
- `setChallenges` from context (for challenge tracking)

**Provides:**
```typescript
interface UseGameLogicReturn {
  gameState: GameState;
  startGame: (settings: GameSettings) => void;
  endGame: (settings: GameSettings) => Promise<void>;
  submitAnswer: (answer: Notes[]) => void;
  nextQuestion: () => void;
  resetStreak: () => void;
  generateNewQuestion: (settings: GameSettings) => void;
  setChallengeProgressCallback: (callback) => void;
}
```

**Business Logic:**
- Dispatches game actions (START_GAME, END_GAME, SUBMIT_ANSWER, etc.)
- Calculates scores and streaks
- Saves game sessions to analytics
- Tracks challenge progress
- Manages game start time

### useGameSettings Hook

**Uses:**
- `gameSettings` from context (read)
- `setGameSettings` from context (write)

**Provides:**
```typescript
interface UseGameSettingsReturn {
  gameSettings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateNotationSystem: (system: NotationSystem) => void;
  updateDifficulty: (difficulty: Difficulty) => void;
  updateGameMode: (mode: GameMode) => void;
  toggleNoteLabels: () => void;
  updateTimeLimit: (limit?: number) => void;
  resetSettings: () => void;
}
```

**Business Logic:**
- Updates individual settings
- Merges partial settings
- Resets to defaults

### useCurrency Hook

**Uses:**
- `currency` from context (read)
- `currencyLoading` from context (read)
- `setCurrency` from context (write)
- `setCurrencyLoading` from context (write)

**Provides:**
```typescript
interface UseCurrencyReturn {
  currency: UserCurrency;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addGoldenShards: (amount: number, desc?: string) => Promise<void>;
  getHistory: (limit?: number) => Promise<CurrencyTransaction[]>;
  getSummary: () => Promise<TransactionSummary>;
  hasSufficientBalance: (amount: number) => Promise<boolean>;
}
```

**Business Logic:**
- Fetches balance from Supabase
- Adds/deducts shards
- Gets transaction history
- Checks sufficient balance

### useChallenges Hook

**Uses:**
- `challenges` from context (read)
- `challengesLoading` from context (read)
- `setChallenges` from context (write)
- `setChallengesLoading` from context (write)
- `setCurrency` + `setCurrencyLoading` (for rewards)

**Provides:**
```typescript
interface UseChallengesReturn {
  challenges: Challenge[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  startChallenge: (id: string) => Promise<void>;
  updateChallengeProgress: (type: ChallengeType, amount: number) => Promise<void>;
  redeemChallenge: (id: string) => Promise<void>;
  resetChallenges: () => Promise<void>;
}
```

**Business Logic:**
- Fetches challenges from Supabase
- Starts/updates challenges
- Redeems rewards (updates currency too!)
- Resets challenges

## Component Usage

### Option 1: Use Individual Hooks
```tsx
function MyScreen() {
  const { gameState, startGame, endGame } = useGameLogic();
  const { gameSettings, updateDifficulty } = useGameSettings();
  const { currency } = useCurrency();
  const { challenges } = useChallenges();

  return (
    <View>
      <Text>Score: {gameState.score}</Text>
      <Text>Balance: {currency.goldenNoteShards}</Text>
    </View>
  );
}
```

### Option 2: Use useGameContext (convenience)
```tsx
function MyScreen() {
  const { gameLogic, gameSettings } = useGameContext();

  return (
    <View>
      <Text>Score: {gameLogic.gameState.score}</Text>
      <Text>Difficulty: {gameSettings.gameSettings.difficulty}</Text>
    </View>
  );
}
```

**Note:** `useGameContext()` is just a convenience wrapper that calls `useGameLogic()` and `useGameSettings()` for you.

## Data Flow Examples

### Example 1: Starting a Game
```
Component calls gameLogic.startGame(settings)
              ↓
Hook sets gameStartTime = Date.now()
              ↓
Hook dispatches { type: 'START_GAME' }
              ↓
Context reducer updates gameState
              ↓
All components see new gameState
```

### Example 2: Changing Difficulty
```
Component calls gameSettings.updateDifficulty(Difficulty.ADVANCED)
              ↓
Hook calls setGameSettings(prev => ({ ...prev, difficulty: Difficulty.ADVANCED }))
              ↓
Context updates gameSettings state
              ↓
All components see new gameSettings
```

### Example 3: Redeeming Challenge
```
Component calls challenges.redeemChallenge(id)
              ↓
Hook calls Supabase API to redeem
              ↓
Hook fetches updated challenges
              ↓
Hook calls setChallenges(newChallenges)
              ↓
Hook fetches updated currency balance
              ↓
Hook calls setCurrency(newBalance)
              ↓
All components see updated challenges AND currency
```

## Benefits

### 1. True Single Source of Truth
- ALL state lives in one place (GameContext)
- No duplicate state anywhere
- State changes propagate everywhere instantly

### 2. Complete Separation of Concerns
- **Context** = Dumb state container
- **Hooks** = Smart business logic
- **Components** = Presentation only

### 3. Easy Testing
```typescript
// Test hook by mocking context
const mockContext = {
  gameState: { score: 0, streak: 0, ... },
  dispatchGameAction: jest.fn(),
};

jest.spyOn(React, 'useContext').mockReturnValue(mockContext);

const { startGame } = useGameLogic();
startGame(settings);

expect(mockContext.dispatchGameAction).toHaveBeenCalledWith({ type: 'START_GAME' });
```

### 4. Maintainability
- Easy to find where state lives (GameContext)
- Easy to find where logic lives (hooks)
- Clear, predictable data flow

### 5. Performance
- Minimal re-renders (only affected components update)
- No prop drilling
- Efficient state updates

## File Structure

```
/contexts
  └─ game-context.tsx          # All state + setters/dispatchers

/hooks
  ├─ use-game-logic.ts         # Game logic business logic
  ├─ use-game-settings.ts      # Settings business logic
  ├─ use-currency.ts           # Currency business logic
  ├─ use-challenges.ts         # Challenges business logic
  └─ use-game-context.ts       # Convenience wrapper

/app
  ├─ game/
  │  ├─ single-note.tsx        # Uses useGameContext()
  │  └─ sequence.tsx           # Uses useGameContext()
  ├─ settings/
  │  ├─ difficulty.tsx         # Uses useGameSettings()
  │  └─ helpers.tsx            # Uses useGameSettings()
  └─ (tabs)/
     ├─ equipment.tsx          # Uses useCurrency()
     └─ luthier.tsx            # Uses useCurrency()
```

## Migration Summary

### Before
```tsx
// Hooks had their own state
export function useGameLogic() {
  const [gameState, dispatch] = useReducer(...);  // ❌ Local state
  return { gameState, ... };
}

export function useGameSettings() {
  const [gameSettings, setGameSettings] = useState(...);  // ❌ Local state
  return { gameSettings, ... };
}
```

### After
```tsx
// Hooks use context state
export function useGameLogic() {
  const { gameState, dispatchGameAction } = useContext(GameContext);  // ✅ Shared state
  // ... business logic ...
  return { gameState, ... };
}

export function useGameSettings() {
  const { gameSettings, setGameSettings } = useContext(GameContext);  // ✅ Shared state
  // ... business logic ...
  return { gameSettings, ... };
}
```

## Key Principles

1. **Context = State Storage Only**
   - No business logic
   - No operations
   - Just state + setters/dispatchers

2. **Hooks = Business Logic Only**
   - Use context state
   - Implement operations
   - Update state via setters/dispatchers

3. **Components = Presentation Only**
   - Use hooks
   - Display data
   - Call hook operations

## Summary

All application state now lives in `GameContext`:
- ✅ `gameState` (managed by reducer)
- ✅ `gameSettings` (managed by setState)
- ✅ `currency` (managed by setState)
- ✅ `challenges` (managed by setState)

All business logic lives in hooks:
- ✅ `useGameLogic()` - Game operations
- ✅ `useGameSettings()` - Settings operations
- ✅ `useCurrency()` - Currency operations
- ✅ `useChallenges()` - Challenge operations

Result: **Clean, maintainable, testable code with true single source of truth!**

