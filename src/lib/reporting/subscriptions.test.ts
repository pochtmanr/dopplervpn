import { describe, expect, it } from "vitest";
import { divideDecimals } from "./decimal";
import {
  eventsFromStoredRows,
  reportingFromStoredEvents,
  subscriptionPageView,
  summarizeSubscriptions,
  toOperationsDaily,
  toSubscriptionsSummary,
  type LifecycleEvent,
  type SubscriptionEvidence,
  type SubscriptionWindow,
} from "./subscriptions";

const FROM = "2026-09-01T00:00:00Z";
const TO = "2026-10-01T00:00:00Z";
const AS_OF = "2026-09-15T12:00:00Z";

const window: SubscriptionWindow = {
  from: FROM,
  to: TO,
  asOf: AS_OF,
  snapshotId: "snap-sub-test",
  generatedAt: "2026-09-15T12:00:01Z",
  dataAsOf: AS_OF,
};

function event(overrides: Partial<LifecycleEvent> & Pick<LifecycleEvent, "eventId" | "kind">): LifecycleEvent {
  return {
    occurredAt: "2026-09-02T00:00:00Z",
    contractId: "contract-1",
    accountId: "acct-secret-1",
    productId: "vpn_premium_monthly",
    store: "app_store",
    environment: "production",
    expiresAt: "2026-10-02T00:00:00Z",
    chargedAmount: "6.99",
    currency: "USD",
    phase: "paying",
    billingModel: null,
    ...overrides,
  };
}

function evidence(events: LifecycleEvent[] | null, chargebacks: SubscriptionEvidence["chargebacks"] = []): SubscriptionEvidence {
  return { events, chargebacks };
}

describe("divideDecimals", () => {
  it("returns null for a zero divisor", () => {
    expect(divideDecimals("6.99", "0", 4)).toBeNull();
  });

  it("normalizes an annual price to four decimal places", () => {
    expect(divideDecimals("39.99", "12", 4)).toBe("3.3325");
    expect(divideDecimals("29.99", "6", 4)).toBe("4.9983");
  });
});

describe("summarizeSubscriptions", () => {
  it("excludes fixed-term web access from MRR and still counts paid access", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({
          eventId: "web-1",
          kind: "INITIAL_PURCHASE",
          contractId: "web-1",
          store: "revolut",
          productId: "monthly",
          billingModel: "fixed_term",
          chargedAmount: "6.99",
        }),
      ]),
      window,
    );
    expect(model.activeContracts.value).toBe(0);
    expect(model.paidAccessAccounts.value).toBe(1);
    expect(model.mrr).toMatchObject({ amount: "0.0000", quality: "actual", currency: "USD" });
    const grant = summarizeSubscriptions(
      evidence([
        event({
          eventId: "grant",
          kind: "INITIAL_PURCHASE",
          contractId: "grant",
          store: "admin",
          productId: null,
          chargedAmount: null,
          currency: null,
          phase: null,
        }),
      ]),
      window,
    );
    expect(grant.paidAccessAccounts.value).toBe(0);
    expect(grant.activeContracts.value).toBe(0);
    const stripe = summarizeSubscriptions(
      evidence([
        event({
          eventId: "stripe-1",
          kind: "INITIAL_PURCHASE",
          contractId: "stripe-1",
          store: "stripe",
          productId: "monthly",
          billingModel: null,
          chargedAmount: "6.99",
        }),
      ]),
      window,
    );
    expect(stripe.activeContracts.value).toBe(0);
    expect(stripe.paidAccessAccounts.value).toBe(1);
    expect(stripe.mrr.amount).toBe("0.0000");
  });

  it("normalizes monthly, six-month, and annual recurring prices into MRR and ARR", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({ eventId: "m", kind: "INITIAL_PURCHASE", contractId: "m", chargedAmount: "6.99" }),
        event({
          eventId: "s",
          kind: "INITIAL_PURCHASE",
          contractId: "s",
          accountId: "acct-secret-2",
          productId: "vpn_premium_6m",
          store: "play_store",
          chargedAmount: "29.99",
          expiresAt: "2027-03-02T00:00:00Z",
        }),
        event({
          eventId: "y",
          kind: "INITIAL_PURCHASE",
          contractId: "y",
          accountId: "acct-secret-3",
          productId: "vpn_premium_yearly",
          chargedAmount: "39.99",
          expiresAt: "2027-09-02T00:00:00Z",
        }),
      ]),
      window,
    );
    expect(model.mrr).toMatchObject({
      amount: "15.3208",
      currency: "USD",
      quality: "estimated",
      coverage: "partial",
      reason: "interval_normalization_remainder",
    });
    expect(model.arr).toMatchObject({ amount: "183.8500", quality: "actual", coverage: "complete" });
    expect(model.activeContracts.value).toBe(3);
    expect(model.activeCustomers.value).toBe(3);
  });

  it("uses a list price as estimated MRR when the store event has no charged amount", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({
          eventId: "list",
          kind: "INITIAL_PURCHASE",
          chargedAmount: null,
          currency: null,
          phase: "paying",
        }),
      ]),
      window,
    );
    expect(model.mrr).toMatchObject({
      amount: "6.9900",
      quality: "estimated",
      reason: "list_price_not_charged_amount",
    });
  });

  it("counts a trial conversion when the first paying period starts inside the window", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({
          eventId: "trial",
          kind: "INITIAL_PURCHASE",
          occurredAt: "2026-09-02T00:00:00Z",
          phase: "trial",
          chargedAmount: null,
          currency: null,
          expiresAt: "2026-09-05T00:00:00Z",
        }),
        event({
          eventId: "convert",
          kind: "RENEWAL",
          occurredAt: "2026-09-05T00:00:00Z",
          phase: "paying",
          chargedAmount: "6.99",
          currency: "USD",
          expiresAt: "2026-10-05T00:00:00Z",
        }),
      ]),
      window,
    );
    expect(model.trialConversions.value).toBe(1);
    expect(model.statuses.trial.value).toBe(0);
    expect(model.mrr.amount).toBe("6.9900");
    const duringTrial = summarizeSubscriptions(
      evidence([
        event({
          eventId: "trial",
          kind: "INITIAL_PURCHASE",
          phase: "trial",
          chargedAmount: null,
          currency: null,
          expiresAt: "2026-09-20T00:00:00Z",
        }),
      ]),
      window,
    );
    expect(duringTrial.activeContracts.value).toBe(0);
    expect(duringTrial.paidAccessAccounts.value).toBe(0);
    expect(duringTrial.mrr.amount).toBe("0.0000");
    expect(duringTrial.statuses.trial.value).toBe(1);
  });

  it("keeps a cancelled contract in MRR until access ends", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({ eventId: "buy", kind: "INITIAL_PURCHASE", occurredAt: "2026-08-01T00:00:00Z", expiresAt: "2026-10-20T00:00:00Z" }),
        event({ eventId: "cancel", kind: "CANCELLATION", occurredAt: "2026-09-10T00:00:00Z", expiresAt: "2026-10-20T00:00:00Z" }),
      ]),
      window,
    );
    expect(model.statuses.cancelled_pending_expiry.value).toBe(1);
    expect(model.activeContracts.value).toBe(1);
    expect(model.mrr.amount).toBe("6.9900");
    expect(model.churn.contract.numerator).toBe(0);
    expect(model.churn.contract.denominator).toBe(1);
    expect(model.churn.contract.window_ratio).toBe("0.0000");
  });

  it("keeps grace access and MRR until expiration", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({
          eventId: "buy",
          kind: "INITIAL_PURCHASE",
          occurredAt: "2026-08-01T00:00:00Z",
          expiresAt: "2026-09-14T00:00:00Z",
        }),
        event({
          eventId: "bill",
          kind: "BILLING_ISSUE",
          occurredAt: "2026-09-14T00:00:00Z",
          expiresAt: "2026-09-14T00:00:00Z",
        }),
      ]),
      window,
    );
    expect(model.statuses.grace.value).toBe(1);
    expect(model.activeContracts.value).toBe(1);
    expect(model.paidAccessAccounts.value).toBe(1);
    expect(model.churn.contract.numerator).toBe(1);
    const stillInGrace = summarizeSubscriptions(
      evidence([
        event({
          eventId: "buy",
          kind: "INITIAL_PURCHASE",
          occurredAt: "2026-08-01T00:00:00Z",
          expiresAt: "2026-09-14T00:00:00Z",
        }),
        event({
          eventId: "bill",
          kind: "BILLING_ISSUE",
          occurredAt: "2026-09-14T00:00:00Z",
          expiresAt: "2026-09-14T00:00:00Z",
        }),
      ]),
      { ...window, to: "2026-09-16T00:00:00Z" },
    );
    expect(stillInGrace.churn.contract.numerator).toBe(0);
    expect(stillInGrace.churn.contract.denominator).toBe(1);
  });

  it("ignores a duplicate lifecycle event", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({ eventId: "same", kind: "INITIAL_PURCHASE" }),
        event({ eventId: "same", kind: "INITIAL_PURCHASE", chargedAmount: "100.00" }),
      ]),
      window,
    );
    expect(model.activeContracts.value).toBe(1);
    expect(model.mrr.amount).toBe("6.9900");
    expect(model.operations.buckets.some((bucket) => bucket.flows.some((flow) => flow.name === "new_contracts" && flow.count === 1))).toBe(true);
    const replayed = summarizeSubscriptions(
      evidence([
        event({ eventId: "first", kind: "INITIAL_PURCHASE" }),
        event({ eventId: "second", kind: "INITIAL_PURCHASE" }),
      ]),
      window,
    );
    expect(replayed.activeContracts.value).toBe(1);
    expect(replayed.mrr.amount).toBe("6.9900");
  });

  it("counts two contracts for one customer once as a customer and once as paid access", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({ eventId: "a", kind: "INITIAL_PURCHASE", contractId: "a" }),
        event({ eventId: "b", kind: "INITIAL_PURCHASE", contractId: "b", productId: "vpn_premium_yearly", chargedAmount: "39.99" }),
      ]),
      window,
    );
    expect(model.activeContracts.value).toBe(2);
    expect(model.activeCustomers.value).toBe(1);
    expect(model.paidAccessAccounts.value).toBe(1);
    const page = JSON.stringify(subscriptionPageView(model));
    expect(page).not.toContain("acct-secret-1");
  });

  it("returns null instead of zero when lifecycle events were not supplied", () => {
    const model = summarizeSubscriptions(evidence(null, null), window);
    expect(model.coverage).toBe("missing");
    expect(model.activeContracts).toEqual({ value: null, reason: "missing_subscription_events" });
    expect(model.mrr).toMatchObject({ amount: null, quality: "unavailable", reason: "missing_subscription_events" });
    expect(model.operations.buckets.every((bucket) => bucket.flows.length === 0 && bucket.stocks.length === 0)).toBe(true);
    expect(model.sourceHealth).toContainEqual({ source: "analytics_subscriptions", status: "unverified_no_writer" });
    expect(model.sourceHealth).toContainEqual({ source: "subscription_events", status: "unavailable" });
  });

  it("returns a null churn ratio when the cohort is empty", () => {
    const model = summarizeSubscriptions(evidence([]), window);
    expect(model.churn.contract.denominator).toBe(0);
    expect(model.churn.contract.window_ratio).toBeNull();
    expect(model.churn.contract.reason).toBe("zero_denominator");
    expect(model.mrr.amount).toBe("0.0000");
  });

  it("does not churn a customer who still has another active contract", () => {
    const model = summarizeSubscriptions(
      evidence([
        event({
          eventId: "keep",
          kind: "INITIAL_PURCHASE",
          contractId: "keep",
          occurredAt: "2026-08-01T00:00:00Z",
          expiresAt: "2026-11-01T00:00:00Z",
        }),
        event({
          eventId: "end-buy",
          kind: "INITIAL_PURCHASE",
          contractId: "end",
          occurredAt: "2026-08-01T00:00:00Z",
          expiresAt: "2026-09-10T00:00:00Z",
        }),
        event({
          eventId: "end-exp",
          kind: "EXPIRATION",
          contractId: "end",
          occurredAt: "2026-09-10T00:00:00Z",
        }),
      ]),
      window,
    );
    expect(model.churn.contract).toMatchObject({ numerator: 1, denominator: 2 });
    expect(model.churn.customer).toMatchObject({ numerator: 0, denominator: 1 });
  });

  it("omits chargebacks until a finance snapshot is supplied, then counts a measured zero or a real event", () => {
    const open = summarizeSubscriptions(evidence([], null), window);
    expect(open.operations.buckets.every((bucket) => bucket.flows.every((flow) => flow.name !== "chargeback_events"))).toBe(true);
    const none = summarizeSubscriptions(evidence([]), window);
    expect(none.operations.buckets.every((bucket) => bucket.flows.some((flow) => flow.name === "chargeback_events" && flow.count === 0))).toBe(true);
    const one = summarizeSubscriptions(
      evidence([], [{ recordId: "cb-1", occurredAt: "2026-09-10T00:00:00Z" }, { recordId: "cb-1", occurredAt: "2026-09-10T00:00:00Z" }]),
      window,
    );
    const counted = one.operations.buckets.reduce(
      (sum, bucket) => sum + bucket.flows.filter((flow) => flow.name === "chargeback_events").reduce((inner, flow) => inner + flow.count, 0),
      0,
    );
    expect(counted).toBe(1);
  });

  it("matches the admin view and the export summary at one cutoff", () => {
    const input = evidence([
      event({ eventId: "a", kind: "INITIAL_PURCHASE", contractId: "a" }),
      event({
        eventId: "fixed",
        kind: "NON_RENEWING_PURCHASE",
        contractId: "fixed",
        accountId: "acct-secret-9",
        store: "oxapay",
        productId: "yearly",
        billingModel: "fixed_term",
        chargedAmount: "39.99",
        expiresAt: "2027-09-02T00:00:00Z",
      }),
    ]);
    const first = subscriptionPageView(summarizeSubscriptions(input, window));
    const second = subscriptionPageView(summarizeSubscriptions(input, window));
    expect(first).toEqual(second);
    const summary = toSubscriptionsSummary(summarizeSubscriptions(input, window));
    expect(summary.posting).toBe(false);
    expect(summary.metrics.active_contracts).toEqual(first.active_contracts);
    expect(summary.metrics.paid_access_accounts).toEqual(first.paid_access_accounts);
    expect(summary.metrics.mrr.amount).toBe(first.mrr.amount);
    expect(summary.metrics).not.toHaveProperty("arr");
    expect(JSON.stringify(summary)).not.toContain("acct-secret");
    const london = toOperationsDaily(
      summarizeSubscriptions(input, {
        ...window,
        from: "2026-09-26T23:00:00Z",
        to: "2026-09-27T23:00:00Z",
      }),
    );
    expect(london.buckets).toHaveLength(1);
    expect(london.buckets[0]).toMatchObject({ date: "2026-09-27", partial: false, timezone: "Europe/London" });
    expect(london.buckets[0].stocks[0].as_of).toBe("2026-09-27T22:59:59Z");
    expect(london.buckets[0].stocks.every((stock) => stock.additive === false)).toBe(true);
  });

  it("maps stored webhook rows through the same view and does not invent a zero", () => {
    const rows = [
      {
        id: "row-1",
        event_type: "BILLING_ISSUES",
        account_id: "acct-secret-7",
        original_transaction_id: "txn-1",
        platform: "ios",
        product_id: "vpn_premium_monthly",
        expires_at: "2026-10-02T00:00:00Z",
        details: { period_type: "NORMAL" },
        created_at: "2026-09-14T00:00:00.123Z",
      },
      {
        id: "row-2",
        event_type: "INITIAL_PURCHASE",
        account_id: "acct-secret-7",
        original_transaction_id: "txn-1",
        platform: "ios",
        product_id: "vpn_premium_monthly",
        expires_at: "2026-10-02T00:00:00Z",
        details: null,
        created_at: "2026-08-01T00:00:00Z",
      },
    ];
    const mapped = eventsFromStoredRows(rows);
    expect(mapped.map((item) => item.kind)).toEqual(["BILLING_ISSUE", "INITIAL_PURCHASE"]);
    expect(mapped[0].occurredAt).toBe("2026-09-14T00:00:00Z");
    const view = reportingFromStoredEvents(rows, window, false);
    const direct = subscriptionPageView(summarizeSubscriptions({
      events: mapped,
      chargebacks: null,
    }, window));
    expect(view).toEqual(direct);
    expect(view.mrr.quality).toBe("estimated");
    expect(view.mrr.reason).toBe("list_price_not_charged_amount");
    expect(JSON.stringify(view)).not.toContain("acct-secret-7");
    const missing = reportingFromStoredEvents(null, window, false);
    expect(missing.mrr).toMatchObject({ amount: null, quality: "unavailable" });
    expect(missing.active_contracts.value).toBeNull();
  });

  it("infers trials from the term and drops re-claims and shadow contracts", () => {
    const row = (id: string, type: string, txn: string, created: string, expires: string | null, account = "acct-1") => ({
      id,
      event_type: type,
      account_id: account,
      original_transaction_id: txn,
      platform: "ios",
      product_id: "vpn_premium_monthly",
      expires_at: expires,
      details: null,
      created_at: created,
    });
    const mapped = eventsFromStoredRows([
      row("a", "INITIAL_PURCHASE", "txn-1", "2026-08-01T00:00:00Z", "2026-08-04T00:00:00Z"),
      // app re-claim of the same trial, expiry a few seconds later
      row("b", "RENEWAL", "txn-1", "2026-08-01T00:05:00Z", "2026-08-04T00:00:07Z"),
      // the real conversion: a month past the trial
      row("c", "RENEWAL", "txn-1", "2026-08-04T00:00:00Z", "2026-09-04T00:00:00Z"),
      // synthetic id for the same subscription, from the pre-StoreKit-2 client
      row("d", "INITIAL_PURCHASE", "vpn_premium_monthly_2026-08-01T00:00:00Z", "2026-08-01T00:01:00Z", "2026-08-04T00:00:00Z"),
      // synthetic id with no real contract on the account stays
      row("e", "INITIAL_PURCHASE", "vpn_premium_monthly_2026-08-02T00:00:00Z", "2026-08-02T00:00:00Z", "2026-09-02T00:00:00Z", "acct-2"),
      // Play product ids carry a base plan suffix
      { ...row("f", "INITIAL_PURCHASE", "GPA.1", "2026-08-03T00:00:00Z", "2026-09-03T00:00:00Z", "acct-3"), product_id: "vpn_premium_monthly:vpn-premium-monthly" },
    ]);
    expect(mapped.map((event) => [event.eventId, event.kind, event.phase])).toEqual([
      ["a", "INITIAL_PURCHASE", "trial"],
      ["c", "RENEWAL", "paying"],
      ["e", "INITIAL_PURCHASE", "paying"],
      ["f", "INITIAL_PURCHASE", "paying"],
    ]);
    expect(mapped.at(-1)?.productId).toBe("vpn_premium_monthly");
  });

  it("keeps a stated period_type over the inferred one", () => {
    const [event] = eventsFromStoredRows([{
      id: "a",
      event_type: "INITIAL_PURCHASE",
      account_id: "acct-1",
      original_transaction_id: "txn-1",
      platform: "ios",
      product_id: "vpn_premium_monthly",
      expires_at: "2026-08-04T00:00:00Z",
      details: { period_type: "NORMAL" },
      created_at: "2026-08-01T00:00:00Z",
    }]);
    expect(event.phase).toBe("paying");
  });

  it("does not let a long-ended contract of unknown phase block MRR", () => {
    const window = {
      from: "2026-09-01T00:00:00Z",
      to: "2026-10-01T00:00:00Z",
      asOf: "2026-10-01T00:00:00Z",
      snapshotId: "sub-stale",
      generatedAt: "2026-10-01T00:00:00Z",
      dataAsOf: "2026-10-01T00:00:00Z",
    };
    const view = reportingFromStoredEvents([
      {
        id: "stale",
        event_type: "CANCELLATION",
        account_id: "acct-9",
        original_transaction_id: "GPA.9",
        platform: "android",
        product_id: "vpn_premium_monthly",
        expires_at: "2026-08-13T00:00:00Z",
        details: { cancel_reason: "UNSUBSCRIBE" },
        created_at: "2026-08-01T00:00:00Z",
      },
      {
        id: "live",
        event_type: "INITIAL_PURCHASE",
        account_id: "acct-1",
        original_transaction_id: "txn-1",
        platform: "ios",
        product_id: "vpn_premium_monthly",
        expires_at: "2026-10-20T00:00:00Z",
        details: null,
        created_at: "2026-09-20T00:00:00Z",
      },
    ], window, false);
    expect(view.mrr.amount).toBe("6.9900");
  });
});
