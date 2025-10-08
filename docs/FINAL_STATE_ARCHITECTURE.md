# Final State Architecture

## Complete State Centralization (Final Version)

All state is now stored in `GameContext` with **simple setters only**. All business logic, including reducer logic, is implemented in hooks.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GameContext                        │
│            (Pure State Container)                    │
│                                                      │
│  State + Simple Setters ONLY:                       │
│  ├─ gameState + setGameState                        │
│  ├─ gameSettings + setGameSettings                  │
│  ├─ currency + setCurrency                          │
│  ├─ challenges + setChallenges                      │
│  └─ loading states + setters                        │
│                                                      │
│  ❌ NO reducer/dispatcher                            │
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
    │ Reducer    │  │ Settings   │  │ API calls  │  │ API calls  │
    │ Logic      │  │ Logic      │  │ + state    │  │ + state    │
    │ + state    │  │ + state    │  │ updates    │  │ updates    │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

## GameContext - Pure State Container

### What it has:
```typescript
interface GameContextType {
  // Game logic state
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;  // ✅ Simple setter

  // Game settings state
  gameSettings: GameSettings;
  setGameSettings: Dispatch<SetStateAction<GameSettings>>;  // ✅ Simple setter

  // Currency state
  currency: UserCurrency;
  setCurrency: Dispatch<SetStateAction<UserCurrency>>;  // ✅ Simple setter

  // Challenges state
  challenges: Challenge[];
  setChallenges: Dispatch<SetStateAction<Challenge[]>>;  // ✅ Simple setter

  // Loading states (same pattern)
  // ...
}
```

### What it does:
- ✅ Stores ALL application state
- ✅ Provides simple setters (useState pattern)
- ✅ Loads initial data on mount
- ❌ NO reducer logic
- ❌ NO dispatch actions
- ❌ NO business logic

### Implementation:
```typescript
export function GameProvider({ children }: { children: ReactNode }) {
  // All state with simple useState
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [gameSettings, setGameSettings] = useState<GameSettings>(initialGameSettings);
  const [currency, setCurrency] = useState<UserCurrency>({ goldenNoteShards: 0 });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  // Initial data loading
  useEffect(() => {
    if (user && !isAuthLoading) {
      loadInitialData();
    }
  }, [user, isAuthLoading]);

  // Simple value object - just state + setters
  const value = {
    gameState,
    setGameState,
    gameSettings,
    setGameSettings,
    currency,
    setCurrency,
    challenges,
    setChallenges,
    // ... loading states
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
```

## useGameLogic Hook - Reducer Logic

### What it does:
- ✅ Implements ALL game reducer logic
- ✅ Uses `setGameState` to update state
- ✅ Manages game session timing
- ✅ Tracks challenge progress
- ✅ Saves game analytics

### Implementation:
```typescript
export function useGameLogic() {
  const { gameState, setGameState, setChallenges } = useContext(GameContext);

  // Helper functions for state updates (reducer logic)
  function startGameState(): Partial<GameState> {
    return {
      isGameActive: true,
      score: 0,
      streak: 0,
      maxStreak: 0,
      totalQuestions: 0,
      correctAnswers: 0,
    };
  }

  function submitAnswerState(currentState: GameState, answer: Notes[]): Partial<GameState> {
    const correctNotes = currentState.currentQuestion.notes.map((note) => note.name);
    const isCorrect = JSON.stringify(answer.sort()) === JSON.stringify(correctNotes.sort());
    const newStreak = isCorrect ? currentState.streak + 1 : 0;
    const points = isCorrect ? 10 + currentState.streak * 2 : 0;

    return {
      currentQuestion: {
        ...currentState.currentQuestion,
        answered: true,
        userAnswer: answer,
      },
      score: currentState.score + points,
      streak: newStreak,
      maxStreak: Math.max(currentState.maxStreak, newStreak),
      totalQuestions: currentState.totalQuestions + 1,
      correctAnswers: currentState.correctAnswers + (isCorrect ? 1 : 0),
    };
  }

  // Business logic operations
  const startGame = (gameSettings: GameSettings) => {
    gameStartTime = Date.now();
    setGameState((prev) => ({ ...prev, ...startGameState() }));  // ✅ Uses setter
    // ... challenge tracking
  };

  const submitAnswer = (answer: Notes[]) => {
    // ... logging
    setGameState((prev) => ({ ...prev, ...submitAnswerState(prev, answer) }));  // ✅ Uses setter
    // ... challenge tracking
  };

  const nextQuestion = () => {
    setGameState((prev) => ({ ...prev, ...nextQuestionState() }));  // ✅ Uses setter
  };

  return { gameState, startGame, submitAnswer, nextQuestion, ... };
}
```

## useGameSettings Hook - Settings Logic

### What it does:
- ✅ Implements ALL settings operations
- ✅ Uses `setGameSettings` to update state
- ✅ Provides convenience methods

### Implementation:
```typescript
export function useGameSettings() {
  const { gameSettings, setGameSettings } = useContext(GameContext);

  const updateDifficulty = (difficulty: Difficulty) => {
    setGameSettings((prev) => ({ ...prev, difficulty }));  // ✅ Uses setter
  };

  const toggleNoteLabels = () => {
    setGameSettings((prev) => ({
      ...prev,
      showNoteLabels: !prev.showNoteLabels,
    }));  // ✅ Uses setter
  };

  const resetSettings = () => {
    setGameSettings({
      notationSystem: NotationSystem.SOLFEGE,
      difficulty: Difficulty.BEGINNER,
      gameMode: GameMode.SINGLE_NOTE,
      showNoteLabels: true,
    });  // ✅ Uses setter
  };

  return {
    gameSettings,
    updateDifficulty,
    toggleNoteLabels,
    resetSettings,
    // ...
  };
}
```

## useCurrency Hook - Currency Logic

### What it does:
- ✅ Implements ALL currency operations
- ✅ Makes Supabase API calls
- ✅ Uses `setCurrency` to update state

### Implementation:
```typescript
export function useCurrency() {
  const { currency, setCurrency, setCurrencyLoading } = useContext(GameContext);
  const { user } = useAuth();

  const refresh = async () => {
    if (!user) return;
    try {
      setCurrencyLoading(true);
      const balance = await getUserBalance(user.id, 'golden_note_shards');
      setCurrency({ goldenNoteShards: balance });  // ✅ Uses setter
    } finally {
      setCurrencyLoading(false);
    }
  };

  const addGoldenShards = async (amount: number, description?: string) => {
    if (!user) return;
    await addGoldenShardsAPI(user.id, amount, description);
    await refresh();  // ✅ Updates state via setter
  };

  return { currency, refresh, addGoldenShards, ... };
}
```

## useChallenges Hook - Challenges Logic

### What it does:
- ✅ Implements ALL challenge operations
- ✅ Makes Supabase API calls
- ✅ Uses `setChallenges` to update state
- ✅ Can also update currency when needed

### Implementation:
```typescript
export function useChallenges() {
  const {
    challenges,
    setChallenges,
    setChallengesLoading,
    setCurrency,
    setCurrencyLoading,
  } = useContext(GameContext);
  const { user } = useAuth();

  const refresh = async () => {
    if (!user) return;
    try {
      setChallengesLoading(true);
      const fetchedChallenges = await fetchUserChallenges(user.id);
      setChallenges(fetchedChallenges);  // ✅ Uses setter
    } finally {
      setChallengesLoading(false);
    }
  };

  const redeemChallenge = async (challengeId: string) => {
    if (!user) return;
    await redeemChallengeAPI(user.id, challengeId);
    
    // Refresh challenges
    await refresh();
    
    // Refresh currency too (redeeming awards shards)
    setCurrencyLoading(true);
    const balance = await getUserBalance(user.id, 'golden_note_shards');
    setCurrency({ goldenNoteShards: balance });  // ✅ Uses setter
    setCurrencyLoading(false);
  };

  return { challenges, refresh, redeemChallenge, ... };
}
```

## Key Principles

### 1. Context = Dumb State Storage
```typescript
// ✅ ONLY state + setters
const value = {
  gameState,
  setGameState,          // Simple setter
  gameSettings,
  setGameSettings,       // Simple setter
  // ...
};

// ❌ NO dispatcher
dispatchGameAction     // Removed!

// ❌ NO reducer
useReducer()          // Not in context!

// ❌ NO business logic
startGame()           // Not in context!
```

### 2. Hooks = Smart Business Logic
```typescript
// ✅ Implements reducer logic
function startGameState(): Partial<GameState> { ... }
function submitAnswerState(...): Partial<GameState> { ... }

// ✅ Uses simple setters to update
setGameState((prev) => ({ ...prev, ...startGameState() }));
setGameState((prev) => ({ ...prev, ...submitAnswerState(prev, answer) }));

// ✅ Implements operations
startGame(), submitAnswer(), updateDifficulty(), addGoldenShards()
```

### 3. Consistent Pattern Everywhere
```typescript
// ALL hooks follow the same pattern:
export function useMyFeature() {
  const { myState, setMyState } = useContext(GameContext);
  
  // Helper functions for state updates
  function updateMyState(): Partial<MyState> { ... }
  
  // Operations that use setter
  const myOperation = () => {
    setMyState((prev) => ({ ...prev, ...updateMyState() }));
  };
  
  return { myState, myOperation };
}
```

## Benefits

### 1. Maximum Simplicity
- Context is just `useState` everywhere
- No complex reducer/dispatcher patterns in context
- Easy to understand: state goes in, state comes out

### 2. All Logic in Hooks
- Reducer logic in `useGameLogic`
- Settings logic in `useGameSettings`
- API logic in `useCurrency` and `useChallenges`
- Context has ZERO logic

### 3. Easy Testing
```typescript
// Mock context with simple state
const mockContext = {
  gameState: { score: 0, ... },
  setGameState: jest.fn(),
};

// Test hook operations
const { startGame } = useGameLogic();
startGame(settings);

expect(mockContext.setGameState).toHaveBeenCalledWith(expect.any(Function));
```

### 4. True Separation of Concerns
```
Context     → State storage (useState)
Hooks       → Business logic (operations + state updates)
Components  → Presentation (display + user interaction)
```

## Summary

**GameContext:**
- ✅ Stores ALL state with `useState`
- ✅ Provides simple setters
- ❌ NO reducer, NO dispatcher, NO logic

**Hooks:**
- ✅ useGameLogic implements reducer logic using `setGameState`
- ✅ useGameSettings implements settings logic using `setGameSettings`
- ✅ useCurrency implements currency logic using `setCurrency`
- ✅ useChallenges implements challenges logic using `setChallenges`

**Result:**
Clean, consistent, testable code with maximum separation of concerns. Context is a dumb store, hooks are smart operations. Perfect architecture! 🎉

