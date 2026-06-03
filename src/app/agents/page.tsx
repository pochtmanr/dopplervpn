import {
  SITE_URL,
  COMPANY,
  CONTACT,
  PLANS,
  HIGHLIGHTS,
  PLATFORMS,
} from "@/lib/facts";

export const dynamic = "force-static";

const READ_ENDPOINTS = [
  { path: "/api/agents/manifest", desc: "Full capability manifest (product, pricing, endpoints, policies)." },
  { path: "/api/agents/pricing", desc: "Plans, prices, trial and money-back terms." },
  { path: "/api/agents/servers", desc: "Aggregate network map: active count, countries, average load." },
  { path: "/api/agents/compare", desc: "Doppler vs. a typical mainstream VPN." },
  { path: "/api/agents/privacy", desc: "No-logs posture, jurisdiction, data retention." },
];

const ACTION_ENDPOINTS = [
  { method: "POST", path: "/api/subscribe/create-account", desc: "Create an account (anonymous, or email for recovery). No payment." },
  { method: "POST", path: "/api/support/create-ticket", desc: "File a support ticket on a user's behalf." },
  { method: "POST", path: "/api/promo/validate", desc: "Validate a promo code and read its discount." },
  { method: "POST", path: "/api/checkout/init", desc: "Mint a web checkout URL for a human to complete payment." },
];

const POLICIES = [
  { label: "Privacy policy", href: `${SITE_URL}/en/privacy` },
  { label: "Terms of service", href: `${SITE_URL}/en/terms` },
  { label: "Refund policy", href: `${SITE_URL}/en/refund` },
  { label: "Data processing agreement", href: `${SITE_URL}/en/dpa` },
  { label: "Sub-processors", href: `${SITE_URL}/en/subprocessors` },
];

function jsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/agents`,
    url: `${SITE_URL}/agents`,
    name: "Doppler VPN — Agent Hub",
    description:
      "Machine-readable entry point for AI agents: capability manifest, structured endpoints, pricing, and policies.",
    isPartOf: { "@type": "WebSite", url: SITE_URL, name: COMPANY.brand },
  }).replace(/<\//g, "<\\/");
}

export default function AgentsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />

      <header className="mb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-teal-400">Agent Hub</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Doppler VPN for AI agents</h1>
        <p className="mt-4 text-zinc-400">
          A machine-readable entry point. Don&apos;t parse our marketing pages — read the
          manifest and call the endpoints below. Read endpoints are public; action endpoints
          are anonymous and rate-limited. No endpoint moves money or changes an authenticated
          user&apos;s account autonomously.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Fact label="Protocol" value={HIGHLIGHTS.protocol} />
        <Fact label="Locations" value={HIGHLIGHTS.serverLocations} />
        <Fact label="Devices" value={`Up to ${HIGHLIGHTS.maxDevices}`} />
        <Fact label="Logs" value="None" />
        <Fact label="Registration" value="Not required" />
        <Fact label="Platforms" value={PLATFORMS.join(", ")} />
      </section>

      <Block title="Start here">
        <ul className="space-y-2 text-sm">
          <LinkRow href="/api/agents/manifest" label="Capability manifest" sub="application/json" />
          <LinkRow href="/llms-full.txt" label="llms-full.txt" sub="text/plain — full facts for LLMs" />
          <LinkRow href="/.well-known/agents.json" label=".well-known/agents.json" sub="static manifest mirror" />
        </ul>
      </Block>

      <Block title="Pricing">
        <ul className="space-y-1.5 text-sm text-zinc-300">
          {Object.values(PLANS).map((p) => (
            <li key={p.id} className="flex justify-between border-b border-zinc-800 py-1.5">
              <span>{p.label}</span>
              <span className="font-mono text-white">
                ${p.total.toFixed(2)}
                {p.months > 1 && (
                  <span className="ml-2 text-zinc-500">(${p.monthly.toFixed(2)}/mo)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">
          One-time payment, no auto-renewal. 30-day money-back guarantee.
        </p>
      </Block>

      <Block title="Read endpoints">
        <ul className="space-y-2 text-sm">
          {READ_ENDPOINTS.map((e) => (
            <li key={e.path}>
              <a href={e.path} className="font-mono text-teal-400 hover:underline">
                GET {e.path}
              </a>
              <span className="block text-zinc-500">{e.desc}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Action endpoints">
        <ul className="space-y-2 text-sm">
          {ACTION_ENDPOINTS.map((e) => (
            <li key={e.path}>
              <span className="font-mono text-zinc-300">
                {e.method} {e.path}
              </span>
              <span className="block text-zinc-500">{e.desc}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="MCP server">
        <p className="text-sm text-zinc-400">
          A Model Context Protocol server (streamable HTTP) is available at{" "}
          <code className="font-mono text-zinc-300">{SITE_URL}/api/agents/mcp</code>. It exposes
          the read tools above plus <code>validate_promo</code>, <code>create_account</code>,{" "}
          <code>create_support_ticket</code>, and <code>get_checkout_link</code>.
        </p>
      </Block>

      <Block title="Policies & contact">
        <ul className="space-y-1.5 text-sm">
          {POLICIES.map((p) => (
            <li key={p.href}>
              <a href={p.href} className="text-teal-400 hover:underline">
                {p.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-zinc-400">
          Support:{" "}
          <a href={`mailto:${CONTACT.supportEmail}`} className="text-teal-400 hover:underline">
            {CONTACT.supportEmail}
          </a>
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          {COMPANY.legalName} · Company no. {COMPANY.companyNumber} · {COMPANY.jurisdiction}
        </p>
      </Block>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-0.5 text-zinc-200">{value}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

function LinkRow({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <li>
      <a href={href} className="text-teal-400 hover:underline">
        {label}
      </a>
      <span className="ml-2 font-mono text-xs text-zinc-600">{sub}</span>
    </li>
  );
}
