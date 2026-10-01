-- Service-role only durable editorial coordination. Public readers never see briefs.
CREATE TABLE IF NOT EXISTS public.editorial_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_key text UNIQUE NOT NULL,
 payload_hash text NOT NULL,
 topic_fingerprint text UNIQUE NOT NULL,
 post_id uuid UNIQUE REFERENCES public.blog_posts(id),
 state text NOT NULL DEFAULT 'claimed' CHECK (state IN ('claimed','draft','held','reviewed','published','translating','revalidation_failed','ready','distributed','failed')),
 brief jsonb NOT NULL,
 quality jsonb,
 requested_locales jsonb NOT NULL,
 attempts integer NOT NULL DEFAULT 0,
 last_error text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.editorial_stage_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 job_id uuid NOT NULL REFERENCES public.editorial_jobs(id),
 stage text NOT NULL,
 status text NOT NULL,
 details jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.editorial_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_stage_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.editorial_jobs, public.editorial_stage_events FROM anon, authenticated;
GRANT ALL ON public.editorial_jobs, public.editorial_stage_events TO service_role;
CREATE TABLE IF NOT EXISTS public.editorial_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 job_id uuid NOT NULL REFERENCES public.editorial_jobs(id),
 locale text NOT NULL,
 channel_id text NOT NULL,
 status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending','delivered','failed','unknown')),
 message_id bigint,
 payload_hash text NOT NULL,
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(job_id,channel_id)
);
ALTER TABLE public.editorial_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.editorial_deliveries FROM anon, authenticated;
GRANT ALL ON public.editorial_deliveries TO service_role;
-- Lock the post/locale before recording an attempt, including concurrent calls.
CREATE OR REPLACE FUNCTION public.claim_editorial_translation(p_post_id uuid, p_locale text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_post_id::text || ':' || p_locale, 0));
 UPDATE translation_jobs SET status='failed', error_message='expired_processing_lease', completed_at=now()
 WHERE post_id=p_post_id AND locale=p_locale AND status='processing' AND created_at < now()-interval '15 minutes';
 IF EXISTS (SELECT 1 FROM translation_jobs WHERE post_id=p_post_id AND locale=p_locale AND status='processing') THEN
  RAISE EXCEPTION 'Locale already processing';
 END IF;
 IF (SELECT count(*) FROM translation_jobs WHERE post_id=p_post_id AND locale=p_locale AND status='failed') >= 3 THEN
  RAISE EXCEPTION 'Locale attempt limit reached';
 END IF;
 IF (SELECT coalesce(sum(tokens_used),0) FROM translation_jobs WHERE post_id=p_post_id) >= 400000 THEN
  RAISE EXCEPTION 'Post token spending bound reached';
 END IF;
 INSERT INTO translation_jobs(post_id,locale,status) VALUES(p_post_id,p_locale,'processing') RETURNING id INTO v_id;
 RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.claim_editorial_translation(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_editorial_translation(uuid,text) TO service_role;
