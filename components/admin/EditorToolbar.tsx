"use client";

import { useRef } from "react";
import type { Editor } from "@tiptap/react";
import { uploadImage } from "@/lib/tiptap/uploadImage";
import { cn } from "@/lib/utils";

function TBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink focus-ring",
        active && "bg-accent-soft text-accent",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 w-px self-stretch bg-line" />;

export function EditorToolbar({
  editor,
  onImageState,
}: {
  editor: Editor;
  onImageState?: (uploading: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("YouTube URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onImageState?.(true);
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(
        "Image upload failed: " + (err instanceof Error ? err.message : "error"),
      );
    } finally {
      onImageState?.(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-line bg-surface p-2">
      <TBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </TBtn>
      <TBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </TBtn>
      <TBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </TBtn>
      <TBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        {"</>"}
      </TBtn>

      <Divider />

      <TBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </TBtn>
      <TBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </TBtn>
      <TBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </TBtn>
      <TBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </TBtn>
      <TBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        &ldquo;
      </TBtn>

      <Divider />

      <TBtn title="Link" active={editor.isActive("link")} onClick={addLink}>
        Link
      </TBtn>
      <TBtn title="Insert image" onClick={() => fileRef.current?.click()}>
        Image
      </TBtn>
      <TBtn title="Embed YouTube" onClick={addYoutube}>
        YouTube
      </TBtn>
      <TBtn title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        Table
      </TBtn>

      <Divider />

      <TBtn title="Mermaid diagram" active={editor.isActive("codeBlock", { language: "mermaid" })} onClick={() => editor.chain().focus().setCodeBlock({ language: "mermaid" }).run()}>
        Mermaid
      </TBtn>
      <TBtn title="Math (KaTeX) block" active={editor.isActive("codeBlock", { language: "math" })} onClick={() => editor.chain().focus().setCodeBlock({ language: "math" }).run()}>
        Math
      </TBtn>
      <TBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        Code
      </TBtn>

      <Divider />

      <TBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        ↺
      </TBtn>
      <TBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        ↻
      </TBtn>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />
    </div>
  );
}
