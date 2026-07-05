"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { extractPlainText } from "@/lib/tiptap/plaintext";

export type SaveResult = { ok: boolean; error: string | null };

const inputSchema = z.object({
  microthemeId: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required"),
  status: z.enum(["draft", "published"]),
  content: z.unknown(),
});

export async function saveNote(input: {
  microthemeId: string;
  title: string;
  status: "draft" | "published";
  content: unknown;
}): Promise<SaveResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized." };
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]!.message };
  }
  const { microthemeId, title, status, content } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("notes").upsert(
    {
      microtheme_id: microthemeId,
      title,
      status,
      content: content as never,
      search_text: extractPlainText(content),
    },
    { onConflict: "microtheme_id" },
  );
  if (error) return { ok: false, error: error.message };

  // Refresh affected pages.
  const { data: mt } = await supabase
    .from("microthemes")
    .select("slug")
    .eq("id", microthemeId)
    .maybeSingle();
  const slug = (mt as { slug?: string } | null)?.slug;
  revalidatePath("/admin/microthemes");
  revalidatePath("/syllabus");
  if (slug) revalidatePath(`/notes/${slug}`);

  return { ok: true, error: null };
}

export async function deleteNote(microthemeId: string): Promise<SaveResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("microtheme_id", microthemeId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/microthemes");
  revalidatePath("/syllabus");
  return { ok: true, error: null };
}
