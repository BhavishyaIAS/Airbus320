# APPSC Group 1 Study Platform

A study platform for aspirants of the **APPSC Group 1** exam (Andhra Pradesh
Public Service Commission): a micro-theme-level **Notes Repository** and a
searchable **MCQ Vault** (previous year questions), with a secure admin backend.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, Supabase
(Postgres / Auth / Storage), TipTap, Mermaid, and KaTeX. Deployed on Vercel.

See **[CLAUDE.md](./CLAUDE.md)** for the architecture, conventions, and the
"why" behind key decisions.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env template and fill in your Supabase keys (see `.env.example` for
   where to find each value):
   ```bash
   cp .env.example .env.local
   ```
   The app will boot and render the landing page even before keys are set.
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Project structure

- `app/(public)/` — public pages (landing, syllabus, notes, PYQs, search)
- `app/admin/` — admin dashboard, editor, management (login-protected)
- `components/` — UI primitives, layout, public + admin components
- `lib/supabase/` — browser / server / admin clients + auth middleware
- `lib/tiptap/` — editor extensions + JSON→HTML renderer
- `supabase/migrations/` — SQL schema, RLS policies, seed data
