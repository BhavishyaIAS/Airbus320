"use client";

import { useState } from "react";
import { PyqMeta } from "@/components/public/PyqMeta";

export function MainsCard({
  question,
  marks,
  year,
  source,
  microthemes,
  tags,
  hasModelAnswer,
  children,
}: {
  question: string;
  marks: number | null;
  year: number | null;
  source: string | null;
  microthemes: { id: string; title: string; slug: string }[];
  tags: { id: string; name: string }[];
  hasModelAnswer: boolean;
  children?: React.ReactNode; // server-rendered model answer
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Mains
      </span>
      <p className="mt-1.5 font-medium text-ink">{question}</p>

      <PyqMeta
        year={year}
        source={source}
        marks={marks}
        microthemes={microthemes}
        tags={tags}
      />

      {hasModelAnswer ? (
        <div className="mt-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-2 focus-ring"
            aria-expanded={open}
          >
            {open ? "Hide model answer" : "Show model answer"}
          </button>
          {open ? (
            <div className="mt-4 rounded-lg border border-line bg-paper p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
                Model answer
              </div>
              {children}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">Model answer coming soon.</p>
      )}
    </article>
  );
}
