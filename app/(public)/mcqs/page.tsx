import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMcqSubjects } from "@/lib/db/mcq";

export const metadata = {
  title: "MCQ Vault",
  description: "Practice GK / GS MCQs for competitive exams, organised by subject, book and chapter.",
};
export const dynamic = "force-dynamic";

export default async function McqVaultPage() {
  const subjects = await getMcqSubjects();

  return (
    <Container className="py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">MCQ Vault</h1>
        <p className="mt-2 text-ink-soft">
          Practice GK &amp; GS multiple-choice questions for competitive exams.
          Pick a subject, choose a standard book, then a chapter, and start
          solving.
        </p>
      </header>

      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet">
          Once the MCQ content is added, subjects will appear here.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/mcqs/${s.slug}`}
              className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <h2 className="font-serif text-xl text-ink group-hover:text-accent">
                {s.name}
              </h2>
              {s.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{s.description}</p>
              ) : null}
              <div className="mt-4 flex gap-3 text-xs text-muted">
                <span>{s.bookCount} book{s.bookCount === 1 ? "" : "s"}</span>
                <span aria-hidden>·</span>
                <span>{s.questionCount} question{s.questionCount === 1 ? "" : "s"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
