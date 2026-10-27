# Sandun Madhura Portfolio — Supabase version

Static HTML/CSS/JS portfolio with Supabase Storage + database for shared uploads and Supabase Auth for the admin dashboard.

## Setup (required before deploy)

1. Create a project at https://supabase.com.
2. In Supabase **Project Settings → API**, copy the **Project URL** and **anon/public key**.
3. Edit `config.js` and replace:
   - `PASTE_SUPABASE_PROJECT_URL_HERE`
   - `PASTE_SUPABASE_ANON_KEY_HERE`
   - `YOUR_ADMIN_EMAIL_HERE` with your admin login email.
   The anon/public key is designed for browser use. **Never put a service-role/secret key in this file.**
4. Open Supabase **SQL Editor → New query**. Open `supabase-setup.sql`, replace every `YOUR_ADMIN_EMAIL_HERE` with the exact same admin email, and run the SQL.
5. In Supabase **Authentication → Users**, create an admin user using that email and a strong password. Use the same email/password on `admin.html` to sign in. Keep public sign-ups disabled; create the admin user yourself.
6. Upload all project files (including `config.js`, `supabase.js`, and `supabase-setup.sql`) to the root of your GitHub repository and deploy to Vercel. Do not upload any service-role key.
7. Open `admin.html`, sign in, and upload a test image. It should then appear on the public portfolio for all visitors.

## What changed
- Admin media uploads go to the `portfolio-media` Supabase Storage bucket.
- Project metadata and profile links are stored in Supabase tables.
- Public visitors can read portfolio projects/media; only the configured admin email can insert, edit, or delete data.
- Media file limit is configured to 50 MB in this starter. Consider compressing large videos for performance.
- When replacing or deleting a project's media, the old storage object is cleaned up where possible.

## Important
- Supabase Free plans have quotas and may change. Check your dashboard for current storage/bandwidth limits.
- If you previously added projects using the old localStorage dashboard, those are not automatically migrated. Re-upload them through the new admin dashboard.
- This browser-only static site uses Supabase Auth + RLS; do not ever expose a service-role key.
