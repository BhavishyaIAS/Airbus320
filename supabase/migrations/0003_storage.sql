-- ============================================================================
-- Migration 0003: Storage bucket for note images / uploads
-- Public read; only the admin can upload/modify/delete.
-- Run after 0002_rls_policies.sql.
-- ============================================================================

-- Public bucket named 'media'. Public read is served directly from Storage;
-- write access is still gated by the policies below.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Anyone can read objects in the media bucket.
drop policy if exists media_objects_read on storage.objects;
create policy media_objects_read on storage.objects
  for select using (bucket_id = 'media');

-- Only the admin can upload / update / delete.
drop policy if exists media_objects_insert on storage.objects;
create policy media_objects_insert on storage.objects
  for insert with check (bucket_id = 'media' and is_admin());

drop policy if exists media_objects_update on storage.objects;
create policy media_objects_update on storage.objects
  for update using (bucket_id = 'media' and is_admin())
  with check (bucket_id = 'media' and is_admin());

drop policy if exists media_objects_delete on storage.objects;
create policy media_objects_delete on storage.objects
  for delete using (bucket_id = 'media' and is_admin());
