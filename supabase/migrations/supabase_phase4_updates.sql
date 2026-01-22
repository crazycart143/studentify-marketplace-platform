-- Phase 4: Student Freelance & Services Hub Updates

-- 1. Enhance Profiles with Academic Information
alter table profiles add column university text;
alter table profiles add column major text;
alter table profiles add column year_of_study text;
alter table profiles add column bio text;

-- 2. Enhance Listings for Freelance Services
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'listing_type') then
        create type listing_type as enum ('product', 'service');
    end if;
    if not exists (select 1 from pg_type where typname = 'pricing_model') then
        create type pricing_model as enum ('fixed', 'hourly');
    end if;
end $$;

alter table listings add column type listing_type default 'product';
alter table listings add column pricing_model pricing_model default 'fixed';
alter table listings add column delivery_time text; -- e.g., '3 days', '1 week'
alter table listings add column revisions_count integer default 0;

-- 3. Skills and Endorsements
create table skills (
  id uuid default gen_random_uuid() primary key,
  name text unique not null
);

create table profile_skills (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  skill_id uuid references skills(id) on delete cascade not null,
  unique(profile_id, skill_id)
);

create table skill_endorsements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  skill_id uuid references skills(id) on delete cascade not null,
  endorser_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  unique(skill_id, endorser_id, recipient_id)
);

-- 4. Milestone-Based Payments / Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references listings(id) on delete set null,
  client_id uuid references profiles(id) on delete cascade not null,
  freelancer_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('draft', 'active', 'completed', 'cancelled')) default 'draft',
  total_amount numeric not null,
  description text
);

create table milestones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  amount numeric not null,
  status text check (status in ('pending', 'in_progress', 'submitted', 'paid')) default 'pending',
  due_date timestamp with time zone
);

-- RLS for new tables

-- Skills
alter table skills enable row level security;
create policy "Skills are viewable by everyone." on skills for select using (true);

-- Profile Skills
alter table profile_skills enable row level security;
create policy "Profile skills are viewable by everyone." on profile_skills for select using (true);
create policy "Users can manage their own skills." on profile_skills for all using (auth.uid() = profile_id);

-- Skill Endorsements
alter table skill_endorsements enable row level security;
create policy "Endorsements are viewable by everyone." on skill_endorsements for select using (true);
create policy "Users can endorse others once per skill." on skill_endorsements for insert with check (auth.uid() = endorser_id);

-- Projects
alter table projects enable row level security;
create policy "Users can view their own projects." on projects for select using (auth.uid() = client_id or auth.uid() = freelancer_id);
create policy "Clients can create projects." on projects for insert with check (auth.uid() = client_id);

-- Milestones
alter table milestones enable row level security;
create policy "Users can view milestones for their projects." on milestones for select using (
  exists (
    select 1 from projects 
    where projects.id = milestones.project_id 
    and (projects.client_id = auth.uid() or projects.freelancer_id = auth.uid())
  )
);
