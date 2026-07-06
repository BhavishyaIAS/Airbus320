"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "@/lib/tiptap/extensions";
import { EditorToolbar } from "@/components/admin/EditorToolbar";
import {
  saveModelAnswer,
  deleteModelAnswer,
} from "@/app/admin/(protected)/pyqs/actions";
import { Button } from "@/components/ui/Button";

export function ModelAnswerEditor({
  pyqId,
  initialContent,
  hasAnswer,
}: {
  pyqId: string;
  initialContent: unknown;
  hasAnswer: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const editor = useEditor({
    extensions: editorExtensions(),
    content: (initialContent as object) ?? { type: "doc", content: [] },
    immediatelyRender: false,
    editorProps: { attributes: { class: "note-prose tiptap focus:outline-none" } },
  });

  const onSave = async () => {
    if (!editor) return;
    setSaving(true);
    setMessage(null);
    const res = await saveModelAnswer(pyqId, editor.getJSON());
    setSaving(false);
    setMessage({ ok: res.ok, text: res.ok ? "Saved." : res.error ?? "Save failed." });
    if (res.ok) router.refresh();
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this model answer?")) return;
    const res = await deleteModelAnswer(pyqId);
    if (res.ok) router.push("/admin/pyqs");
    else setMessage({ ok: false, text: res.error ?? "Delete failed." });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        <Button onClick={onSave} disabled={saving || uploading}>
          {saving ? "Saving…" : "Save model answer"}
        </Button>
      </div>

      {message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            message.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </p>
      ) : null}

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

      {hasAnswer ? (
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-danger hover:underline"
        >
          Delete model answer
        </button>
      ) : null}
    </div>
  );
}
