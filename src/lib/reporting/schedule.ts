import { fulfilThenObserve } from "./isolate";
import {
  observationFromOxapay,
  observationFromRevolut,
  oxapayReportingEnvironment,
  revolutReportingEnvironment,
  sourceAccountId,
} from "./map-evidence";

export async function observeRevolutCompleted(input: {
  orderId: string;
  amountMinor: number | null;
  currency: string | null;
  occurredAt: string;
  planId?: string | null;
  attribution?: Record<string, unknown> | null;
}): Promise<void> {
  await fulfilThenObserve(async () => undefined, async () => {
    const { applyDurableObservation } = await import("./persist");
    await applyDurableObservation(observationFromRevolut({
      orderId: input.orderId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      occurredAt: input.occurredAt,
      environment: revolutReportingEnvironment(),
      planId: input.planId,
      attribution: input.attribution,
      sourceAccountId: sourceAccountId("revolut", process.env.REVOLUT_SOURCE_ACCOUNT_ID),
    }));
  });
}

export async function observeOxapayPaid(input: {
  orderId: string;
  trackId: string;
  amountMajor: number | null;
  currency: string | null;
  occurredAt: string;
  planId?: string | null;
  channel?: string | null;
  attribution?: Record<string, unknown> | null;
}): Promise<void> {
  await fulfilThenObserve(async () => undefined, async () => {
    const { applyDurableObservation } = await import("./persist");
    const observation = observationFromOxapay({
      orderId: input.orderId,
      trackId: input.trackId,
      amountMajor: input.amountMajor,
      currency: input.currency,
      occurredAt: input.occurredAt,
      environment: oxapayReportingEnvironment(),
      planId: input.planId,
      channel: input.channel,
      attribution: input.attribution,
    });
    observation.sourceAccountId = sourceAccountId("oxapay", process.env.OXAPAY_SOURCE_ACCOUNT_ID);
    await applyDurableObservation(observation);
  });
}
