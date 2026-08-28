import { createClient } from "@/lib/supabase/server";
import { asArray } from "@/lib/utils";
import type { PyqOption } from "@/lib/types/database";

/* Admin-side reads for the MCQ vault (RLS lets the admin read everything). */

export type AdminMcqSubject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  bookCount: number;
};

export async function listMcqSubjectsAdmin(): Promise<AdminMcqSubject[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mcq_subjects")
    .select("id, name, slug, description, display_order, mcq_books ( id )")
    .order("display_order", { ascending: true });
  type Raw = Omit<AdminMcqSubject, "bookCount"> & { mcq_books: { id: string }[] | null };
  return ((data as unknown as Raw[]) ?? []).map((s) => ({
    id: s.id, name: s.name, slug: s.slug, description: s.description,
    display_order: s.display_order, bookCount: asArray(s.mcq_books).length,
  }));
}

export type AdminMcqBook = {
  id: string;
  subject_id: string;
  title: string;
  author: string | null;
  slug: string;
  description: string | null;
  display_order: number;
  chapterCount: number;
};

export async function getMcqSubjectAdmin(id: string): Promise<
  | { subject: { id: string; name: string; slug: string; description: string | null; display_order: number }; books: AdminMcqBook[] }
  | null
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mcq_subjects")
    .select(
      `id, name, slug, description, display_order,
       mcq_books ( id, subject_id, title, author, slug, description, display_order, mcq_chapters ( id ) )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  type RawBook = Omit<AdminMcqBook, "chapterCount"> & { mcq_chapters: { id: string }[] | null };
  const row = data as unknown as {
    id: string; name: string; slug: string; description: string | null; display_order: number;
    mcq_books: RawBook[] | null;
  };
  const books = asArray(row.mcq_books)
    .sort((a, b) => a.display_order - b.display_order)
    .map((b) => ({
      id: b.id, subject_id: b.subject_id, title: b.title, author: b.author, slug: b.slug,
      description: b.description, display_order: b.display_order, chapterCount: asArray(b.mcq_chapters).length,
    }));
  return {
    subject: { id: row.id, name: row.name, slug: row.slug, description: row.description, display_order: row.display_order },
    books,
  };
}

export type AdminMcqChapter = {
  id: string;
  book_id: string;
  title: string;
  slug: string;
  chapter_no: number | null;
  display_order: number;
  questionCount: number;
};

export async function getMcqBookAdmin(id: string): Promise<
  | {
      subject: { id: string; name: string };
      book: { id: string; subject_id: string; title: string; author: string | null; slug: string; description: string | null; display_order: number };
      chapters: AdminMcqChapter[];
    }
  | null
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mcq_books")
    .select(
      `id, subject_id, title, author, slug, description, display_order,
       subject:mcq_subjects ( id, name ),
       mcq_chapters ( id, book_id, title, slug, chapter_no, display_order, mcqs ( id ) )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  type RawChapter = Omit<AdminMcqChapter, "questionCount"> & { mcqs: { id: string }[] | null };
  const row = data as unknown as {
    id: string; subject_id: string; title: string; author: string | null; slug: string; description: string | null; display_order: number;
    subject: { id: string; name: string } | { id: string; name: string }[] | null;
    mcq_chapters: RawChapter[] | null;
  };
  const subject = asArray(row.subject)[0] ?? { id: row.subject_id, name: "" };
  const chapters = asArray(row.mcq_chapters)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({
      id: c.id, book_id: c.book_id, title: c.title, slug: c.slug, chapter_no: c.chapter_no,
      display_order: c.display_order, questionCount: asArray(c.mcqs).length,
    }));
  return {
    subject: { id: subject.id, name: subject.name },
    book: { id: row.id, subject_id: row.subject_id, title: row.title, author: row.author, slug: row.slug, description: row.description, display_order: row.display_order },
    chapters,
  };
}

export type AdminMcq = {
  id: string;
  chapter_id: string;
  question_text: string;
  options: PyqOption[];
  correct_answer: string;
  explanation: string | null;
  difficulty: string | null;
  display_order: number;
};

export async function getMcqChapterAdmin(id: string): Promise<
  | {
      subject: { id: string; name: string };
      book: { id: string; title: string };
      chapter: { id: string; book_id: string; title: string; slug: string; chapter_no: number | null; display_order: number };
      questions: AdminMcq[];
    }
  | null
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mcq_chapters")
    .select(
      `id, book_id, title, slug, chapter_no, display_order,
       book:mcq_books ( id, title, subject:mcq_subjects ( id, name ) )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  type RawSubj = { id: string; name: string };
  type RawBook = { id: string; title: string; subject: RawSubj | RawSubj[] | null };
  const row = data as unknown as {
    id: string; book_id: string; title: string; slug: string; chapter_no: number | null; display_order: number;
    book: RawBook | RawBook[] | null;
  };
  const book = asArray(row.book)[0] ?? { id: row.book_id, title: "", subject: null as RawSubj | RawSubj[] | null };
  const subject = asArray(book.subject)[0] ?? { id: "", name: "" };

  const { data: qs } = await supabase
    .from("mcqs")
    .select("id, chapter_id, question_text, options, correct_answer, explanation, difficulty, display_order")
    .eq("chapter_id", id)
    .order("display_order", { ascending: true });

  return {
    subject: { id: subject.id, name: subject.name },
    book: { id: book.id, title: book.title },
    chapter: { id: row.id, book_id: row.book_id, title: row.title, slug: row.slug, chapter_no: row.chapter_no, display_order: row.display_order },
    questions: (qs as AdminMcq[]) ?? [],
  };
}
