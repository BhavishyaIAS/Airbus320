"use client";

import { useState } from "react";
import Link from "next/link";
import type { McqQuestion } from "@/lib/db/mcq";
import { cn } from "@/lib/utils";

export function McqQuiz({
  questions,
  backHref,
}: {
  questions: McqQuestion[];
  backHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <p className="text-ink-soft">No questions in this chapter yet.</p>
        <Link href={backHref} className="mt-3 inline-block text-sm text-accent hover:text-accent-ink">
          ← Back to chapters
        </Link>
      </div>
    );
  }

  const q = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  const choose = (key: string) => {
    if (answered) return;
    setSelected(key);
    setAnsweredCount((n) => n + 1);
    if (key === q.correct_answer) setCorrect((n) => n + 1);
  };

  const next = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setAnsweredCount(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <div className="text-sm font-medium uppercase tracking-wide text-muted">
          Chapter complete
        </div>
        <div className="mt-2 font-serif text-4xl text-ink">
          {correct} / {questions.length}
        </div>
        <p className="mt-1 text-ink-soft">You scored {pct}%.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink focus-ring"
          >
            Try again
          </button>
          <Link
            href={backHref}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink hover:bg-surface-2"
          >
            Back to chapters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* progress */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>Question {index + 1} of {questions.length}</span>
          <span>Score: {correct}/{answeredCount}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <p className="font-medium text-ink">{q.question_text}</p>

        <ul className="mt-4 space-y-2">
          {q.options.map((opt) => {
            const isCorrect = answered && opt.key === q.correct_answer;
            const isWrongPick = answered && opt.key === selected && selected !== q.correct_answer;
            return (
              <li key={opt.key}>
                <button
                  onClick={() => choose(opt.key)}
                  disabled={answered}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-ring",
                    !answered && "border-line hover:border-accent/50 hover:bg-surface-2",
                    isCorrect && "border-success/50 bg-success/10",
                    isWrongPick && "border-danger/50 bg-danger/10",
                    answered && !isCorrect && !isWrongPick && "border-line opacity-60",
                  )}
                >
                  <span className="font-semibold text-ink-soft">{opt.key}.</span>
                  <span className="text-ink">{opt.text}</span>
                  {isCorrect ? (
                    <span className="ml-auto text-xs font-medium text-success">✓</span>
                  ) : null}
                  {isWrongPick ? (
                    <span className="ml-auto text-xs font-medium text-danger">✕</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {answered ? (
          <div className="mt-4 rounded-lg bg-paper p-3 text-sm">
            <span className={cn("font-medium", selected === q.correct_answer ? "text-success" : "text-danger")}>
              {selected === q.correct_answer ? "Correct" : `Incorrect — answer is ${q.correct_answer}`}
            </span>
            {q.explanation ? (
              <p className="mt-1 text-ink-soft">{q.explanation}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            onClick={next}
            disabled={!answered}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink focus-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? "Finish" : "Next question"}
          </button>
        </div>
      </div>
    </div>
  );
}
