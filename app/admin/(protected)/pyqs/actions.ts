"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { PyqOption } from "@/lib/types/database";

export type PyqResult = { ok: boolean; error: string | null; pyqId?: string };

export type PyqInput = {
  id?: string;
  stage: "prelims" | "mains";
  year?: number | null;
  source?: string | null;
  question_text: string;
  options?: PyqOption[] | null;
  correct_answer?: string | null;
  marks?: number | null;
  microthemeIds: string[];
  tagIds: string[];
  newTags: string[];
};

const optionSchema = z.object({
  key: z.string().trim().min(1),
  text: z.string().trim().min(1),
});

const baseSchema = z.object({
  stage: z.enum(["prelims", "mains"]),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  source: z.string().trim().optional().nullable(),
  question_text: z.string().trim().min(1, "Question text is required"),
  microthemeIds: z.array(z.string().uuid()).default([]),
  tagIds: z.array(z.string().uuid()).default([]),
  newTags: z.array(z.string().trim().min(1)).default([]),
});

function searchTextFor(input: PyqInput): string {
  const optText = (input.options ?? []).map((o) => o.text).join(" ");
  return [input.question_text, optText, input.source ?? ""]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function syncTagsAndJunctions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pyqId: string,
  input: PyqInput,
): Promise<string | null> {
  // Create any brand-new tags, collect their ids.
  const createdIds: string[] = [];
  const newTagRows = input.newTags
    .map((name) => ({ name: name.trim(), slug: slugify(name) }))
    .filter((t) => t.slug.length > 0);
  if (newTagRows.length > 0) {
    const { data, error } = await supabase
      .from("tags")
      .upsert(newTagRows, { onConflict: "slug" })
      .select("id");
    if (error) return error.message;
    for (const r of (data ?? []) as { id: string }[]) createdIds.push(r.id);
  }
  const allTagIds = Array.from(new Set([...input.tagIds, ...createdIds]));

  // Reset junctions then insert current selection.
  await supabase.from("pyq_microthemes").delete().eq("pyq_id", pyqId);
  await supabase.from("pyq_tags").delete().eq("pyq_id", pyqId);

  if (input.microthemeIds.length > 0) {
    const { error } = await supabase.from("pyq_microthemes").insert(
      input.microthemeIds.map((mid) => ({ pyq_id: pyqId, microtheme_id: mid })),
    );
    if (error) return error.message;
  }
  if (allTagIds.length > 0) {
    const { error } = await supabase
      .from("pyq_tags")
      .insert(allTagIds.map((tid) => ({ pyq_id: pyqId, tag_id: tid })));
    if (error) return error.message;
  }
  return null;
}

function validate(input: PyqInput): { error: string | null } {
  const base = baseSchema.safeParse(input);
  if (!base.success) return { error: base.error.issues[0]!.message };

  if (input.stage === "prelims") {
    const opts = z.array(optionSchema).min(2, "Add at least two options").safeParse(input.options ?? []);
    if (!opts.success) return { error: opts.error.issues[0]!.message };
    if (!input.correct_answer?.trim())
      return { error: "Choose the correct option." };
    if (!(input.options ?? []).some((o) => o.key === input.correct_answer))
      return { error: "Correct answer must match an option." };
  } else {
    if (input.marks == null || Number.isNaN(input.marks))
      return { error: "Marks are required for mains questions." };
  }
  return { error: null };
}

function revalidate() {
  revalidatePath("/pyqs");
  revalidatePath("/admin/pyqs");
}

export async function savePyq(input: PyqInput): Promise<PyqResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized." };
  }

  const v = validate(input);
  if (v.error) return { ok: false, error: v.error };

  const supabase = await createClient();
  const isPrelims = input.stage === "prelims";
  const row = {
    stage: input.stage,
    year: input.year ?? null,
    source: input.source?.trim() || null,
    question_text: input.question_text.trim(),
    options: isPrelims ? (input.options ?? []) : null,
    correct_answer: isPrelims ? input.correct_answer ?? null : null,
    marks: isPrelims ? null : input.marks ?? null,
    search_text: searchTextFor(input),
  };

  let pyqId = input.id;
  if (pyqId) {
    const { error } = await supabase.from("pyqs").update(row as never).eq("id", pyqId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("pyqs")
      .insert(row as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    pyqId = (data as { id: string }).id;
  }

  const junctionError = await syncTagsAndJunctions(supabase, pyqId!, input);
  if (junctionError) return { ok: false, error: junctionError };

  revalidate();
  return { ok: true, error: null, pyqId };
}

export async function deletePyq(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("pyqs").delete().eq("id", id);
  revalidate();
}

export async function saveModelAnswer(
  pyqId: string,
  content: unknown,
): Promise<PyqResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("model_answers")
    .upsert(
      { pyq_id: pyqId, content: content as never },
      { onConflict: "pyq_id" },
    );
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, error: null };
}

export async function deleteModelAnswer(pyqId: string): Promise<PyqResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("model_answers").delete().eq("pyq_id", pyqId);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, error: null };
}
