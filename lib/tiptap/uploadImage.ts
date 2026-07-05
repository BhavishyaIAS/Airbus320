import { createClient } from "@/lib/supabase/client";

/**
 * Upload an image to the public `media` bucket (admin only, enforced by Storage
 * RLS) and record it in the media table. Returns the public URL for the editor.
 */
export async function uploadImage(file: File): Promise<string> {
  const supabase = createClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `notes/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  const url = data.publicUrl;

  // Best-effort record in the media table (don't block the upload on this).
  await supabase.from("media").insert({ url, path, type: file.type });

  return url;
}
