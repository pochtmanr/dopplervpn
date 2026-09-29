import { SUPPORT_CAPABILITIES } from "./contract";

/**
 * A support-contact removal request. This is not account deletion: the decision
 * never names `delete_account`, never clears `accounts.contact_*`, and never
 * includes a payment column. The public URL is still unset.
 */

export const CONTACT_REMOVAL_ENV = SUPPORT_CAPABILITIES.contactRemovalRequestsEnv;

const ACCOUNT_CODE_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function contactRemovalEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env[CONTACT_REMOVAL_ENV] === "true";
}

export interface StoredAccountContact {
  id: string;
  account_id: string;
  contact_method: string | null;
  contact_value: string | null;
  contact_verified: boolean | null;
}

export interface ContactRemovalRequest {
  account_code: string;
  account_uuid: string;
  status: "pending";
  notice_version: null;
}

export type ContactRemovalPlan = { write: false } | { write: true; row: ContactRemovalRequest };

/**
 * Record a pending request only when the submitted contact matches the verified
 * contact already stored on that account. Any other case is a no-op so the
 * route can answer without revealing which part failed.
 */
export function planContactRemoval(input: {
  account: StoredAccountContact | null;
  accountCode: string;
  contactMethod: string;
  contactValue: string;
}): ContactRemovalPlan {
  const account = input.account;
  if (!account || account.account_id !== input.accountCode) return { write: false };
  if (!ACCOUNT_CODE_REGEX.test(account.account_id)) return { write: false };
  if (account.contact_verified !== true) return { write: false };
  if (input.contactMethod !== "email" && input.contactMethod !== "telegram") return { write: false };
  if (account.contact_method !== input.contactMethod) return { write: false };

  const submitted = normalizeContact(input.contactMethod, input.contactValue);
  const stored = account.contact_value?.trim() ?? "";
  if (!submitted || !stored || submitted !== stored) return { write: false };

  return {
    write: true,
    row: {
      account_code: account.account_id,
      account_uuid: account.id,
      status: "pending",
      notice_version: null,
    },
  };
}

function normalizeContact(method: string, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (method === "email") {
    const email = trimmed.toLowerCase();
    return EMAIL_REGEX.test(email) ? email : null;
  }
  return trimmed;
}
