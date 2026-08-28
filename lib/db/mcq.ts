import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { asArray } from "@/lib/utils";
import type { PyqOption } from "@/lib/types/database";

/* ---- Shapes returned to the UI -------------------------------------------- */

export type McqSubjectCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bookCount: number;
  questionCount: number;
};

export type McqBookCard = {
  id: string;
  title: string;
  author: string | null;
  slug: string;
  description: string | null;
  chapterCount: number;
  questionCount: number;
};

export type McqChapterCard = {
  id: string;
  title: string;
  slug: string;
  chapter_no: number | null;
  questionCount: number;
};

export type McqQuestion = {
  id: string;
  question_text: string;
  options: PyqOption[];
  correct_answer: string;
  explanation: string | null;
  difficulty: string | null;
};

/* ---- Queries -------------------------------------------------------------- */

/** All subjects with book + question counts. */
export async function getMcqSubjects(): Promise<McqSubjectCard[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcq_subjects")
    .select(
      `id, name, slug, description, display_order,
       mcq_books ( id, mcq_chapters ( id, mcqs ( id ) ) )`,
    )
    .order("display_order", { ascending: true });
  if (error || !data) return [];

  type Raw = {
    id: string; name: string; slug: string; description: string | null;
    mcq_books: { id: string; mcq_chapters: { id: string; mcqs: { id: string }[] | null }[] | null }[] | null;
  };

  return (data as unknown as Raw[]).map((s) => {
    const books = asArray(s.mcq_books);
    let questionCount = 0;
    for (const b of books)
      for (const c of asArray(b.mcq_chapters)) questionCount += asArray(c.mcqs).length;
    return {
      id: s.id, name: s.name, slug: s.slug, description: s.description,
      bookCount: books.length,
      questionCount,
    };
  });
}

/** One subject + its books (with counts), by slug. */
export async function getMcqSubject(
  slug: string,
): Promise<{ subject: { id: string; name: string; slug: string; description: string | null }; books: McqBookCard[] } | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcq_subjects")
    .select(
      `id, name, slug, description,
       mcq_books ( id, title, author, slug, description, display_order,
                   mcq_chapters ( id, mcqs ( id ) ) )`,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;

  type RawBook = {
    id: string; title: string; author: string | null; slug: string;
    description: string | null; display_order: number;
    mcq_chapters: { id: string; mcqs: { id: string }[] | null }[] | null;
  };
  const row = data as unknown as {
    id: string; name: string; slug: string; description: string | null;
    mcq_books: RawBook[] | null;
  };

  const books = asArray(row.mcq_books)
    .sort((a, b) => a.display_order - b.display_order)
    .map((b) => {
      const chapters = asArray(b.mcq_chapters);
      const questionCount = chapters.reduce((n, c) => n + asArray(c.mcqs).length, 0);
      return {
        id: b.id, title: b.title, author: b.author, slug: b.slug,
        description: b.description, chapterCount: chapters.length, questionCount,
      };
    });

  return {
    subject: { id: row.id, name: row.name, slug: row.slug, description: row.description },
    books,
  };
}

/** One book + its chapters (with question counts), resolved via subject+book slug. */
export async function getMcqBook(
  subjectSlug: string,
  bookSlug: string,
): Promise<{
  subject: { name: string; slug: string };
  book: { id: string; title: string; author: string | null; slug: string; description: string | null };
  chapters: McqChapterCard[];
} | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();

  const { data: subj } = await supabase
    .from("mcq_subjects")
    .select("id, name, slug")
    .eq("slug", subjectSlug)
    .maybeSingle();
  if (!subj) return null;
  const subject = subj as { id: string; name: string; slug: string };

  const { data, error } = await supabase
    .from("mcq_books")
    .select(
      `id, title, author, slug, description,
       mcq_chapters ( id, title, slug, chapter_no, display_order, mcqs ( id ) )`,
    )
    .eq("subject_id", subject.id)
    .eq("slug", bookSlug)
    .maybeSingle();
  if (error || !data) return null;

  type RawChapter = {
    id: string; title: string; slug: string; chapter_no: number | null;
    display_order: number; mcqs: { id: string }[] | null;
  };
  const row = data as unknown as {
    id: string; title: string; author: string | null; slug: string; description: string | null;
    mcq_chapters: RawChapter[] | null;
  };

  const chapters = asArray(row.mcq_chapters)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({
      id: c.id, title: c.title, slug: c.slug, chapter_no: c.chapter_no,
      questionCount: asArray(c.mcqs).length,
    }));

  return {
    subject: { name: subject.name, slug: subject.slug },
    book: { id: row.id, title: row.title, author: row.author, slug: row.slug, description: row.description },
    chapters,
  };
}

/** One chapter + its MCQs (for solving), resolved via the full slug chain. */
export async function getMcqChapter(
  subjectSlug: string,
  bookSlug: string,
  chapterSlug: string,
): Promise<{
  subject: { name: string; slug: string };
  book: { title: string; slug: string };
  chapter: { id: string; title: string; slug: string };
  questions: McqQuestion[];
} | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();

  const { data: subj } = await supabase
    .from("mcq_subjects").select("id, name, slug").eq("slug", subjectSlug).maybeSingle();
  if (!subj) return null;
  const subject = subj as { id: string; name: string; slug: string };

  const { data: bk } = await supabase
    .from("mcq_books").select("id, title, slug")
    .eq("subject_id", subject.id).eq("slug", bookSlug).maybeSingle();
  if (!bk) return null;
  const book = bk as { id: string; title: string; slug: string };

  const { data: ch } = await supabase
    .from("mcq_chapters").select("id, title, slug")
    .eq("book_id", book.id).eq("slug", chapterSlug).maybeSingle();
  if (!ch) return null;
  const chapter = ch as { id: string; title: string; slug: string };

  const { data: qs } = await supabase
    .from("mcqs")
    .select("id, question_text, options, correct_answer, explanation, difficulty")
    .eq("chapter_id", chapter.id)
    .order("display_order", { ascending: true });

  return {
    subject: { name: subject.name, slug: subject.slug },
    book: { title: book.title, slug: book.slug },
    chapter: { id: chapter.id, title: chapter.title, slug: chapter.slug },
    questions: (qs as McqQuestion[]) ?? [],
  };
}
