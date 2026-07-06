"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Select } from "@/components/ui/Field";
import type { PyqFilterOptions } from "@/lib/db/pyqs";

type Current = {
  stage?: string;
  year?: string;
  topic?: string;
  microtheme?: string;
  tag?: string;
};

export function PyqFilters({
  options,
  current,
}: {
  options: PyqFilterOptions;
  current: Current;
}) {
  const router = useRouter();

  const update = (key: keyof Current, value: string) => {
    const params = new URLSearchParams();
    const next = { ...current, [key]: value };
    (Object.keys(next) as (keyof Current)[]).forEach((k) => {
      if (next[k]) params.set(k, String(next[k]));
    });
    const qs = params.toString();
    router.push(qs ? `/pyqs?${qs}` : "/pyqs");
  };

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted">Stage</span>
          <Select
            value={current.stage ?? ""}
            onChange={(e) => update("stage", e.target.value)}
          >
            <option value="">All</option>
            <option value="prelims">Prelims</option>
            <option value="mains">Mains</option>
          </Select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted">Year</span>
          <Select
            value={current.year ?? ""}
            onChange={(e) => update("year", e.target.value)}
          >
            <option value="">All</option>
            {options.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted">Topic</span>
          <Select
            value={current.topic ?? ""}
            onChange={(e) => update("topic", e.target.value)}
          >
            <option value="">All</option>
            {options.topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted">
            Micro-theme
          </span>
          <Select
            value={current.microtheme ?? ""}
            onChange={(e) => update("microtheme", e.target.value)}
          >
            <option value="">All</option>
            {options.microthemes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted">Tag</span>
          <Select
            value={current.tag ?? ""}
            onChange={(e) => update("tag", e.target.value)}
          >
            <option value="">All</option>
            {options.tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {hasFilters ? (
        <div className="mt-3">
          <Link href="/pyqs" className="text-sm text-accent hover:text-accent-ink">
            Clear filters
          </Link>
        </div>
      ) : null}
    </div>
  );
}
