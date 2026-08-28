import Link from "next/link";
import { notFound } from "next/navigation";
import { getMcqBookAdmin } from "@/lib/db/mcq-admin";
import { deleteMcqChapter } from "../../actions";
import { McqBookForm } from "@/components/admin/McqBookForm";
import { McqChapterForm } from "@/components/admin/McqChapterForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage book" };

export default async function AdminMcqBookPage({
  params,
}: {
  params: Promise<{ subjectId: string; bookId: string }>;
}) {
  const { subjectId, bookId } = await params;
  const data = await getMcqBookAdmin(bookId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <Link href={`/admin/mcqs/${subjectId}`} className="text-sm text-accent hover:text-accent-ink">
        ← {data.subject.name}
      </Link>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h1 className="mb-4 font-serif text-xl text-ink">Book: {data.book.title}</h1>
        <McqBookForm subjectId={subjectId} book={data.book} />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-medium text-ink">Add a chapter</h2>
        <McqChapterForm bookId={data.book.id} />
      </section>

      <section>
        <h2 className="mb-3 font-medium text-ink">Chapters ({data.chapters.length})</h2>
        {data.chapters.length === 0 ? (
          <EmptyState title="No chapters yet">Add a chapter above.</EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {data.chapters.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">
                    {c.chapter_no ? <span className="text-muted">Ch {c.chapter_no} · </span> : null}
                    {c.title}
                  </div>
                  <div className="text-xs text-muted">{c.questionCount} question{c.questionCount === 1 ? "" : "s"}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link href={`/admin/mcqs/${subjectId}/${data.book.id}/${c.id}`} className="font-medium text-accent hover:text-accent-ink">
                    Manage MCQs
                  </Link>
                  <form action={deleteMcqChapter}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`Delete "${c.title}"? This deletes its MCQs.`}>Delete</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
