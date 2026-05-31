# Princess Teddy 🧸 — Wellness Journal

A personal macro & meal tracker built with Next.js + Supabase.

## Setup

### 1. Supabase — Run this SQL

Go to your Supabase project → SQL Editor → New query → paste and run:

```sql
-- Create daily_logs table
create table daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  meals jsonb default '[]'::jsonb,
  checked jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Enable Row Level Security
alter table daily_logs enable row level security;

-- Policy: users can only see their own data
create policy "Users can manage their own logs"
  on daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 2. Vercel — Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ibdotgrjytsqkjlorgli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Deploy

Push to GitHub → Vercel auto-deploys. Done! 🎉
