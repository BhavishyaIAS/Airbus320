"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type FormState = { error: string | null; ok?: boolean };

const schema = z.object({
  subject_id: z.string().uuid("Choose a subject"),
  topic: z.string().trim().min(1, "Topic is required"),
  subtopic: z.string().trim().optional().nullable(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  display_order: z.coerce.number().int().default(0),
  short_description: z.string().trim().optional().nullable(),
});

function revalidate() {
  revalidatePath("/admin/microthemes");
  revalidatePath("/syllabus");
}

function parse(formData: FormData) {
  return schema.safeParse({
    subject_id: formData.get("subject_id"),
    topic: formData.get("topic"),
    subtopic: formData.get("subtopic") || null,
    title: formData.get("title"),
    slug: formData.get("slug") || "",
    display_order: formData.get("display_order") || 0,
    short_description: formData.get("short_description") || null,
  });
}

export async function createMicrotheme(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const { slug, ...rest } = parsed.data;
  const finalSlug = slug ? slugify(slug) : slugify(rest.title);

  const supabase = await createClient();
  const { error } = await supabase
    .from("microthemes")
    .insert({ ...rest, slug: finalSlug });
  if (error) {
    return {
      error: error.code === "23505" ? "That slug is already in use." : error.message,
    };
  }
  revalidate();
  return { error: null, ok: true };
}

export async function updateMicrotheme(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }
  const id = String(formData.get("id") ?? "");
  const parsed = parse(formData);
  if (!id) return { error: "Missing id." };
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  const { slug, ...rest } = parsed.data;
  const finalSlug = slug ? slugify(slug) : slugify(rest.title);

  const supabase = await createClient();
  const { error } = await supabase
    .from("microthemes")
    .update({ ...rest, slug: finalSlug })
    .eq("id", id);
  if (error) {
    return {
      error: error.code === "23505" ? "That slug is already in use." : error.message,
    };
  }
  revalidate();
  return { error: null, ok: true };
}

export async function deleteMicrotheme(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("microthemes").delete().eq("id", id);
  revalidate();
}
