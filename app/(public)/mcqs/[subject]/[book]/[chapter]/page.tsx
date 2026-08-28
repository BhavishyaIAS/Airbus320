import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { McqQuiz } from "@/components/public/McqQuiz";
import { getMcqChapter } from "@/lib/db/mcq";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; book: string; chapter: string }>;
}) {
  const { subject, book, chapter } = await params;
  const data = await getMcqChapter(subject, book, chapter);
  return { title: data ? `${data.chapter.title} — MCQ Vault` : "MCQ Vault" };
}

export default async function McqChapterPage({
  params,
}: {
  params: Promise<{ subject: string; book: string; chapter: string }>;
}) {
  const { subject, book, chapter } = await params;
  const data = await getMcqChapter(subject, book, chapter);
  if (!data) notFound();

  const backHref = `/mcqs/${data.subject.slug}/${data.book.slug}`;

  return (
    <Container size="narrow" className="py-12">
      <Breadcrumbs
        items={[
          { label: "MCQ Vault", href: "/mcqs" },
          { label: data.subject.name, href: `/mcqs/${data.subject.slug}` },
          { label: data.book.title, href: backHref },
          { label: data.chapter.title },
        ]}
      />
      <header className="mb-6">
        <h1 className="font-serif text-2xl text-ink">{data.chapter.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {data.questions.length} question{data.questions.length === 1 ? "" : "s"} ·
          pick an answer to see if you&apos;re right.
        </p>
      </header>

      <McqQuiz questions={data.questions} backHref={backHref} />
    </Container>
  );
}
