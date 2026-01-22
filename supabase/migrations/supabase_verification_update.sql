-- University-Specific Verification Badge Update

-- Update handle_new_user to automatically verify students with .edu emails
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, is_verified)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    -- Automatically verify if email ends in .edu
    (new.email like '%.edu' or new.email like '%.ac.uk' or new.email like '%.edu.%')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Also, let's update existing profiles that have .edu emails but aren't verified
-- Note: This requires joining with auth.users which is in a different schema
-- In a real Supabase environment, you would run this in the SQL Editor
-- update profiles
-- set is_verified = true
-- from auth.users
-- where profiles.id = auth.users.id
-- and (auth.users.email like '%.edu' or auth.users.email like '%.ac.uk' or auth.users.email like '%.edu.%');
