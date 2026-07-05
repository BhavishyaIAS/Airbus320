/**
 * Tiny className combiner. Filters falsy values and joins with a space.
 * Kept dependency-free; swap for clsx/tailwind-merge later if needed.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
