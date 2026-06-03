import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { SITE_URL } from "@/lib/facts";
import {
  pricingPayload,
  comparePayload,
  privacyPayload,
  getServerSummary,
} from "@/lib/agent-data";

/**
 * Doppler VPN MCP server (streamable HTTP).
 *
 * The [transport] dynamic segment + basePath "/api/agents" exposes the
 * streamable-HTTP endpoint at /api/agents/mcp (and SSE at /api/agents/sse).
 * Static siblings like /api/agents/pricing take precedence over this dynamic
 * route, so only `mcp`/`sse` reach the handler.
 *
 * Read tools share their payload builders with the /api/agents/* routes
 * (lib/agent-data) — no network hop, no drift. Action tools POST to the
 * existing rate-limited routes so their validation/business logic is reused,
 * never duplicated. There are NO tools for payment capture, refunds, or
 * VPN-config changes.
 */

/** Same-origin base for action wrappers: the current deployment, else canonical. */
function actionBase(): string {
  const vercel = process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : SITE_URL;
}

async function postJson(path: string, body: unknown): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${actionBase()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = { error: "non-json-response" };
  }
  return { status: res.status, data };
}

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_pricing",
      {
        title: "Get pricing",
        description: "Doppler VPN plans, prices, trial and money-back terms.",
        inputSchema: {},
      },
      async () => text(pricingPayload())
    );

    server.registerTool(
      "get_servers",
      {
        title: "Get network map",
        description: "Aggregate VPN network map: active server count, countries, premium count, average load.",
        inputSchema: {},
      },
      async () => text(await getServerSummary())
    );

    server.registerTool(
      "compare_vpns",
      {
        title: "Compare VPNs",
        description: "Head-to-head comparison of Doppler VPN vs. a typical mainstream VPN.",
        inputSchema: {},
      },
      async () => text(comparePayload())
    );

    server.registerTool(
      "get_privacy",
      {
        title: "Get privacy posture",
        description: "No-logs policy, jurisdiction, what is and isn't collected, and data retention.",
        inputSchema: {},
      },
      async () => text(privacyPayload())
    );

    server.registerTool(
      "validate_promo",
      {
        title: "Validate promo code",
        description:
          "Check whether a promo code is valid for an account and plan, and return its discount percent.",
        inputSchema: {
          code: z.string().describe("The promo code to validate."),
          account_id: z.string().describe("Account ID in VPN-XXXX-XXXX-XXXX format."),
          plan: z.enum(["monthly", "6month", "yearly"]).describe("Checkout plan code."),
        },
      },
      async (args) => text(await postJson("/api/promo/validate", args))
    );

    server.registerTool(
      "create_account",
      {
        title: "Create account",
        description:
          "Create a Doppler VPN account (VPN-XXXX-XXXX-XXXX). Anonymous unless an email is provided for recovery. No payment is taken.",
        inputSchema: {
          email: z.string().email().optional().describe("Optional email for account recovery."),
        },
      },
      async (args) => text(await postJson("/api/subscribe/create-account", args))
    );

    server.registerTool(
      "create_support_ticket",
      {
        title: "Create support ticket",
        description: "File a support ticket on a user's behalf. Priority is derived server-side from the account tier.",
        inputSchema: {
          topic: z.enum([
            "connection_issues",
            "subscription_billing",
            "account",
            "feature_request",
            "other",
          ]),
          subject: z.string().min(3).describe("Short subject (>= 3 chars)."),
          description: z.string().min(10).describe("Ticket details (>= 10 chars)."),
          contact_email: z.string().email().describe("Email to reply to."),
          account_id: z.string().optional().describe("Account ID, if known."),
        },
      },
      async (args) => text(await postJson("/api/support/create-ticket", args))
    );

    server.registerTool(
      "get_checkout_link",
      {
        title: "Get checkout link",
        description:
          "Mint a short-lived web checkout URL for a HUMAN to complete payment. The agent never captures payment. The account must already exist (use create_account first).",
        inputSchema: {
          account_id: z.string().describe("Existing account ID, VPN-XXXX-XXXX-XXXX."),
          plan: z.enum(["monthly", "6month", "yearly"]).describe("Checkout plan code."),
        },
      },
      async ({ account_id, plan }) =>
        text(await postJson("/api/checkout/init", { accountId: account_id, plan }))
    );
  },
  {
    serverInfo: { name: "doppler-vpn", version: "1.0.0" },
  },
  {
    basePath: "/api/agents",
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST };
