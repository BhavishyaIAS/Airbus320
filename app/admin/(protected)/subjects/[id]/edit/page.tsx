import Link from "next/link";
import { notFound } from "next/navigation";
import { listSubjects } from "@/lib/db/admin";
import { SubjectForm } from "@/components/admin/SubjectForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit subject" };

export default async function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = (await listSubjects()).find((s) => s.id === id);
  if (!subject) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/subjects" className="text-sm text-accent hover:text-accent-ink">
        ← Subjects
      </Link>
      <h1 className="font-serif text-2xl text-ink">Edit subject</h1>
      <div className="rounded-xl border border-line bg-surface p-5">
        <SubjectForm subject={subject} onDone="/admin/subjects" />
      </div>
    </div>
  );
}
