import { Container } from "@/components/ui/Container";

/** Temporary placeholder for pages built in later phases. */
export function PagePlaceholder({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <Container className="py-20">
      <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
        Coming soon
      </span>
      <h1 className="mt-4 font-serif text-3xl text-ink">{title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{note}</p>
    </Container>
  );
}
