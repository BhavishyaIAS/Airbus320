-- ============================================================================
-- MCQ Vault sample content — GK/GS for competitive exams.
-- Idempotent & non-destructive (ON CONFLICT / NOT EXISTS). Run after 0005.
-- Replace/extend with real content via the admin later.
-- ============================================================================
begin;

-- ---- Subjects -------------------------------------------------------------
insert into mcq_subjects (name, slug, description, display_order) values
  ('History, Art & Culture', 'history',             'Ancient, medieval and modern India, art forms and cultural heritage.', 0),
  ('Geography',              'geography',           'Physical, human, Indian and world geography.',                          1),
  ('Polity',                 'polity',              'Indian Constitution, governance and the political system.',             2),
  ('Economy',                'economy',             'Indian economy, development and core economic concepts.',               3),
  ('Science & Technology',   'science-technology',  'General science and recent technological developments.',                4),
  ('Ecology & Environment',  'ecology-environment', 'Ecology, biodiversity, environment and climate change.',                5)
on conflict (slug) do nothing;

-- ---- Books ----------------------------------------------------------------
insert into mcq_books (subject_id, title, author, slug, description, display_order)
select s.id, v.title, v.author, v.slug, v.descr, v.ord
from (values
  ('history',   'A Brief History of Modern India',      'Spectrum',       'spectrum-modern-india', 'Standard reference for modern Indian history.', 0),
  ('history',   'Ancient India (NCERT)',                'R.S. Sharma',    'ncert-ancient-india',   'Foundational ancient history.',                 1),
  ('geography', 'Certificate Physical & Human Geography','G.C. Leong',    'leong-geography',       'Classic physical geography text.',              0),
  ('polity',    'Indian Polity',                        'M. Laxmikanth',  'laxmikanth-polity',     'The standard polity reference.',                0)
) as v(subject_slug, title, author, slug, descr, ord)
join mcq_subjects s on s.slug = v.subject_slug
on conflict (subject_id, slug) do nothing;

-- ---- Chapters -------------------------------------------------------------
insert into mcq_chapters (book_id, title, slug, chapter_no, display_order)
select b.id, v.title, v.slug, v.chno, v.ord
from (values
  ('spectrum-modern-india', 'Advent of the Europeans', 'advent-of-europeans', 1, 0),
  ('spectrum-modern-india', 'The Revolt of 1857',      'revolt-of-1857',      2, 1),
  ('ncert-ancient-india',   'The Harappan Civilisation','harappan-civilisation', 1, 0),
  ('leong-geography',       'Weathering and Erosion',  'weathering-erosion',  1, 0),
  ('laxmikanth-polity',     'Fundamental Rights',      'fundamental-rights',  1, 0)
) as v(book_slug, title, slug, chno, ord)
join mcq_books b on b.slug = v.book_slug
on conflict (book_id, slug) do nothing;

-- ---- MCQs -----------------------------------------------------------------
insert into mcqs (chapter_id, question_text, options, correct_answer, explanation, difficulty, display_order)
select c.id, v.q, v.opts::jsonb, v.ans, v.expl, v.diff, v.ord
from (values
  ('revolt-of-1857',
   'Who was the Governor-General of India during the Revolt of 1857?',
   '[{"key":"A","text":"Lord Dalhousie"},{"key":"B","text":"Lord Canning"},{"key":"C","text":"Lord Curzon"},{"key":"D","text":"Lord Ripon"}]',
   'B', 'Lord Canning was Governor-General during 1857 and later became the first Viceroy of India.', 'easy', 0),
  ('revolt-of-1857',
   'The immediate cause of the Revolt of 1857 was the introduction of the:',
   '[{"key":"A","text":"Doctrine of Lapse"},{"key":"B","text":"Enfield rifle greased cartridges"},{"key":"C","text":"Permanent Settlement"},{"key":"D","text":"Vernacular Press Act"}]',
   'B', 'The greased cartridges of the Enfield rifle, rumoured to use cow and pig fat, were the immediate trigger.', 'easy', 1),
  ('revolt-of-1857',
   'At which centre did Rani Lakshmibai lead the revolt?',
   '[{"key":"A","text":"Kanpur"},{"key":"B","text":"Lucknow"},{"key":"C","text":"Jhansi"},{"key":"D","text":"Delhi"}]',
   'C', 'Rani Lakshmibai led the uprising at Jhansi.', 'easy', 2),
  ('advent-of-europeans',
   'Which European power was the first to establish trade links with India in the modern era?',
   '[{"key":"A","text":"The British"},{"key":"B","text":"The French"},{"key":"C","text":"The Portuguese"},{"key":"D","text":"The Dutch"}]',
   'C', 'The Portuguese, led by Vasco da Gama (1498), were the first; the British and others followed.', 'medium', 0),
  ('advent-of-europeans',
   'The Battle of Plassey (1757) was fought between the British and the Nawab of:',
   '[{"key":"A","text":"Bengal"},{"key":"B","text":"Awadh"},{"key":"C","text":"Hyderabad"},{"key":"D","text":"Mysore"}]',
   'A', 'It was fought against Siraj-ud-Daulah, the Nawab of Bengal, and established British dominance in Bengal.', 'easy', 1),
  ('harappan-civilisation',
   'Which Harappan site is located on the banks of the river Ravi?',
   '[{"key":"A","text":"Mohenjodaro"},{"key":"B","text":"Harappa"},{"key":"C","text":"Lothal"},{"key":"D","text":"Kalibangan"}]',
   'B', 'Harappa is situated on the Ravi; Mohenjodaro is on the Indus.', 'medium', 0),
  ('harappan-civilisation',
   'The Great Bath has been found at which Harappan site?',
   '[{"key":"A","text":"Harappa"},{"key":"B","text":"Lothal"},{"key":"C","text":"Dholavira"},{"key":"D","text":"Mohenjodaro"}]',
   'D', 'The Great Bath, a large watertight tank, was found at Mohenjodaro.', 'easy', 1),
  ('weathering-erosion',
   'The breakdown of rocks in situ, without any movement of material, is called:',
   '[{"key":"A","text":"Erosion"},{"key":"B","text":"Weathering"},{"key":"C","text":"Deposition"},{"key":"D","text":"Transportation"}]',
   'B', 'Weathering is the in-situ disintegration/decomposition of rocks; erosion involves movement.', 'easy', 0),
  ('weathering-erosion',
   'Which type of weathering is dominant in hot desert regions?',
   '[{"key":"A","text":"Chemical weathering"},{"key":"B","text":"Biological weathering"},{"key":"C","text":"Physical (mechanical) weathering"},{"key":"D","text":"Frost weathering"}]',
   'C', 'Large diurnal temperature ranges make physical/mechanical weathering dominant in hot deserts.', 'medium', 1),
  ('fundamental-rights',
   'Fundamental Rights are contained in which Part of the Indian Constitution?',
   '[{"key":"A","text":"Part III"},{"key":"B","text":"Part IV"},{"key":"C","text":"Part II"},{"key":"D","text":"Part V"}]',
   'A', 'Fundamental Rights are in Part III (Articles 12–35).', 'easy', 0),
  ('fundamental-rights',
   'The Right to Constitutional Remedies is provided under which Article?',
   '[{"key":"A","text":"Article 19"},{"key":"B","text":"Article 21"},{"key":"C","text":"Article 32"},{"key":"D","text":"Article 14"}]',
   'C', 'Article 32 — called the "heart and soul" of the Constitution by Dr. Ambedkar.', 'medium', 1),
  ('fundamental-rights',
   'Which Fundamental Right was described by Dr. B.R. Ambedkar as the "heart and soul" of the Constitution?',
   '[{"key":"A","text":"Right to Equality"},{"key":"B","text":"Right to Freedom"},{"key":"C","text":"Right against Exploitation"},{"key":"D","text":"Right to Constitutional Remedies"}]',
   'D', 'He referred to Article 32 (Right to Constitutional Remedies) in this way.', 'medium', 2)
) as v(chapter_slug, q, opts, ans, expl, diff, ord)
join mcq_chapters c on c.slug = v.chapter_slug
where not exists (
  select 1 from mcqs m where m.chapter_id = c.id and m.question_text = v.q
);

commit;
