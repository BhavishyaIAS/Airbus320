-- ============================================================================
-- Seed data — a couple of AP micro-themes so we can see data flow end to end.
-- Safe to re-run (uses fixed UUIDs + ON CONFLICT DO NOTHING).
-- Run after the three migrations.
--
-- NOTE: This does NOT create the admin user. After you sign up once in the app,
-- promote yourself with:
--   update profiles set role = 'admin' where id = (
--     select id from auth.users where email = 'you@example.com'
--   );
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Subjects
-- ---------------------------------------------------------------------------
insert into subjects (id, name, stage, paper, display_order) values
  ('10000000-0000-0000-0000-000000000001',
   'History, Culture & Heritage of India and AP', 'mains', 'Paper II', 1),
  ('10000000-0000-0000-0000-000000000002',
   'Geography of India and Andhra Pradesh', 'mains', 'Paper III', 2)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Micro-themes
-- ---------------------------------------------------------------------------
insert into microthemes (id, subject_id, topic, subtopic, title, slug, display_order, short_description) values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'Ancient AP History', 'Early Deccan Dynasties',
   'The Satavahana Dynasty', 'satavahana-dynasty', 1,
   'The first great indigenous dynasty of the Deccan and Andhra.'),
  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   'Ancient AP History', 'Early Deccan Dynasties',
   'The Ikshvakus of Vijayapuri', 'ikshvakus-of-vijayapuri', 2,
   'Successors of the Satavahanas centred at Nagarjunakonda.'),
  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000002',
   'Physical Geography of AP', 'Drainage',
   'Rivers of Andhra Pradesh', 'rivers-of-andhra-pradesh', 1,
   'The major east-flowing river systems that drain the state.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
insert into tags (id, name, slug) values
  ('40000000-0000-0000-0000-000000000001', 'Ancient History', 'ancient-history'),
  ('40000000-0000-0000-0000-000000000002', 'Art & Architecture', 'art-architecture'),
  ('40000000-0000-0000-0000-000000000003', 'Rivers', 'rivers')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Notes (TipTap canonical JSON). One published rich note + one shorter note.
-- The 'Ikshvakus' micro-theme intentionally has NO note (shows the empty state).
-- ---------------------------------------------------------------------------
insert into notes (id, microtheme_id, title, status, search_text, content) values
(
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'The Satavahana Dynasty',
  'published',
  'Satavahanas Deccan Andhra Simuka Gautamiputra Satakarni Amaravati Pratishthana Paithan Krishna Godavari art architecture administration aharas Buddhist patronage',
  $json$
  {
    "type": "doc",
    "content": [
      { "type": "paragraph", "content": [ { "type": "text", "text": "The Satavahanas were the first major indigenous dynasty of the Deccan and Andhra, ruling for roughly four and a half centuries after the decline of Mauryan authority." } ] },
      { "type": "heading", "attrs": { "level": 2 }, "content": [ { "type": "text", "text": "Origins and Extent" } ] },
      { "type": "paragraph", "content": [ { "type": "text", "text": "Their power base lay in the fertile Krishna–Godavari region, from where they controlled trade routes linking the Deccan to both coasts." } ] },
      { "type": "bulletList", "content": [
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Capital: Pratishthana (Paithan), with Amaravati / Dharanikota as an eastern centre." } ] } ] },
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Founder: Simuka; greatest ruler: Gautamiputra Satakarni." } ] } ] }
      ] },
      { "type": "heading", "attrs": { "level": 2 }, "content": [ { "type": "text", "text": "Key Rulers" } ] },
      { "type": "table", "content": [
        { "type": "tableRow", "content": [
          { "type": "tableHeader", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Ruler" } ] } ] },
          { "type": "tableHeader", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Contribution" } ] } ] }
        ] },
        { "type": "tableRow", "content": [
          { "type": "tableCell", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Gautamiputra Satakarni" } ] } ] },
          { "type": "tableCell", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Defeated the Kshaharatas and restored Satavahana power." } ] } ] }
        ] },
        { "type": "tableRow", "content": [
          { "type": "tableCell", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Vasishthiputra Pulumavi" } ] } ] },
          { "type": "tableCell", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Extended patronage to the Amaravati stupa." } ] } ] }
        ] }
      ] },
      { "type": "heading", "attrs": { "level": 2 }, "content": [ { "type": "text", "text": "Administrative Structure" } ] },
      { "type": "codeBlock", "attrs": { "language": "mermaid" }, "content": [ { "type": "text", "text": "graph TD\n  King[Raja] --> Aharas[Aharas / Provinces]\n  Aharas --> Grama[Villages]\n  King --> Amatyas[Ministers]" } ] },
      { "type": "paragraph", "content": [ { "type": "text", "text": "Watch this lecture for a deeper overview:" } ] },
      { "type": "youtube", "attrs": { "src": "https://www.youtube.com/watch?v=aqz-KE-bpKQ", "start": 0 } },
      { "type": "heading", "attrs": { "level": 2 }, "content": [ { "type": "text", "text": "Art and Architecture" } ] },
      { "type": "paragraph", "content": [ { "type": "text", "text": "The Amaravati school of art flourished under their patronage, famous for its white-limestone reliefs." } ] },
      { "type": "image", "attrs": { "src": "https://picsum.photos/seed/amaravati/800/400", "alt": "Placeholder schematic — replace with a map of the Satavahana extent." } }
    ]
  }
  $json$::jsonb
),
(
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  'Rivers of Andhra Pradesh',
  'published',
  'Andhra Pradesh rivers Godavari Krishna Pennar east flowing Bay of Bengal drainage',
  $json$
  {
    "type": "doc",
    "content": [
      { "type": "paragraph", "content": [ { "type": "text", "text": "Andhra Pradesh is drained mainly by large east-flowing rivers that empty into the Bay of Bengal." } ] },
      { "type": "bulletList", "content": [
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Godavari — the largest river in the state (the ‘Dakshina Ganga’)." } ] } ] },
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Krishna — second largest; delta near Hamsaladeevi." } ] } ] },
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Pennar — drains the Rayalaseema region." } ] } ] }
      ] }
    ]
  }
  $json$::jsonb
)
on conflict (id) do nothing;

-- Note ↔ tag links
insert into note_tags (note_id, tag_id) values
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- PYQs: one prelims MCQ, one mains question (with a model answer).
-- ---------------------------------------------------------------------------
insert into pyqs (id, stage, year, question_text, options, correct_answer, source, search_text) values
(
  '50000000-0000-0000-0000-000000000001',
  'prelims', 2018,
  'Which of the following was an early capital of the Satavahana dynasty?',
  $json$[
    { "key": "A", "text": "Pataliputra" },
    { "key": "B", "text": "Pratishthana (Paithan)" },
    { "key": "C", "text": "Kanchipuram" },
    { "key": "D", "text": "Ujjain" }
  ]$json$::jsonb,
  'B',
  'APPSC Group 1 Prelims',
  'Satavahana capital Pratishthana Paithan'
)
on conflict (id) do nothing;

insert into pyqs (id, stage, year, question_text, marks, source, search_text) values
(
  '50000000-0000-0000-0000-000000000002',
  'mains', 2019,
  'Discuss the contributions of the Satavahana dynasty to art and architecture in ancient Andhra.',
  10,
  'APPSC Group 1 Mains',
  'Satavahana art architecture Amaravati Nagarjunakonda Buddhist stupa'
)
on conflict (id) do nothing;

-- PYQ ↔ micro-theme and ↔ tag links
insert into pyq_microthemes (pyq_id, microtheme_id) values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into pyq_tags (pyq_id, tag_id) values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- Model answer for the mains question
insert into model_answers (id, pyq_id, content) values
(
  '60000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  $json$
  {
    "type": "doc",
    "content": [
      { "type": "heading", "attrs": { "level": 3 }, "content": [ { "type": "text", "text": "Introduction" } ] },
      { "type": "paragraph", "content": [ { "type": "text", "text": "The Satavahanas (2nd century BCE – 3rd century CE) were pivotal patrons of early Buddhist art in the Deccan." } ] },
      { "type": "heading", "attrs": { "level": 3 }, "content": [ { "type": "text", "text": "Contributions" } ] },
      { "type": "bulletList", "content": [
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Amaravati Mahastupa: carved railings and medallions in white limestone." } ] } ] },
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Patronage of Buddhist centres at Nagarjunakonda and Bhattiprolu." } ] } ] }
      ] },
      { "type": "heading", "attrs": { "level": 3 }, "content": [ { "type": "text", "text": "Conclusion" } ] },
      { "type": "paragraph", "content": [ { "type": "text", "text": "This patronage laid the foundation of the Andhra school of art, which influenced later South-Indian and South-East Asian traditions." } ] }
    ]
  }
  $json$::jsonb
)
on conflict (id) do nothing;
