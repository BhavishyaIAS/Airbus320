import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Privileged, server-only Supabase client using the service-role key.
 * BYPASSES Row Level Security — never import this into client code, and only
 * use it for trusted server operations (e.g. bootstrap tasks). Most admin
 * writes should go through the RLS-respecting `server.ts` client instead.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin client.",
    );
  }
  return createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
