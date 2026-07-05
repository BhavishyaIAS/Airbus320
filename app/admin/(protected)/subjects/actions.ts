"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type FormState = { error: string | null; ok?: boolean };

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  stage: z.enum(["prelims", "mains"]),
  paper: z.string().trim().optional().nullable(),
  display_order: z.coerce.number().int().default(0),
});

function revalidate() {
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/microthemes");
  revalidatePath("/syllabus");
}

export async function createSubject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    stage: formData.get("stage"),
    paper: formData.get("paper") || null,
    display_order: formData.get("display_order") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert(parsed.data);
  if (error) return { error: error.message };

  revalidate();
  return { error: null, ok: true };
}

export async function updateSubject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }
  const id = String(formData.get("id") ?? "");
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    stage: formData.get("stage"),
    paper: formData.get("paper") || null,
    display_order: formData.get("display_order") || 0,
  });
  if (!id || !parsed.success) {
    return { error: parsed.success ? "Missing id." : parsed.error.issues[0]!.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subjects")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidate();
  return { error: null, ok: true };
}

export async function deleteSubject(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("subjects").delete().eq("id", id);
  revalidate();
}
