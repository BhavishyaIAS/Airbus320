"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createSubject,
  updateSubject,
  type FormState,
} from "@/app/admin/(protected)/subjects/actions";
import { Label, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Subject = {
  id: string;
  name: string;
  stage: "prelims" | "mains";
  paper: string | null;
  display_order: number;
};

const initial: FormState = { error: null };

export function SubjectForm({
  subject,
  onDone,
}: {
  subject?: Subject;
  onDone?: string; // path to navigate to on success (edit mode)
}) {
  const editing = Boolean(subject);
  const action = editing ? updateSubject : createSubject;
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
      {subject ? <input type="hidden" name="id" value={subject.id} /> : null}

      <div>
        <Label htmlFor="name">Subject name</Label>
        <Input id="name" name="name" defaultValue={subject?.name} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="stage">Stage</Label>
          <Select id="stage" name="stage" defaultValue={subject?.stage ?? "mains"}>
            <option value="prelims">Prelims</option>
            <option value="mains">Mains</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="paper">Paper (optional)</Label>
          <Input id="paper" name="paper" defaultValue={subject?.paper ?? ""} />
        </div>
        <div>
          <Label htmlFor="display_order">Order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            defaultValue={subject?.display_order ?? 0}
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save changes" : "Add subject"}
      </Button>
    </form>
  );
}
