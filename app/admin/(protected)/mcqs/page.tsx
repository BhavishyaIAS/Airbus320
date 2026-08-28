import Link from "next/link";
import { listMcqSubjectsAdmin } from "@/lib/db/mcq-admin";
import { deleteMcqSubject } from "./actions";
import { McqSubjectForm } from "@/components/admin/McqSubjectForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "MCQ Vault" };

export default async function AdminMcqSubjectsPage() {
  const subjects = await listMcqSubjectsAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">MCQ Vault</h1>
        <p className="mt-1 text-ink-soft">
          GK/GS practice content: Subject → Book → Chapter → MCQs.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-medium text-ink">Add a subject</h2>
        <McqSubjectForm />
      </section>

      <section>
        <h2 className="mb-3 font-medium text-ink">Subjects ({subjects.length})</h2>
        {subjects.length === 0 ? (
          <EmptyState title="No subjects yet">Add your first subject above.</EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">{s.name}</div>
                  <div className="text-xs text-muted">{s.bookCount} book{s.bookCount === 1 ? "" : "s"} · /{s.slug}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link href={`/admin/mcqs/${s.id}`} className="font-medium text-accent hover:text-accent-ink">
                    Manage books
                  </Link>
                  <form action={deleteMcqSubject}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={`Delete "${s.name}"? This deletes its books, chapters and MCQs.`}>
                      Delete
                    </ConfirmButton>
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
