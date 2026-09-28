-- Canonical financial observations for Doppler reporting.
-- Additive only: new tables, no changes to payment or entitlement tables.
-- Service role reads and writes. No anon or authenticated policies.

CREATE TABLE IF NOT EXISTS reporting_transports (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_system text NOT NULL,
  transport_id text NOT NULL,
  payload_hash text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('production', 'sandbox', 'unknown')),
  external_object_id text NOT NULL,
  economic_transaction_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  body jsonb NOT NULL,
  UNIQUE (source_system, transport_id)
);

CREATE TABLE IF NOT EXISTS reporting_quarantine (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_system text NOT NULL,
  transport_id text NOT NULL,
  payload_hash text NOT NULL,
  reason text NOT NULL,
  environment text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  body jsonb NOT NULL,
  UNIQUE (source_system, transport_id)
);

CREATE TABLE IF NOT EXISTS reporting_records (
  record_id text NOT NULL,
  revision integer NOT NULL CHECK (revision >= 1),
  change_sequence bigint NOT NULL,
  record_type text NOT NULL,
  economic_transaction_id text NOT NULL,
  environment text NOT NULL,
  status text NOT NULL,
  occurred_at timestamptz NOT NULL,
  content_hash text NOT NULL,
  body jsonb NOT NULL,
  PRIMARY KEY (record_id, revision),
  UNIQUE (change_sequence)
);

CREATE INDEX IF NOT EXISTS reporting_records_economic_idx
  ON reporting_records (economic_transaction_id, revision);

CREATE INDEX IF NOT EXISTS reporting_records_occurred_idx
  ON reporting_records (environment, occurred_at);

CREATE SEQUENCE IF NOT EXISTS reporting_change_sequence AS bigint;

CREATE TABLE IF NOT EXISTS reporting_import_checkpoints (
  source_key text PRIMARY KEY,
  cursor_created_at timestamptz,
  cursor_id text,
  covered_through timestamptz,
  lease_owner text,
  lease_until timestamptz,
  retry_count integer NOT NULL DEFAULT 0,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reporting_snapshots (
  snapshot_id text PRIMARY KEY,
  environment text NOT NULL,
  data_as_of timestamptz NOT NULL,
  high_watermark bigint NOT NULL,
  formula_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reporting_fx_evidence (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  economic_transaction_id text NOT NULL,
  policy_version text NOT NULL,
  rate text,
  rate_source text,
  effective_at timestamptz,
  source_amount text,
  source_currency text,
  reason text NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reporting_transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_quarantine ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_import_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_fx_evidence ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION reporting_allocate_change_sequence()
RETURNS text
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT nextval('reporting_change_sequence')::text;
$$;

CREATE OR REPLACE FUNCTION reporting_acquire_lease(
  p_source text,
  p_owner text,
  p_now timestamptz,
  p_ttl_ms integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  acquired boolean := false;
BEGIN
  INSERT INTO reporting_import_checkpoints (source_key, lease_owner, lease_until)
  VALUES (p_source, p_owner, p_now + make_interval(secs => p_ttl_ms / 1000.0))
  ON CONFLICT (source_key) DO UPDATE
    SET lease_owner = EXCLUDED.lease_owner,
        lease_until = EXCLUDED.lease_until,
        updated_at = now()
    WHERE reporting_import_checkpoints.lease_until IS NULL
       OR reporting_import_checkpoints.lease_until < p_now
       OR reporting_import_checkpoints.lease_owner = p_owner
  RETURNING true INTO acquired;
  RETURN coalesce(acquired, false);
END;
$$;

CREATE OR REPLACE FUNCTION reporting_commit_plan(p_plan jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  transport jsonb := p_plan->'transport';
  quarantine jsonb := p_plan->'quarantine';
  existing_hash text;
  item jsonb;
  expected_revision integer;
  current_revision integer;
  record_body jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_plan->>'lock_key'));

  IF transport IS NOT NULL AND transport <> 'null'::jsonb THEN
    SELECT payload_hash INTO existing_hash
    FROM reporting_transports
    WHERE source_system = transport->>'source_system'
      AND transport_id = transport->>'transport_id';
    IF FOUND THEN
      IF existing_hash IS DISTINCT FROM transport->>'payload_hash' THEN
        RAISE EXCEPTION 'conflict' USING ERRCODE = 'P0001';
      END IF;
      RETURN jsonb_build_object('status', 'duplicate');
    END IF;
  END IF;

  FOR item IN
    SELECT value FROM jsonb_array_elements(coalesce(p_plan->'inserts', '[]'::jsonb))
  LOOP
    record_body := item->'record';
    expected_revision := NULLIF(item->>'expected_previous_revision', '')::integer;
    SELECT max(revision) INTO current_revision
    FROM reporting_records
    WHERE record_id = record_body->>'record_id';
    IF expected_revision IS NULL AND current_revision IS NOT NULL THEN
      RAISE EXCEPTION 'conflict' USING ERRCODE = 'P0001';
    END IF;
    IF expected_revision IS NOT NULL AND current_revision IS DISTINCT FROM expected_revision THEN
      RAISE EXCEPTION 'conflict' USING ERRCODE = 'P0001';
    END IF;
  END LOOP;

  IF transport IS NOT NULL AND transport <> 'null'::jsonb THEN
    INSERT INTO reporting_transports (
      source_system, transport_id, payload_hash, environment,
      external_object_id, economic_transaction_id, body
    ) VALUES (
      transport->>'source_system',
      transport->>'transport_id',
      transport->>'payload_hash',
      transport->>'environment',
      transport->>'external_object_id',
      transport->>'economic_transaction_id',
      coalesce(transport->'body', '{}'::jsonb)
    );
  END IF;

  IF quarantine IS NOT NULL AND quarantine <> 'null'::jsonb THEN
    INSERT INTO reporting_quarantine (
      source_system, transport_id, payload_hash, reason, environment, body
    ) VALUES (
      quarantine->>'source_system',
      quarantine->>'transport_id',
      quarantine->>'payload_hash',
      quarantine->>'reason',
      quarantine->>'environment',
      coalesce(quarantine->'body', '{}'::jsonb)
    );
  END IF;

  FOR item IN
    SELECT value FROM jsonb_array_elements(coalesce(p_plan->'inserts', '[]'::jsonb))
  LOOP
    record_body := item->'record';
    INSERT INTO reporting_records (
      record_id, revision, change_sequence, record_type, economic_transaction_id,
      environment, status, occurred_at, content_hash, body
    ) VALUES (
      record_body->>'record_id',
      (record_body->>'revision')::integer,
      (record_body->>'change_sequence')::bigint,
      record_body->>'record_type',
      record_body->>'economic_transaction_id',
      record_body->>'environment',
      record_body->>'status',
      (record_body->>'occurred_at')::timestamptz,
      record_body->>'content_hash',
      record_body
    );
  END LOOP;

  FOR item IN
    SELECT value FROM jsonb_array_elements(coalesce(p_plan->'fx', '[]'::jsonb))
  LOOP
    INSERT INTO reporting_fx_evidence (
      economic_transaction_id, policy_version, rate, rate_source, effective_at,
      source_amount, source_currency, reason
    ) VALUES (
      item->>'economic_transaction_id',
      item->>'policy_version',
      NULLIF(item->>'rate', ''),
      NULLIF(item->>'rate_source', ''),
      NULLIF(item->>'effective_at', '')::timestamptz,
      NULLIF(item->>'source_amount', ''),
      NULLIF(item->>'source_currency', ''),
      item->>'reason'
    );
  END LOOP;

  RETURN jsonb_build_object('status', 'ok');
EXCEPTION
  WHEN unique_violation OR SQLSTATE 'P0001' THEN
    RETURN jsonb_build_object('status', 'conflict');
END;
$$;

REVOKE ALL ON FUNCTION reporting_allocate_change_sequence() FROM PUBLIC;
REVOKE ALL ON FUNCTION reporting_acquire_lease(text, text, timestamptz, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION reporting_commit_plan(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reporting_allocate_change_sequence() TO service_role;
GRANT EXECUTE ON FUNCTION reporting_acquire_lease(text, text, timestamptz, integer) TO service_role;
GRANT EXECUTE ON FUNCTION reporting_commit_plan(jsonb) TO service_role;
