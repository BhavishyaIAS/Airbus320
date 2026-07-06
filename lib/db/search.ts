import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Stage } from "@/lib/types/database";

export type NoteHit = {
  id: string;
  title: string;
  slug: string;
  microthemeTitle: string;
  topic: string;
};

export type PyqHit = {
  id: string;
  stage: Stage;
  year: number | null;
  question_text: string;
};

export type SearchResults = { notes: NoteHit[]; pyqs: PyqHit[]; query: string };

/**
 * Site-wide search across note titles/content and PYQs using the Postgres
 * full-text `search_tsv` columns (websearch query syntax — safe for raw input).
 * RLS ensures anonymous users only match published notes.
 */
export async function searchAll(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim();
  if (!isSupabaseConfigured || query.length === 0) {
    return { notes: [], pyqs: [], query };
  }
  const supabase = await createClient();

  const notesQ = supabase
    .from("notes")
    .select(
      `id, title, status,
       microtheme:microthemes ( title, slug, topic )`,
    )
    .eq("status", "published")
    .textSearch("search_tsv", query, { type: "websearch", config: "english" })
    .limit(20);

  const pyqsQ = supabase
    .from("pyqs")
    .select("id, stage, year, question_text")
    .textSearch("search_tsv", query, { type: "websearch", config: "english" })
    .limit(20);

  const [notesRes, pyqsRes] = await Promise.all([notesQ, pyqsQ]);

  type RawNote = {
    id: string;
    title: string;
    microtheme: { title: string; slug: string; topic: string } | null;
  };

  const notes: NoteHit[] = ((notesRes.data as unknown as RawNote[]) ?? [])
    .filter((n) => n.microtheme)
    .map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.microtheme!.slug,
      microthemeTitle: n.microtheme!.title,
      topic: n.microtheme!.topic,
    }));

  const pyqs = (pyqsRes.data as PyqHit[]) ?? [];

  return { notes, pyqs, query };
}
