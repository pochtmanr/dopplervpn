-- 007_support_bot.sql
-- Telegram support bot (@DopplerSupportBot, doppler-support-bot/):
--   * support_tickets can come from Telegram (no email required)
--   * one-time tokens that let an app prove account ownership to the bot
--   * telegram_users remembers whether the linked account was verified
-- Idempotent: safe to paste into the Supabase SQL editor more than once.

-- ─── support_tickets ────────────────────────────────────────────────
alter table public.support_tickets add column if not exists source text not null default 'web';
alter table public.support_tickets add column if not exists telegram_user_id bigint;
alter table public.support_tickets add column if not exists telegram_username text;
alter table public.support_tickets add column if not exists telegram_name text;
alter table public.support_tickets add column if not exists lang text;

alter table public.support_tickets alter column contact_email drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'support_tickets_source_check') then
    alter table public.support_tickets
      add constraint support_tickets_source_check check (source in ('web', 'telegram'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'support_tickets_contact_check') then
    alter table public.support_tickets
      add constraint support_tickets_contact_check
      check (contact_email is not null or telegram_user_id is not null) not valid;
  end if;
end $$;

create index if not exists support_tickets_telegram_user_idx
  on public.support_tickets (telegram_user_id) where telegram_user_id is not null;

-- ─── telegram_users ─────────────────────────────────────────────────
alter table public.telegram_users add column if not exists account_verified boolean not null default false;

-- ─── account_link_tokens ────────────────────────────────────────────
-- The app mints a token (only its sha256 is stored) and opens
-- t.me/DopplerSupportBot?start=link_<token>; the bot redeems it once.
create table if not exists public.account_link_tokens (
  token_hash          text primary key,
  account_id          text not null,            -- accounts.account_id (VPN-XXXX-XXXX-XXXX)
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null default now() + interval '10 minutes',
  used_at             timestamptz,
  used_by_telegram_id bigint
);

alter table public.account_link_tokens enable row level security;
-- No policies: only the service role (which bypasses RLS) can touch it.

create index if not exists account_link_tokens_expires_idx on public.account_link_tokens (expires_at);

-- ─── redeem_link_token ──────────────────────────────────────────────
-- Returns the linked account_id, or raises 'invalid' / 'expired' / 'used'.
create or replace function public.redeem_link_token(p_token text, p_tg_id bigint)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row public.account_link_tokens%rowtype;
  v_account public.accounts%rowtype;
begin
  select * into v_row
  from public.account_link_tokens
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;

  if not found then raise exception 'invalid'; end if;
  if v_row.used_at is not null then raise exception 'used'; end if;
  if v_row.expires_at < now() then raise exception 'expired'; end if;

  select * into v_account from public.accounts where account_id = v_row.account_id;
  if not found then raise exception 'invalid'; end if;

  update public.account_link_tokens
     set used_at = now(), used_by_telegram_id = p_tg_id
   where token_hash = v_row.token_hash;

  -- Detach this Telegram id from any other account it was verified on.
  update public.accounts
     set contact_method = null, contact_value = null, contact_verified = false, updated_at = now()
   where contact_method = 'telegram' and contact_value = p_tg_id::text and id <> v_account.id;

  update public.accounts
     set contact_method = 'telegram', contact_value = p_tg_id::text, contact_verified = true, updated_at = now()
   where id = v_account.id;

  update public.telegram_users
     set account_id = v_account.id, account_code = v_account.account_id,
         account_verified = true, updated_at = now()
   where telegram_id = p_tg_id;

  return v_account.account_id;
end $$;

revoke all on function public.redeem_link_token(text, bigint) from public, anon, authenticated;
grant execute on function public.redeem_link_token(text, bigint) to service_role;
