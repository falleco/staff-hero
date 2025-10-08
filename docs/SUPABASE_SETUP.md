# Supabase Setup Guide

This guide will help you set up Supabase for the Staff Hero app.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js and bun installed

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: staff-hero (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Wait for the project to finish initializing (2-3 minutes)

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cd /Users/falleco/projects/rebelde/staff-hero
touch .env
```

Add the following content (replace with your actual values):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Make sure `.env` is in your `.gitignore` file (it already is!).

## Step 4: Enable Anonymous Sign-Ins

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Scroll down to **Anonymous Sign-Ins**
3. Toggle it **ON**
4. (Optional but recommended) Enable **CAPTCHA Protection** to prevent abuse:
   - Scroll to **Bot and Abuse Prevention**
   - Enable **Invisible CAPTCHA** or **Cloudflare Turnstile**

## Step 5: Run Database Migrations

You have two options to set up the database schema:

### Option A: Using SQL Editor (Recommended for first-time setup)

Run each migration in order by copying the SQL and running it in the Supabase SQL Editor:

**Migration 1 - Initial Schema & Challenges:**
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `features/supabase/migrations/20251008043754_initial_load.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is expected!

**Migration 2 - Currency System:**
7. Click **New Query** again
8. Copy the entire contents of `features/supabase/migrations/20251008053509_currency.sql`
9. Paste it into the SQL Editor
10. Click **Run**
11. You should see "Success" - this sets up the transaction-based currency system!

**Migration 3 - Analytics System:**
12. Click **New Query** again
13. Copy the entire contents of `features/supabase/migrations/20251008053514_analytics.sql`
14. Paste it into the SQL Editor
15. Click **Run**
16. You should see "Success" - game sessions and achievements are now tracked!

**Migration 4 - Equipment System:**
17. Click **New Query** again
18. Copy the entire contents of `features/supabase/migrations/20251008062059_equipments.sql`
19. Paste it into the SQL Editor
20. Click **Run**
21. You should see "Success" - equipment system is ready!

**Migration 5 - Instruments System:**
22. Click **New Query** again
23. Copy the entire contents of `features/supabase/migrations/20251008062059_instruments.sql`
24. Paste it into the SQL Editor
25. Click **Run**
26. You should see "Success" - instrument system is ready!

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project (you'll need your database password)
bunx supabase link --workdir features/supabase --project-ref your-project-ref

# Push migrations
bunx supabase db push --workdir features/supabase
```

## Step 6: Run Seed Data

After running all migrations, populate the database with initial data:

**Seed 1 - Challenges:**
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `features/supabase/seeds/challenges.sql`
4. Paste and **Run**

**Seed 2 - Achievements:**
5. Click **New Query**
6. Copy the entire contents of `features/supabase/seeds/achievements.sql`
7. Paste and **Run**

**Seed 3 - Equipment:**
8. Click **New Query**
9. Copy the entire contents of `features/supabase/seeds/equipments.sql`
10. Paste and **Run**

**Seed 4 - Instruments:**
11. Click **New Query**
12. Copy the entire contents of `features/supabase/seeds/instruments.sql`
13. Paste and **Run**

## Step 7: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `user_profiles` - User data
   - `challenges` - Master list of challenges (3 default)
   - `user_challenges` - User progress on challenges
   - `currency_transactions` - All currency movements (transaction-based!)
   - `equipments` - Master list of equipment (5 default)
   - `user_equipments` - User equipment data
   - `instruments` - Master list of instruments (4 default)
   - `user_instruments` - User instrument data
   - `game_sessions` - Individual game sessions
   - `achievements` - Master list of achievements (6 default)
   - `user_achievements` - User achievement unlocks
3. Click on `challenges` - you should see 3 pre-populated challenges
4. Click on `achievements` - you should see 6 pre-populated achievements
5. Click on `equipments` - you should see 5 pre-populated items
6. Click on `instruments` - you should see 4 pre-populated instruments

## Step 8: Test the App

```bash
# Start the development server
bun start

# Or for iOS
bun ios

# Or for Android
bun android
```

The app should:
1. Automatically create an anonymous user on first launch
2. Load all data from the database (challenges, equipment, instruments)
3. Track game sessions and progress in the database
4. Award Golden Note Shards for completing challenges
5. Allow purchasing and upgrading equipment and instruments

## Troubleshooting

### "Invalid API key" error

- Double-check that your `.env` file has the correct URL and anon key
- Make sure the `.env` file is in the project root
- Restart the Expo dev server after creating/updating `.env`

### "relation does not exist" error

- The migrations haven't been run yet
- Follow Step 5 again to create the database tables

### Anonymous sign-in not working

- Make sure anonymous sign-ins are enabled in Authentication > Settings
- Check the browser console or React Native logs for specific error messages

### No challenges showing up

- Check the `challenges` table in Supabase - it should have 3 rows
- If empty, re-run the migration SQL (Step 5)

## What's Next?

You can now:
- Add more challenges via the Supabase dashboard
- Add custom equipment and instruments
- View user data, transactions, and game sessions in real-time
- Monitor authentication in the Auth section
- Track player analytics and achievements
- Add permanent authentication methods (email, OAuth) later
- Customize equipment bonuses and instrument stats

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Anonymous Auth Guide](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Need Help?

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Check the React Native logs (`bun start` terminal)
3. Verify your `.env` file is correct
4. Make sure tables were created successfully

