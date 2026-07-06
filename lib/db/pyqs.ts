import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { asArray } from "@/lib/utils";
import type { PyqOption, Stage } from "@/lib/types/database";

export type PyqFilters = {
  stage?: Stage;
  year?: number;
  microtheme?: string; // microtheme id
  tag?: string; // tag id
  topic?: string;
};

export type PyqView = {
  id: string;
  stage: Stage;
  year: number | null;
  question_text: string;
  options: PyqOption[] | null;
  correct_answer: string | null;
  marks: number | null;
  source: string | null;
  microthemes: { id: string; title: string; slug: string; topic: string }[];
  tags: { id: string; name: string; slug: string }[];
  modelAnswer: unknown | null;
};

export type PyqFilterOptions = {
  years: number[];
  microthemes: { id: string; title: string; topic: string }[];
  tags: { id: string; name: string }[];
  topics: string[];
};

/** Resolve the set of pyq ids matching tag/microtheme/topic filters (intersection). */
async function resolvePyqIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: PyqFilters,
): Promise<string[] | null> {
  const sets: string[][] = [];

  if (filters.tag) {
    const { data } = await supabase
      .from("pyq_tags")
      .select("pyq_id")
      .eq("tag_id", filters.tag);
    sets.push((data ?? []).map((r) => (r as { pyq_id: string }).pyq_id));
  }
  if (filters.microtheme) {
    const { data } = await supabase
      .from("pyq_microthemes")
      .select("pyq_id")
      .eq("microtheme_id", filters.microtheme);
    sets.push((data ?? []).map((r) => (r as { pyq_id: string }).pyq_id));
  }
  if (filters.topic) {
    const { data: mts } = await supabase
      .from("microthemes")
      .select("id")
      .eq("topic", filters.topic);
    const mtIds = (mts ?? []).map((r) => (r as { id: string }).id);
    if (mtIds.length === 0) {
      sets.push([]);
    } else {
      const { data } = await supabase
        .from("pyq_microthemes")
        .select("pyq_id")
        .in("microtheme_id", mtIds);
      sets.push((data ?? []).map((r) => (r as { pyq_id: string }).pyq_id));
    }
  }

  if (sets.length === 0) return null;
  return sets.reduce((acc, s) => acc.filter((id) => s.includes(id)));
}

export async function getPyqs(filters: PyqFilters): Promise<PyqView[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();

  const ids = await resolvePyqIds(supabase, filters);
  if (ids && ids.length === 0) return [];

  let query = supabase
    .from("pyqs")
    .select(
      `id, stage, year, question_text, options, correct_answer, marks, source,
       pyq_microthemes ( microtheme:microthemes ( id, title, slug, topic ) ),
       pyq_tags ( tag:tags ( id, name, slug ) ),
       model_answers ( content )`,
    )
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters.stage) query = query.eq("stage", filters.stage);
  if (filters.year) query = query.eq("year", filters.year);
  if (ids) query = query.in("id", ids);

  const { data, error } = await query;
  if (error || !data) return [];

  type Raw = {
    id: string;
    stage: Stage;
    year: number | null;
    question_text: string;
    options: PyqOption[] | null;
    correct_answer: string | null;
    marks: number | null;
    source: string | null;
    pyq_microthemes: { microtheme: { id: string; title: string; slug: string; topic: string } | null }[] | null;
    pyq_tags: { tag: { id: string; name: string; slug: string } | null }[] | null;
    model_answers: { content: unknown }[] | null;
  };

  return (data as unknown as Raw[]).map((p) => ({
    id: p.id,
    stage: p.stage,
    year: p.year,
    question_text: p.question_text,
    options: p.options,
    correct_answer: p.correct_answer,
    marks: p.marks,
    source: p.source,
    microthemes: asArray(p.pyq_microthemes)
      .map((x) => x.microtheme)
      .filter(Boolean) as PyqView["microthemes"],
    tags: asArray(p.pyq_tags).map((x) => x.tag).filter(Boolean) as PyqView["tags"],
    modelAnswer: asArray(p.model_answers)[0]?.content ?? null,
  }));
}

export async function getPyqFilterOptions(): Promise<PyqFilterOptions> {
  if (!isSupabaseConfigured)
    return { years: [], microthemes: [], tags: [], topics: [] };
  const supabase = await createClient();

  const [{ data: yearsRaw }, { data: mts }, { data: tags }] = await Promise.all([
    supabase.from("pyqs").select("year"),
    supabase.from("microthemes").select("id, title, topic").order("title"),
    supabase.from("tags").select("id, name").order("name"),
  ]);

  const years = Array.from(
    new Set(
      (yearsRaw ?? [])
        .map((r) => (r as { year: number | null }).year)
        .filter((y): y is number => typeof y === "number"),
    ),
  ).sort((a, b) => b - a);

  const microthemes = (mts ?? []) as PyqFilterOptions["microthemes"];
  const topics = Array.from(new Set(microthemes.map((m) => m.topic))).sort();

  return {
    years,
    microthemes,
    tags: (tags ?? []) as PyqFilterOptions["tags"],
    topics,
  };
}
