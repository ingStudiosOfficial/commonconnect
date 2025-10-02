-- Enable extensions for UUID generation and cryptographic functions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Table to store user profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  updated_at timestamp with time zone not null default now()
);

-- Trigger to automatically update the updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_timestamp
before update on profiles
for each row execute function update_updated_at();

-- Enable row-level security on profiles table
alter table profiles enable row level security;

-- Policy to allow users to insert their own profile
create policy insert_profile on profiles
  for insert
  using (auth.uid() = id);

-- Policy to allow users to update their own profile
create policy update_profile on profiles
  for update
  using (auth.uid() = id);