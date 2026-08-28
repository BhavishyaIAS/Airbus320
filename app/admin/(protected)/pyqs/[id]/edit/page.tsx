import Link from "next/link";
import { notFound } from "next/navigation";
import { getPyqAdmin, listMicrothemes, listTags } from "@/lib/db/admin";
import { PyqForm } from "@/components/admin/PyqForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit PYQ" };

export default async function EditPyqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pyq, microthemes, tags] = await Promise.all([
    getPyqAdmin(id),
    listMicrothemes(),
    listTags(),
  ]);
  if (!pyq) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/pyqs" className="text-sm text-accent hover:text-accent-ink">
        ← MCQ vault
      </Link>
      <h1 className="font-serif text-2xl text-ink">Edit question</h1>
      <div className="rounded-xl border border-line bg-surface p-5">
        <PyqForm
          pyq={pyq}
          microthemes={microthemes.map((m) => ({ id: m.id, title: m.title, topic: m.topic }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </div>
  );
}
