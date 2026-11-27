-- Every ticket's description is the first message of its thread.
--
-- 20261127_support_console.sql backfilled that opening message once, but nothing created it
-- for tickets opened afterwards (the support bot, the website and the Mini App all insert only
-- into support_tickets), so new tickets showed "No messages yet" in the console. A trigger
-- covers every writer at once.
--
-- notified_at is stamped because the ticket itself is announced through
-- support_tickets.telegram_notified_at; without it Marcus would also announce the opening
-- message as a customer reply (20261128_support_message_alerts.sql).
--
-- security definer: a ticket insert must never fail because the inserting role lacks
-- rights on support_messages. Safe to run twice.

begin;

create or replace function public.support_ticket_opening_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.support_messages (ticket_id, direction, channel, body, author, status, created_at, notified_at)
  values (
    new.id,
    'in',
    case when new.source = 'telegram' then 'telegram' else 'web' end,
    coalesce(nullif(btrim(new.description), ''), nullif(btrim(new.subject), ''), '(no text)'),
    coalesce(nullif(new.telegram_username, ''), new.contact_email, new.telegram_name),
    'received',
    coalesce(new.created_at, now()),
    now()
  );
  return new;
end;
$$;

revoke all on function public.support_ticket_opening_message() from public, anon, authenticated;

drop trigger if exists support_ticket_opening_message on public.support_tickets;
create trigger support_ticket_opening_message
  after insert on public.support_tickets
  for each row execute function public.support_ticket_opening_message();

-- Tickets opened between the first backfill and this trigger.
insert into public.support_messages (ticket_id, direction, channel, body, author, status, created_at, notified_at)
select t.id, 'in',
       case when t.source = 'telegram' then 'telegram' else 'web' end,
       coalesce(nullif(btrim(t.description), ''), nullif(btrim(t.subject), ''), '(no text)'),
       coalesce(nullif(t.telegram_username, ''), t.contact_email, t.telegram_name),
       'received',
       coalesce(t.created_at, now()),
       now()
from public.support_tickets t
where not exists (
  select 1 from public.support_messages m where m.ticket_id = t.id and m.direction = 'in'
);

commit;
