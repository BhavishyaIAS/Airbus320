"use client";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-serif text-2xl text-ink">Something went wrong</h1>
      <p className="mt-2 text-ink-soft">
        We couldn&apos;t load this page. This can happen if the database is
        temporarily unavailable.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink"
      >
        Try again
      </button>
    </div>
  );
}
