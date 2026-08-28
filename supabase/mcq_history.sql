-- ============================================================================
-- MCQ Vault — add the three History divisions under the History subject.
-- These sit at the level directly under a subject (the "book" level in the
-- schema). Idempotent & non-destructive; run after 0005 + mcq_subjects.sql.
-- ============================================================================
begin;

insert into mcq_books (subject_id, title, slug, description, display_order)
select s.id, v.title, v.slug, v.descr, v.ord
from (values
  ('Ancient India',  'ancient-india',  'Prehistory and the Indus Valley to c. 8th century CE.', 0),
  ('Medieval India', 'medieval-india', 'c. 8th century CE to the 18th century.',                 1),
  ('Modern India',   'modern-india',   '18th century CE to Independence and after.',             2)
) as v(title, slug, descr, ord)
join mcq_subjects s on s.slug = 'history'
on conflict (subject_id, slug) do update set
  title         = excluded.title,
  description   = excluded.description,
  display_order = excluded.display_order;

commit;
