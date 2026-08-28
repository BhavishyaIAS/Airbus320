import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          APPSC Group 1 Study Platform — notes &amp; previous year questions for
          Andhra Pradesh aspirants.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/syllabus" className="hover:text-ink focus-ring rounded">
            Syllabus
          </Link>
          <Link href="/pyqs" className="hover:text-ink focus-ring rounded">
            MCQ Vault
          </Link>
          <Link
            href="/admin"
            className="hover:text-ink focus-ring rounded"
          >
            Admin
          </Link>
        </div>
      </Container>
    </footer>
  );
}
