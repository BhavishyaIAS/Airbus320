import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { signOut } from "@/app/admin/auth-actions";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, email, isAdmin } = await getAdmin();

  // Not signed in → login (middleware usually catches this first).
  if (!userId) redirect("/admin/login");

  // Signed in but not the admin → explicit, non-looping "forbidden" screen.
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-md rounded-xl border border-line bg-surface p-8 text-center">
          <h1 className="font-serif text-xl text-ink">Not authorized</h1>
          <p className="mt-2 text-sm text-ink-soft">
            You&apos;re signed in as{" "}
            <span className="font-medium">{email}</span>, but this account
            isn&apos;t an administrator. Ask the owner to set your role to
            <code className="mx-1 rounded bg-surface-2 px-1">admin</code>in
            Supabase.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <form action={signOut}>
              <button className="rounded-lg border border-line bg-surface px-4 py-2 text-sm hover:bg-surface-2 focus-ring">
                Sign out
              </button>
            </form>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm text-ink-soft hover:bg-surface-2"
            >
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell email={email}>{children}</AdminShell>;
}
