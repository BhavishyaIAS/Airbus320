import { createClient } from "@/lib/supabase/server";
import { asArray } from "@/lib/utils";
import type { NoteStatus, PyqOption, Stage } from "@/lib/types/database";

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
    subjectName: asArray(m.subject)[0]?.name ?? null,
    noteStatus: asArray(m.notes)[0]?.status ?? null,
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

/* ---- Tags & PYQs (admin) -------------------------------------------------- */

export type AdminTag = { id: string; name: string; slug: string };

export async function listTags(): Promise<AdminTag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");
  return (data as AdminTag[]) ?? [];
}

export type AdminPyq = {
  id: string;
  stage: Stage;
  year: number | null;
  question_text: string;
  options: PyqOption[] | null;
  correct_answer: string | null;
  marks: number | null;
  source: string | null;
  microthemeIds: string[];
  tagIds: string[];
  hasModelAnswer: boolean;
};

type RawAdminPyq = {
  id: string;
  stage: Stage;
  year: number | null;
  question_text: string;
  options: PyqOption[] | null;
  correct_answer: string | null;
  marks: number | null;
  source: string | null;
  pyq_microthemes: { microtheme_id: string }[] | null;
  pyq_tags: { tag_id: string }[] | null;
  model_answers: { id: string }[] | null;
};

const PYQ_ADMIN_SELECT = `id, stage, year, question_text, options, correct_answer, marks, source,
  pyq_microthemes ( microtheme_id ),
  pyq_tags ( tag_id ),
  model_answers ( id )`;

function mapAdminPyq(p: RawAdminPyq): AdminPyq {
  return {
    id: p.id,
    stage: p.stage,
    year: p.year,
    question_text: p.question_text,
    options: p.options,
    correct_answer: p.correct_answer,
    marks: p.marks,
    source: p.source,
    microthemeIds: asArray(p.pyq_microthemes).map((x) => x.microtheme_id),
    tagIds: asArray(p.pyq_tags).map((x) => x.tag_id),
    hasModelAnswer: asArray(p.model_answers).length > 0,
  };
}

export async function listPyqsAdmin(): Promise<AdminPyq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pyqs")
    .select(PYQ_ADMIN_SELECT)
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return ((data as unknown as RawAdminPyq[]) ?? []).map(mapAdminPyq);
}

export async function getPyqAdmin(id: string): Promise<AdminPyq | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pyqs")
    .select(PYQ_ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapAdminPyq(data as unknown as RawAdminPyq) : null;
}

export async function getModelAnswer(pyqId: string): Promise<unknown | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("model_answers")
    .select("content")
    .eq("pyq_id", pyqId)
    .maybeSingle();
  return (data as { content?: unknown } | null)?.content ?? null;
}
