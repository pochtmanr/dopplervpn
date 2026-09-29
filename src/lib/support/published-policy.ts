/**
 * The customer-facing refund statement. The research matrix is not this version
 * and must not supply a number.
 */
export const PUBLISHED_REFUND_POLICY_VERSION = "published-statement-2026-08";

export function publishedRefundPolicyLabel(): string {
  return `Policy version ${PUBLISHED_REFUND_POLICY_VERSION}`;
}

/**
 * A version other than the published statement needs a person. This never
 * returns a refund amount, including for the published statement.
 */
export function refundAmountForPolicy(policyVersion: string | null | undefined): {
  needsReview: boolean;
  customerAmount: null;
} {
  if (policyVersion === PUBLISHED_REFUND_POLICY_VERSION) {
    return { needsReview: false, customerAmount: null };
  }
  return { needsReview: true, customerAmount: null };
}
