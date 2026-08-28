-- ============================================================================
-- MCQ Vault — canonical subject list.
-- Idempotent & non-destructive: updates existing subjects in place (keeping
-- their books/chapters/MCQs) and adds any missing ones. Run after 0005.
-- ============================================================================
begin;

insert into mcq_subjects (name, slug, description, display_order) values
  ('History, Art & Culture', 'history',             'Ancient, medieval and modern India, art forms and cultural heritage.', 0),
  ('Geography',              'geography',           'Physical, human, Indian and world geography.',                          1),
  ('Polity',                 'polity',              'Indian Constitution, governance and the political system.',             2),
  ('Economy',                'economy',             'Indian economy, development and core economic concepts.',               3),
  ('Science & Technology',   'science-technology',  'General science and recent technological developments.',                4),
  ('Ecology & Environment',  'ecology-environment', 'Ecology, biodiversity, environment and climate change.',                5)
on conflict (slug) do update set
  name          = excluded.name,
  description   = excluded.description,
  display_order = excluded.display_order;

commit;
