# State Management Quick Reference

## TL;DR

**GameContext** = State storage only (dumb store)  
**Hooks** = Business logic (smart operations)  
**Components** = Use hooks, not context directly

## Context (Read-Only State)

```typescript
// contexts/game-context.tsx
interface GameContextType {
  // State
  currency: UserCurrency;
  challenges: Challenge[];
  currencyLoading: boolean;
  challengesLoading: boolean;
  
  // Setters (for hooks only!)
  setCurrency: Dispatch<SetStateAction<UserCurrency>>;
  setChallenges: Dispatch<SetStateAction<Challenge[]>>;
  setCurrencyLoading: Dispatch<SetStateAction<boolean>>;
  setChallengesLoading: Dispatch<SetStateAction<boolean>>;
}
```

## Hooks (Business Logic)

### useCurrency()
```typescript
const {
  currency,              // Current balance
  isLoading,            // Loading state
  refresh,              // Reload from DB
  addGoldenShards,      // Add/deduct shards
  getHistory,           // Transaction history
  getSummary,           // Transaction summary
  hasSufficientBalance  // Check if can afford
} = useCurrency();

// Add shards
await addGoldenShards(100, 'Bonus reward');

// Deduct shards (negative amount)
await addGoldenShards(-50, 'Purchase item');

// Check balance
if (await hasSufficientBalance(100)) {
  // Can afford
}
```

### useChallenges()
```typescript
const {
  challenges,             // All challenges
  isLoading,             // Loading state
  refresh,               // Reload from DB
  startChallenge,        // Mark as in progress
  updateChallengeProgress, // Track progress
  redeemChallenge,       // Redeem rewards (updates currency!)
  resetChallenges        // Reset all (resets currency!)
} = useChallenges();

// Start challenge
await startChallenge('challenge-id');

// Update progress
await updateChallengeProgress(ChallengeType.SCORE_POINTS, 100);

// Redeem (awards golden note shards)
await redeemChallenge('challenge-id');
```

## Component Patterns

### Display Only
```tsx
function BalanceDisplay() {
  const { currency, isLoading } = useCurrency();
  
  if (isLoading) return <Spinner />;
  
  return <Text>{currency.goldenNoteShards} shards</Text>;
}
```

### With Operations
```tsx
function ShopItem({ price }: { price: number }) {
  const { currency, addGoldenShards, hasSufficientBalance } = useCurrency();
  
  const handleBuy = async () => {
    if (await hasSufficientBalance(price)) {
      await addGoldenShards(-price, 'Purchase item');
      Alert.alert('Success', 'Item purchased!');
    } else {
      Alert.alert('Error', 'Insufficient funds');
    }
  };
  
  return <Button onPress={handleBuy}>Buy ({price})</Button>;
}
```

### Multiple Hooks
```tsx
function GameOverScreen() {
  const { currency } = useCurrency();
  const { challenges, updateChallengeProgress } = useChallenges();
  
  // Use both hooks together
  // State updates propagate everywhere
}
```

## Rules

### ✅ DO
- Use `useCurrency()` for all currency operations
- Use `useChallenges()` for all challenge operations
- Access context state via hooks (not directly)
- Update state via hook operations
- Handle errors in try/catch blocks

### ❌ DON'T
- Don't use `useContext(GameContext)` in components
- Don't duplicate state in components
- Don't forget loading states
- Don't call setters directly from components
- Don't skip error handling

## Data Flow

```
Component calls hook operation
         ↓
Hook calls Supabase API
         ↓
Hook updates state via setter
         ↓
All components see new state
```

## Example: Complete Flow

```tsx
// Component
function ChallengeCard({ challenge }: Props) {
  const { redeemChallenge } = useChallenges();
  const { currency } = useCurrency();
  
  const handleRedeem = async () => {
    try {
      await redeemChallenge(challenge.id);
      // Both challenges AND currency are updated automatically!
      Alert.alert('Success', `You earned ${challenge.reward} shards!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem challenge');
    }
  };
  
  return (
    <View>
      <Text>{challenge.title}</Text>
      <Text>Progress: {challenge.current}/{challenge.target}</Text>
      <Text>Reward: {challenge.reward} shards</Text>
      <Text>Current Balance: {currency.goldenNoteShards}</Text>
      {challenge.current >= challenge.target && (
        <Button onPress={handleRedeem}>Redeem</Button>
      )}
    </View>
  );
}
```

## Testing

### Testing Hooks
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useCurrency } from './use-currency';

describe('useCurrency', () => {
  it('should add golden shards', async () => {
    const { result } = renderHook(() => useCurrency(), {
      wrapper: GameProvider,
    });
    
    await result.current.addGoldenShards(100);
    
    expect(result.current.currency.goldenNoteShards).toBe(100);
  });
});
```

### Testing Components
```tsx
import { render } from '@testing-library/react-native';
import { GameProvider } from '@/contexts/game-context';

describe('BalanceDisplay', () => {
  it('should display balance', () => {
    const { getByText } = render(
      <GameProvider>
        <BalanceDisplay />
      </GameProvider>
    );
    
    expect(getByText(/shards/)).toBeTruthy();
  });
});
```

## Summary

| Layer | Responsibility | Examples |
|---|---|---|
| **GameContext** | State storage | currency, challenges, loading states |
| **Hooks** | Business logic | addGoldenShards(), redeemChallenge() |
| **Components** | Presentation | Display data, call hook operations |

Remember: **Context = State, Hooks = Logic, Components = View**

