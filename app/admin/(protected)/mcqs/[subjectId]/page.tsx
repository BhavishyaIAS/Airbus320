import Link from "next/link";
import { notFound } from "next/navigation";
import { getMcqSubjectAdmin } from "@/lib/db/mcq-admin";
import { deleteMcqBook } from "../actions";
import { McqSubjectForm } from "@/components/admin/McqSubjectForm";
import { McqBookForm } from "@/components/admin/McqBookForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage subject" };

export default async function AdminMcqSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const data = await getMcqSubjectAdmin(subjectId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <Link href="/admin/mcqs" className="text-sm text-accent hover:text-accent-ink">← MCQ Vault</Link>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h1 className="mb-4 font-serif text-xl text-ink">Subject: {data.subject.name}</h1>
        <McqSubjectForm subject={data.subject} />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-medium text-ink">Add a book</h2>
        <McqBookForm subjectId={data.subject.id} />
      </section>

      <section>
        <h2 className="mb-3 font-medium text-ink">Books ({data.books.length})</h2>
        {data.books.length === 0 ? (
          <EmptyState title="No books yet">Add a standard book above.</EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {data.books.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">{b.title}</div>
                  <div className="text-xs text-muted">
                    {b.author ? `${b.author} · ` : ""}{b.chapterCount} chapter{b.chapterCount === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link href={`/admin/mcqs/${data.subject.id}/${b.id}`} className="font-medium text-accent hover:text-accent-ink">
                    Manage chapters
                  </Link>
                  <form action={deleteMcqBook}>
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmButton message={`Delete "${b.title}"? This deletes its chapters and MCQs.`}>Delete</ConfirmButton>
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
