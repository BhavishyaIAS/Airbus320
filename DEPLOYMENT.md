# Deployment guide — Vercel + Supabase

This app runs on **Vercel** (Next.js) with **Supabase** (database, auth, storage).
You already have the Supabase project; these steps put the app online.

## 0. Prerequisites (one-time)

- The database SQL has been run in Supabase (see `supabase/README.md`).
- Your admin user exists and has `role = 'admin'` (see `supabase/README.md`).
- The code is pushed to GitHub (branch `claude/appsc-study-platform-qs3pxh`,
  or merged to `main`).

## 1. Get your three Supabase values

Supabase dashboard → **Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (secret!)

## 2. Import the project into Vercel

1. Go to **https://vercel.com** and sign in with GitHub.
2. **Add New… → Project** → **Import** your `Airbus320` repository.
3. Vercel auto-detects **Next.js** — leave build/output settings at defaults.
4. **Before clicking Deploy**, open **Environment Variables** and add all three
   (apply to Production, Preview, and Development):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |

5. Click **Deploy**. Wait ~2 minutes. You'll get a URL like
   `https://your-project.vercel.app`.

> If you deployed before adding the env vars, add them under
> **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.

## 3. Point Supabase Auth at your live URL

Supabase dashboard → **Authentication → URL Configuration**:

- Set **Site URL** to your Vercel URL (`https://your-project.vercel.app`).
- Under **Redirect URLs**, add `https://your-project.vercel.app/**`.

(We use email + password sign-in, so this is mostly future-proofing, but set it
now so nothing breaks later.)

## 4. Smoke-test production

- Open your Vercel URL → the landing page loads.
- `/syllabus` and `/notes/satavahana-dynasty` render the seeded content.
- `/pyqs` shows the seeded questions; reveal/expand work.
- `/admin` → sign in → create a micro-theme, write & publish a note, confirm it
  appears publicly. Upload an image in the editor (confirms Storage works in
  production).

## 5. Add a custom domain (optional)

1. Buy a domain (any registrar), or use one you own.
2. Vercel → your project → **Settings → Domains** → **Add** → enter your domain
   (e.g. `appscnotes.in`).
3. Vercel shows DNS records to add. At your registrar's DNS settings:
   - For an apex domain (`example.com`): add the **A record** Vercel gives you.
   - For `www` or a subdomain: add the **CNAME** to `cname.vercel-dns.com`.
4. Wait for DNS to propagate (minutes to a few hours). Vercel auto-issues HTTPS.
5. Once the custom domain is live, update **Site URL / Redirect URLs** in
   Supabase (step 3) to the custom domain.

## Notes

- **Never** commit `.env.local` or expose the `service_role` key in client code.
  In Vercel it lives only as a server-side env var.
- Redeploys happen automatically on every push to the connected branch.
- To rotate a leaked key: Supabase → Settings → API → reset it, then update the
  value in Vercel and redeploy.
