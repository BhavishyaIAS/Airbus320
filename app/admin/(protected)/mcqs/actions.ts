"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { PyqOption } from "@/lib/types/database";

export type FormState = { error: string | null; ok?: boolean };
export type SaveResult = { ok: boolean; error: string | null; id?: string };

function revalidate() {
  revalidatePath("/admin/mcqs");
  revalidatePath("/mcqs");
}

const dup = (e: { code?: string; message: string }) =>
  e.code === "23505" ? "That slug is already used here." : e.message;

/* ---- Subjects ------------------------------------------------------------- */

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  display_order: z.coerce.number().int().default(0),
});

export async function saveMcqSubject(_p: FormState, fd: FormData): Promise<FormState> {
  try { await requireAdmin(); } catch { return { error: "Not authorized." }; }
  const id = String(fd.get("id") ?? "");
  const parsed = subjectSchema.safeParse({
    name: fd.get("name"), slug: fd.get("slug") || "",
    description: fd.get("description") || null, display_order: fd.get("display_order") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };
  const { slug, ...rest } = parsed.data;
  const row = { ...rest, slug: slug ? slugify(slug) : slugify(rest.name) };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("mcq_subjects").update(row).eq("id", id)
    : await supabase.from("mcq_subjects").insert(row);
  if (error) return { error: dup(error) };
  revalidate();
  return { error: null, ok: true };
}

export async function deleteMcqSubject(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("mcq_subjects").delete().eq("id", id);
  revalidate();
}

/* ---- Books ---------------------------------------------------------------- */

const bookSchema = z.object({
  subject_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().optional().nullable(),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  display_order: z.coerce.number().int().default(0),
});

export async function saveMcqBook(_p: FormState, fd: FormData): Promise<FormState> {
  try { await requireAdmin(); } catch { return { error: "Not authorized." }; }
  const id = String(fd.get("id") ?? "");
  const parsed = bookSchema.safeParse({
    subject_id: fd.get("subject_id"), title: fd.get("title"), author: fd.get("author") || null,
    slug: fd.get("slug") || "", description: fd.get("description") || null, display_order: fd.get("display_order") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };
  const { slug, ...rest } = parsed.data;
  const row = { ...rest, slug: slug ? slugify(slug) : slugify(rest.title) };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("mcq_books").update(row).eq("id", id)
    : await supabase.from("mcq_books").insert(row);
  if (error) return { error: dup(error) };
  revalidate();
  return { error: null, ok: true };
}

export async function deleteMcqBook(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("mcq_books").delete().eq("id", id);
  revalidate();
}

/* ---- Chapters ------------------------------------------------------------- */

const chapterSchema = z.object({
  book_id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  chapter_no: z.coerce.number().int().optional().nullable(),
  display_order: z.coerce.number().int().default(0),
});

export async function saveMcqChapter(_p: FormState, fd: FormData): Promise<FormState> {
  try { await requireAdmin(); } catch { return { error: "Not authorized." }; }
  const id = String(fd.get("id") ?? "");
  const parsed = chapterSchema.safeParse({
    book_id: fd.get("book_id"), title: fd.get("title"), slug: fd.get("slug") || "",
    chapter_no: fd.get("chapter_no") || null, display_order: fd.get("display_order") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };
  const { slug, ...rest } = parsed.data;
  const row = { ...rest, slug: slug ? slugify(slug) : slugify(rest.title) };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("mcq_chapters").update(row).eq("id", id)
    : await supabase.from("mcq_chapters").insert(row);
  if (error) return { error: dup(error) };
  revalidate();
  return { error: null, ok: true };
}

export async function deleteMcqChapter(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("mcq_chapters").delete().eq("id", id);
  revalidate();
}

/* ---- MCQs ----------------------------------------------------------------- */

export type McqInput = {
  id?: string;
  chapter_id: string;
  question_text: string;
  options: PyqOption[];
  correct_answer: string;
  explanation?: string | null;
  difficulty?: string | null;
  display_order?: number;
};

const optionSchema = z.object({
  key: z.string().trim().min(1),
  text: z.string().trim().min(1),
});
const mcqSchema = z.object({
  chapter_id: z.string().uuid(),
  question_text: z.string().trim().min(1, "Question is required"),
  options: z.array(optionSchema).min(2, "Add at least two options"),
  correct_answer: z.string().trim().min(1, "Choose the correct option"),
  explanation: z.string().trim().optional().nullable(),
  difficulty: z.string().trim().optional().nullable(),
  display_order: z.coerce.number().int().default(0),
});

export async function saveMcq(input: McqInput): Promise<SaveResult> {
  try { await requireAdmin(); } catch { return { ok: false, error: "Not authorized." }; }
  const parsed = mcqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };
  if (!parsed.data.options.some((o) => o.key === parsed.data.correct_answer))
    return { ok: false, error: "Correct answer must match an option key." };

  const supabase = await createClient();
  const row = {
    chapter_id: parsed.data.chapter_id,
    question_text: parsed.data.question_text,
    options: parsed.data.options as never,
    correct_answer: parsed.data.correct_answer,
    explanation: parsed.data.explanation ?? null,
    difficulty: parsed.data.difficulty ?? null,
    display_order: parsed.data.display_order,
  };
  const { error } = input.id
    ? await supabase.from("mcqs").update(row).eq("id", input.id)
    : await supabase.from("mcqs").insert(row);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, error: null };
}

export async function deleteMcq(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("mcqs").delete().eq("id", id);
  revalidate();
}
