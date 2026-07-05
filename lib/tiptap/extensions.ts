import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import type { Extensions } from "@tiptap/core";

/**
 * The single source of truth for the editor's schema. StarterKit v3 already
 * includes Link, Underline, CodeBlock (with a `language` attr we use for
 * Mermaid/math), headings, lists, blockquote, etc. We add Image, YouTube and
 * Tables on top. The public renderer (components/public/NoteContent) mirrors
 * these node types.
 */
export function editorExtensions(): Extensions {
  return [
    StarterKit.configure({
      link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } },
      codeBlock: { HTMLAttributes: { spellcheck: "false" } },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    Youtube.configure({ controls: true, nocookie: true, width: 640, height: 360 }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}
