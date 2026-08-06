import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SyllabusTree } from "@/components/public/SyllabusTree";
import { getSyllabus, type SyllabusFilters } from "@/lib/db/queries";
import type { Stage } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export const metadata = { title: "Syllabus" };
export const dynamic = "force-dynamic";

type SP = { stage?: string; scope?: string };

const FILTERS: { label: string; stage?: Stage; scope?: string }[] = [
  { label: "All" },
  { label: "Prelims", stage: "prelims" },
  { label: "Mains", stage: "mains" },
  { label: "AP-Specific", scope: "AP-Specific" },
];

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors focus-ring",
        active
          ? "border-accent bg-accent text-white"
          : "border-line bg-surface text-ink-soft hover:bg-surface-2 hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}

export default async function SyllabusPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filters: SyllabusFilters = {
    stage: sp.stage === "prelims" || sp.stage === "mains" ? sp.stage : undefined,
    scope: sp.scope || undefined,
  };
  const subjects = await getSyllabus(filters);
  const total = subjects.reduce((n, s) => n + s.count, 0);

  return (
    <Container className="py-12">
      <header className="mb-6 max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">Syllabus</h1>
        <p className="mt-2 text-ink-soft">
          The APPSC Group 1 syllabus, fragmented to the micro-theme. Expand a
          section to browse its units and themes; linked micro-themes have
          published notes.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const params = new URLSearchParams();
          if (f.stage) params.set("stage", f.stage);
          if (f.scope) params.set("scope", f.scope);
          const qs = params.toString();
          const active =
            (f.stage ?? undefined) === filters.stage &&
            (f.scope ?? undefined) === filters.scope;
          return (
            <FilterChip
              key={f.label}
              label={f.label}
              href={qs ? `/syllabus?${qs}` : "/syllabus"}
              active={active}
            />
          );
        })}
        {total > 0 ? (
          <span className="ml-auto text-sm text-muted">{total} micro-themes</span>
        ) : null}
      </div>

      {subjects.length === 0 ? (
        <EmptyState title="No micro-themes found">
          {filters.stage || filters.scope
            ? "Try clearing the filter."
            : "Once the database is connected and seeded, the syllabus will appear here."}
        </EmptyState>
      ) : (
        <SyllabusTree subjects={subjects} />
      )}
    </Container>
  );
}
