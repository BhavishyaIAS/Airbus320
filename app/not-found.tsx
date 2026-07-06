import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        404
      </p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink"
        >
          Go home
        </Link>
        <Link
          href="/syllabus"
          className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink hover:bg-surface-2"
        >
          Browse syllabus
        </Link>
      </div>
    </div>
  );
}
