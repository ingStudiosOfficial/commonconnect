-- Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- Create the messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  sender text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.messages
  enable row level security;

-- Policy: allow authenticated users to SELECT messages
create policy "Allow authenticated to select messages"
  on public.messages
  for select
  using (auth.role() = 'authenticated');

-- Policy: allow authenticated users to INSERT messages
create policy "Allow authenticated to insert messages"
  on public.messages
  for insert
  with check (auth.role() = 'authenticated');

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;