"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createMicrotheme,
  updateMicrotheme,
  type FormState,
} from "@/app/admin/(protected)/microthemes/actions";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Subject = { id: string; name: string; stage: string };
type Microtheme = {
  id: string;
  subject_id: string;
  topic: string;
  subtopic: string | null;
  title: string;
  slug: string;
  display_order: number;
  short_description: string | null;
};

const initial: FormState = { error: null };

export function MicrothemeForm({
  subjects,
  microtheme,
  onDone,
}: {
  subjects: Subject[];
  microtheme?: Microtheme;
  onDone?: string;
}) {
  const editing = Boolean(microtheme);
  const action = editing ? updateMicrotheme : createMicrotheme;
  const [state, formAction, pending] = useActionState(action, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      if (onDone) router.push(onDone);
      else router.refresh();
    }
  }, [state, onDone, router]);

  return (
    <form action={formAction} className="space-y-4">
      {microtheme ? <input type="hidden" name="id" value={microtheme.id} /> : null}

      <div>
        <Label htmlFor="subject_id">Subject</Label>
        <Select
          id="subject_id"
          name="subject_id"
          defaultValue={microtheme?.subject_id ?? ""}
          required
        >
          <option value="" disabled>
            Choose a subject…
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.stage})
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" name="topic" defaultValue={microtheme?.topic} required />
        </div>
        <div>
          <Label htmlFor="subtopic">Subtopic (optional)</Label>
          <Input
            id="subtopic"
            name="subtopic"
            defaultValue={microtheme?.subtopic ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title">Micro-theme title</Label>
        <Input id="title" name="title" defaultValue={microtheme?.title} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="slug">Slug (optional — auto from title)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={microtheme?.slug ?? ""}
            placeholder="e.g. satavahana-dynasty"
          />
        </div>
        <div>
          <Label htmlFor="display_order">Order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            defaultValue={microtheme?.display_order ?? 0}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="short_description">Short description (optional)</Label>
        <Textarea
          id="short_description"
          name="short_description"
          defaultValue={microtheme?.short_description ?? ""}
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save changes" : "Add micro-theme"}
      </Button>
    </form>
  );
}
