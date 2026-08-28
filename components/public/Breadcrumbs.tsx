import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {c.href ? (
            <Link href={c.href} className="hover:text-ink">
              {c.label}
            </Link>
          ) : (
            <span className="text-ink-soft">{c.label}</span>
          )}
          {i < items.length - 1 ? <span aria-hidden>/</span> : null}
        </span>
      ))}
    </nav>
  );
}
