import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type RefundExample = {
  customerAmount: string | null;
  currency: string;
  gatewayCostBearer: string | null;
  useDeductionApplied: boolean;
  withoutRequiredEvidenceCustomerAmount?: string;
};

export type RefundBranch = {
  id: string;
  rail: string;
  railConfirmed: boolean;
  reasonClass: string;
  publishedAsCustomerPromise: boolean;
  example: RefundExample;
  unresolved: string[];
};

export type RefundDecisionMatrix = {
  version: string;
  status: "research";
  approvedCustomerPromise: false;
  example: {
    grossPaid: { amount: string; currency: string };
    gatewayCost: { amount: string; currency: string };
    forbiddenDefaultCustomerAmount: string;
  };
  law: {
    ukSubscriptionRegime: { inForceOn: string | null };
  };
  branches: RefundBranch[];
};

const matrixPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../contracts/refund/v1/refund-decision-matrix.json",
);

export function loadRefundMatrix(): RefundDecisionMatrix {
  return JSON.parse(readFileSync(matrixPath, "utf8")) as RefundDecisionMatrix;
}

/** Customer amount for the worked $6.99 / $0.15 example. Never the gateway-net figure. */
export function exampleCustomerAmount(branch: RefundBranch, matrix = loadRefundMatrix()): string | null {
  const amount = branch.example.customerAmount;
  if (amount === matrix.example.forbiddenDefaultCustomerAmount) {
    throw new Error(`${branch.id} uses the forbidden default ${amount}`);
  }
  return amount;
}

export function assertMatrixExamples(matrix = loadRefundMatrix()): Record<string, string | null> {
  if (matrix.approvedCustomerPromise !== false) {
    throw new Error("Refund matrix must not be marked as an approved customer promise");
  }
  const amounts: Record<string, string | null> = {};
  const ids = new Set<string>();
  for (const branch of matrix.branches) {
    if (ids.has(branch.id)) throw new Error(`Duplicate branch ${branch.id}`);
    ids.add(branch.id);
    if (branch.publishedAsCustomerPromise) {
      throw new Error(`${branch.id} is marked as a published promise`);
    }
    amounts[branch.id] = exampleCustomerAmount(branch, matrix);
    if (!branch.railConfirmed && amounts[branch.id] !== null) {
      throw new Error(`${branch.id} is an unconfirmed rail with a customer amount`);
    }
  }
  return amounts;
}
