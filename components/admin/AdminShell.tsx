import Link from "next/link";
import { signOut } from "@/app/admin/auth-actions";

const nav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/microthemes", label: "Micro-themes" },
  { href: "/admin/pyqs", label: "PYQs" },
  { href: "/admin/mcqs", label: "MCQ Vault" },
  { href: "/admin/media", label: "Media" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">
              G1
            </span>
            <span className="font-semibold text-ink">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-ink-soft hover:text-ink">
              View site ↗
            </Link>
            {email ? <span className="hidden text-muted sm:inline">{email}</span> : null}
            <form action={signOut}>
              <button className="rounded-md px-2 py-1 text-ink-soft hover:bg-surface-2 hover:text-ink focus-ring">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:flex-row">
        <aside className="sm:w-48 sm:shrink-0">
          <nav className="flex gap-1 overflow-x-auto sm:flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
