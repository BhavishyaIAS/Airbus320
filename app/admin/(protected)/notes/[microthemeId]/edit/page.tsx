import { notFound } from "next/navigation";
import { getMicrotheme, getNoteForMicrotheme } from "@/lib/db/admin";
import { NoteEditor } from "@/components/admin/NoteEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Note editor" };

export default async function NoteEditPage({
  params,
}: {
  params: Promise<{ microthemeId: string }>;
}) {
  const { microthemeId } = await params;
  const [microtheme, note] = await Promise.all([
    getMicrotheme(microthemeId),
    getNoteForMicrotheme(microthemeId),
  ]);
  if (!microtheme) notFound();

  return (
    <NoteEditor
      microthemeId={microtheme.id}
      microthemeTitle={microtheme.title}
      slug={microtheme.slug}
      initialTitle={note?.title ?? microtheme.title}
      initialContent={note?.content ?? { type: "doc", content: [] }}
      initialStatus={note?.status ?? "draft"}
      hasNote={Boolean(note)}
    />
  );
}
