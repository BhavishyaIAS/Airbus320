/**
 * Extract plaintext from a TipTap JSON document for full-text search.
 * Walks all `text` nodes and joins them with spaces / block breaks.
 */
type Node = { type?: string; text?: string; content?: Node[] };

export function extractPlainText(doc: unknown): string {
  const root = doc as Node | null | undefined;
  if (!root) return "";
  const parts: string[] = [];

  const walk = (node: Node) => {
    if (node.text) parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(root);

  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 20000);
}
