-- Phase 5: Student Career & Safety Ecosystem Updates

-- 1. Academic Honor Code Support
alter table listings add column honor_code_agreed boolean default false;

-- 2. Smart Campus Safe-Zones
create table safe_zones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  university text not null,
  description text,
  location_lat numeric,
  location_lng numeric,
  is_verified boolean default true
);

alter table listings add column safe_zone_id uuid references safe_zones(id) on delete set null;

-- Enable RLS for safe_zones
alter table safe_zones enable row level security;
create policy "Safe zones are viewable by everyone." on safe_zones for select using (true);

-- 3. Student Agencies (Collaborative Framework)
create table agencies (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  owner_id uuid references profiles(id) on delete cascade not null,
  avatar_url text,
  university text
);

create table agency_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  agency_id uuid references agencies(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  role text default 'member',
  unique(agency_id, profile_id)
);

alter table listings add column agency_id uuid references agencies(id) on delete set null;

-- Enable RLS for agencies
alter table agencies enable row level security;
create policy "Agencies are viewable by everyone." on agencies for select using (true);
create policy "Users can create agencies." on agencies for insert with check (auth.uid() = owner_id);

alter table agency_members enable row level security;
create policy "Agency members are viewable by everyone." on agency_members for select using (true);
create policy "Agency owners can manage members." on agency_members for all using (
  exists (
    select 1 from agencies where agencies.id = agency_members.agency_id and agencies.owner_id = auth.uid()
  )
);

-- 4. Experience Certificates / Digital Credentials
create table credentials (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  issuer_name text default 'Studentify Professional Network',
  certificate_url text,
  verification_code text unique default encode(gen_random_bytes(6), 'hex')
);

-- Enable RLS for credentials
alter table credentials enable row level security;
create policy "Credentials are viewable by everyone." on credentials for select using (true);
create policy "System can issue credentials." on credentials for all using (true); -- In real app, restrict to service role
