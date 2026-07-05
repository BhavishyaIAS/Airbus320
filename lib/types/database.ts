/**
 * Placeholder database types.
 *
 * Phase 2 replaces this file with types generated from the real schema via:
 *   npx supabase gen types typescript --project-id <ref> > lib/types/database.ts
 *
 * Until then this loose shape keeps the Supabase generic clients compiling.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, Json>;
        Insert: Record<string, Json>;
        Update: Record<string, Json>;
        Relationships: [];
      };
    };
    Views: { [key: string]: { Row: Record<string, Json> } };
    Functions: { [key: string]: unknown };
    Enums: { [key: string]: string };
    CompositeTypes: { [key: string]: unknown };
  };
};
