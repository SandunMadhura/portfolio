# Sandun Madhura — Creative Portfolio

A responsive minimal/premium portfolio starter built with plain HTML, CSS and JavaScript.

## Included
- Portfolio homepage with selected work, services, about and contact sections
- Category filters: Social Media, Flyers, Packaging, Video Ads and Web Design
- Click-to-open project previews
- Admin starter dashboard (`admin.html`) to add/edit/delete projects
- Profile links form for email, WhatsApp, Instagram and Behance
- Responsive layout for desktop and mobile

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a browser, or use VS Code's Live Server extension.
3. Open `admin.html` to manage sample projects.

## Important limitations of this starter
The admin dashboard uses `localStorage`. This is a prototype only:
- Changes are saved only in the current browser and device.
- Public visitors will not see projects added from your browser.
- There is no real authentication. Do not treat the admin page as secure.
- Local file uploads are limited to small files because browser storage is limited.
- Sample projects are placeholders and should be replaced with your real work.

## Production upgrade for shared uploads
For a public portfolio where admin uploads are visible to every visitor:
1. Create a Supabase project.
2. Use Supabase Auth for admin sign-in (restrict access to your own account).
3. Create a `projects` table with fields such as `id`, `title`, `category`, `description`, `year`, `media_url`, `media_type`, `created_at`.
4. Create a Supabase Storage bucket for portfolio media.
5. Configure Row Level Security so public visitors can read published projects but only your authenticated admin can create, update and delete them.
6. Move the admin form and public gallery to use Supabase instead of `localStorage`.
Never put a Supabase service-role key in browser JavaScript.

## Deploy to Vercel
1. Create a GitHub repository and upload the extracted project files to the repository root.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import the GitHub repository.
4. For a plain static site, use no build command and no framework preset if Vercel asks; the root directory should contain `index.html`.
5. Deploy. Vercel will provide a `*.vercel.app` URL.
6. After making changes, push them to GitHub and Vercel will redeploy automatically.

## Before launch
- Replace `hello@example.com` and social links with your real contact details in the admin profile form.
- Replace the sample project placeholders with your actual portfolio images.
- Add a real backend and secure authentication before exposing project management publicly.
