-- ============================================================================
-- Migration 0005: MCQ Vault
-- A separate practice module (distinct from the exam-year PYQ vault):
--   mcq_subjects -> mcq_books -> mcq_chapters -> mcqs
-- GK/GS MCQs for competitive exams, browsable Subject → Book → Chapter → solve.
-- Public can read everything; only the admin writes. Run after 0001-0004.
-- ============================================================================

-- ---- Tables ---------------------------------------------------------------

create table if not exists mcq_subjects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists mcq_books (
  id            uuid primary key default gen_random_uuid(),
  subject_id    uuid not null references mcq_subjects(id) on delete cascade,
  title         text not null,
  author        text,
  slug          text not null,
  description   text,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  unique (subject_id, slug)
);
create index if not exists mcq_books_subject_idx on mcq_books (subject_id);

create table if not exists mcq_chapters (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references mcq_books(id) on delete cascade,
  title         text not null,
  slug          text not null,
  chapter_no    int,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  unique (book_id, slug)
);
create index if not exists mcq_chapters_book_idx on mcq_chapters (book_id);

create table if not exists mcqs (
  id             uuid primary key default gen_random_uuid(),
  chapter_id     uuid not null references mcq_chapters(id) on delete cascade,
  question_text  text not null,
  options        jsonb not null,          -- [{ "key": "A", "text": "..." }, ...]
  correct_answer text not null,           -- e.g. 'B'
  explanation    text,
  difficulty     text,                    -- 'easy' | 'medium' | 'hard' (optional)
  display_order  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists mcqs_chapter_idx on mcqs (chapter_id);

create trigger mcqs_updated_at
  before update on mcqs
  for each row execute function set_updated_at();

-- ---- Row Level Security ---------------------------------------------------

alter table mcq_subjects enable row level security;
alter table mcq_books    enable row level security;
alter table mcq_chapters enable row level security;
alter table mcqs         enable row level security;

-- Public read (practice content is always public); admin-only writes.
create policy mcq_subjects_read  on mcq_subjects for select using (true);
create policy mcq_subjects_write on mcq_subjects for all using (is_admin()) with check (is_admin());

create policy mcq_books_read  on mcq_books for select using (true);
create policy mcq_books_write on mcq_books for all using (is_admin()) with check (is_admin());

create policy mcq_chapters_read  on mcq_chapters for select using (true);
create policy mcq_chapters_write on mcq_chapters for all using (is_admin()) with check (is_admin());

create policy mcqs_read  on mcqs for select using (true);
create policy mcqs_write on mcqs for all using (is_admin()) with check (is_admin());
