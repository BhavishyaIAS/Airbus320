import katex from "katex";

/**
 * Render a LaTeX string to HTML on the server (no client JS, no layout shift).
 * Returns a safe HTML string; on error returns the escaped source so a typo
 * never blanks the page. The KaTeX stylesheet is imported by the note page.
 */
export function renderMath(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return escapeHtml(tex);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
