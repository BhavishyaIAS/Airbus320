"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMcq, type McqInput } from "@/app/admin/(protected)/mcqs/actions";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { AdminMcq } from "@/lib/db/mcq-admin";
import type { PyqOption } from "@/lib/types/database";

const LETTERS = "ABCDEFGH".split("");
const blankOptions: PyqOption[] = [
  { key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" },
];

export function McqQuestionForm({ chapterId, mcq }: { chapterId: string; mcq?: AdminMcq }) {
  const router = useRouter();
  const editing = Boolean(mcq);
  const [question, setQuestion] = useState(mcq?.question_text ?? "");
  const [options, setOptions] = useState<PyqOption[]>(mcq?.options ?? blankOptions);
  const [correct, setCorrect] = useState(mcq?.correct_answer ?? "");
  const [explanation, setExplanation] = useState(mcq?.explanation ?? "");
  const [difficulty, setDifficulty] = useState(mcq?.difficulty ?? "");
  const [order, setOrder] = useState(mcq?.display_order?.toString() ?? "0");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const reletter = (opts: PyqOption[]) => opts.map((o, i) => ({ ...o, key: LETTERS[i] }));
  const setText = (i: number, text: string) =>
    setOptions((p) => p.map((o, idx) => (idx === i ? { ...o, text } : o)));
  const addOption = () => setOptions((p) => reletter([...p, { key: "", text: "" }]).slice(0, LETTERS.length));
  const removeOption = (i: number) =>
    setOptions((p) => {
      const next = reletter(p.filter((_, idx) => idx !== i));
      if (!next.some((o) => o.key === correct)) setCorrect("");
      return next;
    });

  const reset = () => {
    setQuestion(""); setOptions(blankOptions); setCorrect("");
    setExplanation(""); setDifficulty(""); setOrder("0");
  };

  const submit = async () => {
    setSaving(true); setMsg(null);
    const input: McqInput = {
      id: mcq?.id,
      chapter_id: chapterId,
      question_text: question,
      options: options.filter((o) => o.text.trim()),
      correct_answer: correct,
      explanation: explanation || null,
      difficulty: difficulty || null,
      display_order: order ? parseInt(order, 10) : 0,
    };
    const res = await saveMcq(input);
    setSaving(false);
    setMsg({ ok: res.ok, text: res.ok ? "Saved." : res.error ?? "Save failed." });
    if (res.ok) {
      if (!editing) reset();
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="q">Question</Label>
        <Textarea id="q" value={question} onChange={(e) => setQuestion(e.target.value)} required />
      </div>

      <div>
        <Label>Options (select the correct one)</Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio" name="mcq-correct" checked={correct === opt.key}
                onChange={() => setCorrect(opt.key)} className="h-4 w-4 accent-[var(--accent)]"
                aria-label={`Mark ${opt.key} correct`}
              />
              <span className="w-5 font-semibold text-ink-soft">{opt.key}</span>
              <Input value={opt.text} onChange={(e) => setText(i, e.target.value)} placeholder={`Option ${opt.key}`} />
              {options.length > 2 ? (
                <button type="button" onClick={() => removeOption(i)} className="shrink-0 rounded px-2 py-1 text-sm text-danger hover:bg-surface-2">✕</button>
              ) : null}
            </div>
          ))}
        </div>
        {options.length < LETTERS.length ? (
          <button type="button" onClick={addOption} className="mt-2 text-sm text-accent hover:text-accent-ink">+ Add option</button>
        ) : null}
      </div>

      <div>
        <Label htmlFor="expl">Explanation (optional)</Label>
        <Textarea id="expl" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="diff">Difficulty (optional)</Label>
          <Select id="diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">—</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="order">Order</Label>
          <Input id="order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
      </div>

      {msg ? (
        <p className={`rounded-md px-3 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{msg.text}</p>
      ) : null}

      <Button onClick={submit} disabled={saving}>
        {saving ? "Saving…" : editing ? "Save question" : "Add question"}
      </Button>
    </div>
  );
}
