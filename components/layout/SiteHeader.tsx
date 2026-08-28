import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchBox } from "@/components/public/SearchBox";

const navLinks = [
  { href: "/syllabus", label: "Syllabus" },
  { href: "/pyqs", label: "MCQ Vault" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-ink focus-ring rounded"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white"
          >
            G1
          </span>
          <span className="hidden sm:inline">APPSC Group 1</span>
        </Link>

        <div className="hidden max-w-xs flex-1 md:block">
          <SearchBox />
        </div>

        <nav className="flex items-center gap-1 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-ring"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="rounded-md px-3 py-1.5 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-ring md:hidden"
          >
            Search
          </Link>
        </nav>
      </Container>
    </header>
  );
}
