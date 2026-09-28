-- Machine-auth nonce ledger for the Business OS export.
-- Additive only. Payment and entitlement tables are not touched.
-- Service role calls reporting_claim_bos_nonce. No anon or authenticated policies.

CREATE TABLE IF NOT EXISTS reporting_bos_nonces (
  key_id text NOT NULL,
  nonce text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key_id, nonce)
);

ALTER TABLE reporting_bos_nonces ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION reporting_claim_bos_nonce(
  p_key_id text,
  p_nonce text,
  p_expires_at timestamptz,
  p_rate_window_seconds integer,
  p_rate_limit integer
) RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  inserted_count integer;
  recent integer;
BEGIN
  DELETE FROM reporting_bos_nonces WHERE expires_at <= now();

  INSERT INTO reporting_bos_nonces (key_id, nonce, expires_at)
  VALUES (p_key_id, p_nonce, p_expires_at)
  ON CONFLICT (key_id, nonce) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 0 THEN
    RETURN 'replayed';
  END IF;

  SELECT count(*) INTO recent
  FROM reporting_bos_nonces
  WHERE key_id = p_key_id
    AND created_at >= now() - make_interval(secs => p_rate_window_seconds);

  IF recent > p_rate_limit THEN
    RETURN 'rate_limited';
  END IF;

  RETURN 'claimed';
END;
$$;

REVOKE ALL ON FUNCTION reporting_claim_bos_nonce(text, text, timestamptz, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reporting_claim_bos_nonce(text, text, timestamptz, integer, integer) TO service_role;
