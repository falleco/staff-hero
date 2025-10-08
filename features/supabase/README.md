# Supabase Integration

This directory contains all Supabase-related code for the Staff Hero app.

## Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL (`EXPO_PUBLIC_SUPABASE_URL`)
   - Anon public key (`EXPO_PUBLIC_SUPABASE_ANON_KEY`)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Make sure `.env` is in your `.gitignore` file!

### 4. Enable Anonymous Sign-Ins

1. Go to Authentication > Settings in your Supabase project
2. Scroll down to "Anonymous Sign-Ins"
3. Enable anonymous sign-ins
4. (Optional) Enable CAPTCHA protection to prevent abuse

### 5. Run Database Migrations

Run the migration to create the database schema:

```bash
# Using Supabase CLI
bunx supabase db push --workdir features/supabase

# Or manually apply the migration:
# Copy the contents of features/supabase/migrations/20251008043754_initial_load.sql
# and run it in the SQL Editor in your Supabase dashboard
```

## Project Structure

```
features/supabase/
├── README.md              # This file
├── index.ts              # Main export file
├── config.toml           # Supabase CLI configuration
├── auth-context.tsx      # Authentication context with anonymous sign-in
├── types.ts              # Database types
├── migrations/           # Database migrations
│   └── 20251008043754_initial_load.sql
└── api/                  # API functions
    ├── challenges.ts     # Challenge-related API calls
    └── user-profile.ts   # User profile API calls
```

## Features

### Anonymous Authentication

Users can play the game without signing up. An anonymous user is automatically created on app launch.

```tsx
import { useAuth } from '~/features/supabase';

function MyComponent() {
  const { user, isAnonymous, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  
  return <Text>User ID: {user?.id}</Text>;
}
```

### User Profiles

User profiles are automatically created when a user signs in (including anonymous users).

- `id`: User ID (references auth.users)
- `username`: Optional username
- `is_anonymous`: Whether this is an anonymous user
- `golden_note_shards`: User's currency

### Challenges

Challenges are stored in the database and tracked per user.

```tsx
import { useChallenges } from '~/hooks/use-challenges';

function ChallengesScreen() {
  const {
    challenges,
    currency,
    startChallenge,
    updateChallengeProgress,
    redeemChallenge,
  } = useChallenges();
  
  // Start a challenge
  await startChallenge('dominate-violin-notes');
  
  // Update progress (e.g., after scoring points)
  await updateChallengeProgress(ChallengeType.SCORE_POINTS, 100);
  
  // Redeem completed challenge
  await redeemChallenge('score-master');
}
```

## Database Schema

### Tables

#### `user_profiles`
- Extends `auth.users`
- Stores user data like username and golden note shards
- Row Level Security (RLS) enabled

#### `challenges`
- Master list of all challenges
- Anyone can read
- Only admins can modify (via SQL)

#### `user_challenges`
- Tracks each user's progress on challenges
- RLS enabled (users can only access their own data)

## Security

All tables have Row Level Security (RLS) enabled:

- Users can only access their own data
- Anonymous users have the same permissions as authenticated users
- The `is_anonymous` claim in the JWT can be used to distinguish anonymous users

Example RLS policy:

```sql
create policy "Users can view own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = id);
```

## Converting Anonymous Users

Anonymous users can later link an email, phone, or OAuth identity to become permanent users:

```tsx
import { supabase } from '~/features/supabase';

// Link email
await supabase.auth.updateUser({
  email: 'user@example.com',
});

// Link OAuth identity
await supabase.auth.linkIdentity({ 
  provider: 'google' 
});
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Anonymous Sign-Ins Guide](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

