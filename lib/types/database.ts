/**
 * Hand-authored database types matching supabase/migrations.
 *
 * These mirror the SQL schema so the app is fully typed before the project
 * exists. Once the hosted DB is live you can regenerate the exact types with:
 *   npx supabase gen types typescript --project-id <ref> > lib/types/database.ts
 * (keep the shape compatible with the Row/Insert/Update usage in lib/db).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Stage = "prelims" | "mains";
export type NoteStatus = "draft" | "published";

/** A single MCQ option stored in pyqs.options (prelims). */
export type PyqOption = { key: string; text: string };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: "admin" | null; created_at: string };
        Insert: { id: string; role?: "admin" | null; created_at?: string };
        Update: { id?: string; role?: "admin" | null; created_at?: string };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          stage: Stage;
          paper: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          stage: Stage;
          paper?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
        Relationships: [];
      };
      microthemes: {
        Row: {
          id: string;
          subject_id: string;
          topic: string;
          subtopic: string | null;
          title: string;
          slug: string;
          display_order: number;
          short_description: string | null;
          external_id: string | null;
          geographic_scope: string | null;
          cognitive_level: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          topic: string;
          subtopic?: string | null;
          title: string;
          slug: string;
          display_order?: number;
          short_description?: string | null;
          external_id?: string | null;
          geographic_scope?: string | null;
          cognitive_level?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["microthemes"]["Insert"]>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          microtheme_id: string;
          title: string;
          content: Json;
          search_text: string;
          status: NoteStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          microtheme_id: string;
          title: string;
          content?: Json;
          search_text?: string;
          status?: NoteStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; name: string; slug: string };
        Insert: { id?: string; name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
        Relationships: [];
      };
      note_tags: {
        Row: { note_id: string; tag_id: string };
        Insert: { note_id: string; tag_id: string };
        Update: Partial<Database["public"]["Tables"]["note_tags"]["Insert"]>;
        Relationships: [];
      };
      pyqs: {
        Row: {
          id: string;
          stage: Stage;
          year: number | null;
          question_text: string;
          options: PyqOption[] | null;
          correct_answer: string | null;
          marks: number | null;
          source: string | null;
          search_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stage: Stage;
          year?: number | null;
          question_text: string;
          options?: PyqOption[] | null;
          correct_answer?: string | null;
          marks?: number | null;
          source?: string | null;
          search_text?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pyqs"]["Insert"]>;
        Relationships: [];
      };
      pyq_microthemes: {
        Row: { pyq_id: string; microtheme_id: string };
        Insert: { pyq_id: string; microtheme_id: string };
        Update: Partial<Database["public"]["Tables"]["pyq_microthemes"]["Insert"]>;
        Relationships: [];
      };
      pyq_tags: {
        Row: { pyq_id: string; tag_id: string };
        Insert: { pyq_id: string; tag_id: string };
        Update: Partial<Database["public"]["Tables"]["pyq_tags"]["Insert"]>;
        Relationships: [];
      };
      model_answers: {
        Row: {
          id: string;
          pyq_id: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pyq_id: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["model_answers"]["Insert"]>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          url: string;
          path: string | null;
          type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          path?: string | null;
          type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
        Relationships: [];
      };
      mcq_subjects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mcq_subjects"]["Insert"]>;
        Relationships: [];
      };
      mcq_books: {
        Row: {
          id: string;
          subject_id: string;
          title: string;
          author: string | null;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          title: string;
          author?: string | null;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mcq_books"]["Insert"]>;
        Relationships: [];
      };
      mcq_chapters: {
        Row: {
          id: string;
          book_id: string;
          title: string;
          slug: string;
          chapter_no: number | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          title: string;
          slug: string;
          chapter_no?: number | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mcq_chapters"]["Insert"]>;
        Relationships: [];
      };
      mcqs: {
        Row: {
          id: string;
          chapter_id: string;
          question_text: string;
          options: PyqOption[];
          correct_answer: string;
          explanation: string | null;
          difficulty: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          question_text: string;
          options: PyqOption[];
          correct_answer: string;
          explanation?: string | null;
          difficulty?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mcqs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      stage: Stage;
      note_status: NoteStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row aliases used across the app.
export type SubjectRow = Database["public"]["Tables"]["subjects"]["Row"];
export type MicrothemeRow = Database["public"]["Tables"]["microthemes"]["Row"];
export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type PyqRow = Database["public"]["Tables"]["pyqs"]["Row"];
export type ModelAnswerRow = Database["public"]["Tables"]["model_answers"]["Row"];
export type MediaRow = Database["public"]["Tables"]["media"]["Row"];
