"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePyq, type PyqInput } from "@/app/admin/(protected)/pyqs/actions";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { AdminPyq } from "@/lib/db/admin";
import type { PyqOption } from "@/lib/types/database";

type MT = { id: string; title: string; topic: string };
type Tag = { id: string; name: string };

const LETTERS = "ABCDEFGH".split("");

export function PyqForm({
  microthemes,
  tags,
  pyq,
  onDone = "/admin/pyqs",
}: {
  microthemes: MT[];
  tags: Tag[];
  pyq?: AdminPyq;
  onDone?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"prelims" | "mains">(pyq?.stage ?? "prelims");
  const [year, setYear] = useState(pyq?.year?.toString() ?? "");
  const [source, setSource] = useState(pyq?.source ?? "");
  const [question, setQuestion] = useState(pyq?.question_text ?? "");
  const [marks, setMarks] = useState(pyq?.marks?.toString() ?? "");
  const [options, setOptions] = useState<PyqOption[]>(
    pyq?.options ?? [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
  );
  const [correct, setCorrect] = useState(pyq?.correct_answer ?? "");
  const [mtIds, setMtIds] = useState<Set<string>>(new Set(pyq?.microthemeIds ?? []));
  const [tagIds, setTagIds] = useState<Set<string>>(new Set(pyq?.tagIds ?? []));
  const [newTags, setNewTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reletter = (opts: PyqOption[]) =>
    opts.map((o, i) => ({ ...o, key: LETTERS[i] }));

  const setOptionText = (i: number, text: string) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, text } : o)));

  const addOption = () =>
    setOptions((prev) =>
      reletter([...prev, { key: "", text: "" }]).slice(0, LETTERS.length),
    );

  const removeOption = (i: number) =>
    setOptions((prev) => {
      const next = reletter(prev.filter((_, idx) => idx !== i));
      if (!next.some((o) => o.key === correct)) setCorrect("");
      return next;
    });

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    const input: PyqInput = {
      id: pyq?.id,
      stage,
      year: year ? parseInt(year, 10) : null,
      source: source || null,
      question_text: question,
      options: stage === "prelims" ? options.filter((o) => o.text.trim()) : null,
      correct_answer: stage === "prelims" ? correct || null : null,
      marks: stage === "mains" ? (marks ? parseInt(marks, 10) : null) : null,
      microthemeIds: [...mtIds],
      tagIds: [...tagIds],
      newTags: newTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await savePyq(input);
    setSaving(false);
    if (res.ok) router.push(onDone);
    else setError(res.error);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="stage">Stage</Label>
          <Select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as "prelims" | "mains")}
          >
            <option value="prelims">Prelims (MCQ)</option>
            <option value="mains">Mains</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2019"
          />
        </div>
        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="APPSC Group 1 Prelims"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>

      {stage === "prelims" ? (
        <div>
          <Label>Options (select the correct one)</Label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={correct === opt.key}
                  onChange={() => setCorrect(opt.key)}
                  className="h-4 w-4 accent-[var(--accent)]"
                  aria-label={`Mark ${opt.key} correct`}
                />
                <span className="w-5 font-semibold text-ink-soft">{opt.key}</span>
                <Input
                  value={opt.text}
                  onChange={(e) => setOptionText(i, e.target.value)}
                  placeholder={`Option ${opt.key}`}
                />
                {options.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="shrink-0 rounded px-2 py-1 text-sm text-danger hover:bg-surface-2"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {options.length < LETTERS.length ? (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-accent hover:text-accent-ink"
            >
              + Add option
            </button>
          ) : null}
        </div>
      ) : (
        <div className="max-w-40">
          <Label htmlFor="marks">Marks</Label>
          <Input
            id="marks"
            type="number"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="10"
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">
            Micro-themes
          </legend>
          <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-line bg-surface p-2">
            {microthemes.length === 0 ? (
              <p className="p-2 text-sm text-muted">No micro-themes yet.</p>
            ) : (
              microthemes.map((m) => (
                <label key={m.id} className="flex items-center gap-2 rounded px-1 py-0.5 text-sm">
                  <input
                    type="checkbox"
                    checked={mtIds.has(m.id)}
                    onChange={() => toggle(mtIds, m.id, setMtIds)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="truncate">
                    {m.title}
                    <span className="text-muted"> · {m.topic}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">Tags</legend>
          <div className="max-h-28 space-y-1 overflow-y-auto rounded-lg border border-line bg-surface p-2">
            {tags.length === 0 ? (
              <p className="p-2 text-sm text-muted">No tags yet.</p>
            ) : (
              tags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 rounded px-1 py-0.5 text-sm">
                  <input
                    type="checkbox"
                    checked={tagIds.has(t.id)}
                    onChange={() => toggle(tagIds, t.id, setTagIds)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  {t.name}
                </label>
              ))
            )}
          </div>
          <Input
            className="mt-2"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="New tags, comma-separated"
          />
        </fieldset>
      </div>

      {error ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}

      <Button onClick={submit} disabled={saving}>
        {saving ? "Saving…" : pyq ? "Save changes" : "Add question"}
      </Button>
    </div>
  );
}
