import Link from "next/link";
import { notFound } from "next/navigation";
import { getMicrotheme, listSubjects } from "@/lib/db/admin";
import { MicrothemeForm } from "@/components/admin/MicrothemeForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit micro-theme" };

export default async function EditMicrothemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [microtheme, subjects] = await Promise.all([
    getMicrotheme(id),
    listSubjects(),
  ]);
  if (!microtheme) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/microthemes"
        className="text-sm text-accent hover:text-accent-ink"
      >
        ← Micro-themes
      </Link>
      <h1 className="font-serif text-2xl text-ink">Edit micro-theme</h1>
      <div className="rounded-xl border border-line bg-surface p-5">
        <MicrothemeForm
          subjects={subjects}
          microtheme={microtheme}
          onDone="/admin/microthemes"
        />
      </div>
    </div>
  );
}
