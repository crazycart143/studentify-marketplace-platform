-- Add onboarding and student details to profiles
alter table public.profiles 
add column if not exists university text,
add column if not exists major text,
add column if not exists year_of_study text,
add column if not exists bio text,
add column if not exists is_verified boolean default false,
add column if not exists has_completed_onboarding boolean default false;

-- Add onboarding metadata to help track progress
comment on column public.profiles.has_completed_onboarding is 'Tracks if the student has finished the initial setup flow';
