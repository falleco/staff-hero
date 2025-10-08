# Equipment System

The Staff Hero app uses a Supabase-based equipment system for managing player equipment (mantles, adornments, and instruments).

## Architecture

Equipment is stored in two main tables:
- **`equipments`**: Master list of all available equipment (read-only for users)
- **`user_equipments`**: Tracks what each user owns, their upgrade levels, and what's equipped

## Database Schema

### `equipments` Table

Master list of all equipment available in the game.

```sql
- id: text (primary key)
- name: text
- category: text ('mantle', 'adornments', 'instruments')
- rarity: text ('common', 'rare', 'epic', 'legendary')
- base_level: integer (default: 1)
- base_score_bonus: integer
- base_accuracy_bonus: integer
- base_streak_bonus: integer
- special_effect: text (optional)
- price: integer (cost in golden note shards)
- upgrade_price: integer (base upgrade cost)
- icon: text (emoji)
- description: text
- created_at: timestamp
- updated_at: timestamp
```

### `user_equipments` Table

Tracks user ownership, levels, and equipped status.

```sql
- id: uuid (primary key)
- user_id: uuid (references user_profiles)
- equipment_id: text (references equipments)
- level: integer (default: 1, max: 10)
- is_equipped: boolean
- created_at: timestamp
- updated_at: timestamp
- unique(user_id, equipment_id)
```

## Equipment Categories

### Mantles
- **One at a time**: Users can only equip one mantle
- Examples: Novice Cloak, Maestro's Robe

### Adornments
- **Multiple allowed**: Users can equip multiple adornments
- Examples: Silver Pendant, Golden Metronome Charm

### Instruments
- **One at a time**: Users can only equip one instrument equipment
- Examples: Enchanted Violin Bow

## Database Functions

### `get_user_equipments(user_id)`

Returns all equipment with user ownership data and calculated bonuses.

**Features:**
- Calculates bonuses based on upgrade level
- Each level adds: +25 score, +2 accuracy, +1 streak
- Upgrade price increases by 1.5x per level
- Shows ownership and equipped status

```typescript
const equipment = await supabase.rpc('get_user_equipments', {
  p_user_id: userId
});
```

### `purchase_equipment(user_id, equipment_id)`

Purchases equipment with automatic currency validation and deduction.

**Validations:**
- Equipment exists
- Not already owned
- Sufficient balance

**Actions:**
- Deducts currency (creates transaction)
- Adds equipment to user inventory

```typescript
await supabase.rpc('purchase_equipment', {
  p_user_id: userId,
  p_equipment_id: 'silver-pendant'
});
```

### `upgrade_equipment(user_id, equipment_id)`

Upgrades owned equipment with automatic currency validation.

**Validations:**
- Equipment is owned
- Not at max level (10)
- Sufficient balance for upgrade price

**Actions:**
- Deducts currency (creates transaction)
- Increases equipment level by 1
- Bonuses automatically calculated on next fetch

```typescript
await supabase.rpc('upgrade_equipment', {
  p_user_id: userId,
  p_equipment_id: 'novice-cloak'
});
```

### `toggle_equipment(user_id, equipment_id, equip)`

Equips or unequips equipment with category-specific logic.

**Category Logic:**
- **Mantle**: Unequips other mantles automatically
- **Instruments**: Unequips other instruments automatically
- **Adornments**: Can have multiple equipped

```typescript
// Equip
await supabase.rpc('toggle_equipment', {
  p_user_id: userId,
  p_equipment_id: 'maestro-robe',
  p_equip: true
});

// Unequip
await supabase.rpc('toggle_equipment', {
  p_user_id: userId,
  p_equipment_id: 'maestro-robe',
  p_equip: false
});
```

### `initialize_user_equipment(user_id)`

Gives new users the starter equipment (Novice Cloak).

```typescript
await supabase.rpc('initialize_user_equipment', {
  p_user_id: userId
});
```

## TypeScript API

### Get User Equipment

```typescript
import { fetchUserEquipment } from '~/features/supabase';

const equipment = await fetchUserEquipment(userId);
// Returns Equipment[] with ownership and level data
```

### Purchase Equipment

```typescript
import { purchaseEquipment } from '~/features/supabase';

try {
  await purchaseEquipment(userId, 'silver-pendant');
  // Equipment purchased, currency deducted
} catch (error) {
  // Handle error (insufficient balance, already owned, etc.)
}
```

### Upgrade Equipment

```typescript
import { upgradeEquipment } from '~/features/supabase';

try {
  await upgradeEquipment(userId, 'novice-cloak');
  // Equipment upgraded to next level
} catch (error) {
  // Handle error (insufficient balance, max level, etc.)
}
```

### Equip/Unequip Items

```typescript
import { equipItem, unequipItem } from '~/features/supabase';

// Equip
await equipItem(userId, 'maestro-robe');

// Unequip
await unequipItem(userId, 'maestro-robe');
```

## Usage in React

### useEquipment Hook

The `useEquipment` hook provides equipment management functionality.

```typescript
import { useEquipment } from '@/hooks/use-equipment';
import { useCurrency } from '@/hooks/use-currency';

function EquipmentScreen() {
  const { equipment, userEquipment, buyEquipment, upgradeEquipment, equipItem } = useEquipment();
  const { currency, addGoldenShards } = useCurrency();

  // Purchase equipment
  const handleBuy = async (equipmentId: string) => {
    const success = await buyEquipment(equipmentId, currency, async (newCurrency) => {
      await addGoldenShards(newCurrency.goldenNoteShards - currency.goldenNoteShards);
    });
    
    if (success) {
      alert('Purchase successful!');
    } else {
      alert('Insufficient funds');
    }
  };

  // Upgrade equipment
  const handleUpgrade = async (equipmentId: string) => {
    const success = await upgradeEquipment(equipmentId, currency, async (newCurrency) => {
      await addGoldenShards(newCurrency.goldenNoteShards - currency.goldenNoteShards);
    });
    
    if (success) {
      alert('Upgrade successful!');
    }
  };

  // Equip item
  const handleEquip = async (equipmentId: string) => {
    await equipItem(equipmentId);
  };

  // Get equipped items
  const { mantle, adornments, instruments } = userEquipment;

  return (
    <View>
      <Text>Equipped Mantle: {mantle?.name || 'None'}</Text>
      <Text>Balance: {currency.goldenNoteShards} shards</Text>
      {/* ... render equipment list ... */}
    </View>
  );
}
```

## Bonus Calculation

### Base Bonuses
Each equipment has base bonuses at level 1.

### Level Scaling
Each level adds:
- **+25** score bonus
- **+2** accuracy bonus
- **+1** streak bonus

### Example
**Novice Cloak (Level 1):**
- Score: 50
- Accuracy: 5
- Streak: 1

**Novice Cloak (Level 5):**
- Score: 50 + (4 × 25) = 150
- Accuracy: 5 + (4 × 2) = 13
- Streak: 1 + (4 × 1) = 5

### Total Bonuses
The `getTotalBonuses()` function sums all equipped items:

```typescript
const { getTotalBonuses } = useEquipment();
const bonuses = getTotalBonuses();

console.log(`Total Score Bonus: ${bonuses.scoreBonus}`);
console.log(`Total Accuracy Bonus: ${bonuses.accuracyBonus}`);
console.log(`Total Streak Bonus: ${bonuses.streakBonus}`);
```

## Upgrade Cost Scaling

Upgrade costs increase exponentially by 1.5x per level:

```
Level 1 → 2: base_price
Level 2 → 3: base_price × 1.5
Level 3 → 4: base_price × 1.5²
Level 4 → 5: base_price × 1.5³
...
Level 9 → 10: base_price × 1.5⁸
```

**Example (Novice Cloak, base upgrade price = 15):**
- Level 1 → 2: 15 shards
- Level 2 → 3: 22 shards
- Level 3 → 4: 33 shards
- Level 4 → 5: 50 shards
- ...
- Level 9 → 10: 380 shards

## Starter Equipment

New users automatically receive:
- **Novice Cloak** (equipped)
  - Common rarity
  - Price: 20 shards
  - Base bonuses: +50 score, +5 accuracy, +1 streak
  - Special effect: "Beginner's Luck"

This is handled by the `initialize_user_equipment` database function, called when a new user profile is created.

## Seed Data

The equipment seed file contains default equipment:

**Mantles:**
- Novice Cloak (Common)
- Maestro's Robe (Epic)

**Adornments:**
- Silver Music Note Pendant (Rare)
- Golden Metronome Charm (Legendary)

**Instruments:**
- Enchanted Violin Bow (Rare)

## Security

- ✅ Row Level Security (RLS) enabled - users can only access their own equipment
- ✅ Server-side validation prevents:
  - Purchasing without sufficient balance
  - Upgrading beyond max level
  - Equipping items not owned
- ✅ All currency transactions are tracked
- ✅ Equipment data is read-only for users (only admins can modify via SQL)

## Testing

### Reset User Equipment

```typescript
import { resetUserEquipment } from '~/features/supabase';

// Deletes all user equipment and reinitializes with starter equipment
await resetUserEquipment(userId);
```

### View Equipment in Supabase Dashboard

1. Go to **Table Editor**
2. Select `user_equipments` table
3. Filter by `user_id` to see a user's equipment

## Future Enhancements

### Equipment Sets
Add bonuses for equipping multiple items from the same set.

```typescript
// Could add a `set_id` field to equipments table
if (hasFullSet('maestro-set')) {
  bonuses.scoreBonus += 100; // Set bonus
}
```

### Equipment Crafting
Allow users to craft equipment from materials.

### Equipment Trading
Allow players to trade equipment with each other.

### Temporary Buffs
Add time-limited equipment buffs.

## Resources

- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Math Functions](https://www.postgresql.org/docs/current/functions-math.html)

