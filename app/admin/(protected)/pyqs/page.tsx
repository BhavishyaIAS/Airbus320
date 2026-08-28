import Link from "next/link";
import { listPyqsAdmin } from "@/lib/db/admin";
import { deletePyq } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "PYQs" };

export default async function AdminPyqsPage() {
  const pyqs = await listPyqsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-ink">PYQ vault</h1>
          <p className="mt-1 text-ink-soft">
            Prelims MCQs and mains questions. Mains can carry a model answer.
          </p>
        </div>
        <ButtonLink href="/admin/pyqs/new">Add question</ButtonLink>
      </div>

      {pyqs.length === 0 ? (
        <EmptyState title="No questions yet">
          Add your first PYQ with the button above.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {pyqs.map((p) => (
            <li key={p.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium uppercase tracking-wide text-ink-soft">
                    {p.stage}
                  </span>
                  {p.year ? <span className="text-muted">{p.year}</span> : null}
                  {p.stage === "mains" ? (
                    <span className="text-muted">{p.marks ?? "—"} marks</span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink">
                  {p.question_text}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                {p.stage === "mains" ? (
                  <Link
                    href={`/admin/pyqs/${p.id}/answer`}
                    className="font-medium text-accent hover:text-accent-ink"
                  >
                    {p.hasModelAnswer ? "Edit answer" : "Add answer"}
                  </Link>
                ) : null}
                <Link
                  href={`/admin/pyqs/${p.id}/edit`}
                  className="text-ink-soft hover:text-ink"
                >
                  Edit
                </Link>
                <form action={deletePyq}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton message="Delete this question and its model answer?">
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
