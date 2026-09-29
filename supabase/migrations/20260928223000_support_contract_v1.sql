-- Support contract v1.
--
-- Order: after the numbered reporting migrations (011_reporting_*, 012_reporting_*)
-- and after the latest applied Supabase migration oxapay_invoice_promo
-- (20260922165425). The checked-in 011 files are reporting migrations. They are
-- not a support `channel` column. This file does not add `channel`.
-- `source` stays the ingress (web, telegram). `preferred_reply_channel` is the
-- reply preference.
--
-- This file is not applied by the change that added it. Do not deploy writers
-- that insert these columns until it has been applied to Doppler VPN
-- (fzlrhmjdjjzcgstaeblu).
--
-- Additive. Existing topic values stay. `subscription_billing` is not backfilled
-- into payment or subscription. Business rows stay business. No ticket, account,
-- or payment row is deleted.
--
-- Rollback (run only if no new topic values have been stored; dropping columns
-- discards the new fields):
--   alter table public.support_tickets drop constraint if exists support_tickets_issue_category_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_device_platform_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_preferred_reply_channel_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_preference_destination_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_whatsapp_e164_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_contract_lengths_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_contact_check;
--   alter table public.support_tickets drop constraint if exists support_tickets_topic_check;
--   drop index if exists support_tickets_client_request_idx;
--   alter table public.support_tickets
--     drop column if exists issue_category,
--     drop column if exists device_platform,
--     drop column if exists preferred_reply_channel,
--     drop column if exists whatsapp_e164,
--     drop column if exists reply_contact_verified,
--     drop column if exists association_verified,
--     drop column if exists privacy_notice_version,
--     drop column if exists privacy_notice_acknowledged_at,
--     drop column if exists payment_provider,
--     drop column if exists payment_order_ref,
--     drop column if exists client_request_id;
--   drop table if exists public.support_contact_removal_requests;
--   alter table public.support_tickets
--     add constraint support_tickets_topic_check check (topic in (
--       'connection_issues', 'subscription_billing', 'account', 'feature_request', 'other', 'business'
--     ));
--   alter table public.support_tickets
--     add constraint support_tickets_contact_check
--     check (contact_email is not null or telegram_user_id is not null) not valid;
--   alter table public.support_tickets disable row level security;
-- Do not grant support_tickets back to anon or authenticated. Those grants exposed
-- every ticket while row level security was off.

begin;

alter table public.support_tickets
  add column if not exists issue_category text,
  add column if not exists device_platform text,
  add column if not exists preferred_reply_channel text,
  add column if not exists whatsapp_e164 text,
  add column if not exists reply_contact_verified boolean not null default false,
  add column if not exists association_verified boolean not null default false,
  add column if not exists privacy_notice_version text,
  add column if not exists privacy_notice_acknowledged_at timestamptz,
  add column if not exists payment_provider text,
  add column if not exists payment_order_ref text,
  add column if not exists client_request_id uuid;

-- Unambiguous legacy topics only. subscription_billing stays null.
update public.support_tickets
   set issue_category = case topic
     when 'connection_issues' then 'connection'
     when 'account' then 'account'
     when 'feature_request' then 'feature_request'
     when 'other' then 'other'
     when 'business' then 'business'
     else issue_category
   end
 where issue_category is null
   and topic in ('connection_issues', 'account', 'feature_request', 'other', 'business');

alter table public.support_tickets drop constraint if exists support_tickets_topic_check;
alter table public.support_tickets
  add constraint support_tickets_topic_check check (topic in (
    'connection_issues', 'subscription_billing', 'account', 'feature_request', 'other', 'business',
    'payment', 'subscription', 'connection', 'performance', 'app', 'refund', 'privacy'
  ));

alter table public.support_tickets drop constraint if exists support_tickets_issue_category_check;
alter table public.support_tickets
  add constraint support_tickets_issue_category_check check (
    issue_category is null or issue_category in (
      'account', 'payment', 'subscription', 'connection', 'performance', 'app',
      'refund', 'privacy', 'feature_request', 'other', 'business'
    )
  );

alter table public.support_tickets drop constraint if exists support_tickets_device_platform_check;
alter table public.support_tickets
  add constraint support_tickets_device_platform_check check (
    device_platform is null or device_platform in (
      'ios', 'android', 'macos', 'windows', 'web', 'unknown'
    )
  );

alter table public.support_tickets drop constraint if exists support_tickets_preferred_reply_channel_check;
alter table public.support_tickets
  add constraint support_tickets_preferred_reply_channel_check check (
    preferred_reply_channel is null or preferred_reply_channel in ('telegram', 'email', 'whatsapp')
  );

alter table public.support_tickets drop constraint if exists support_tickets_preference_destination_check;
alter table public.support_tickets
  add constraint support_tickets_preference_destination_check check (
    preferred_reply_channel is null
    or (preferred_reply_channel = 'email' and contact_email is not null)
    or (
      preferred_reply_channel = 'telegram'
      and (telegram_user_id is not null or telegram_username is not null)
    )
    or (preferred_reply_channel = 'whatsapp' and whatsapp_e164 is not null)
  );

alter table public.support_tickets drop constraint if exists support_tickets_whatsapp_e164_check;
alter table public.support_tickets
  add constraint support_tickets_whatsapp_e164_check check (
    whatsapp_e164 is null or whatsapp_e164 ~ '^[0-9]{8,15}$'
  );

alter table public.support_tickets drop constraint if exists support_tickets_contract_lengths_check;
alter table public.support_tickets
  add constraint support_tickets_contract_lengths_check check (
    (privacy_notice_version is null or char_length(privacy_notice_version) <= 40)
    and (payment_provider is null or char_length(payment_provider) <= 40)
    and (payment_order_ref is null or char_length(payment_order_ref) <= 80)
    and (telegram_username is null or char_length(telegram_username) <= 32)
  );

-- Looser than the previous check, which every current row already satisfies:
-- email, a Telegram id, a username-only manual contact, or a WhatsApp number.
alter table public.support_tickets drop constraint if exists support_tickets_contact_check;
alter table public.support_tickets
  add constraint support_tickets_contact_check check (
    contact_email is not null
    or telegram_user_id is not null
    or telegram_username is not null
    or whatsapp_e164 is not null
  );

-- Permanent dedupe. There is no shared cache to expire keys in.
create unique index if not exists support_tickets_client_request_idx
  on public.support_tickets (source, client_request_id)
  where client_request_id is not null;

create table if not exists public.support_contact_removal_requests (
  id uuid primary key default gen_random_uuid(),
  account_code text not null,
  account_uuid uuid,
  status text not null default 'pending',
  notice_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_contact_removal_requests_status_check
    check (status in ('pending', 'completed', 'rejected')),
  constraint support_contact_removal_requests_code_check
    check (account_code ~ '^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  constraint support_contact_removal_requests_notice_check
    check (notice_version is null or char_length(notice_version) <= 40)
);

create unique index if not exists support_contact_removal_requests_one_pending
  on public.support_contact_removal_requests (account_code)
  where status = 'pending';

alter table public.support_tickets enable row level security;
alter table public.support_contact_removal_requests enable row level security;

revoke all privileges on table public.support_tickets from anon, authenticated;
revoke all privileges on table public.support_contact_removal_requests from public, anon, authenticated;
grant select, insert, update, delete on table public.support_contact_removal_requests to service_role;

commit;
