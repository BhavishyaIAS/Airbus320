"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveMcqChapter, type FormState } from "@/app/admin/(protected)/mcqs/actions";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Chapter = {
  id: string; book_id: string; title: string; slug: string;
  chapter_no: number | null; display_order: number;
};
const initial: FormState = { error: null };

export function McqChapterForm({ bookId, chapter }: { bookId: string; chapter?: Chapter }) {
  const editing = Boolean(chapter);
  const [state, action, pending] = useActionState(saveMcqChapter, initial);
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
      <input type="hidden" name="book_id" value={bookId} />
      {chapter ? <input type="hidden" name="id" value={chapter.id} /> : null}
      <div>
        <Label htmlFor="title">Chapter title</Label>
        <Input id="title" name="title" defaultValue={chapter?.title} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="chapter_no">Chapter no. (optional)</Label>
          <Input id="chapter_no" name="chapter_no" type="number" defaultValue={chapter?.chapter_no ?? ""} />
        </div>
        <div>
          <Label htmlFor="display_order">Order</Label>
          <Input id="display_order" name="display_order" type="number" defaultValue={chapter?.display_order ?? 0} />
        </div>
        {chapter ? (
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={chapter.slug} />
          </div>
        ) : null}
      </div>
      {state.error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : editing ? "Save chapter" : "Add chapter"}
      </Button>
    </form>
  );
}
