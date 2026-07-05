import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SyllabusTree } from "@/components/public/SyllabusTree";
import { getSyllabus } from "@/lib/db/queries";

export const metadata = { title: "Syllabus" };
// Data is per-request (RLS + fresh content); don't prerender at build time.
export const dynamic = "force-dynamic";

export default async function SyllabusPage() {
  const subjects = await getSyllabus();

  return (
    <Container className="py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-serif text-3xl text-ink">Syllabus</h1>
        <p className="mt-2 text-ink-soft">
          Browse the syllabus from subject down to the micro-theme. Linked
          micro-themes have published notes; the rest are on the way.
        </p>
      </header>

      {subjects.length === 0 ? (
        <EmptyState title="No syllabus yet">
          Once the database is connected and seeded, subjects and micro-themes
          will appear here.
        </EmptyState>
      ) : (
        <SyllabusTree subjects={subjects} />
      )}
    </Container>
  );
}
