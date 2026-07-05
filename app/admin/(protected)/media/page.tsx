export const dynamic = "force-dynamic";
export const metadata = { title: "Media" };

export default function AdminMediaPlaceholder() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Media library</h1>
      <p className="mt-2 text-ink-soft">
        Image uploads already work inside the note editor. A browsable media
        library lands in a later phase.
      </p>
    </div>
  );
}
