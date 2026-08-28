-- ============================================================================
-- MCQ Vault — sample MCQs across every subject (proxy/placeholder book names).
-- Self-contained & idempotent: ensures the 6 subjects and History divisions
-- exist, adds proxy books/chapters, and inserts sample GK/GS MCQs.
-- Non-destructive (ON CONFLICT / NOT EXISTS). Run after 0005.
-- (Geography & Polity already have sample MCQs from mcq_seed.sql.)
-- ============================================================================
begin;

-- Ensure the 6 subjects exist (no-op if already present).
insert into mcq_subjects (name, slug, description, display_order) values
  ('History, Art & Culture', 'history',             'Ancient, medieval and modern India, art forms and cultural heritage.', 0),
  ('Geography',              'geography',           'Physical, human, Indian and world geography.',                          1),
  ('Polity',                 'polity',              'Indian Constitution, governance and the political system.',             2),
  ('Economy',                'economy',             'Indian economy, development and core economic concepts.',               3),
  ('Science & Technology',   'science-technology',  'General science and recent technological developments.',                4),
  ('Ecology & Environment',  'ecology-environment', 'Ecology, biodiversity, environment and climate change.',                5)
on conflict (slug) do nothing;

-- History divisions (book level).
insert into mcq_books (subject_id, title, slug, description, display_order)
select s.id, v.title, v.slug, v.descr, v.ord
from (values
  ('Ancient India',  'ancient-india',  'Prehistory and the Indus Valley to c. 8th century CE.', 0),
  ('Medieval India', 'medieval-india', 'c. 8th century CE to the 18th century.',                 1),
  ('Modern India',   'modern-india',   '18th century CE to Independence and after.',             2)
) as v(title, slug, descr, ord)
join mcq_subjects s on s.slug = 'history'
on conflict (subject_id, slug) do nothing;

-- Proxy books for the three subjects that had no content yet.
insert into mcq_books (subject_id, title, author, slug, description, display_order)
select s.id, v.title, 'Sample compilation', v.slug, v.descr, 0
from (values
  ('economy',             'Indian Economy Primer (sample)',      'economy-primer', 'Placeholder book — replace with a standard reference.'),
  ('science-technology',  'General Science Primer (sample)',     'science-primer', 'Placeholder book — replace with a standard reference.'),
  ('ecology-environment', 'Environment & Ecology Primer (sample)','ecology-primer','Placeholder book — replace with a standard reference.')
) as v(subject_slug, title, slug, descr)
join mcq_subjects s on s.slug = v.subject_slug
on conflict (subject_id, slug) do nothing;

-- Chapters.
insert into mcq_chapters (book_id, title, slug, chapter_no, display_order)
select b.id, v.title, v.slug, v.chno, v.ord
from (values
  ('ancient-india',   'Indus Valley Civilization', 'indus-valley-civilization', 1, 0),
  ('medieval-india',  'The Delhi Sultanate',       'delhi-sultanate',           1, 0),
  ('modern-india',    'Indian National Movement',  'indian-national-movement',  1, 0),
  ('economy-primer',  'Basic Concepts',            'basic-concepts',            1, 0),
  ('science-primer',  'General Science',           'general-science',           1, 0),
  ('ecology-primer',  'Basics of Ecology',         'basics-of-ecology',         1, 0)
) as v(book_slug, title, slug, chno, ord)
join mcq_books b on b.slug = v.book_slug
on conflict (book_id, slug) do nothing;

-- MCQs.
insert into mcqs (chapter_id, question_text, options, correct_answer, explanation, difficulty, display_order)
select c.id, v.q, v.opts::jsonb, v.ans, v.expl, v.diff, v.ord
from (values
  -- Ancient India · IVC
  ('indus-valley-civilization',
   'Which metal was NOT known to the people of the Indus Valley Civilization?',
   '[{"key":"A","text":"Copper"},{"key":"B","text":"Bronze"},{"key":"C","text":"Iron"},{"key":"D","text":"Gold"}]',
   'C', 'The IVC was a Bronze Age culture; iron was not yet in use.', 'easy', 0),
  ('indus-valley-civilization',
   'Which Indus site is famous for its dockyard?',
   '[{"key":"A","text":"Harappa"},{"key":"B","text":"Lothal"},{"key":"C","text":"Kalibangan"},{"key":"D","text":"Ropar"}]',
   'B', 'Lothal in Gujarat had a tidal dockyard, indicating maritime trade.', 'medium', 1),
  ('indus-valley-civilization',
   'The Indus Valley Civilization is also known as the:',
   '[{"key":"A","text":"Vedic Civilization"},{"key":"B","text":"Harappan Civilization"},{"key":"C","text":"Mauryan Civilization"},{"key":"D","text":"Dravidian Civilization"}]',
   'B', 'It is named the Harappan Civilization after Harappa, the first site excavated.', 'easy', 2),
  -- Medieval India · Delhi Sultanate
  ('delhi-sultanate',
   'Who founded the Slave (Mamluk) dynasty of the Delhi Sultanate?',
   '[{"key":"A","text":"Qutbuddin Aibak"},{"key":"B","text":"Iltutmish"},{"key":"C","text":"Balban"},{"key":"D","text":"Alauddin Khalji"}]',
   'A', 'Qutbuddin Aibak founded the Slave dynasty in 1206.', 'medium', 0),
  ('delhi-sultanate',
   'The Qutb Minar in Delhi was completed by:',
   '[{"key":"A","text":"Qutbuddin Aibak"},{"key":"B","text":"Iltutmish"},{"key":"C","text":"Firoz Shah Tughlaq"},{"key":"D","text":"Sikandar Lodi"}]',
   'B', 'Aibak began the Qutb Minar; Iltutmish completed it.', 'medium', 1),
  ('delhi-sultanate',
   'Who was the first woman ruler of the Delhi Sultanate?',
   '[{"key":"A","text":"Chand Bibi"},{"key":"B","text":"Razia Sultana"},{"key":"C","text":"Nur Jahan"},{"key":"D","text":"Rani Durgavati"}]',
   'B', 'Razia Sultana (daughter of Iltutmish) was the first and only woman to rule the Sultanate.', 'easy', 2),
  -- Modern India · National Movement
  ('indian-national-movement',
   'In which year was the Indian National Congress founded?',
   '[{"key":"A","text":"1885"},{"key":"B","text":"1857"},{"key":"C","text":"1905"},{"key":"D","text":"1919"}]',
   'A', 'The INC was founded in 1885, with A.O. Hume playing a key role.', 'easy', 0),
  ('indian-national-movement',
   'Who gave the slogan "Do or Die" during the Quit India Movement (1942)?',
   '[{"key":"A","text":"Jawaharlal Nehru"},{"key":"B","text":"Mahatma Gandhi"},{"key":"C","text":"Subhas Chandra Bose"},{"key":"D","text":"Sardar Patel"}]',
   'B', 'Gandhi gave the "Do or Die" call during the Quit India Movement.', 'easy', 1),
  ('indian-national-movement',
   'The Jallianwala Bagh massacre took place in which year?',
   '[{"key":"A","text":"1919"},{"key":"B","text":"1920"},{"key":"C","text":"1930"},{"key":"D","text":"1942"}]',
   'A', 'It occurred on 13 April 1919 in Amritsar.', 'easy', 2),
  -- Economy · Basic Concepts
  ('basic-concepts',
   'Which institution is responsible for monetary policy in India?',
   '[{"key":"A","text":"SEBI"},{"key":"B","text":"Reserve Bank of India"},{"key":"C","text":"NITI Aayog"},{"key":"D","text":"Finance Commission"}]',
   'B', 'The RBI formulates and implements monetary policy in India.', 'easy', 0),
  ('basic-concepts',
   'The Indian financial year runs from:',
   '[{"key":"A","text":"January to December"},{"key":"B","text":"April to March"},{"key":"C","text":"July to June"},{"key":"D","text":"October to September"}]',
   'B', 'India''s financial year is 1 April to 31 March.', 'easy', 1),
  ('basic-concepts',
   '"GDP" stands for:',
   '[{"key":"A","text":"Gross Domestic Product"},{"key":"B","text":"General Domestic Product"},{"key":"C","text":"Gross Development Plan"},{"key":"D","text":"Gross Domestic Provision"}]',
   'A', 'GDP = Gross Domestic Product, the total value of goods and services produced.', 'easy', 2),
  -- Science & Technology · General Science
  ('general-science',
   'The chemical symbol for gold is:',
   '[{"key":"A","text":"Go"},{"key":"B","text":"Gd"},{"key":"C","text":"Au"},{"key":"D","text":"Ag"}]',
   'C', 'Gold''s symbol is Au (from Latin aurum). Ag is silver.', 'easy', 0),
  ('general-science',
   'Which gas is the most abundant in the Earth''s atmosphere?',
   '[{"key":"A","text":"Oxygen"},{"key":"B","text":"Carbon dioxide"},{"key":"C","text":"Nitrogen"},{"key":"D","text":"Hydrogen"}]',
   'C', 'Nitrogen makes up about 78% of the atmosphere.', 'easy', 1),
  ('general-science',
   'The "powerhouse of the cell" is the:',
   '[{"key":"A","text":"Nucleus"},{"key":"B","text":"Ribosome"},{"key":"C","text":"Mitochondria"},{"key":"D","text":"Golgi body"}]',
   'C', 'Mitochondria generate most of the cell''s ATP (energy).', 'easy', 2),
  -- Ecology & Environment · Basics
  ('basics-of-ecology',
   'The variety of life forms in a given region is called:',
   '[{"key":"A","text":"Biomagnification"},{"key":"B","text":"Biodiversity"},{"key":"C","text":"Bioremediation"},{"key":"D","text":"Biomass"}]',
   'B', 'Biodiversity refers to the variety of species, genes and ecosystems.', 'easy', 0),
  ('basics-of-ecology',
   'Which organization publishes the "Red List" of threatened species?',
   '[{"key":"A","text":"WWF"},{"key":"B","text":"IUCN"},{"key":"C","text":"UNEP"},{"key":"D","text":"IPCC"}]',
   'B', 'The IUCN maintains the Red List of Threatened Species.', 'medium', 1),
  ('basics-of-ecology',
   'Which of the following is a greenhouse gas?',
   '[{"key":"A","text":"Nitrogen"},{"key":"B","text":"Oxygen"},{"key":"C","text":"Carbon dioxide"},{"key":"D","text":"Argon"}]',
   'C', 'CO2 is a major greenhouse gas driving global warming.', 'easy', 2)
) as v(chapter_slug, q, opts, ans, expl, diff, ord)
join mcq_chapters c on c.slug = v.chapter_slug
where not exists (
  select 1 from mcqs m where m.chapter_id = c.id and m.question_text = v.q
);

commit;
