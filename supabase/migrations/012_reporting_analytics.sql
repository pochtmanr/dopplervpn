-- Additive analytics cache. Payment and entitlement tables are untouched.

CREATE TABLE IF NOT EXISTS reporting_analytics_revisions (
  provider text NOT NULL,
  report text NOT NULL,
  grain_key text NOT NULL,
  revision integer NOT NULL CHECK (revision >= 1),
  content_hash text NOT NULL,
  source_timezone text NOT NULL,
  source_date text,
  source_as_of timestamptz NOT NULL,
  retrieved_at timestamptz NOT NULL,
  data_state text NOT NULL,
  body jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (provider, report, grain_key, revision)
);

CREATE INDEX IF NOT EXISTS reporting_analytics_revisions_report_idx
  ON reporting_analytics_revisions (provider, report, source_date);

CREATE TABLE IF NOT EXISTS reporting_analytics_drain_batches (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id text,
  retry_count integer,
  received_at timestamptz NOT NULL DEFAULT now(),
  body jsonb NOT NULL
);

ALTER TABLE reporting_analytics_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_analytics_drain_batches ENABLE ROW LEVEL SECURITY;
