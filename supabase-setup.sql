-- Run this whole file in Supabase Dashboard -> SQL Editor -> New query.
-- IMPORTANT: replace YOUR_ADMIN_EMAIL_HERE with the same email you set in config.js.
-- Then create a Supabase Auth user with that email in Authentication -> Users.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text default '',
  year text default '',
  media_url text,
  media_type text not null default 'image' check (media_type in ('image','video')),
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_profile (
  id integer primary key check (id = 1),
  email text default '',
  whatsapp text default '',
  instagram text default '',
  behance text default '',
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.site_profile enable row level security;

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects" on public.projects for select to anon, authenticated using (true);
drop policy if exists "Admin can insert projects" on public.projects;
create policy "Admin can insert projects" on public.projects for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');
drop policy if exists "Admin can update projects" on public.projects;
create policy "Admin can update projects" on public.projects for update to authenticated
using ((auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com')
with check ((auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');
drop policy if exists "Admin can delete projects" on public.projects;
create policy "Admin can delete projects" on public.projects for delete to authenticated
using ((auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');

drop policy if exists "Public can read profile" on public.site_profile;
create policy "Public can read profile" on public.site_profile for select to anon, authenticated using (true);
drop policy if exists "Admin can write profile" on public.site_profile;
create policy "Admin can write profile" on public.site_profile for all to authenticated
using ((auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com')
with check ((auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/svg+xml','video/mp4','video/webm','video/ogg'])
on conflict (id) do update set public=true, file_size_limit=52428800,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media" on storage.objects for select to anon, authenticated
using (bucket_id = 'portfolio-media');
drop policy if exists "Admin can upload portfolio media" on storage.objects;
create policy "Admin can upload portfolio media" on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-media' and (auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');
drop policy if exists "Admin can update portfolio media" on storage.objects;
create policy "Admin can update portfolio media" on storage.objects for update to authenticated
using (bucket_id = 'portfolio-media' and (auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com')
with check (bucket_id = 'portfolio-media' and (auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');
drop policy if exists "Admin can delete portfolio media" on storage.objects;
create policy "Admin can delete portfolio media" on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-media' and (auth.jwt() ->> 'email') = 'smadhurageeth@gmail.com');
