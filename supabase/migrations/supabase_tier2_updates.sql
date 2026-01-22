-- Add is_verified to profiles
alter table profiles add column is_verified boolean default false;

-- Create follows table
create table follows (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  unique(follower_id, following_id)
);

-- RLS for follows
alter table follows enable row level security;

create policy "Follows are viewable by everyone." on follows
  for select using (true);

create policy "Users can follow others." on follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow." on follows
  for delete using (auth.uid() = follower_id);

-- Create favorites table (Wishlist)
create table favorites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  unique(user_id, listing_id)
);

-- RLS for favorites
alter table favorites enable row level security;

create policy "Users can view their own favorites." on favorites
  for select using (auth.uid() = user_id);

create policy "Users can add favorites." on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can remove favorites." on favorites
  for delete using (auth.uid() = user_id);

-- Create reports table
create table reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reporter_id uuid references profiles(id) on delete set null,
  listing_id uuid references listings(id) on delete cascade,
  reason text not null,
  status text check (status in ('pending', 'reviewed', 'resolved')) default 'pending'
);

-- RLS for reports
alter table reports enable row level security;

create policy "Users can create reports." on reports
  for insert with check (auth.uid() = reporter_id);

-- Enable full-text search on listings
-- We'll use a generated column for easier searching
alter table listings add column fts tsvector generated always as (to_tsvector('english', title || ' ' || coalesce(description, ''))) stored;
create index listings_fts_idx on listings using gin(fts);
