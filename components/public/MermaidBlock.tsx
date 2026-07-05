"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram from a fenced ```mermaid code block on the client.
 * Falls back to showing the raw source if the diagram fails to parse, so a
 * bad diagram never breaks the note.
 */
export function MermaidBlock({ code }: { code: string }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        });
        const { svg } = await mermaid.render(`mmd-${rawId}`, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "render error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, rawId]);

  if (error) {
    return (
      <pre className="my-6 overflow-x-auto rounded-lg border border-line bg-surface-2 p-4 text-sm text-ink-soft">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Diagram"
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-line bg-surface p-4"
    />
  );
}
