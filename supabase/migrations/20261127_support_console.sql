-- Support console v1 (2026-11-27)
--
-- Two-way message thread, AI suggestions prepared on arrival, an editable KB and
-- saved replies. Applied by hand on core-db (self-hosted Supabase); idempotent.
--
-- support_tickets / ticket_replies have no CREATE TABLE anywhere: they were made
-- in the SQL editor. Their live shape was read on 2026-11-27 before writing this.
-- ticket_replies stays the write target of the reply path until it is retired;
-- support_messages is dual-written next to it.

begin;

-- 1. Ticket timing columns for the queue views ---------------------------------
alter table public.support_tickets
  add column if not exists last_inbound_at  timestamptz,
  add column if not exists last_outbound_at timestamptz,
  add column if not exists snoozed_until    timestamptz;

-- 2. Messages in both directions ----------------------------------------------
create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  direction   text not null check (direction in ('in', 'out', 'note')),
  channel     text not null check (channel in ('telegram', 'email', 'web', 'whatsapp', 'internal')),
  body        text not null,
  author      text,
  external_id text,
  status      text not null default 'sent' check (status in ('received', 'sent', 'failed')),
  error       text,
  reply_id    uuid references public.ticket_replies(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists support_messages_ticket_created_idx
  on public.support_messages (ticket_id, created_at);
-- A Telegram update or email Message-ID is stored once, so a bot retry cannot duplicate it.
create unique index if not exists support_messages_channel_external_idx
  on public.support_messages (channel, external_id) where external_id is not null;

-- 3. AI suggestions ------------------------------------------------------------
create table if not exists public.support_suggestions (
  id                  uuid primary key default gen_random_uuid(),
  ticket_id           uuid not null references public.support_tickets(id) on delete cascade,
  based_on_message_id uuid references public.support_messages(id) on delete set null,
  status              text not null default 'ready'
                        check (status in ('ready', 'sent', 'dismissed', 'stale', 'failed')),
  brief               jsonb,
  draft               text,
  locale              text,
  citation_ids        text[] not null default '{}',
  link_ids            text[] not null default '{}',
  actions             jsonb  not null default '[]'::jsonb,
  missing_facts       text[] not null default '{}',
  needs_review        boolean not null default true,
  model               text,
  error               text,
  sent_at             timestamptz,
  sent_by             text,
  created_at          timestamptz not null default now()
);

create index if not exists support_suggestions_ticket_created_idx
  on public.support_suggestions (ticket_id, created_at desc);
-- At most one live suggestion per ticket; preparing a new one marks the old one stale first.
create unique index if not exists support_suggestions_one_ready_idx
  on public.support_suggestions (ticket_id) where status = 'ready';

-- 4. Knowledge base ------------------------------------------------------------
create table if not exists public.support_kb_articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null check (slug ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  locale      text not null default 'en' check (locale ~ '^[a-z]{2}(-[A-Za-z]{2,4})?$'),
  category    text not null default 'general',
  platforms   text[] not null default '{}',
  title       text not null check (char_length(title) between 1 and 200),
  body        text not null check (char_length(body) between 1 and 12000),
  status      text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  source      text,
  version     text not null default to_char(now() at time zone 'utc', 'YYYY-MM-DD'),
  updated_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (slug, locale)
);

-- 5. Saved replies (macros) ----------------------------------------------------
create table if not exists public.support_macros (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 120),
  body        text not null check (char_length(body) between 1 and 8000),
  locale      text not null default 'ru',
  link_ids    text[] not null default '{}',
  use_count   integer not null default 0,
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 6. Server-only access, as with every other support table ---------------------
alter table public.support_messages    enable row level security;
alter table public.support_suggestions enable row level security;
alter table public.support_kb_articles enable row level security;
alter table public.support_macros      enable row level security;

revoke all on public.support_messages, public.support_suggestions,
              public.support_kb_articles, public.support_macros
  from anon, authenticated;
grant all on public.support_messages, public.support_suggestions,
             public.support_kb_articles, public.support_macros
  to service_role;

-- 7. Backfill the thread from what exists today -------------------------------
-- The ticket description is the customer's first message.
insert into public.support_messages (ticket_id, direction, channel, body, author, status, created_at)
select t.id, 'in',
       case when t.source = 'telegram' then 'telegram' else 'web' end,
       t.description,
       coalesce(nullif(t.telegram_username, ''), t.contact_email, t.telegram_name),
       'received',
       coalesce(t.created_at, now())
from public.support_tickets t
where not exists (
  select 1 from public.support_messages m where m.ticket_id = t.id and m.direction = 'in'
);

-- Every admin reply so far.
insert into public.support_messages (ticket_id, direction, channel, body, author, status, error, reply_id, created_at)
select r.ticket_id, 'out',
       case when r.to_email like 'telegram:%' then 'telegram' else 'email' end,
       r.body, r.admin_email,
       case when r.status = 'failed' then 'failed' else 'sent' end,
       r.error, r.id, r.created_at
from public.ticket_replies r
where not exists (select 1 from public.support_messages m where m.reply_id = r.id);

update public.support_tickets t
set last_inbound_at = coalesce(t.last_inbound_at, t.created_at),
    last_outbound_at = coalesce(
      t.last_outbound_at,
      (select max(r.created_at) from public.ticket_replies r
        where r.ticket_id = t.id and r.status = 'sent'))
where t.last_inbound_at is null;

commit;

notify pgrst, 'reload schema';
