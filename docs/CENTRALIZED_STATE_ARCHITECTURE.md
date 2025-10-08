# Centralized State Architecture

## Overview

The application uses a **centralized state management pattern** where:
- **GameContext** acts as a simple state container (dumb store)
- **Hooks** implement all business logic (smart operations)
- **Components** consume data from hooks

This architecture ensures:
- ✅ Single source of truth for state
- ✅ No duplicate state across components
- ✅ Clear separation of concerns
- ✅ Business logic is testable and reusable
- ✅ State changes propagate everywhere automatically

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   GameProvider                       │
│                  (State Container)                   │
│                                                      │
│  State:                                             │
│  ├─ currency: UserCurrency                          │
│  ├─ currencyLoading: boolean                        │
│  ├─ challenges: Challenge[]                         │
│  ├─ challengesLoading: boolean                      │
│  ├─ gameLogic: UseGameLogicReturn                   │
│  └─ gameSettings: UseGameSettingsReturn             │
│                                                      │
│  Setters:                                           │
│  ├─ setCurrency()                                    │
│  ├─ setCurrencyLoading()                             │
│  ├─ setChallenges()                                  │
│  └─ setChallengesLoading()                           │
│                                                      │
│  Initial Data Loading:                              │
│  └─ loadInitialData() - fetches data when user ready│
└─────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │useCurrency │  │useChallenges│ │Components  │
    │   Hook     │  │   Hook      │ │  (Read)    │
    │            │  │             │ │            │
    │ Business   │  │ Business    │ │ Display    │
    │ Logic:     │  │ Logic:      │ │ State      │
    │            │  │             │ │            │
    │ - refresh()│  │ - refresh() │ │            │
    │ - add()    │  │ - start()   │ │            │
    │ - deduct() │  │ - update()  │ │            │
    │ - history()│  │ - redeem()  │ │            │
    │            │  │ - reset()   │ │            │
    │            │  │             │ │            │
    │ Supabase   │  │ Supabase    │ │            │
    │ API Calls  │  │ API Calls   │ │            │
    │            │  │             │ │            │
    │ Update     │  │ Update      │ │            │
    │ Context    │  │ Context     │ │            │
    │ State via  │  │ State via   │ │            │
    │ Setters    │  │ Setters     │ │            │
    └────────────┘  └────────────┘  └────────────┘
```

## State Flow

### 1. Initial Data Load
```
User signs in → GameProvider.loadInitialData()
                ↓
    Fetch currency from Supabase
                ↓
    setCurrency({ goldenNoteShards: balance })
                ↓
    Fetch challenges from Supabase
                ↓
    setChallenges(challenges)
                ↓
    State available to all hooks/components
```

### 2. Currency Operations (via useCurrency hook)
```
Component calls useCurrency().addGoldenShards(100)
                ↓
    Hook calls Supabase API
                ↓
    Hook calls refresh()
                ↓
    Fetches new balance
                ↓
    setCurrency({ goldenNoteShards: newBalance })
                ↓
    All components see updated balance
```

### 3. Challenge Operations (via useChallenges hook)
```
Component calls useChallenges().redeemChallenge(id)
                ↓
    Hook calls Supabase API (redeems + awards currency)
                ↓
    Hook refreshes challenges
                ↓
    setChallenges(newChallenges)
                ↓
    Hook refreshes currency too
                ↓
    setCurrency({ goldenNoteShards: newBalance })
                ↓
    All components see updated challenges & currency
```

## File Structure

```
/contexts
  └─ game-context.tsx          # State container (dumb store)

/hooks
  ├─ use-currency.ts           # Currency business logic
  ├─ use-challenges.ts         # Challenges business logic
  ├─ use-game-logic.ts         # Game logic (score, streak, etc)
  └─ use-game-settings.ts      # Settings (difficulty, notation)

/features/supabase/api
  ├─ currency.ts               # Currency API functions
  ├─ challenges.ts             # Challenges API functions
  └─ user-profile.ts           # User profile API functions
```

## GameContext (State Container)

### Responsibilities
✅ Store state (currency, challenges, loading states)
✅ Provide setters for state updates
✅ Load initial data when user becomes available
✅ Connect game logic to challenge tracking
❌ NO business logic (no add/update/delete operations)
❌ NO API calls (except initial data load)

### Interface
```typescript
interface GameContextType {
  // Game logic and settings
  gameLogic: UseGameLogicReturn;
  gameSettings: UseGameSettingsReturn;

  // Currency state (read-only for components, writable for hooks)
  currency: UserCurrency;
  currencyLoading: boolean;
  setCurrency: Dispatch<SetStateAction<UserCurrency>>;
  setCurrencyLoading: Dispatch<SetStateAction<boolean>>;

  // Challenges state (read-only for components, writable for hooks)
  challenges: Challenge[];
  challengesLoading: boolean;
  setChallenges: Dispatch<SetStateAction<Challenge[]>>;
  setChallengesLoading: Dispatch<SetStateAction<boolean>>;
}
```

## Hooks (Business Logic)

### useCurrency Hook

**Responsibilities:**
- Implement currency business logic
- Make Supabase API calls
- Update context state via setters
- Expose currency operations to components

**Operations:**
```typescript
interface UseCurrencyReturn {
  currency: UserCurrency;              // Read from context
  isLoading: boolean;                  // Read from context
  refresh: () => Promise<void>;        // Fetch latest balance
  addGoldenShards: (amount, desc) => Promise<void>;  // Add/deduct
  getHistory: (limit) => Promise<CurrencyTransaction[]>;
  getSummary: () => Promise<{...}>;
  hasSufficientBalance: (amount) => Promise<boolean>;
}
```

**Example Usage:**
```tsx
function ShopScreen() {
  const { currency, addGoldenShards, hasSufficientBalance } = useCurrency();
  
  const handlePurchase = async (price: number) => {
    if (await hasSufficientBalance(price)) {
      await addGoldenShards(-price, 'Purchase item');
      // currency is automatically updated
    }
  };

  return <Text>Balance: {currency.goldenNoteShards}</Text>;
}
```

### useChallenges Hook

**Responsibilities:**
- Implement challenges business logic
- Make Supabase API calls
- Update context state via setters
- Update currency when redeeming/resetting

**Operations:**
```typescript
interface UseChallengesReturn {
  challenges: Challenge[];             // Read from context
  isLoading: boolean;                  // Read from context
  refresh: () => Promise<void>;        // Fetch latest challenges
  startChallenge: (id) => Promise<void>;
  updateChallengeProgress: (type, amount) => Promise<void>;
  redeemChallenge: (id) => Promise<void>;  // Also updates currency
  resetChallenges: () => Promise<void>;    // Also resets currency
}
```

**Example Usage:**
```tsx
function ChallengesScreen() {
  const { challenges, redeemChallenge } = useChallenges();
  
  const handleRedeem = async (challengeId: string) => {
    await redeemChallenge(challengeId);
    // Both challenges and currency are automatically updated
  };

  return (
    <View>
      {challenges.map(challenge => (
        <ChallengeCard 
          key={challenge.id}
          challenge={challenge}
          onRedeem={handleRedeem}
        />
      ))}
    </View>
  );
}
```

## Key Benefits

### 1. Single Source of Truth
- State lives in one place (GameContext)
- No duplicate state across components
- State changes propagate everywhere automatically

### 2. Separation of Concerns
- Context = dumb state container
- Hooks = smart business logic
- Components = presentation only

### 3. Easy Testing
```typescript
// Test hook in isolation
const mockContext = {
  currency: { goldenNoteShards: 100 },
  setCurrency: jest.fn(),
  // ...
};

jest.spyOn(React, 'useContext').mockReturnValue(mockContext);

const { addGoldenShards } = useCurrency();
await addGoldenShards(50);

expect(mockContext.setCurrency).toHaveBeenCalled();
```

### 4. Performance
- Minimal re-renders (only affected components update)
- No unnecessary API calls (centralized refresh)
- Loading states prevent duplicate fetches

### 5. Maintainability
- Business logic is in one place (hooks)
- Easy to find where operations happen
- Clear data flow (Context → Hook → Component)

## Common Patterns

### Pattern 1: Read-only component
```tsx
function DisplayBalance() {
  const { currency } = useCurrency();
  return <Text>{currency.goldenNoteShards}</Text>;
}
```

### Pattern 2: Component with operations
```tsx
function ShopItem({ price }: { price: number }) {
  const { currency, addGoldenShards } = useCurrency();
  
  const handleBuy = async () => {
    await addGoldenShards(-price, 'Purchase');
  };
  
  return (
    <Button onPress={handleBuy}>
      Buy ({price} shards)
    </Button>
  );
}
```

### Pattern 3: Multi-hook component
```tsx
function GameOverScreen() {
  const { currency } = useCurrency();
  const { challenges, updateChallengeProgress } = useChallenges();
  
  // Can use both hooks together
  // State updates from either hook propagate everywhere
}
```

### Pattern 4: Hook calling another hook's operation
```tsx
// useChallenges can update currency when redeeming
const redeemChallenge = async (id: string) => {
  await redeemChallengeAPI(user.id, id);
  
  // Update challenges
  const fetchedChallenges = await fetchUserChallenges(user.id);
  setChallenges(fetchedChallenges);
  
  // Update currency too (redeeming awards shards)
  const balance = await getUserBalance(user.id, 'golden_note_shards');
  setCurrency({ goldenNoteShards: balance });
};
```

## Migration from Old Architecture

### Before (Duplicated State)
```tsx
// Each hook had its own state
function useCurrency() {
  const [currency, setCurrency] = useState({...});
  // ...
}

function useChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [currency, setCurrency] = useState({...}); // DUPLICATE!
  // ...
}

// Problem: Using both hooks created 2 copies of currency
```

### After (Centralized State)
```tsx
// Context stores state once
function GameProvider() {
  const [currency, setCurrency] = useState({...});
  const [challenges, setChallenges] = useState([]);
  // ...
}

// Hooks access the same state
function useCurrency() {
  const { currency, setCurrency } = useContext(GameContext);
  // ...
}

function useChallenges() {
  const { challenges, setChallenges, setCurrency } = useContext(GameContext);
  // Can update currency when needed
}

// Solution: One copy of state, shared by all hooks/components
```

## Best Practices

### ✅ DO
- Use hooks in components to access state and operations
- Update state via setters provided by context
- Refresh data after mutations
- Update related state when needed (e.g., currency after redeeming challenge)

### ❌ DON'T
- Don't duplicate state in hooks or components
- Don't access context directly in components (use hooks)
- Don't forget to update loading states
- Don't skip error handling in hooks

## Testing Strategy

### Testing Hooks
```typescript
describe('useCurrency', () => {
  it('should add golden shards', async () => {
    const mockSetCurrency = jest.fn();
    
    jest.spyOn(React, 'useContext').mockReturnValue({
      currency: { goldenNoteShards: 100 },
      setCurrency: mockSetCurrency,
      setCurrencyLoading: jest.fn(),
    });
    
    const { addGoldenShards } = useCurrency();
    await addGoldenShards(50);
    
    expect(mockSetCurrency).toHaveBeenCalled();
  });
});
```

### Testing Components
```tsx
describe('ShopScreen', () => {
  it('should display balance', () => {
    render(
      <GameProvider>
        <ShopScreen />
      </GameProvider>
    );
    
    expect(screen.getByText(/Balance:/)).toBeTruthy();
  });
});
```

## Summary

The centralized state architecture provides:
- **GameContext** = Simple state container
- **Hooks** = Business logic implementation
- **Components** = Presentation layer

This pattern ensures maintainable, testable, and performant code with a single source of truth for all game state.
