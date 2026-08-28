import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { getMcqBook } from "@/lib/db/mcq";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; book: string }>;
}) {
  const { subject, book } = await params;
  const data = await getMcqBook(subject, book);
  return { title: data ? `${data.book.title} — MCQ Vault` : "MCQ Vault" };
}

export default async function McqBookPage({
  params,
}: {
  params: Promise<{ subject: string; book: string }>;
}) {
  const { subject, book } = await params;
  const data = await getMcqBook(subject, book);
  if (!data) notFound();

  return (
    <Container className="py-12">
      <Breadcrumbs
        items={[
          { label: "MCQ Vault", href: "/mcqs" },
          { label: data.subject.name, href: `/mcqs/${data.subject.slug}` },
          { label: data.book.title },
        ]}
      />
      <header className="mb-8 max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">{data.book.title}</h1>
        {data.book.author ? (
          <p className="mt-1 text-muted">by {data.book.author}</p>
        ) : null}
        <p className="mt-2 text-ink-soft">Pick a chapter to start solving its MCQs.</p>
      </header>

      {data.chapters.length === 0 ? (
        <EmptyState title="No chapters yet">
          Chapters for this book will appear here.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {data.chapters.map((c) => (
            <li key={c.id}>
              <Link
                href={`/mcqs/${data.subject.slug}/${data.book.slug}/${c.slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2"
              >
                <span className="flex items-baseline gap-2">
                  {c.chapter_no ? (
                    <span className="text-xs text-muted">Ch {c.chapter_no}</span>
                  ) : null}
                  <span className="font-medium text-ink">{c.title}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {c.questionCount} question{c.questionCount === 1 ? "" : "s"} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
