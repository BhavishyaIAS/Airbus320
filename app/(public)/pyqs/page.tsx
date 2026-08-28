import "katex/dist/katex.min.css";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PyqFilters } from "@/components/public/PyqFilters";
import { PrelimsCard } from "@/components/public/PrelimsCard";
import { MainsCard } from "@/components/public/MainsCard";
import { NoteContent } from "@/components/public/NoteContent";
import { getPyqs, getPyqFilterOptions, type PyqFilters as Filters } from "@/lib/db/pyqs";
import type { Stage } from "@/lib/types/database";

export const metadata = { title: "PYQ Vault" };
export const dynamic = "force-dynamic";

type SearchParams = {
  stage?: string;
  year?: string;
  topic?: string;
  microtheme?: string;
  tag?: string;
};

export default async function PyqsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const filters: Filters = {
    stage: sp.stage === "prelims" || sp.stage === "mains" ? (sp.stage as Stage) : undefined,
    year: sp.year ? parseInt(sp.year, 10) || undefined : undefined,
    microtheme: sp.microtheme || undefined,
    tag: sp.tag || undefined,
    topic: sp.topic || undefined,
  };

  const [options, pyqs] = await Promise.all([
    getPyqFilterOptions(),
    getPyqs(filters),
  ]);

  return (
    <Container className="py-12">
      <header className="mb-6 max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">PYQ Vault</h1>
        <p className="mt-2 text-ink-soft">
          Previous year questions. Reveal prelims answers on click; expand mains
          model answers to study the blueprint.
        </p>
      </header>

      <div className="mb-6">
        <PyqFilters options={options} current={sp} />
      </div>

      {pyqs.length === 0 ? (
        <EmptyState title="No questions found">
          Try clearing filters, or check back once questions are added.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {pyqs.length} question{pyqs.length === 1 ? "" : "s"}
          </p>
          {pyqs.map((p) =>
            p.stage === "prelims" ? (
              <PrelimsCard
                key={p.id}
                question={p.question_text}
                options={p.options}
                correctAnswer={p.correct_answer}
                year={p.year}
                source={p.source}
                microthemes={p.microthemes}
                tags={p.tags}
              />
            ) : (
              <MainsCard
                key={p.id}
                question={p.question_text}
                marks={p.marks}
                year={p.year}
                source={p.source}
                microthemes={p.microthemes}
                tags={p.tags}
                hasModelAnswer={Boolean(p.modelAnswer)}
              >
                {p.modelAnswer ? <NoteContent content={p.modelAnswer} /> : null}
              </MainsCard>
            ),
          )}
        </div>
      )}
    </Container>
  );
}
