-- Fix RLS for skills table to allow authenticated users to add new skills
create policy "Authenticated users can add new skills." 
on skills for insert 
to authenticated 
with check (true);
