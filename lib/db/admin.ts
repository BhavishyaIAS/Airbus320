import { createClient } from "@/lib/supabase/server";
import type { NoteStatus, Stage } from "@/lib/types/database";

/* Admin-side reads. The admin session's RLS lets these see drafts too. */

export type AdminSubject = {
  id: string;
  name: string;
  stage: Stage;
  paper: string | null;
  display_order: number;
};

export async function listSubjects(): Promise<AdminSubject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, name, stage, paper, display_order")
    .order("display_order", { ascending: true });
  return (data as AdminSubject[]) ?? [];
}

export type AdminMicrotheme = {
  id: string;
  subject_id: string;
  topic: string;
  subtopic: string | null;
  title: string;
  slug: string;
  display_order: number;
  short_description: string | null;
  subjectName: string | null;
  noteStatus: NoteStatus | null;
};

export async function listMicrothemes(): Promise<AdminMicrotheme[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("microthemes")
    .select(
      `id, subject_id, topic, subtopic, title, slug, display_order, short_description,
       subject:subjects ( name ),
       notes ( status )`,
    )
    .order("display_order", { ascending: true });

  type Raw = Omit<AdminMicrotheme, "subjectName" | "noteStatus"> & {
    subject: { name: string } | null;
    notes: { status: NoteStatus }[] | null;
  };

  return ((data as unknown as Raw[]) ?? []).map((m) => ({
    id: m.id,
    subject_id: m.subject_id,
    topic: m.topic,
    subtopic: m.subtopic,
    title: m.title,
    slug: m.slug,
    display_order: m.display_order,
    short_description: m.short_description,
    subjectName: m.subject?.name ?? null,
    noteStatus: m.notes?.[0]?.status ?? null,
  }));
}

export async function getMicrotheme(id: string): Promise<AdminMicrotheme | null> {
  const all = await listMicrothemes();
  return all.find((m) => m.id === id) ?? null;
}

export type AdminNote = {
  id: string;
  microtheme_id: string;
  title: string;
  content: unknown;
  status: NoteStatus;
  updated_at: string;
};

export async function getNoteForMicrotheme(
  microthemeId: string,
): Promise<AdminNote | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("id, microtheme_id, title, content, status, updated_at")
    .eq("microtheme_id", microthemeId)
    .maybeSingle();
  return (data as AdminNote) ?? null;
}

export type AdminStats = {
  subjects: number;
  microthemes: number;
  publishedNotes: number;
  draftNotes: number;
  pyqs: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const count = (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return q;
  };

  const [subjects, microthemes, published, draft, pyqs] = await Promise.all([
    count("subjects"),
    count("microthemes"),
    count("notes", ["status", "published"]),
    count("notes", ["status", "draft"]),
    count("pyqs"),
  ]);

  return {
    subjects: subjects.count ?? 0,
    microthemes: microthemes.count ?? 0,
    publishedNotes: published.count ?? 0,
    draftNotes: draft.count ?? 0,
    pyqs: pyqs.count ?? 0,
  };
}
