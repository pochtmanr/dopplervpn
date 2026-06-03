/**
 * Drift guard for the agent surface.
 *
 * The static files in /public (`.well-known/agents.json`, `llms.txt`,
 * `llms-full.txt`) are hand-maintained mirrors of the canonical data in
 * `src/lib/facts.ts`. This script fails the build (non-zero exit) when they
 * disagree on pricing, plan IDs, support email, the MCP URL, or the renewal
 * terms — the fields agents actually act on.
 *
 * Run: `npm run check:facts` (also wired into `prebuild`).
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PLANS, CONTACT, SITE_URL } from "../src/lib/facts";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");

const MCP_URL = `${SITE_URL}/api/agents/mcp`;

const agentsJsonRaw = readFileSync(resolve(publicDir, ".well-known/agents.json"), "utf8");
const agentsJson = JSON.parse(agentsJsonRaw) as {
  contact: { email: string };
  mcp: { url: string };
  pricing: { plans: Array<Record<string, unknown>> };
};
const llms = readFileSync(resolve(publicDir, "llms.txt"), "utf8");
const llmsFull = readFileSync(resolve(publicDir, "llms-full.txt"), "utf8");

const errors: string[] = [];
const check = (cond: boolean, msg: string) => {
  if (!cond) errors.push(msg);
};

// --- Pricing + plan IDs ----------------------------------------------------
for (const plan of Object.values(PLANS)) {
  const mirrored = agentsJson.pricing.plans.find((p) => p.id === plan.id);
  check(Boolean(mirrored), `agents.json is missing plan "${plan.id}"`);
  if (mirrored) {
    check(mirrored.total === plan.total, `agents.json plan "${plan.id}" total ${mirrored.total} ≠ facts ${plan.total}`);
    check(mirrored.monthly === plan.monthly, `agents.json plan "${plan.id}" monthly ${mirrored.monthly} ≠ facts ${plan.monthly}`);
    check(mirrored.months === plan.months, `agents.json plan "${plan.id}" months ${mirrored.months} ≠ facts ${plan.months}`);
    check(
      mirrored.checkoutPlanId === plan.checkoutPlanId,
      `agents.json plan "${plan.id}" checkoutPlanId ${String(mirrored.checkoutPlanId)} ≠ facts ${plan.checkoutPlanId}`,
    );
  }
  // Price appears in the prose mirror.
  const price = `$${plan.total.toFixed(2)}`;
  check(llmsFull.includes(price), `llms-full.txt is missing price ${price} for plan "${plan.id}"`);
  // Checkout code is documented for agents.
  check(llmsFull.includes(plan.checkoutPlanId), `llms-full.txt is missing checkout code "${plan.checkoutPlanId}"`);
}

// --- Support email ---------------------------------------------------------
check(agentsJson.contact.email === CONTACT.supportEmail, `agents.json contact.email ${agentsJson.contact.email} ≠ facts ${CONTACT.supportEmail}`);
check(llmsFull.includes(CONTACT.supportEmail), "llms-full.txt is missing the canonical support email");

// --- MCP URL ---------------------------------------------------------------
check(agentsJson.mcp.url === MCP_URL, `agents.json mcp.url ${agentsJson.mcp.url} ≠ ${MCP_URL}`);
check(llmsFull.includes(MCP_URL), `llms-full.txt is missing the MCP URL ${MCP_URL}`);

// --- Terms / promo schema regressions -------------------------------------
check(llmsFull.toLowerCase().includes("auto-renew"), "llms-full.txt no longer mentions auto-renew (App Store / Google Play)");
check(llmsFull.includes("account_id"), "llms-full.txt promo body must require account_id (got the old {code, plan?} schema?)");

// Stale claims that must not reappear.
for (const [name, text] of [["llms.txt", llms], ["llms-full.txt", llmsFull], ["agents.json", agentsJsonRaw]] as const) {
  check(!text.includes("50+"), `${name} still contains the stale "50+" location claim`);
  check(!/WireGuard tunnel/i.test(text), `${name} still describes a "WireGuard tunnel"`);
}

if (errors.length) {
  console.error(`\n✗ Agent-fact drift detected (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nUpdate the static files in /public to match src/lib/facts.ts.\n");
  process.exit(1);
}

console.log("✓ Agent facts are consistent across facts.ts and the static /public mirrors.");
