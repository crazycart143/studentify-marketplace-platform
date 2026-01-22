-- Add columns for Student Type and Verification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_type text CHECK (student_type IN ('college', 'shs'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_doc_url text;

-- Create a PRIVATE bucket for verification documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'verifications', 'verifications', false, 5242880, ARRAY['image/png', 'image/jpeg', 'application/pdf']
where not exists (select 1 from storage.buckets where id = 'verifications');

-- Policy: Authenticated users can upload verification docs
create policy "Authenticated users can upload verification docs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'verifications');

-- Policy: Users can view their own verification docs
create policy "Users can view own verification docs"
on storage.objects for select
to authenticated
using (bucket_id = 'verifications');
