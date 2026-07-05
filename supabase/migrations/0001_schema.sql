-- ============================================================================
-- APPSC Group 1 Study Platform — Phase 2
-- Migration 0001: schema (enums, tables, indexes, triggers)
-- Run this first, then 0002_rls_policies.sql, then 0003_storage.sql.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type stage as enum ('prelims', 'mains');
exception when duplicate_object then null; end $$;

do $$ begin
  create type note_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users). role is null for normal users, 'admin' for
-- the single product owner (set manually — see seed / README).
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- subjects → microthemes → notes (1:1)
-- ---------------------------------------------------------------------------
create table if not exists subjects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  stage         stage not null,
  paper         text,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists microthemes (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references subjects (id) on delete cascade,
  topic             text not null,
  subtopic          text,
  title             text not null,
  slug              text not null unique,
  display_order     int  not null default 0,
  short_description text,
  created_at        timestamptz not null default now()
);
create index if not exists microthemes_subject_idx on microthemes (subject_id);

create table if not exists notes (
  id            uuid primary key default gen_random_uuid(),
  microtheme_id uuid not null unique references microthemes (id) on delete cascade,
  title         text not null,
  content       jsonb not null default '{}'::jsonb,  -- canonical TipTap JSON
  search_text   text  not null default '',           -- plaintext extracted on save
  search_tsv    tsvector,                             -- maintained by trigger
  status        note_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists notes_status_idx on notes (status);
create index if not exists notes_search_idx on notes using gin (search_tsv);

-- ---------------------------------------------------------------------------
-- tags (shared by notes and pyqs)
-- ---------------------------------------------------------------------------
create table if not exists tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table if not exists note_tags (
  note_id uuid not null references notes (id) on delete cascade,
  tag_id  uuid not null references tags  (id) on delete cascade,
  primary key (note_id, tag_id)
);
create index if not exists note_tags_tag_idx on note_tags (tag_id);

-- ---------------------------------------------------------------------------
-- pyqs (prelims MCQs / mains questions) + junctions + model answers
-- ---------------------------------------------------------------------------
create table if not exists pyqs (
  id            uuid primary key default gen_random_uuid(),
  stage         stage not null,
  year          int,
  question_text text not null,
  options       jsonb,          -- prelims only: [{ "key": "A", "text": "..." }, ...]
  correct_answer text,          -- prelims only: e.g. 'B'
  marks         int,            -- mains only
  source        text,
  search_text   text not null default '',
  search_tsv    tsvector,
  created_at    timestamptz not null default now(),
  -- Enforce the prelims/mains discriminator at the DB level.
  constraint pyq_stage_fields check (
    (stage = 'prelims' and marks is null)
    or
    (stage = 'mains' and options is null and correct_answer is null)
  )
);
create index if not exists pyqs_stage_idx on pyqs (stage);
create index if not exists pyqs_year_idx  on pyqs (year);
create index if not exists pyqs_search_idx on pyqs using gin (search_tsv);

create table if not exists pyq_microthemes (
  pyq_id        uuid not null references pyqs       (id) on delete cascade,
  microtheme_id uuid not null references microthemes(id) on delete cascade,
  primary key (pyq_id, microtheme_id)
);
create index if not exists pyq_microthemes_mt_idx on pyq_microthemes (microtheme_id);

create table if not exists pyq_tags (
  pyq_id uuid not null references pyqs (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (pyq_id, tag_id)
);
create index if not exists pyq_tags_tag_idx on pyq_tags (tag_id);

create table if not exists model_answers (
  id         uuid primary key default gen_random_uuid(),
  pyq_id     uuid not null unique references pyqs (id) on delete cascade,
  content    jsonb not null default '{}'::jsonb,  -- canonical TipTap JSON
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media (record of Storage uploads)
-- ---------------------------------------------------------------------------
create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  path        text,                       -- storage object path
  type        text,                       -- mime type / kind
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Full-text search vectors (trigger-maintained; to_tsvector is STABLE so it
-- can't live in a generated column).
-- ---------------------------------------------------------------------------
create or replace function notes_search_refresh()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.search_text, '')), 'B');
  return new;
end;
$$;

drop trigger if exists notes_search_trg on notes;
create trigger notes_search_trg
  before insert or update of title, search_text on notes
  for each row execute function notes_search_refresh();

create or replace function pyqs_search_refresh()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.question_text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.search_text, '')), 'B');
  return new;
end;
$$;

drop trigger if exists pyqs_search_trg on pyqs;
create trigger pyqs_search_trg
  before insert or update of question_text, search_text on pyqs
  for each row execute function pyqs_search_refresh();

-- updated_at triggers
drop trigger if exists notes_updated_at on notes;
create trigger notes_updated_at
  before update on notes
  for each row execute function set_updated_at();

drop trigger if exists model_answers_updated_at on model_answers;
create trigger model_answers_updated_at
  before update on model_answers
  for each row execute function set_updated_at();
