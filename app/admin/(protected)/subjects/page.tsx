import Link from "next/link";
import { listSubjects } from "@/lib/db/admin";
import { deleteSubject } from "./actions";
import { SubjectForm } from "@/components/admin/SubjectForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subjects" };

export default async function SubjectsPage() {
  const subjects = await listSubjects();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">Subjects</h1>
        <p className="mt-1 text-ink-soft">
          The top level of the syllabus. Micro-themes belong to a subject.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-medium text-ink">Add a subject</h2>
        <SubjectForm />
      </section>

      <section>
        <h2 className="mb-3 font-medium text-ink">
          All subjects ({subjects.length})
        </h2>
        {subjects.length === 0 ? (
          <EmptyState title="No subjects yet">
            Add your first subject above.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {subjects.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-ink">{s.name}</div>
                  <div className="text-xs text-muted">
                    {s.stage}
                    {s.paper ? ` · ${s.paper}` : ""} · order {s.display_order}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link
                    href={`/admin/subjects/${s.id}/edit`}
                    className="text-accent hover:text-accent-ink"
                  >
                    Edit
                  </Link>
                  <form action={deleteSubject}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={`Delete "${s.name}"? This also deletes its micro-themes and notes.`}>
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
