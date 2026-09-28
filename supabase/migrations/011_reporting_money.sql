-- D2 durable extension of the doppler-web reporting ledger.
-- D1 currently keeps canonical observations in the in-memory reporting service.
-- These tables store that same finance-record payload, plus local drafts,
-- private receipt bytes, immutable statement files, balance evidence, and
-- frozen Money-page snapshots. Additive only. No public policies: the
-- service role bypasses row level security, and anon/authenticated clients
-- cannot read the rows.
--
-- Private receipt bucket name, not created by this migration and not public:
-- reporting-receipts. Document rows store a checksum and private bytes.
-- They do not store a public URL.

create table if not exists reporting_finance_records (
  record_id text not null,
  revision integer not null check (revision >= 1),
  change_sequence text not null,
  record_type text not null,
  source_system text not null,
  payload jsonb not null,
  primary key (record_id, revision)
);

create unique index if not exists reporting_finance_records_sequence_idx
  on reporting_finance_records (change_sequence);

create table if not exists reporting_money_drafts (
  draft_id text primary key,
  kind text not null,
  status text not null,
  payload jsonb not null,
  record_id text,
  created_at timestamptz not null default now()
);

create table if not exists reporting_money_documents (
  document_id text primary key,
  filename text not null,
  checksum_sha256 text not null,
  bytes bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists reporting_money_statements (
  checksum_sha256 text primary key,
  bytes bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists reporting_money_balances (
  id bigint generated always as identity primary key,
  financial_account_id text not null,
  account_kind text not null,
  as_of timestamptz not null,
  payload jsonb not null
);

create table if not exists reporting_money_snapshots (
  snapshot_id text not null,
  basis text not null,
  period_from timestamptz not null,
  period_to timestamptz not null,
  payload jsonb not null,
  primary key (snapshot_id, basis, period_from, period_to)
);

alter table reporting_finance_records enable row level security;
alter table reporting_money_drafts enable row level security;
alter table reporting_money_documents enable row level security;
alter table reporting_money_statements enable row level security;
alter table reporting_money_balances enable row level security;
alter table reporting_money_snapshots enable row level security;
