"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-serif text-xl text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-lg border border-line bg-surface px-4 py-2 text-sm hover:bg-surface-2"
      >
        Try again
      </button>
    </div>
  );
}
