import Link from "next/link";
import { notFound } from "next/navigation";
import { getMcqChapterAdmin } from "@/lib/db/mcq-admin";
import { deleteMcq } from "../../../actions";
import { McqChapterForm } from "@/components/admin/McqChapterForm";
import { McqQuestionForm } from "@/components/admin/McqQuestionForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage chapter" };

export default async function AdminMcqChapterPage({
  params,
}: {
  params: Promise<{ subjectId: string; bookId: string; chapterId: string }>;
}) {
  const { subjectId, bookId, chapterId } = await params;
  const data = await getMcqChapterAdmin(chapterId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <Link href={`/admin/mcqs/${subjectId}/${bookId}`} className="text-sm text-accent hover:text-accent-ink">
        ← {data.book.title}
      </Link>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h1 className="mb-4 font-serif text-xl text-ink">Chapter: {data.chapter.title}</h1>
        <McqChapterForm bookId={bookId} chapter={data.chapter} />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-medium text-ink">Add a question</h2>
        <McqQuestionForm chapterId={data.chapter.id} />
      </section>

      <section>
        <h2 className="mb-3 font-medium text-ink">Questions ({data.questions.length})</h2>
        {data.questions.length === 0 ? (
          <EmptyState title="No questions yet">Add the first MCQ above.</EmptyState>
        ) : (
          <div className="space-y-3">
            {data.questions.map((q, i) => (
              <details key={q.id} className="rounded-xl border border-line bg-surface">
                <summary className="flex cursor-pointer items-start justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="mr-2 text-xs text-muted">{i + 1}.</span>
                    <span className="text-ink">{q.question_text}</span>
                    <span className="ml-2 rounded bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">
                      Ans {q.correct_answer}
                    </span>
                  </span>
                </summary>
                <div className="space-y-4 border-t border-line px-4 py-4">
                  <McqQuestionForm chapterId={data.chapter.id} mcq={q} />
                  <form action={deleteMcq}>
                    <input type="hidden" name="id" value={q.id} />
                    <ConfirmButton message="Delete this question?">Delete question</ConfirmButton>
                  </form>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
