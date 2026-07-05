import Link from "next/link";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata = { title: "Admin" };

export default function AdminHome() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-semibold text-ink">Admin</span>
          <Link href="/" className="text-sm text-accent hover:text-accent-ink">
            ← Back to site
          </Link>
        </div>
      </div>
      <PagePlaceholder
        title="Admin dashboard"
        note="Secure login, micro-theme management, the TipTap note editor, PYQ management and the media library arrive in Phases 4 and 5."
      />
    </div>
  );
}
