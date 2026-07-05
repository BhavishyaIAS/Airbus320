# Supabase — schema, RLS & seed

This folder holds the database definition for the platform. Everything here has
been validated against PostgreSQL 16.

## Files (run in order)

1. `migrations/0001_schema.sql` — enums, tables, indexes, and triggers
   (`updated_at`, full-text `search_tsv`, auto-create profile on signup).
2. `migrations/0002_rls_policies.sql` — the `is_admin()` helper + Row Level
   Security policies (public reads published content; admin-only writes).
3. `migrations/0003_storage.sql` — the public `media` Storage bucket + policies.
4. `seed.sql` — a few sample AP micro-themes, notes, PYQs and a model answer.
   Safe to re-run (fixed UUIDs + `ON CONFLICT DO NOTHING`).

## How to run (hosted project)

In the Supabase dashboard: **SQL Editor → New query**, paste each file's
contents in the order above, and click **Run**. (Or use the Supabase CLI:
`supabase db push` with these as migrations.)

## Create the admin (one-time)

There is no public sign-up UI. To become the admin:

1. Start the app, go to `/admin/login`, and **sign up** with your email.
   (Admin auth UI ships in Phase 4; until then create the user in the
   dashboard: **Authentication → Users → Add user**.)
2. Promote that user to admin by running, in the SQL Editor:

   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

Only this user can create/edit/publish content or upload media.

## Security model (verified)

- Anonymous visitors can **read** published notes, all PYQs, model answers, and
  the syllabus structure — but **not** draft notes or anyone's profile.
- All `INSERT/UPDATE/DELETE` require `is_admin()` to be true.
- A `CHECK` constraint enforces the prelims/mains split on `pyqs`
  (prelims may carry `options`/`correct_answer`, mains carries `marks`).

## Regenerating TypeScript types

`lib/types/database.ts` is currently hand-authored to match this schema. Once
the hosted DB exists you can regenerate the canonical types:

```bash
npx supabase gen types typescript --project-id <your-project-ref> \
  > lib/types/database.ts
```
