"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveMcqSubject, type FormState } from "@/app/admin/(protected)/mcqs/actions";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Subject = { id: string; name: string; slug: string; description: string | null; display_order: number };
const initial: FormState = { error: null };

export function McqSubjectForm({ subject }: { subject?: Subject }) {
  const editing = Boolean(subject);
  const [state, action, pending] = useActionState(saveMcqSubject, initial);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (!editing) formRef.current?.reset();
      router.refresh();
    }
  }, [state, editing, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Subject name</Label>
          <Input id="name" name="name" defaultValue={subject?.name} required />
        </div>
        <div>
          <Label htmlFor="display_order">Order</Label>
          <Input id="display_order" name="display_order" type="number" defaultValue={subject?.display_order ?? 0} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" defaultValue={subject?.description ?? ""} />
      </div>
      {subject ? (
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={subject.slug} />
        </div>
      ) : null}
      {state.error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save subject" : "Add subject"}
      </Button>
    </form>
  );
}
