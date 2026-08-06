import Link from "next/link";
import type { SyllabusSubject } from "@/lib/db/queries";

/* Group subjects (sections) under their paper, preserving order. */
function groupByPaper(subjects: SyllabusSubject[]) {
  const groups: { key: string; stage: string; paper: string; subjects: SyllabusSubject[] }[] = [];
  for (const s of subjects) {
    const paper = s.paper ?? "—";
    const key = `${s.stage}||${paper}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, stage: s.stage, paper, subjects: [] };
      groups.push(g);
    }
    g.subjects.push(s);
  }
  return groups;
}

function ApBadge() {
  return (
    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
      AP
    </span>
  );
}

/**
 * Paper → Section (collapsible) → Unit → Theme → Micro-theme.
 * Uses native <details> so it stays collapsible without client JS.
 */
export function SyllabusTree({ subjects }: { subjects: SyllabusSubject[] }) {
  const groups = groupByPaper(subjects);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {group.stage}
            </span>
            <h2 className="font-serif text-xl text-ink">{group.paper}</h2>
          </div>

          <div className="divide-y divide-line rounded-xl border border-line bg-surface">
            {group.subjects.map((subject) => (
              <details key={subject.id} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2 focus-ring">
                  <span className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-90"
                      fill="none"
                    >
                      <path d="m7 5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium text-ink">{subject.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {subject.publishedCount > 0 ? (
                      <span className="mr-2 text-success">{subject.publishedCount} with notes</span>
                    ) : null}
                    {subject.count} micro-themes
                  </span>
                </summary>

                <div className="space-y-5 border-t border-line px-4 py-4 sm:pl-10">
                  {subject.topics.map((topic) => (
                    <div key={topic.topic}>
                      <h3 className="mb-2 text-sm font-semibold text-accent">
                        {topic.topic}
                      </h3>
                      <div className="space-y-3">
                        {topic.subtopics.map((sub, i) => (
                          <div key={sub.subtopic ?? i}>
                            {sub.subtopic ? (
                              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                                {sub.subtopic}
                              </div>
                            ) : null}
                            <ul className="space-y-1 border-l border-line pl-3">
                              {sub.microthemes.map((mt) => (
                                <li key={mt.id} className="flex items-baseline gap-2">
                                  {mt.hasPublishedNote ? (
                                    <Link
                                      href={`/notes/${mt.slug}`}
                                      className="font-medium text-ink underline-offset-2 hover:text-accent hover:underline focus-ring"
                                    >
                                      {mt.title}
                                    </Link>
                                  ) : (
                                    <span className="text-ink-soft">{mt.title}</span>
                                  )}
                                  {mt.geographicScope === "AP-Specific" ? <ApBadge /> : null}
                                  {!mt.hasPublishedNote ? (
                                    <span className="rounded-full border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                                      soon
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
