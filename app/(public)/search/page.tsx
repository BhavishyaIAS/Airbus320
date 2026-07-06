import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/public/SearchBox";
import { searchAll } from "@/lib/db/search";

export const metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { notes, pyqs, query } = await searchAll(q);
  const hasQuery = query.length > 0;
  const total = notes.length + pyqs.length;

  return (
    <Container size="narrow" className="py-12">
      <h1 className="font-serif text-3xl text-ink">Search</h1>
      <p className="mt-2 text-ink-soft">
        Across note titles, note content, and previous year questions.
      </p>

      <div className="mt-5">
        <SearchBox defaultValue={query} autoFocus />
      </div>

      {!hasQuery ? (
        <p className="mt-8 text-sm text-muted">
          Type a query above to search — e.g. <em>Satavahana</em>,{" "}
          <em>Amaravati</em>, or <em>rivers</em>.
        </p>
      ) : total === 0 ? (
        <div className="mt-8">
          <EmptyState title={`No results for "${query}"`}>
            Try a different or broader term.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <p className="text-sm text-muted">
            {total} result{total === 1 ? "" : "s"} for{" "}
            <span className="font-medium text-ink-soft">&ldquo;{query}&rdquo;</span>
          </p>

          {notes.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">
                Notes ({notes.length})
              </h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/notes/${n.slug}`}
                      className="block px-4 py-3 hover:bg-surface-2"
                    >
                      <div className="font-medium text-ink">{n.title}</div>
                      <div className="text-xs text-muted">{n.topic}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {pyqs.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">
                Questions ({pyqs.length})
              </h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
                {pyqs.map((p) => (
                  <li key={p.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium uppercase tracking-wide">
                        {p.stage}
                      </span>
                      {p.year ? <span>{p.year}</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-ink">{p.question_text}</p>
                    <Link
                      href={`/pyqs?stage=${p.stage}`}
                      className="mt-1 inline-block text-xs text-accent hover:text-accent-ink"
                    >
                      Open in vault →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </Container>
  );
}
