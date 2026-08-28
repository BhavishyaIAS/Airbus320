import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

const modules = [
  {
    href: "/syllabus",
    title: "Notes Repository",
    body: "Exhaustive, exam-ready notes organized down to the finest micro-theme of the syllabus — with diagrams, maps, tables and embedded video lectures.",
    cta: "Browse the syllabus",
  },
  {
    href: "/pyqs",
    title: "PYQ Vault",
    body: "Previous year Prelims MCQs and Mains questions, filterable by micro-theme, year and tag. Mains questions come with model-answer blueprints.",
    cta: "Open the vault",
  },
  {
    href: "/mcqs",
    title: "MCQ Vault",
    body: "Practice GK & GS MCQs for competitive exams, organised by subject, standard book and chapter — with instant feedback and explanations.",
    cta: "Start practising",
  },
];

export default function HomePage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-accent">
          Andhra Pradesh Public Service Commission
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
          A calm, structured place to prepare for{" "}
          <span className="text-accent">APPSC Group 1</span>.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Micro-theme-level notes and a searchable previous-year-questions vault,
          built for long study sessions on any device.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/syllabus">Start studying</ButtonLink>
          <ButtonLink href="/pyqs" variant="secondary">
            Practice PYQs
          </ButtonLink>
        </div>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <a
            key={m.href}
            href={m.href}
            className="group rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent/40 focus-ring"
          >
            <h2 className="font-serif text-xl text-ink">{m.title}</h2>
            <p className="mt-2 text-ink-soft">{m.body}</p>
            <span className="mt-4 inline-block text-sm font-medium text-accent group-hover:text-accent-ink">
              {m.cta} →
            </span>
          </a>
        ))}
      </div>
    </Container>
  );
}
