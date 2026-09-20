-- 008_language_carryover.sql
--
-- @DopplerSupportBot v2 (grammy) reads telegram_users.language_code; the n8n bot it
-- replaces stored the user's choice in telegram_users.preferred_language. Without this,
-- everyone who picked a language in the old bot silently falls back to their Telegram
-- client locale.
--
-- v2 serves two languages. Russian-adjacent locales map to Russian (the same set as
-- RU_LIKE in doppler-support-bot/src/i18n/index.ts); everything else maps to English.
--
-- Rows with preferred_language IS NULL are left alone: their language_code already holds
-- the Telegram-detected value, which is what v2 would pick anyway.
--
-- Idempotent: safe to run more than once. Apply by hand in the Supabase SQL editor.

update public.telegram_users
   set language_code = case
         when left(preferred_language, 2) in ('ru','uk','be','kk','uz','ky','tg','hy','az','ka')
           then 'ru'
         else 'en'
       end,
       updated_at = now()
 where preferred_language is not null
   and language_code is distinct from (
         case
           when left(preferred_language, 2) in ('ru','uk','be','kk','uz','ky','tg','hy','az','ka')
             then 'ru'
           else 'en'
         end
       );

-- Anything v2 has no locale for must not survive as a stored preference: normalizeLang()
-- would resolve it at read time, but leaving it in the column keeps the drift alive.
update public.telegram_users
   set language_code = case
         when left(language_code, 2) in ('ru','uk','be','kk','uz','ky','tg','hy','az','ka')
           then 'ru'
         else 'en'
       end,
       updated_at = now()
 where language_code is not null
   and language_code not in ('en','ru');

-- Expected after running: language_code is only ever 'en' or 'ru'.
--   select language_code, count(*) from public.telegram_users group by 1 order by 2 desc;
