-- ============================================================================
-- Migration 0004: syllabus metadata for the full APPSC micro-theme import
-- Adds columns used by the imported 458-micro-theme syllabus.
-- Run after the earlier migrations. Safe to re-run.
-- ============================================================================

alter table microthemes
  add column if not exists external_id      text,
  add column if not exists geographic_scope text,   -- 'India/General' | 'AP-Specific' | 'World/Global'
  add column if not exists cognitive_level  text;   -- 'Factual' | 'Conceptual' | 'Analytical' | 'Applied/Skill'

-- external_id is the stable source id (e.g. 'PRE-PI-HC-001'); unique so the
-- import can upsert idempotently.
create unique index if not exists microthemes_external_id_key
  on microthemes (external_id)
  where external_id is not null;

create index if not exists microthemes_geo_idx on microthemes (geographic_scope);
