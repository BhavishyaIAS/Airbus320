import Link from "next/link";
import type { SyllabusSubject } from "@/lib/db/queries";

/** Renders Subject → Topic → Micro-theme, linking micro-themes that have notes. */
export function SyllabusTree({ subjects }: { subjects: SyllabusSubject[] }) {
  return (
    <div className="space-y-10">
      {subjects.map((subject) => (
        <section key={subject.id}>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-serif text-2xl text-ink">{subject.name}</h2>
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {subject.stage}
              {subject.paper ? ` · ${subject.paper}` : ""}
            </span>
          </div>

          <div className="space-y-6 border-l border-line pl-4 sm:pl-6">
            {subject.topics.map((topic) => (
              <div key={topic.topic}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
                  {topic.topic}
                </h3>
                <ul className="space-y-1.5">
                  {topic.microthemes.map((mt) => (
                    <li key={mt.id}>
                      {mt.hasPublishedNote ? (
                        <Link
                          href={`/notes/${mt.slug}`}
                          className="group flex items-baseline gap-2 rounded px-1 py-0.5 focus-ring"
                        >
                          <span className="font-medium text-ink underline-offset-2 group-hover:text-accent group-hover:underline">
                            {mt.title}
                          </span>
                          {mt.subtopic ? (
                            <span className="text-xs text-muted">{mt.subtopic}</span>
                          ) : null}
                        </Link>
                      ) : (
                        <span className="flex items-baseline gap-2 px-1 py-0.5 text-muted">
                          {mt.title}
                          <span className="rounded-full border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                            note soon
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
