export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
      <p className="font-serif text-lg text-ink">{title}</p>
      {children ? (
        <div className="mx-auto mt-2 max-w-sm text-sm text-muted">{children}</div>
      ) : null}
    </div>
  );
}
