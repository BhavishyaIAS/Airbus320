import Link from "next/link";
import { getAdminStats } from "@/lib/db/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin dashboard" };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-2xl font-semibold text-ink">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

export default async function Dashboard() {
  const stats = await getAdminStats();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Dashboard</h1>
      <p className="mt-1 text-ink-soft">Manage your notes and question bank.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Subjects" value={stats.subjects} />
        <StatCard label="Micro-themes" value={stats.microthemes} />
        <StatCard label="Published notes" value={stats.publishedNotes} />
        <StatCard label="Draft notes" value={stats.draftNotes} />
        <StatCard label="PYQs" value={stats.pyqs} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/microthemes"
          className="rounded-xl border border-line bg-surface p-5 hover:border-accent/40"
        >
          <div className="font-medium text-ink">Micro-themes &amp; notes →</div>
          <p className="mt-1 text-sm text-ink-soft">
            Create micro-themes and write their notes in the editor.
          </p>
        </Link>
        <Link
          href="/admin/pyqs"
          className="rounded-xl border border-line bg-surface p-5 hover:border-accent/40"
        >
          <div className="font-medium text-ink">PYQ vault →</div>
          <p className="mt-1 text-sm text-ink-soft">
            Add prelims and mains questions, tags, and model answers.
          </p>
        </Link>
      </div>
    </div>
  );
}
