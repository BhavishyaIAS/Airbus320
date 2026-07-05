/**
 * Extract a YouTube video id (and optional start seconds) from any of the URL
 * shapes TipTap's YouTube extension may store: watch?v=, youtu.be/, /embed/,
 * or /shorts/.
 */
export function parseYouTube(src: string): { id: string; start?: number } | null {
  if (!src) return null;
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (host.endsWith("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2];
      else if (url.pathname.startsWith("/shorts/"))
        id = url.pathname.split("/")[2];
      else id = url.searchParams.get("v") ?? "";
    }
    if (!id) return null;

    const t = url.searchParams.get("start") ?? url.searchParams.get("t");
    const start = t ? parseInt(t, 10) : undefined;
    return { id, start: Number.isFinite(start) ? start : undefined };
  } catch {
    // Not a full URL — assume the raw value is already an id.
    return /^[\w-]{11}$/.test(src) ? { id: src } : null;
  }
}

/** Build a privacy-friendly embed URL for an iframe. */
export function youTubeEmbedUrl(id: string, start?: number): string {
  const base = `https://www.youtube-nocookie.com/embed/${id}`;
  return start ? `${base}?start=${start}` : base;
}
