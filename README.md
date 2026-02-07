# FastTrack — Intermittent Fasting Tracker

A personal intermittent fasting tracker built with React, TypeScript, and Supabase. Track fasting sessions, monitor weight trends, and visualize your progress with science-based milestones.

## Features

- **Fasting Timer** — start/stop fasts with a visual circular progress ring and real-time countdown
- **Milestone Tracking** — 14 science-based milestones (4h–72h) mapped to metabolic events like ketosis, autophagy, and HGH surges
- **Fat Burn Estimation** — conservative fat oxidation model using the Katch-McArdle RMR formula, adjusted for meal type and activity level
- **Weight & Body Fat Tracking** — log entries over time with trend charts (Recharts)
- **Stats Dashboard** — filterable by week/month/quarter/year with streaks, averages, and personal bests
- **Session History** — view, edit, and delete past fasts with full detail views
- **Theming** — dark/light mode with 6 accent color options
- **Cloud Persistence** — all data stored in Supabase (Postgres) with Row Level Security
- **Auth** — email/password authentication so each user's data is private
- **Data Export** — backup your data as JSON at any time
- **PWA-Ready** — installable on mobile via "Add to Home Screen"

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui (Radix primitives), Tailwind CSS |
| Charts | Recharts |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (email/password) |
| Icons | Lucide React |
| Fonts | DM Sans (body), Space Grotesk (display) |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account

### 1. Clone the repo

```bash
git clone https://github.com/Grace0d56/fast-circle-flow.git
cd fast-circle-flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run the following to create tables and security policies:

```sql
-- Create tables
CREATE TABLE fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  goal_hours REAL NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_meal_type TEXT NOT NULL DEFAULT 'normal',
  activity_level TEXT NOT NULL DEFAULT 'sedentary',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date BIGINT NOT NULL,
  weight REAL NOT NULL,
  fat_percentage REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can read own sessions" ON fasting_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON fasting_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON fasting_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON fasting_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own weight entries" ON weight_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight entries" ON weight_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight entries" ON weight_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight entries" ON weight_entries FOR DELETE USING (auth.uid() = user_id);
```

3. In Supabase, go to **Authentication → Sign In / Up** and turn off **"Confirm email"** (optional, for easier testing)

### 4. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values (found in Supabase → Settings → Data API and API Keys):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key_here
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080), create an account, and start tracking!

## Project Structure

```
src/
├── components/
│   ├── AuthScreen.tsx        # Login/signup screen
│   ├── CircularProgress.tsx  # SVG timer ring with milestone dots
│   ├── ConfirmDialog.tsx     # Reusable confirmation dialog
│   ├── FastingHistory.tsx    # Session list view
│   ├── GoalInput.tsx         # Fast configuration form
│   ├── MilestoneDialog.tsx   # Milestone detail popup
│   ├── SessionDetail.tsx     # Individual session view with edit/delete
│   ├── StatsView.tsx         # Stats dashboard with period filters
│   ├── ThemeSwitcher.tsx     # Dark/light mode + accent color picker
│   ├── WeightDetailView.tsx  # Weight trends with charts
│   ├── WeightTracker.tsx     # Weight logging card
│   └── ui/                   # shadcn/ui base components
├── hooks/
│   ├── useAuth.ts            # Supabase auth hook
│   └── useFasting.ts         # Core state management (Supabase CRUD)
├── lib/
│   ├── fatEstimate.ts        # Fat oxidation model (Katch-McArdle RMR)
│   ├── milestones.ts         # 14 science-based fasting milestones
│   ├── stats.ts              # Session statistics calculations
│   ├── supabase.ts           # Supabase client config
│   ├── time.ts               # Time formatting utilities
│   └── utils.ts              # Tailwind class merge helper
├── pages/
│   ├── Index.tsx             # Main app page (timer/stats/history tabs)
│   └── NotFound.tsx          # 404 page
├── App.tsx                   # Root with auth gate
└── main.tsx                  # Entry point
```

## Fat Burn Estimation Model

The app estimates fat burned using a conservative model:

1. **Adjusted fasting time** — accounts for meal type (light/normal/heavy) with a decaying offset
2. **RMR calculation** — Katch-McArdle formula based on lean body mass
3. **Fat fraction** — progressive scale from 30% (under 12h) to 65% (48h+)
4. **Activity multiplier** — sedentary (1.0x) through high (1.3x)
5. **Output** — lower bound (sedentary) and upper bound (user-selected activity) in grams

## License

This project is for personal use and portfolio demonstration.
