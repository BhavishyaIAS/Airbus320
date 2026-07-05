import { createClient } from "@/lib/supabase/server";

export type AdminCheck = {
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
};

/**
 * Resolve the current user and whether they are the admin.
 * Used by the admin layout (to gate the UI) and by every mutating action
 * (defence in depth — RLS is still the real boundary).
 */
export async function getAdmin(): Promise<AdminCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, email: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    isAdmin: (profile as { role?: string | null } | null)?.role === "admin",
  };
}

/** Throws (via the caller) unless the current user is the admin. */
export async function requireAdmin(): Promise<AdminCheck> {
  const check = await getAdmin();
  if (!check.isAdmin) {
    throw new Error("Not authorized");
  }
  return check;
}
