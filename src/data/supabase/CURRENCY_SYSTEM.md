# Currency Transaction System

The Staff Hero app uses a transaction-based currency system for tracking **Golden Note Shards** and other future currencies.

## Architecture

Instead of storing a single balance value, every currency movement is recorded as a **transaction**. The current balance is calculated as the **SUM of all transactions**.

### Benefits

- ✅ **Audit Trail**: Every currency movement is tracked
- ✅ **Prevention of Fraud**: Can't manipulate balance directly
- ✅ **Historical Data**: See where currency came from/went to
- ✅ **Scalability**: Easy to add multiple currency types
- ✅ **Debugging**: Easy to trace currency issues
- ✅ **Balance Protection**: Built-in validation prevents negative balances

## Database Schema

### `currency_transactions` Table

```sql
- id: uuid (primary key)
- user_id: uuid (references user_profiles)
- currency_type: text (default: 'golden_note_shards')
- amount: integer (positive = credit, negative = debit)
- source: text (e.g., 'challenge_reward', 'purchase', 'admin_adjustment')
- source_id: text (optional reference to source entity)
- description: text (human-readable description)
- metadata: jsonb (flexible additional data)
- created_at: timestamp
```

### Database Functions

#### `get_user_balance(user_id, currency_type)`
Returns the current balance (SUM of all transactions), guaranteed ≥ 0.

```sql
SELECT get_user_balance('user-uuid', 'golden_note_shards');
-- Returns: 150
```

#### `add_currency_transaction(...)`
Adds a transaction with validation. Throws error if debit would cause negative balance.

```sql
SELECT add_currency_transaction(
  'user-uuid',           -- user_id
  50,                    -- amount (positive = add, negative = subtract)
  'challenge_reward',    -- source
  'challenge-123',       -- source_id (optional)
  'Completed challenge', -- description (optional)
  '{"challenge": "..."}' -- metadata (optional)
);
```

## TypeScript API

### Get User Balance

```typescript
import { getUserBalance } from '~/data/supabase';

const balance = await getUserBalance(userId, 'golden_note_shards');
console.log(`User has ${balance} shards`);
```

### Add Currency Transaction

```typescript
import { addCurrencyTransaction } from '~/data/supabase';

// Award currency (positive amount)
await addCurrencyTransaction(
  userId,
  100,
  'challenge_reward',
  {
    sourceId: 'challenge-123',
    description: 'Completed "Score Master" challenge',
    metadata: {
      challengeId: 'challenge-123',
      challengeTitle: 'Score Master',
      reward: 100,
    },
  }
);

// Deduct currency (negative amount)
await addCurrencyTransaction(
  userId,
  -50,
  'purchase',
  {
    sourceId: 'item-456',
    description: 'Purchased Golden Violin',
    metadata: {
      itemId: 'item-456',
      itemName: 'Golden Violin',
      price: 50,
    },
  }
);
```

### Get Transaction History

```typescript
import { getTransactionHistory } from '~/data/supabase';

const transactions = await getTransactionHistory(userId, {
  currencyType: 'golden_note_shards',
  limit: 20,
  offset: 0,
});

transactions.forEach(tx => {
  console.log(`${tx.amount > 0 ? '+' : ''}${tx.amount} - ${tx.description}`);
});
```

### Get Transaction Summary

```typescript
import { getTransactionSummary } from '~/data/supabase';

const summary = await getTransactionSummary(userId);
console.log(`Balance: ${summary.balance}`);
console.log(`Total Earned: ${summary.totalCredits}`);
console.log(`Total Spent: ${summary.totalDebits}`);
console.log(`Transactions: ${summary.transactionCount}`);
```

### Check Sufficient Balance

```typescript
import { hasSufficientBalance } from '~/data/supabase';

const canAfford = await hasSufficientBalance(userId, 50);
if (canAfford) {
  // Proceed with purchase
  await addCurrencyTransaction(userId, -50, 'purchase', {...});
} else {
  alert('Insufficient balance!');
}
```

## Transaction Sources

The system tracks where currency comes from/goes to:

| Source | Description | Example |
|--------|-------------|---------|
| `challenge_reward` | Earned from completing challenges | +5 shards for "Battle Warrior" |
| `purchase` | Spent on items/upgrades | -50 shards for "Golden Violin" |
| `initial_balance` | Starting balance for new users | +0 shards on signup |
| `admin_adjustment` | Manual adjustment by admin | +100 shards (compensation) |
| `migration` | Balance from old system migration | +25 shards (migrated) |

## Usage in Features

### Challenge System

When a user completes and redeems a challenge:

```typescript
// In challenges.ts
export async function redeemChallenge(userId: string, challengeId: string) {
  // ... validation ...
  
  // Award currency via transaction
  await addCurrencyTransaction(
    userId,
    challenge.reward,
    'challenge_reward',
    {
      sourceId: challengeId,
      description: `Reward for completing "${challenge.title}"`,
      metadata: {
        challengeId,
        challengeTitle: challenge.title,
        reward: challenge.reward,
      },
    }
  );
  
  // Mark challenge as redeemed
  // ...
}
```

### Shop/Purchase System (Future)

```typescript
export async function purchaseItem(userId: string, itemId: string) {
  const item = await getItem(itemId);
  
  // Check balance
  if (!await hasSufficientBalance(userId, item.price)) {
    throw new Error('Insufficient balance');
  }
  
  // Deduct currency
  await addCurrencyTransaction(
    userId,
    -item.price,
    'purchase',
    {
      sourceId: itemId,
      description: `Purchased ${item.name}`,
      metadata: {
        itemId,
        itemName: item.name,
        price: item.price,
      },
    }
  );
  
  // Grant item to user
  // ...
}
```

## Migration from Old System

The migration automatically converts existing `golden_note_shards` values to transactions:

1. For each user with `golden_note_shards > 0`
2. Create a transaction with:
   - Amount: current `golden_note_shards` value
   - Source: `'migration'`
   - Description: `'Initial balance from migration'`

After migration, the old `golden_note_shards` column can be ignored (but kept for reference).

## Testing

### Reset User Currency (for testing)

```typescript
import { resetUserChallenges } from '~/data/supabase';

// This deletes all transactions and challenges for testing
await resetUserChallenges(userId);
```

### View Transactions in Supabase Dashboard

1. Go to **Table Editor**
2. Select `currency_transactions` table
3. Filter by `user_id` to see a user's transaction history

## Future Enhancements

### Multiple Currency Types

```typescript
// Easy to add new currency types
await addCurrencyTransaction(userId, 100, 'challenge_reward', {
  currencyType: 'experience_points', // New currency type!
  description: 'Level up bonus',
});

const xp = await getUserBalance(userId, 'experience_points');
```

### Transaction Reversals

```typescript
// Add support for refunds/reversals
await addCurrencyTransaction(userId, 50, 'refund', {
  sourceId: originalTransactionId,
  description: 'Refund for cancelled purchase',
  metadata: { originalTransaction: originalTransactionId },
});
```

### Leaderboards

```sql
-- Top users by balance
SELECT user_id, SUM(amount) as balance
FROM currency_transactions
WHERE currency_type = 'golden_note_shards'
GROUP BY user_id
ORDER BY balance DESC
LIMIT 10;
```

## Security

- ✅ Row Level Security (RLS) enabled - users can only see their own transactions
- ✅ Server-side validation prevents negative balances
- ✅ Database functions ensure atomic operations
- ✅ All transactions are immutable (insert-only, no updates/deletes except admin)

## Resources

- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

