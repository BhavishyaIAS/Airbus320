import "katex/dist/katex.min.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteContent } from "@/components/public/NoteContent";
import { getNoteBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getNoteBySlug(slug);
  if (!data) return { title: "Note not found" };
  return {
    title: data.note?.title ?? data.microtheme.title,
    description: data.microtheme.short_description ?? undefined,
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const data = await getNoteBySlug(slug);

  if (!data) {
    return (
      <Container size="narrow" className="py-16">
        <EmptyState title="Micro-theme not found">
          We couldn&apos;t find that micro-theme.{" "}
          <Link href="/syllabus" className="text-accent hover:text-accent-ink">
            Back to the syllabus
          </Link>
          .
        </EmptyState>
      </Container>
    );
  }

  const { microtheme, subject, note, tags } = data;

  return (
    <Container size="narrow" className="py-12">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/syllabus" className="hover:text-ink">
          Syllabus
        </Link>
        {subject ? (
          <>
            <span aria-hidden>/</span>
            <span>{subject.name}</span>
          </>
        ) : null}
        <span aria-hidden>/</span>
        <span className="text-ink-soft">{microtheme.topic}</span>
      </nav>

      <header className="mb-8 border-b border-line pb-6">
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {note?.title ?? microtheme.title}
        </h1>
        {microtheme.short_description ? (
          <p className="mt-3 text-lg text-ink-soft">
            {microtheme.short_description}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          {note ? (
            <span>
              Updated{" "}
              {new Date(note.updated_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : null}
          {tags.length > 0 ? (
            <span className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
                >
                  {t.name}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </header>

      {note ? (
        <article>
          <NoteContent content={note.content} />
        </article>
      ) : (
        <EmptyState title="Note coming soon">
          This micro-theme is in the syllabus but its note hasn&apos;t been
          published yet. Check back soon.
        </EmptyState>
      )}
    </Container>
  );
}
