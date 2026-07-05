-- ============================================================================
-- Migration 0002: Row Level Security
-- Public reads published content; all writes require the admin role.
-- Run after 0001_schema.sql.
-- ============================================================================

-- Admin check used across every write policy. SECURITY DEFINER so it can read
-- profiles regardless of the caller's own RLS; search_path pinned for safety.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS everywhere.
alter table profiles        enable row level security;
alter table subjects        enable row level security;
alter table microthemes     enable row level security;
alter table notes           enable row level security;
alter table tags            enable row level security;
alter table note_tags       enable row level security;
alter table pyqs            enable row level security;
alter table pyq_microthemes enable row level security;
alter table pyq_tags        enable row level security;
alter table model_answers   enable row level security;
alter table media           enable row level security;

-- Helper to (re)create a policy idempotently.
-- (Postgres has no CREATE POLICY IF NOT EXISTS, so we drop first.)

-- ---------------------------------------------------------------------------
-- profiles: a user sees their own row; admins see all. No public read.
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select using (id = auth.uid() or is_admin());

drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles
  for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- subjects / microthemes / tags: fully readable (syllabus structure is public).
-- Writes: admin only.
-- ---------------------------------------------------------------------------
drop policy if exists subjects_read on subjects;
create policy subjects_read on subjects for select using (true);
drop policy if exists subjects_write on subjects;
create policy subjects_write on subjects for all using (is_admin()) with check (is_admin());

drop policy if exists microthemes_read on microthemes;
create policy microthemes_read on microthemes for select using (true);
drop policy if exists microthemes_write on microthemes;
create policy microthemes_write on microthemes for all using (is_admin()) with check (is_admin());

drop policy if exists tags_read on tags;
create policy tags_read on tags for select using (true);
drop policy if exists tags_write on tags;
create policy tags_write on tags for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- notes: public reads PUBLISHED only; admin reads/writes everything.
-- ---------------------------------------------------------------------------
drop policy if exists notes_read on notes;
create policy notes_read on notes
  for select using (status = 'published' or is_admin());
drop policy if exists notes_write on notes;
create policy notes_write on notes for all using (is_admin()) with check (is_admin());

-- note_tags: readable (only useful alongside a readable note); admin writes.
drop policy if exists note_tags_read on note_tags;
create policy note_tags_read on note_tags for select using (true);
drop policy if exists note_tags_write on note_tags;
create policy note_tags_write on note_tags for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- pyqs + junctions + model answers: public read, admin write.
-- ---------------------------------------------------------------------------
drop policy if exists pyqs_read on pyqs;
create policy pyqs_read on pyqs for select using (true);
drop policy if exists pyqs_write on pyqs;
create policy pyqs_write on pyqs for all using (is_admin()) with check (is_admin());

drop policy if exists pyq_microthemes_read on pyq_microthemes;
create policy pyq_microthemes_read on pyq_microthemes for select using (true);
drop policy if exists pyq_microthemes_write on pyq_microthemes;
create policy pyq_microthemes_write on pyq_microthemes for all using (is_admin()) with check (is_admin());

drop policy if exists pyq_tags_read on pyq_tags;
create policy pyq_tags_read on pyq_tags for select using (true);
drop policy if exists pyq_tags_write on pyq_tags;
create policy pyq_tags_write on pyq_tags for all using (is_admin()) with check (is_admin());

drop policy if exists model_answers_read on model_answers;
create policy model_answers_read on model_answers for select using (true);
drop policy if exists model_answers_write on model_answers;
create policy model_answers_write on model_answers for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- media: public read (bucket is public anyway), admin write.
-- ---------------------------------------------------------------------------
drop policy if exists media_read on media;
create policy media_read on media for select using (true);
drop policy if exists media_write on media;
create policy media_write on media for all using (is_admin()) with check (is_admin());
