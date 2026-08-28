import Link from "next/link";
import { notFound } from "next/navigation";
import { getPyqAdmin, getModelAnswer } from "@/lib/db/admin";
import { ModelAnswerEditor } from "@/components/admin/ModelAnswerEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Model answer" };

export default async function ModelAnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pyq = await getPyqAdmin(id);
  if (!pyq) notFound();
  if (pyq.stage !== "mains") {
    // Model answers only apply to mains questions.
    notFound();
  }
  const content = await getModelAnswer(id);

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/pyqs" className="text-sm text-accent hover:text-accent-ink">
        ← MCQ vault
      </Link>
      <div>
        <h1 className="font-serif text-2xl text-ink">Model answer</h1>
        <p className="mt-1 rounded-lg border border-line bg-surface p-3 text-sm text-ink-soft">
          {pyq.question_text}
          {pyq.marks ? (
            <span className="ml-2 font-medium text-accent">({pyq.marks} marks)</span>
          ) : null}
        </p>
      </div>
      <ModelAnswerEditor
        pyqId={id}
        initialContent={content ?? { type: "doc", content: [] }}
        hasAnswer={Boolean(content)}
      />
    </div>
  );
}
