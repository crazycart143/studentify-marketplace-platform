-- Create offers table
create table offers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  amount numeric not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'countered', 'expired')) default 'pending',
  expires_at timestamp with time zone default (now() + interval '48 hours'),
  message text
);

-- RLS for offers
alter table offers enable row level security;

create policy "Users can view offers they are involved in." on offers
  for select using (auth.uid() = buyer_id or exists (
    select 1 from listings where listings.id = offers.listing_id and listings.owner_id = auth.uid()
  ));

create policy "Buyers can create offers." on offers
  for insert with check (auth.uid() = buyer_id);

create policy "Involved parties can update offers." on offers
  for update using (auth.uid() = buyer_id or exists (
    select 1 from listings where listings.id = offers.listing_id and listings.owner_id = auth.uid()
  ));

-- Create orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references listings(id) on delete set null,
  buyer_id uuid references profiles(id) on delete set null,
  seller_id uuid references profiles(id) on delete set null,
  amount numeric not null,
  stripe_payment_intent_id text unique,
  status text check (status in ('pending', 'succeeded', 'failed', 'refunded')) default 'pending'
);

-- RLS for orders
alter table orders enable row level security;

create policy "Users can view their own orders." on orders
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
