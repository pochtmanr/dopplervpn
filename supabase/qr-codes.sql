-- QR code marketing campaigns (admin panel creates, landing /q/[slug] redirects)
-- New objects only: no existing tables, RLS policies, views, or grants are modified.

create table public.qr_codes (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  target_url   text not null,
  style        jsonb not null default '{}'::jsonb,
  scan_count   integer not null default 0,
  last_scan_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS on with zero policies: anon/authenticated can do nothing; service_role bypasses RLS.
alter table public.qr_codes enable row level security;

-- Atomic scan count increment + target lookup in one round trip.
create or replace function public.track_qr_scan(p_slug text)
returns text
language sql
security definer
set search_path = public
as $$
  update qr_codes
     set scan_count = scan_count + 1,
         last_scan_at = now()
   where slug = p_slug
  returning target_url;
$$;

-- New functions get EXECUTE for public by default — restrict to service_role only.
revoke execute on function public.track_qr_scan(text) from public, anon, authenticated;
grant execute on function public.track_qr_scan(text) to service_role;
