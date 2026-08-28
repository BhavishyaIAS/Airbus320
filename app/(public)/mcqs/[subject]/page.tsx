import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { getMcqSubject } from "@/lib/db/mcq";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const data = await getMcqSubject(subject);
  return { title: data ? `${data.subject.name} — MCQ Vault` : "MCQ Vault" };
}

export default async function McqSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const data = await getMcqSubject(subject);
  if (!data) notFound();

  return (
    <Container className="py-12">
      <Breadcrumbs
        items={[
          { label: "MCQ Vault", href: "/mcqs" },
          { label: data.subject.name },
        ]}
      />
      <header className="mb-8 max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">{data.subject.name}</h1>
        <p className="mt-2 text-ink-soft">
          Choose a standard book to see its chapters.
        </p>
      </header>

      {data.books.length === 0 ? (
        <EmptyState title="No books yet">
          Books for this subject will appear here.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.books.map((b) => (
            <Link
              key={b.id}
              href={`/mcqs/${data.subject.slug}/${b.slug}`}
              className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <h2 className="font-medium text-ink group-hover:text-accent">{b.title}</h2>
              {b.author ? (
                <p className="mt-0.5 text-sm text-muted">by {b.author}</p>
              ) : null}
              {b.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{b.description}</p>
              ) : null}
              <div className="mt-4 flex gap-3 text-xs text-muted">
                <span>{b.chapterCount} chapter{b.chapterCount === 1 ? "" : "s"}</span>
                <span aria-hidden>·</span>
                <span>{b.questionCount} question{b.questionCount === 1 ? "" : "s"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
