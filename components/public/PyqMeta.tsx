import Link from "next/link";

export type PyqMetaProps = {
  year: number | null;
  source: string | null;
  marks?: number | null;
  microthemes: { id: string; title: string; slug: string }[];
  tags: { id: string; name: string }[];
};

/** Shared meta row for a PYQ card: year, source, marks, micro-theme links, tags. */
export function PyqMeta({ year, source, marks, microthemes, tags }: PyqMetaProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
      {year ? <span className="font-medium text-ink-soft">{year}</span> : null}
      {typeof marks === "number" ? (
        <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
          {marks} marks
        </span>
      ) : null}
      {source ? <span>{source}</span> : null}
      {microthemes.map((m) => (
        <Link
          key={m.id}
          href={`/notes/${m.slug}`}
          className="underline-offset-2 hover:text-accent hover:underline"
        >
          {m.title}
        </Link>
      ))}
      {tags.map((t) => (
        <span key={t.id} className="rounded bg-surface-2 px-1.5 py-0.5">
          #{t.name}
        </span>
      ))}
    </div>
  );
}
