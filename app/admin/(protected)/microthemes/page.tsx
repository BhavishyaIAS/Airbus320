import Link from "next/link";
import { listMicrothemes, listSubjects } from "@/lib/db/admin";
import { deleteMicrotheme } from "./actions";
import { MicrothemeForm } from "@/components/admin/MicrothemeForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Micro-themes" };

function NoteBadge({ status }: { status: "draft" | "published" | null }) {
  const map = {
    published: "bg-success/10 text-success",
    draft: "bg-accent-soft text-accent",
    none: "bg-surface-2 text-muted",
  };
  const key = status ?? "none";
  const label = status ?? "no note";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[key]}`}>
      {label}
    </span>
  );
}

export default async function MicrothemesPage() {
  const [subjects, microthemes] = await Promise.all([
    listSubjects(),
    listMicrothemes(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">Micro-themes &amp; notes</h1>
        <p className="mt-1 text-ink-soft">
          Each micro-theme has exactly one note. Create the micro-theme, then
          open its note in the editor.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-medium text-ink">Add a micro-theme</h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-ink-soft">
            First{" "}
            <Link href="/admin/subjects" className="text-accent hover:text-accent-ink">
              create a subject
            </Link>
            .
          </p>
        ) : (
          <MicrothemeForm subjects={subjects} />
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium text-ink">
          All micro-themes ({microthemes.length})
        </h2>
        {microthemes.length === 0 ? (
          <EmptyState title="No micro-themes yet">
            Add your first micro-theme above.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {microthemes.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-ink">{m.title}</span>
                    <NoteBadge status={m.noteStatus} />
                  </div>
                  <div className="truncate text-xs text-muted">
                    {m.subjectName} · {m.topic}
                    {m.subtopic ? ` · ${m.subtopic}` : ""} · /{m.slug}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <Link
                    href={`/admin/notes/${m.id}/edit`}
                    className="font-medium text-accent hover:text-accent-ink"
                  >
                    {m.noteStatus ? "Edit note" : "Write note"}
                  </Link>
                  <Link
                    href={`/admin/microthemes/${m.id}/edit`}
                    className="text-ink-soft hover:text-ink"
                  >
                    Edit
                  </Link>
                  <form action={deleteMicrotheme}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton
                      message={`Delete "${m.title}"? This also deletes its note.`}
                    >
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
