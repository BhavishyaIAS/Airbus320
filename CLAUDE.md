# CLAUDE.md — APPSC Group 1 Study Platform

Guidance for any future session working in this repo. Read this first.

## What this is

A production study platform for **APPSC Group 1** (Andhra Pradesh Public Service
Commission) aspirants. Two core modules:

1. **Notes Repository** — exhaustive notes organized to the finest "micro-theme"
   of the syllabus. Rich content: headings, images, Mermaid diagrams, embedded
   YouTube lectures, tables, and math. Exactly **one note per micro-theme**.
2. **PYQ Vault** — previous year questions. Prelims = MCQs with a correct
   answer; Mains = questions with marks and an optional **model answer**.
   Filterable by micro-theme, tag, year, topic.

Public visitors read notes and use the PYQ vault with **no login**. A single
**admin** (the product owner) logs in to create/edit/publish everything.

The exam is heavily Andhra-Pradesh-specific (AP history, geography, economy,
polity), so the content structure must let AP micro-themes be organized clearly.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS v4** (CSS-first config via
  `@theme` in `app/globals.css` — there is no `tailwind.config.js`).
- **Supabase**: Postgres DB, admin Auth, and Storage (image/file uploads).
- **TipTap** rich-text editor (admin) → content stored as **canonical JSON**.
- **Mermaid.js** renders diagrams client-side on public note pages.
- **KaTeX** for math.
- Deploy: **Vercel** (app) + **Supabase** (DB/storage).

## Key decisions & the "why"

- **TipTap content is stored as JSON, not HTML.** It stays re-editable and
  sanitizable; public pages render it to HTML server-side (`lib/tiptap/`) so the
  editor and the public view share one schema. Never store raw HTML from the
  editor.
- **Mermaid renders on the client** (a small `"use client"` component) from
  fenced ` ```mermaid ` code blocks. Everything else renders in Server
  Components for speed and SEO.
- **Search = Postgres full-text search** (`tsvector` + GIN index on notes and
  pyqs). No third-party search service.
- **RLS is the security boundary.** Public can `SELECT` only `published`
  content; all writes require the `admin` role, enforced by an `is_admin()`
  SQL helper used in policies. See `supabase/migrations/`.
- **Single admin, seeded manually.** No public sign-up UI. After the admin signs
  up once, set `profiles.role = 'admin'` in Supabase. Server-privileged actions
  use the service-role client (`lib/supabase/admin.ts`) — server-only.
- **Design = "warm scholarly", light theme only for now.** Colors are CSS
  variables in `app/globals.css`; a dark theme can be layered later by
  overriding that one `:root` block. Serif (`Source Serif 4`) for long note
  bodies, Inter for UI. Mobile-first.

## Conventions

- **Path alias**: `@/*` → repo root. Import as `@/lib/...`, `@/components/...`.
- **Supabase clients**:
  - `lib/supabase/client.ts` — browser (Client Components).
  - `lib/supabase/server.ts` — Server Components / Actions / Route Handlers
    (RLS applies; respects the logged-in user).
  - `lib/supabase/admin.ts` — service-role, **server-only**, bypasses RLS. Use
    sparingly.
  - `lib/supabase/session.ts` + root `proxy.ts` — refresh the auth session and
    guard `/admin`. (Next 16 renamed `middleware.ts` → `proxy.ts`.)
- **Env**: read via `lib/env.ts`. The app is built to boot even before Supabase
  keys are set (`isSupabaseConfigured`) so the landing page renders. Real keys
  live in `.env.local` (gitignored); see `.env.example`.
- **Route groups**: public pages under `app/(public)/` (shared header/footer);
  admin under `app/admin/`.
- **Styling**: use theme tokens (`bg-paper`, `text-ink`, `text-accent`,
  `border-line`, …) not raw hex. Note content uses the `.note-prose` class.
- **DB schema** lives in `supabase/migrations/*.sql`; generated types in
  `lib/types/database.ts` (regenerate after schema changes).

## Data model (summary)

`subjects → microthemes → notes (1:1 with microtheme)`, plus `tags`/`note_tags`,
`pyqs` with `pyq_microthemes`/`pyq_tags`, `model_answers` (1:1 with a mains pyq),
`media`, and `profiles` (role). Full DDL + RLS in `supabase/migrations/`.

## Build phases (see the plan for detail)

1. Scaffold + Tailwind + Supabase clients + this file. ← done
2. DB schema + migrations + RLS + seed. ← done
3. Public read: syllabus tree + note rendering. ← done
4. Admin auth + micro-theme management + TipTap editor. ← done
5. PYQ vault + admin PYQ management + model answers. ← done
6. Search, polish, mobile QA.
7. Deploy to Vercel + custom domain.

## Working agreement

- Never run destructive commands or delete data without asking the product
  owner first.
- When something needs an account, key, or a decision only the owner can make,
  **stop and say exactly what to do** — don't guess secrets.
- Commit at the end of every phase with a clear message; work happens on branch
  `claude/appsc-study-platform-qs3pxh`.

> **Next.js version note:** this is Next 16 with breaking changes vs. older
> App Router. See `AGENTS.md` and `node_modules/next/dist/docs/` before relying
> on remembered APIs (e.g. `cookies()`/`headers()` are async).

## Commands

- `npm run dev` — local dev server.
- `npm run build` — production build (must pass before committing a phase).
- `npm run lint` — ESLint.
