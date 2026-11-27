-- Alerts for customer replies inside an existing ticket.
--
-- Marcus (doppler-admin-bot ticket-notifier) already announces new tickets by polling
-- support_tickets.telegram_notified_at. A customer answering inside a ticket (Telegram
-- conversation mode, doppler-support-bot) writes a support_messages row with direction
-- 'in'; this column is the same "announced yet?" stamp for those rows.
--
-- Every existing row is stamped so applying this does not replay the backlog as alerts.
-- Safe to run twice.

begin;

alter table public.support_messages
  add column if not exists notified_at timestamptz;

update public.support_messages
   set notified_at = now()
 where notified_at is null;

create index if not exists support_messages_unnotified_in_idx
  on public.support_messages (created_at)
  where direction = 'in' and notified_at is null;

commit;
