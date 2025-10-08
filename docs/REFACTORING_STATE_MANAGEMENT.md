# State Management Refactoring Summary

## Overview

Refactored the application's state management to implement a clean separation between **state storage** and **business logic**.

**Key Change:** GameContext is now a simple state container, while hooks (`useCurrency`, `useChallenges`) implement all business logic.

## Changes Made

### 1. GameContext (contexts/game-context.tsx)

**Before:**
- Stored state AND implemented business logic
- Exposed functions like `addGoldenShards()`, `redeemChallenge()`, etc.
- Mixed concerns (state + operations)

**After:**
```typescript
interface GameContextType {
  // State (read-only for components)
  currency: UserCurrency;
  currencyLoading: boolean;
  challenges: Challenge[];
  challengesLoading: boolean;
  
  // Setters (for hooks to update state)
  setCurrency: Dispatch<SetStateAction<UserCurrency>>;
  setCurrencyLoading: Dispatch<SetStateAction<boolean>>;
  setChallenges: Dispatch<SetStateAction<Challenge[]>>;
  setChallengesLoading: Dispatch<SetStateAction<boolean>>;
  
  // Game logic and settings
  gameLogic: UseGameLogicReturn;
  gameSettings: UseGameSettingsReturn;
}
```

**What it does now:**
- ✅ Stores state (currency, challenges, loading states)
- ✅ Provides setters for state updates
- ✅ Loads initial data when user signs in
- ✅ Connects game logic to challenge tracking
- ❌ NO business logic (add/update/delete operations)
- ❌ NO complex operations (moved to hooks)

### 2. useCurrency Hook (hooks/use-currency.ts)

**Before:**
- Was a thin wrapper around GameContext
- Just passed through context functions

**After:**
```typescript
export function useCurrency(): UseCurrencyReturn {
  const context = useContext(GameContext);
  const { user } = useAuth();
  const { currency, setCurrency, setCurrencyLoading } = context;

  const refresh = async () => {
    // Implementation: fetch from Supabase, update state
  };

  const addGoldenShards = async (amount: number, desc?: string) => {
    // Implementation: call API, refresh state
  };

  // ... more operations
}
```

**What it does now:**
- ✅ Implements all currency business logic
- ✅ Makes Supabase API calls
- ✅ Updates context state via setters
- ✅ Handles errors and loading states
- ✅ Exposes operations to components

**Operations:**
- `refresh()` - Fetch latest balance from database
- `addGoldenShards(amount, desc)` - Add/deduct shards
- `getHistory(limit)` - Get transaction history
- `getSummary()` - Get transaction summary
- `hasSufficientBalance(amount)` - Check if user can afford

### 3. useChallenges Hook (hooks/use-challenges.ts)

**Before:**
- Was a thin wrapper around GameContext
- Just passed through context functions

**After:**
```typescript
export function useChallenges(): UseChallengesReturn {
  const context = useContext(GameContext);
  const { user } = useAuth();
  const { 
    challenges, 
    setChallenges, 
    setChallengesLoading,
    setCurrency,  // Can update currency too!
    setCurrencyLoading 
  } = context;

  const refresh = async () => {
    // Implementation: fetch from Supabase, update state
  };

  const redeemChallenge = async (id: string) => {
    // Implementation: call API, refresh challenges AND currency
  };

  // ... more operations
}
```

**What it does now:**
- ✅ Implements all challenges business logic
- ✅ Makes Supabase API calls
- ✅ Updates context state via setters
- ✅ Can update currency when redeeming/resetting
- ✅ Handles errors and loading states
- ✅ Exposes operations to components

**Operations:**
- `refresh()` - Fetch latest challenges
- `startChallenge(id)` - Mark challenge as in progress
- `updateChallengeProgress(type, amount)` - Track progress
- `redeemChallenge(id)` - Redeem rewards (updates currency too!)
- `resetChallenges()` - Reset all (resets currency too!)

## Architecture

### Data Flow

```
┌──────────────────────────────────────────────────┐
│              GameContext (Provider)               │
│                                                  │
│  State:                                          │
│  - currency                                      │
│  - challenges                                    │
│  - loading states                                │
│                                                  │
│  Setters:                                        │
│  - setCurrency()                                 │
│  - setChallenges()                               │
│  - loading setters                               │
└──────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │useCurrency│   │useChallenges│ │Components│
  │  Hook    │    │   Hook    │    │  (View)  │
  └──────────┘    └──────────┘    └──────────┘
       │                │                │
  Business Logic   Business Logic    Read State
  API Calls       API Calls          Display Data
  Update State    Update State
```

### Example: Redeeming a Challenge

```
1. User clicks "Redeem" button
   ↓
2. Component calls useChallenges().redeemChallenge(id)
   ↓
3. Hook calls Supabase API to redeem challenge
   ↓
4. Hook fetches updated challenges
   ↓
5. Hook calls setChallenges(newChallenges)
   ↓
6. Hook fetches updated currency balance
   ↓
7. Hook calls setCurrency(newBalance)
   ↓
8. All components see updated challenges AND currency!
```

## Benefits

### 1. Clear Separation of Concerns
- **Context** = State storage only
- **Hooks** = Business logic only
- **Components** = Presentation only

### 2. Single Source of Truth
- State lives in one place (GameContext)
- No duplicate state across hooks
- State changes propagate everywhere

### 3. Better Testability
```typescript
// Test hooks in isolation
const mockContext = {
  currency: { goldenNoteShards: 100 },
  setCurrency: jest.fn(),
};

jest.spyOn(React, 'useContext').mockReturnValue(mockContext);

const { addGoldenShards } = useCurrency();
await addGoldenShards(50);

expect(mockContext.setCurrency).toHaveBeenCalled();
```

### 4. Maintainability
- Easy to find where operations happen (in hooks)
- Easy to understand what context does (just state)
- Clear data flow

### 5. Flexibility
- Hooks can update multiple pieces of state
- Example: `redeemChallenge()` updates both challenges and currency
- No tight coupling between different parts of state

## Migration Guide

### For Components

**Before:**
```tsx
function MyComponent() {
  const { currency, addGoldenShards } = useGameContext();
  // ...
}
```

**After:**
```tsx
function MyComponent() {
  const { currency, addGoldenShards } = useCurrency();
  // Same API, just use dedicated hook
}
```

### For Hooks

**Before (hooks exposed context functions):**
```typescript
export function useCurrency() {
  const context = useContext(GameContext);
  return {
    currency: context.currency,
    addGoldenShards: context.addGoldenShards,
  };
}
```

**After (hooks implement logic):**
```typescript
export function useCurrency() {
  const context = useContext(GameContext);
  const { user } = useAuth();
  const { currency, setCurrency, setCurrencyLoading } = context;

  const addGoldenShards = async (amount: number, desc?: string) => {
    if (!user) return;
    try {
      await addGoldenShardsAPI(user.id, amount, desc);
      // Refresh balance
      const balance = await getUserBalance(user.id, 'golden_note_shards');
      setCurrency({ goldenNoteShards: balance });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return { currency, addGoldenShards };
}
```

## Files Changed

### Modified Files:
1. **contexts/game-context.tsx**
   - Removed all business logic functions
   - Added state setters to context
   - Simplified to state container only

2. **hooks/use-currency.ts**
   - Added business logic implementation
   - Added Supabase API calls
   - Uses context setters to update state

3. **hooks/use-challenges.ts**
   - Added business logic implementation
   - Added Supabase API calls
   - Uses context setters to update state
   - Can update currency when needed

### No Changes Needed:
- **Components** - API stays the same (just use `useCurrency()`/`useChallenges()`)
- **API functions** - No changes needed
- **Types** - No changes needed

## Verification

All changes verified:
- ✅ TypeScript compilation: `bun run tsc` (0 errors)
- ✅ Linting: `bun run lint` (0 issues)
- ✅ Component APIs unchanged
- ✅ State management simplified

## Summary

This refactoring implements the **Container/Presenter pattern** for state management:

- **GameContext (Container)**: Dumb state storage
- **Hooks (Presenters)**: Smart business logic
- **Components (View)**: Presentation only

Result: Cleaner, more maintainable, more testable code with clear separation of concerns.

