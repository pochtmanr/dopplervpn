-- Business inquiries ride on support_tickets (topic = 'business') so status,
-- admin notes, email replies, the n8n Telegram notifier and dashboard counts
-- all work unchanged. Written by POST /api/support/business-inquiry.

BEGIN;

-- The topic CHECK was declared inline, so its name is whatever Postgres chose.
-- Drop every CHECK that mentions topic rather than guessing the name.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.support_tickets'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%topic%'
  LOOP
    EXECUTE format('ALTER TABLE public.support_tickets DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_topic_check CHECK (topic IN (
    'connection_issues', 'subscription_billing', 'account', 'feature_request', 'other', 'business'
  ));

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS inquiry_type    text,
  ADD COLUMN IF NOT EXISTS company_name    text,
  ADD COLUMN IF NOT EXISTS industry        text,
  ADD COLUMN IF NOT EXISTS contact_name    text,
  ADD COLUMN IF NOT EXISTS company_website text;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_inquiry_type_check CHECK (
    inquiry_type IS NULL OR inquiry_type IN ('partnership', 'enterprise', 'press', 'reseller', 'other')
  ),
  ADD CONSTRAINT support_tickets_industry_check CHECK (
    industry IS NULL OR industry IN (
      'tech_saas', 'media_press', 'finance', 'education', 'healthcare', 'travel',
      'retail_ecommerce', 'government_ngo', 'telecom_isp', 'other'
    )
  ),
  ADD CONSTRAINT support_tickets_business_lengths_check CHECK (
    (company_name IS NULL OR char_length(company_name) <= 120)
    AND (contact_name IS NULL OR char_length(contact_name) <= 120)
    AND (company_website IS NULL OR char_length(company_website) <= 255)
  ),
  ADD CONSTRAINT support_tickets_business_fields_check CHECK (
    topic <> 'business' OR (company_name IS NOT NULL AND inquiry_type IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS support_tickets_business_created_idx
  ON public.support_tickets (created_at DESC)
  WHERE topic = 'business';

COMMIT;

-- Verify:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'public.support_tickets'::regclass AND contype = 'c';
