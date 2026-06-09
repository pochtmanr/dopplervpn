import { NextResponse } from "next/server";
import {
  SITE_URL,
  COMPANY,
  CONTACT,
  PLANS,
  CURRENCY,
  TERMS,
  HIGHLIGHTS,
  PLATFORMS,
} from "@/lib/facts";

/**
 * Agent capability manifest — the machine-readable entry point for AI agents.
 * Describes what Doppler VPN is, what it costs, and exactly which endpoints an
 * agent may safely call. Mirrored statically at /.well-known/agents.json.
 *
 * Read tools are public; write tools are anonymous + rate-limited. No endpoint
 * here moves money or mutates an authenticated user's account.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const manifest = {
    schemaVersion: "1.0",
    name: COMPANY.brand,
    description:
      "Fast, private VPN using the VLESS-Reality protocol. No logs, no registration, bypasses censorship (DPI / SNI inspection / active probing). Native apps for iOS, Android, macOS, and Windows.",
    provider: {
      legalName: COMPANY.legalName,
      companyNumber: COMPANY.companyNumber,
      jurisdiction: COMPANY.jurisdiction,
      address: COMPANY.address,
    },
    homepage: `${SITE_URL}/en`,
    agentsHome: `${SITE_URL}/agents`,
    llmsTxt: `${SITE_URL}/llms-full.txt`,
    contact: {
      email: CONTACT.supportEmail,
      telegram: CONTACT.telegram,
    },
    highlights: HIGHLIGHTS,
    platforms: PLATFORMS,
    pricing: {
      currency: CURRENCY,
      plans: Object.values(PLANS),
      terms: TERMS,
    },
    mcp: {
      url: `${SITE_URL}/api/agents/mcp`,
      transport: "streamable-http",
      status: "active",
      tools: [
        "get_pricing",
        "get_servers",
        "compare_vpns",
        "get_privacy",
        "validate_promo",
        "create_account",
        "create_support_ticket",
        "get_checkout_link",
      ],
    },
    endpoints: [
      {
        name: "get_pricing",
        method: "GET",
        path: "/api/agents/pricing",
        auth: "none",
        description: "Plans, prices, trial and money-back terms.",
      },
      {
        name: "get_servers",
        method: "GET",
        path: "/api/agents/servers",
        auth: "none",
        description: "Aggregate network map: active server count, countries, premium count, average load.",
      },
      {
        name: "compare_vpns",
        method: "GET",
        path: "/api/agents/compare",
        auth: "none",
        description: "Head-to-head comparison vs. a typical mainstream VPN.",
      },
      {
        name: "get_privacy",
        method: "GET",
        path: "/api/agents/privacy",
        auth: "none",
        description: "No-logs posture, jurisdiction, what is and isn't collected, retention.",
      },
      {
        name: "validate_promo",
        method: "POST",
        path: "/api/promo/validate",
        auth: "rate-limited",
        params: { code: "string", account_id: "string", plan: "monthly|6month|yearly" },
        description: "Check whether a promo code is valid for an account and plan, and its discount percent.",
      },
      {
        name: "create_account",
        method: "POST",
        path: "/api/subscribe/create-account",
        auth: "rate-limited",
        params: { email: "string (optional — omit for an anonymous account)" },
        description: "Create a VPN account (VPN-XXXX-XXXX-XXXX). Anonymous unless an email is provided.",
        sideEffects: "Creates a free-tier account row. No payment.",
      },
      {
        name: "create_support_ticket",
        method: "POST",
        path: "/api/support/create-ticket",
        auth: "rate-limited",
        params: {
          topic: "connection_issues|subscription_billing|account|feature_request|other",
          subject: "string (>= 3 chars)",
          description: "string (>= 10 chars)",
          contact_email: "string",
          account_id: "string (optional)",
        },
        description: "File a support ticket on a user's behalf. Priority is derived server-side from the account tier.",
      },
      {
        name: "get_checkout_link",
        method: "POST",
        path: "/api/checkout/init",
        auth: "rate-limited",
        params: { accountId: "string", plan: "monthly|6month|yearly" },
        description: "Mint a short-lived web checkout URL for a human to complete payment. Agents never capture payment.",
      },
    ],
    policies: {
      privacy: `${SITE_URL}/en/privacy`,
      terms: `${SITE_URL}/en/terms`,
      refund: `${SITE_URL}/en/refund`,
      dpa: `${SITE_URL}/en/dpa`,
      subprocessors: `${SITE_URL}/en/subprocessors`,
      security: `${SITE_URL}/en/security`,
      securityTxt: `${SITE_URL}/.well-known/security.txt`,
    },
    excludedActions: [
      "autonomous payment capture",
      "refunds",
      "VPN protocol / server-config changes",
      "actions on an authenticated user's existing account",
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
