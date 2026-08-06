import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { asArray } from "@/lib/utils";
import type { NoteStatus, Stage } from "@/lib/types/database";

/* ---- Assembled shapes returned to the UI ---------------------------------- */

export type SyllabusMicrotheme = {
  id: string;
  title: string;
  slug: string;
  geographicScope: string | null;
  hasPublishedNote: boolean;
};

export type SyllabusSubtopic = {
  subtopic: string | null;
  microthemes: SyllabusMicrotheme[];
};

export type SyllabusTopic = {
  topic: string;
  subtopics: SyllabusSubtopic[];
  count: number;
};

export type SyllabusSubject = {
  id: string;
  name: string;
  stage: Stage;
  paper: string | null;
  topics: SyllabusTopic[];
  count: number;
  publishedCount: number;
};

export type SyllabusFilters = { stage?: Stage; scope?: string };

export type NotePageData = {
  microtheme: {
    id: string;
    topic: string;
    subtopic: string | null;
    title: string;
    slug: string;
    short_description: string | null;
  };
  subject: { id: string; name: string; stage: Stage; paper: string | null } | null;
  note: {
    id: string;
    title: string;
    content: unknown;
    status: NoteStatus;
    updated_at: string;
  } | null;
  tags: { id: string; name: string; slug: string }[];
};

/* ---- Queries -------------------------------------------------------------- */

/**
 * The full syllabus tree: subjects → topics → micro-themes, each flagged with
 * whether it has a published note. RLS means anon only ever sees published
 * notes, so a returned note implies it's public.
 */
export async function getSyllabus(
  filters: SyllabusFilters = {},
): Promise<SyllabusSubject[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();

  let query = supabase
    .from("subjects")
    .select(
      `id, name, stage, paper, display_order,
       microthemes ( id, topic, subtopic, title, slug, display_order, geographic_scope,
                     notes ( id, status ) )`,
    )
    .order("display_order", { ascending: true })
    .order("display_order", { referencedTable: "microthemes", ascending: true });

  if (filters.stage) query = query.eq("stage", filters.stage);

  const { data, error } = await query;
  if (error || !data) return [];

  const out: SyllabusSubject[] = [];

  for (const s of data as unknown as RawSubject[]) {
    // topic -> (subtopic -> microthemes), preserving insertion order.
    const topics = new Map<string, Map<string, SyllabusMicrotheme[]>>();
    let count = 0;
    let publishedCount = 0;

    for (const mt of asArray(s.microthemes)) {
      if (filters.scope && mt.geographic_scope !== filters.scope) continue;

      const subKey = mt.subtopic ?? "";
      if (!topics.has(mt.topic)) topics.set(mt.topic, new Map());
      const subMap = topics.get(mt.topic)!;
      if (!subMap.has(subKey)) subMap.set(subKey, []);

      const published = asArray(mt.notes).some((n) => n.status === "published");
      if (published) publishedCount++;
      count++;

      subMap.get(subKey)!.push({
        id: mt.id,
        title: mt.title,
        slug: mt.slug,
        geographicScope: mt.geographic_scope ?? null,
        hasPublishedNote: published,
      });
    }

    if (count === 0) continue; // filtered out entirely

    out.push({
      id: s.id,
      name: s.name,
      stage: s.stage,
      paper: s.paper,
      count,
      publishedCount,
      topics: Array.from(topics, ([topic, subMap]) => ({
        topic,
        count: Array.from(subMap.values()).reduce((n, l) => n + l.length, 0),
        subtopics: Array.from(subMap, ([subtopic, microthemes]) => ({
          subtopic: subtopic === "" ? null : subtopic,
          microthemes,
        })),
      })),
    });
  }

  return out;
}

/** One micro-theme + its published note (if any), subject, and tags, by slug. */
export async function getNoteBySlug(slug: string): Promise<NotePageData | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();

  // Tags are embedded through the note (note_tags → notes), not the micro-theme:
  // note_tags has no foreign key to microthemes, so embedding it there errors.
  const { data, error } = await supabase
    .from("microthemes")
    .select(
      `id, topic, subtopic, title, slug, short_description,
       subject:subjects ( id, name, stage, paper ),
       notes ( id, title, content, status, updated_at,
               note_tags ( tag:tags ( id, name, slug ) ) )`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as RawMicrothemeWithNote;

  const publishedNote =
    asArray(row.notes).find((n) => n.status === "published") ?? null;
  const subject = asArray(row.subject)[0] ?? null;
  const tags = publishedNote
    ? asArray(publishedNote.note_tags)
        .map((nt) => nt.tag)
        .filter(Boolean)
    : [];

  return {
    microtheme: {
      id: row.id,
      topic: row.topic,
      subtopic: row.subtopic,
      title: row.title,
      slug: row.slug,
      short_description: row.short_description,
    },
    subject,
    note: publishedNote
      ? {
          id: publishedNote.id,
          title: publishedNote.title,
          content: publishedNote.content,
          status: publishedNote.status,
          updated_at: publishedNote.updated_at,
        }
      : null,
    tags,
  };
}

/* ---- Raw row shapes from the nested selects -------------------------------- */

type RawSubject = {
  id: string;
  name: string;
  stage: Stage;
  paper: string | null;
  microthemes: {
    id: string;
    topic: string;
    subtopic: string | null;
    title: string;
    slug: string;
    geographic_scope: string | null;
    notes: { id: string; status: NoteStatus }[] | null;
  }[] | null;
};

type RawNoteWithTags = {
  id: string;
  title: string;
  content: unknown;
  status: NoteStatus;
  updated_at: string;
  note_tags: { tag: { id: string; name: string; slug: string } }[] | null;
};

type RawSubjectRef = { id: string; name: string; stage: Stage; paper: string | null };

type RawMicrothemeWithNote = {
  id: string;
  topic: string;
  subtopic: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  subject: RawSubjectRef | RawSubjectRef[] | null;
  notes: RawNoteWithTags | RawNoteWithTags[] | null;
};
