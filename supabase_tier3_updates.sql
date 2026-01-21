-- Create listing_views table for analytics
create table listing_views (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references listings(id) on delete cascade not null,
  viewer_id uuid references profiles(id) on delete set null, -- Optional: track logged in viewers
  ip_address text -- To prevent double counting (simple version)
);

-- RLS for listing_views
alter table listing_views enable row level security;

create policy "Anyone can insert views." on listing_views
  for insert with check (true);

create policy "Owners can view analytics for their listings." on listing_views
  for select using (
    exists (
      select 1 from listings 
      where listings.id = listing_views.listing_id 
      and listings.owner_id = auth.uid()
    )
  );

-- Function to increment view count (RPC)
create or replace function increment_listing_view(l_id uuid)
returns void as $$
begin
  insert into listing_views (listing_id) values (l_id);
end;
$$ language plpgsql security definer;

-- Update listings table to include a views_count cache (optional but helpful for performance)
alter table listings add column views_count integer default 0;

-- Trigger to update views_count on listing_views insert
create or replace function update_listing_views_count()
returns trigger as $$
begin
  update listings 
  set views_count = views_count + 1 
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_listing_view_added
  after insert on listing_views
  for each row execute procedure update_listing_views_count();
