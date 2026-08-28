"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveMcqBook, type FormState } from "@/app/admin/(protected)/mcqs/actions";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Book = {
  id: string; subject_id: string; title: string; author: string | null;
  slug: string; description: string | null; display_order: number;
};
const initial: FormState = { error: null };

export function McqBookForm({ subjectId, book }: { subjectId: string; book?: Book }) {
  const editing = Boolean(book);
  const [state, action, pending] = useActionState(saveMcqBook, initial);
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
      <input type="hidden" name="subject_id" value={subjectId} />
      {book ? <input type="hidden" name="id" value={book.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Book title</Label>
          <Input id="title" name="title" defaultValue={book?.title} required />
        </div>
        <div>
          <Label htmlFor="author">Author (optional)</Label>
          <Input id="author" name="author" defaultValue={book?.author ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" defaultValue={book?.description ?? ""} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="display_order">Order</Label>
          <Input id="display_order" name="display_order" type="number" defaultValue={book?.display_order ?? 0} />
        </div>
        {book ? (
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={book.slug} />
          </div>
        ) : null}
      </div>
      {state.error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save book" : "Add book"}
      </Button>
    </form>
  );
}
