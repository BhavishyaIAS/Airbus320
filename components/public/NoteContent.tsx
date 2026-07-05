import { Fragment, type ReactNode } from "react";
import { MermaidBlock } from "@/components/public/MermaidBlock";
import { renderMath } from "@/lib/tiptap/katex";
import { parseYouTube, youTubeEmbedUrl } from "@/lib/tiptap/youtube";

/* Minimal TipTap JSON shapes (structural typing — we only read what we render). */
type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  text?: string;
  marks?: Mark[];
};

type Doc = { type?: string; content?: Node[] } | null | undefined;

/**
 * Server-renders canonical TipTap JSON into React. Everything is server-side
 * except Mermaid (needs the browser). KaTeX is rendered to HTML on the server.
 */
export function NoteContent({ content }: { content: unknown }) {
  const doc = content as Doc;
  if (!doc || !Array.isArray(doc.content)) {
    return <p className="text-muted">This note has no content yet.</p>;
  }
  return (
    <div className="note-prose">
      {doc.content.map((node, i) => (
        <RenderNode key={i} node={node} />
      ))}
    </div>
  );
}

function renderChildren(nodes: Node[] | undefined): ReactNode {
  if (!nodes) return null;
  return nodes.map((n, i) => <RenderNode key={i} node={n} />);
}

function RenderNode({ node }: { node: Node }): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p>{renderChildren(node.content)}</p>;

    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      const Tag = (`h${Math.min(Math.max(level, 1), 4)}` as "h2");
      return <Tag>{renderChildren(node.content)}</Tag>;
    }

    case "bulletList":
      return <ul>{renderChildren(node.content)}</ul>;
    case "orderedList":
      return <ol>{renderChildren(node.content)}</ol>;
    case "listItem":
      return <li>{renderChildren(node.content)}</li>;

    case "blockquote":
      return <blockquote>{renderChildren(node.content)}</blockquote>;

    case "horizontalRule":
      return <hr className="my-8 border-line" />;

    case "hardBreak":
      return <br />;

    case "codeBlock": {
      const language = String(node.attrs?.language ?? "");
      const code = (node.content ?? []).map((c) => c.text ?? "").join("");
      if (language === "mermaid") return <MermaidBlock code={code} />;
      if (language === "math" || language === "latex") {
        return (
          <div
            className="my-6 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderMath(code, true) }}
          />
        );
      }
      return (
        <pre>
          <code>{code}</code>
        </pre>
      );
    }

    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      if (!src) return null;
      // Plain <img>: note images come from arbitrary uploads; .note-prose styles it.
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} loading="lazy" />;
    }

    case "youtube": {
      const parsed = parseYouTube(String(node.attrs?.src ?? ""));
      if (!parsed) return null;
      return (
        <span className="my-6 block overflow-hidden rounded-lg border border-line">
          <span className="relative block aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={youTubeEmbedUrl(parsed.id, parsed.start)}
              title="Embedded video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </span>
        </span>
      );
    }

    case "table":
      return (
        <table>
          <tbody>{renderChildren(node.content)}</tbody>
        </table>
      );
    case "tableRow":
      return <tr>{renderChildren(node.content)}</tr>;
    case "tableHeader":
      return <th>{renderChildren(node.content)}</th>;
    case "tableCell":
      return <td>{renderChildren(node.content)}</td>;

    case "text":
      return <RenderText node={node} />;

    default:
      // Unknown node: render its children if any, else nothing.
      return <>{renderChildren(node.content)}</>;
  }
}

/** Render a text node with its marks (bold/italic/code/strike/link) + inline math. */
function RenderText({ node }: { node: Node }): ReactNode {
  let el: ReactNode = <InlineText text={node.text ?? ""} />;

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        el = <strong>{el}</strong>;
        break;
      case "italic":
        el = <em>{el}</em>;
        break;
      case "code":
        el = <code>{el}</code>;
        break;
      case "strike":
        el = <s>{el}</s>;
        break;
      case "underline":
        el = <u>{el}</u>;
        break;
      case "link": {
        const href = String(mark.attrs?.href ?? "#");
        const external = /^https?:\/\//.test(href);
        el = (
          <a
            href={href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {el}
          </a>
        );
        break;
      }
      default:
        break;
    }
  }
  return el;
}

/** Split a plain string on inline math delimited by $...$ and KaTeX-render it. */
function InlineText({ text }: { text: string }): ReactNode {
  if (!text.includes("$")) return <>{text}</>;

  const parts = text.split(/(\$[^$\n]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
          const tex = part.slice(1, -1);
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: renderMath(tex, false) }}
            />
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
