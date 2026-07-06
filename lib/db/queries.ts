import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { asArray } from "@/lib/utils";
import type { NoteStatus, Stage } from "@/lib/types/database";

/* ---- Assembled shapes returned to the UI ---------------------------------- */

export type SyllabusMicrotheme = {
  id: string;
  topic: string;
  subtopic: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  hasPublishedNote: boolean;
};

export type SyllabusTopic = {
  topic: string;
  microthemes: SyllabusMicrotheme[];
};

export type SyllabusSubject = {
  id: string;
  name: string;
  stage: Stage;
  paper: string | null;
  topics: SyllabusTopic[];
};

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
export async function getSyllabus(): Promise<SyllabusSubject[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select(
      `id, name, stage, paper, display_order,
       microthemes ( id, topic, subtopic, title, slug, display_order, short_description,
                     notes ( id, status ) )`,
    )
    .order("display_order", { ascending: true })
    .order("display_order", { referencedTable: "microthemes", ascending: true });

  if (error || !data) return [];

  // Group each subject's micro-themes by topic, preserving order.
  return (data as unknown as RawSubject[]).map((s) => {
    const topicMap = new Map<string, SyllabusMicrotheme[]>();
    for (const mt of asArray(s.microthemes)) {
      const list = topicMap.get(mt.topic) ?? [];
      list.push({
        id: mt.id,
        topic: mt.topic,
        subtopic: mt.subtopic,
        title: mt.title,
        slug: mt.slug,
        short_description: mt.short_description,
        hasPublishedNote: asArray(mt.notes).some((n) => n.status === "published"),
      });
      topicMap.set(mt.topic, list);
    }
    return {
      id: s.id,
      name: s.name,
      stage: s.stage,
      paper: s.paper,
      topics: Array.from(topicMap, ([topic, microthemes]) => ({ topic, microthemes })),
    };
  });
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
    short_description: string | null;
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
