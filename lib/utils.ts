/**
 * Tiny className combiner. Filters falsy values and joins with a space.
 * Kept dependency-free; swap for clsx/tailwind-merge later if needed.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Normalize a Supabase embedded relation to an array. PostgREST returns
 * one-to-one embeds (e.g. a note behind a UNIQUE fk) as a single object or
 * null, and to-many embeds as an array — this coerces both to an array.
 */
export function asArray<T>(v: T | T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
