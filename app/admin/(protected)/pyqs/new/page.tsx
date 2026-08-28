import Link from "next/link";
import { listMicrothemes, listTags } from "@/lib/db/admin";
import { PyqForm } from "@/components/admin/PyqForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New PYQ" };

export default async function NewPyqPage() {
  const [microthemes, tags] = await Promise.all([listMicrothemes(), listTags()]);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/pyqs" className="text-sm text-accent hover:text-accent-ink">
        ← MCQ vault
      </Link>
      <h1 className="font-serif text-2xl text-ink">Add a question</h1>
      <div className="rounded-xl border border-line bg-surface p-5">
        <PyqForm
          microthemes={microthemes.map((m) => ({ id: m.id, title: m.title, topic: m.topic }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </div>
  );
}
