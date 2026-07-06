"use client";

import { useState } from "react";
import { PyqMeta } from "@/components/public/PyqMeta";
import type { PyqOption } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function PrelimsCard({
  question,
  options,
  correctAnswer,
  year,
  source,
  microthemes,
  tags,
}: {
  question: string;
  options: PyqOption[] | null;
  correctAnswer: string | null;
  year: number | null;
  source: string | null;
  microthemes: { id: string; title: string; slug: string }[];
  tags: { id: string; name: string }[];
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        Prelims · MCQ
      </span>
      <p className="mt-1.5 font-medium text-ink">{question}</p>

      {options && options.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {options.map((opt) => {
            const isCorrect = revealed && opt.key === correctAnswer;
            return (
              <li
                key={opt.key}
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                  isCorrect
                    ? "border-success/40 bg-success/10 text-ink"
                    : "border-line",
                )}
              >
                <span className="font-semibold text-ink-soft">{opt.key}.</span>
                <span>{opt.text}</span>
                {isCorrect ? (
                  <span className="ml-auto text-xs font-medium text-success">
                    ✓ correct
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setRevealed((v) => !v)}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-2 focus-ring"
        >
          {revealed ? "Hide answer" : "Reveal answer"}
        </button>
        {revealed && correctAnswer ? (
          <span className="text-sm text-ink-soft">
            Answer: <span className="font-semibold text-success">{correctAnswer}</span>
          </span>
        ) : null}
      </div>

      <PyqMeta
        year={year}
        source={source}
        microthemes={microthemes}
        tags={tags}
      />
    </article>
  );
}
