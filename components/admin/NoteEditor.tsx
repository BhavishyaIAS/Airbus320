"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "@/lib/tiptap/extensions";
import { EditorToolbar } from "@/components/admin/EditorToolbar";
import { saveNote, deleteNote } from "@/app/admin/(protected)/notes/actions";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function NoteEditor({
  microthemeId,
  microthemeTitle,
  slug,
  initialTitle,
  initialContent,
  initialStatus,
  hasNote,
}: {
  microthemeId: string;
  microthemeTitle: string;
  slug: string;
  initialTitle: string;
  initialContent: unknown;
  initialStatus: "draft" | "published";
  hasNote: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [published, setPublished] = useState(initialStatus === "published");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const editor = useEditor({
    extensions: editorExtensions(),
    content: (initialContent as object) ?? { type: "doc", content: [] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "note-prose tiptap focus:outline-none",
      },
    },
  });

  const onSave = async () => {
    if (!editor) return;
    if (!title.trim()) {
      setMessage({ ok: false, text: "Please add a title." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await saveNote({
      microthemeId,
      title: title.trim(),
      status: published ? "published" : "draft",
      content: editor.getJSON(),
    });
    setSaving(false);
    setMessage({
      ok: res.ok,
      text: res.ok ? "Saved." : res.error ?? "Save failed.",
    });
    if (res.ok) router.refresh();
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this note? The micro-theme stays.")) return;
    const res = await deleteNote(microthemeId);
    if (res.ok) router.push("/admin/microthemes");
    else setMessage({ ok: false, text: res.error ?? "Delete failed." });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/admin/microthemes"
            className="text-sm text-accent hover:text-accent-ink"
          >
            ← Micro-themes
          </Link>
          <h1 className="truncate font-serif text-xl text-ink">
            {microthemeTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {published && hasNote ? (
            <Link
              href={`/notes/${slug}`}
              target="_blank"
              className="text-sm text-ink-soft hover:text-ink"
            >
              View public ↗
            </Link>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Published
          </label>
          <Button onClick={onSave} disabled={saving || uploading}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            message.ok
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div>
        <Label htmlFor="note-title">Note title</Label>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title shown at the top of the note"
        />
      </div>

      <div className="rounded-lg border border-line bg-surface">
        {editor ? (
          <>
            <EditorToolbar editor={editor} onImageState={setUploading} />
            <div className="px-4 py-3">
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-muted">Loading editor…</div>
        )}
      </div>

      <p className="text-xs text-muted">
        {uploading ? "Uploading image… " : ""}
        Tip: use the <b>Mermaid</b> and <b>Math</b> buttons to insert diagram /
        LaTeX blocks — they render on the public note page. Inline math uses
        <code className="mx-1">$…$</code>.
      </p>

      {hasNote ? (
        <div className="pt-4">
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-danger hover:underline"
          >
            Delete note
          </button>
        </div>
      ) : null}
    </div>
  );
}
