"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "@/app/admin/auth-actions";
import { Label, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initial: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-semibold text-ink"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white">
            G1
          </span>
          APPSC Group 1
        </Link>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <h1 className="font-serif text-xl text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Only the site administrator can sign in.
          </p>

          <form action={formAction} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {state.error ? (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Trouble signing in? Create the user in Supabase and set its role to
          admin — see supabase/README.md.
        </p>
      </div>
    </div>
  );
}
