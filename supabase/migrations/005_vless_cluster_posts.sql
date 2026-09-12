-- =====================================================
-- VLESS CLUSTER POSTS — five hand-written English articles
-- Safe, idempotent, non-destructive to existing data
-- =====================================================
-- Apply via: Supabase SQL Editor (paste this file) or `supabase db push`
-- Rollback:  005_vless_cluster_posts_rollback.sql
-- =====================================================
--
-- Why these five, and why now.
--
-- Live Search Console (90d, pulled 2026-09-12) says the site's demand is one
-- cluster and it is almost entirely unserved:
--
--   vless                              5,244 impr
--   vless vpn                          3,634
--   vless reality                      1,712
--   vless protocol                       487
--   vless + reality                      340
--   vpn vless                            251
--   what is vless and how does it work?  221
--   vless-reality                        202
--   what is vless                        198
--   reality vpn                          185
--   vless reality vpn                    159
--   vless encryption                     110
--   what is vless protocol                70
--   vless://                              55
--   + a large Persian tail (معنی vless 137, vless چیست 63, vless یعنی چی 54)
--
-- Of 176 published posts, three touch this cluster, all dated 2026-04-17.
-- There was no "what is VLESS" post at all — the single largest unserved
-- intent. /en/vless-vpn draws 18,888 impressions at 1.0% CTR from position
-- 6.8, so the ranking exists and the click does not; these are written to be
-- clicked and to be quotable by AI Overviews (dense, self-contained answer
-- blocks rather than a long preamble).
--
-- Slugs are 13-27 chars against a 75-char median on existing posts. That is
-- deliberate: it is the same defect fixed in doppler-admin/src/lib/slugify.ts.
--
-- Posts land as status='draft' and are invisible publicly (RLS gates public
-- SELECT on status='published'). Publish from /admin-dvpn/posts, then run
-- translations per-locale from the Translations tab.
--
-- Content is English-only. Every other locale is produced by the admin panel,
-- not by this file.

BEGIN;

-- -----------------------------------------------------
-- 1. what-is-vless
-- -----------------------------------------------------
WITH upsert_post AS (
  INSERT INTO blog_posts (slug, author_name, status, published_at, template_type, topic_category)
  VALUES ('what-is-vless', 'Doppler Team', 'draft', NULL, 'analysis', 'vpn-protocols')
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING id
), upsert_tr AS (
  INSERT INTO blog_post_translations
    (post_id, locale, title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description)
  SELECT id, 'en',
    $t$What Is VLESS? The Protocol Explained in Plain English$t$,
    $e$VLESS is a lightweight proxy protocol from the Xray ecosystem. Its name says it carries less encryption than its predecessor — and that turns out to be the whole point.$e$,
    $c$# What Is VLESS? The Protocol Explained in Plain English

VLESS is a lightweight proxy protocol used to tunnel internet traffic through a remote server. It was introduced in 2020 as the successor to VMess in the V2Ray project, and it is implemented today mainly by Xray-core. Its defining trait is what it removes: VLESS carries no encryption layer of its own and no protocol-specific markers, which is precisely what makes it hard to detect.

## What the name actually means

VLESS stands for V2Ray-Less Encryption Serialization Stream. The "less encryption" part confuses people, and it is worth clearing up, because it is the most common misunderstanding about the protocol.

VLESS does not encrypt your traffic itself. That sounds alarming until you see the reasoning. Its predecessor, VMess, applied its own encryption on top of whatever the transport already provided. The result was double encryption — slower, heavier on battery, and, critically, *distinctive*. Encrypting twice produces traffic that does not look like anything else on the network. A censorship system does not need to break the encryption to block you; it only needs to notice that your traffic is unusual.

VLESS delegates encryption to the transport layer instead, where TLS already does the job properly. What travels over the wire is a normal TLS session. The protocol contributes structure, not secrecy.

## How a VLESS connection is put together

VLESS on its own is just the inner protocol. In practice it is always paired with a transport, and the pairing is what determines whether the connection survives censorship.

A plain VLESS connection over TCP with no TLS is trivially detectable and effectively useless in a censored network. VLESS over standard TLS is better — the traffic is encrypted and looks broadly like HTTPS — but the server still needs a certificate of its own, and a domain that only ever serves proxy traffic is a pattern that gets noticed and blocked.

The combination that works is VLESS with the Reality transport, added by the XTLS project in 2022. Reality does not generate a certificate for your server. It performs a genuine TLS 1.3 handshake against a real, unrelated website and presents that site's real certificate chain. To anything watching, the connection is a visit to a legitimate HTTPS site, because at the packet level that is what it is.

## Why this beats a conventional VPN protocol in a censored network

WireGuard and OpenVPN were designed to be fast and secure, and they are both. Neither was designed to be inconspicuous. WireGuard has a recognisable UDP handshake; OpenVPN has a distinctive opening exchange. Deep packet inspection identifies both quickly, and once identified they are blocked regardless of how strong the encryption is.

This is the trade-off people miss. Encryption protects the contents of your traffic. It does nothing about the *shape* of it. In a country that filters by protocol signature, shape is the only thing that matters — and it is the problem VLESS with Reality is built to solve.

## Where VLESS falls short

It is harder to run. A VLESS-Reality server needs Xray-core, a chosen camouflage target, key pairs, and matching client configuration. Get the SNI or the public key wrong and the connection simply fails, usually with an unhelpful error. This is why the protocol spent years as a tool for people willing to edit JSON config files rather than as a consumer product.

It is also not a privacy cure-all. VLESS conceals that you are using a tunnel. It does not anonymise you from the operator of the server at the other end, which is a question of who runs that server and what they keep.

## Where Doppler fits

Doppler VPN runs VLESS with Reality on Xray-core, which is why it keeps working in networks where mainstream VPNs stop. The apps handle the configuration that normally makes this protocol impractical — no UUIDs to paste, no keys to match by hand.

If you want the mechanics of the camouflage itself, the [Reality deep dive](/en/blog/vless-reality-explained) covers the handshake step by step.$c$,
    NULL,
    $mt$What Is VLESS? The Protocol Explained in Plain English$mt$,
    $md$VLESS is a lightweight Xray proxy protocol that carries no encryption of its own — and that is the point. What it is, how it works, and where it fails.$md$,
    $ot$What Is VLESS? The Protocol Explained in Plain English$ot$,
    $od$VLESS is a lightweight Xray proxy protocol that deliberately carries no encryption of its own. Here is what that means, how a VLESS connection is assembled, and the trade-offs it makes.$od$
  FROM upsert_post
  ON CONFLICT (post_id, locale) DO UPDATE SET
    title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
    og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
    updated_at = now()
  RETURNING post_id
)
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT up.id, bt.id FROM upsert_post up
CROSS JOIN blog_tags bt WHERE bt.slug IN ('protocol', 'vpn-guide', 'encryption')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- 2. vless-vs-vmess-vs-trojan
-- -----------------------------------------------------
WITH upsert_post AS (
  INSERT INTO blog_posts (slug, author_name, status, published_at, template_type, topic_category)
  VALUES ('vless-vs-vmess-vs-trojan', 'Doppler Team', 'draft', NULL, 'analysis', 'vpn-protocols')
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING id
), upsert_tr AS (
  INSERT INTO blog_post_translations
    (post_id, locale, title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description)
  SELECT id, 'en',
    $t$VLESS vs VMess vs Trojan vs Shadowsocks: Which Survives DPI?$t$,
    $e$Four censorship-resistant protocols, four different bets on how to stay unnoticed. Here is what separates them, and which ones still work in 2026.$e$,
    $c$# VLESS vs VMess vs Trojan vs Shadowsocks: Which Survives DPI?

All four protocols exist for the same reason: ordinary VPN protocols are easy to spot and therefore easy to block. Where they differ is in the strategy each one uses to avoid being spotted — and in 2026 those strategies no longer perform equally.

## The short version

**Shadowsocks** hides traffic as random noise. **VMess** adds obfuscation and its own encryption. **Trojan** imitates HTTPS. **VLESS with Reality** does not imitate HTTPS — it *is* a TLS session with a real website's certificate. That last distinction is why the ranking has shifted.

## Shadowsocks (2012)

Shadowsocks was the first of these to see mass use, and it is still the simplest. It encrypts traffic into a stream with no recognisable headers — no handshake to fingerprint, just bytes.

That was enough for years. Its weakness is that "no structure at all" is itself a structure. Normal internet traffic is overwhelmingly TLS, and TLS has a visible handshake. A flow with high entropy and no handshake stands out precisely because it looks like nothing. Modern DPI flags it on that basis, and active probing confirms it. Shadowsocks still works on lightly filtered networks and fails on aggressive ones.

## VMess (2015)

VMess came from the V2Ray project, built in response to the Great Firewall. It obfuscated traffic and added its own encryption and authentication layer.

Its problems were structural. The header was fingerprintable. The protocol was chatty and complex. And because VMess encrypted on top of a transport that was often already encrypted, connections carried double encryption — costly in speed and battery, and distinctive on the wire. VMess is effectively legacy now; its own ecosystem replaced it.

## Trojan (2019)

Trojan made a smart bet: rather than hide, blend in. It wraps traffic in real TLS and presents itself as an ordinary HTTPS server. If someone probes it with a normal web request, it serves a real web page.

This works well, and Trojan remains respectable. The limitation is that the disguise depends on a certificate *you* control, for a domain *you* own. That domain serves only proxy traffic. A censor watching which domains carry long-lived TLS sessions from targeted users can identify the domain and block it — without breaking anything cryptographic.

## VLESS + Reality (2020 / 2022)

VLESS stripped out what made VMess detectable: no built-in encryption, no protocol markers, minimal overhead. On its own that is not enough. Reality, added in 2022, is what completes it.

Reality does not present a certificate you own. It completes a genuine TLS 1.3 handshake with a real, third-party website and relays that site's real certificate chain. There is no attacker-controlled domain to blocklist, because the domain in the handshake belongs to a site the censor likely does not want to block. Probe the server and it answers as the site it mimics.

The trade-off is operational complexity: Xray-core, a camouflage target, key pairs, and matching client config.

## Side by side

| Protocol | Strategy | DPI resistance | Main weakness |
|---|---|---|---|
| Shadowsocks | Look like noise | Moderate | Structureless traffic is itself a signal |
| VMess | Obfuscate + encrypt | Low | Fingerprintable header, double encryption |
| Trojan | Imitate HTTPS | High | Your own domain can be identified and blocked |
| VLESS + Reality | Be real TLS to a real site | Highest | Hardest to deploy correctly |

## Which to choose

On a lightly filtered network, any of them will do, and Shadowsocks is the least work. On a network doing serious inspection — China, Iran, Russia — the practical choice is VLESS with Reality, with Trojan as a reasonable fallback.

Doppler VPN runs VLESS-Reality on Xray-core and handles the configuration in the app. For how the camouflage works step by step, see [VLESS Reality, explained](/en/blog/vless-reality-explained).$c$,
    NULL,
    $mt$VLESS vs VMess vs Trojan vs Shadowsocks: Which Survives DPI?$mt$,
    $md$Four censorship-resistant protocols compared: how each avoids detection, where each breaks, and which still works against deep packet inspection in 2026.$md$,
    $ot$VLESS vs VMess vs Trojan vs Shadowsocks: Which Survives DPI?$ot$,
    $od$Four censorship-resistant protocols, four different bets on how to stay unnoticed. How each avoids detection, where each one breaks, and which still works against modern DPI.$od$
  FROM upsert_post
  ON CONFLICT (post_id, locale) DO UPDATE SET
    title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
    og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
    updated_at = now()
  RETURNING post_id
)
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT up.id, bt.id FROM upsert_post up
CROSS JOIN blog_tags bt WHERE bt.slug IN ('protocol', 'comparison', 'censorship')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- 3. vless-reality-vs-wireguard
-- -----------------------------------------------------
WITH upsert_post AS (
  INSERT INTO blog_posts (slug, author_name, status, published_at, template_type, topic_category)
  VALUES ('vless-reality-vs-wireguard', 'Doppler Team', 'draft', NULL, 'analysis', 'vpn-protocols')
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING id
), upsert_tr AS (
  INSERT INTO blog_post_translations
    (post_id, locale, title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description)
  SELECT id, 'en',
    $t$VLESS-Reality vs WireGuard: Why Fast Is Not the Same as Unblockable$t$,
    $e$WireGuard is the faster protocol and it is blocked in minutes. The reason has nothing to do with encryption strength — and everything to do with what a handshake looks like.$e$,
    $c$# VLESS-Reality vs WireGuard: Why Fast Is Not the Same as Unblockable

WireGuard is genuinely excellent: lean, modern, very fast, with a small codebase that is easy to audit. In a censored network it is also close to useless. Both statements are true, and understanding why explains the whole category.

## Encryption strength is not the issue

Both protocols use strong, modern cryptography. Nobody is breaking either one. That is not how blocking works.

A censorship system does not decrypt your traffic. It classifies it. It asks a cheaper question — *what kind of connection is this?* — and it answers from packet sizes, timing, port numbers, and above all the opening handshake. If the answer is "a VPN", the flow is dropped. The contents were never relevant.

So the question that decides whether a protocol survives is not "how strong is the encryption" but "how identifiable is the handshake".

## What WireGuard looks like on the wire

WireGuard's first packet is a fixed-size UDP message with a known structure and a distinctive type field at a predictable offset. Its handshake is a well-defined exchange with consistent lengths. These properties are deliberate — they are what make WireGuard fast and analysable.

They also make it trivial to fingerprint. A DPI system can classify a WireGuard handshake from the first packet, with essentially no false positives and no cryptographic work. Worse, WireGuard is UDP-first, and in networks that aggressively filter, plain UDP to an unfamiliar host is already suspicious before anyone inspects it.

This is why VPNs that rely on WireGuard tend to stop working during a crackdown even though nothing about their encryption changed.

## What VLESS-Reality looks like on the wire

It looks like you visiting a website. Not approximately — actually.

Reality performs a real TLS 1.3 handshake against a genuine third-party site and relays that site's real certificate chain. The ClientHello is a real ClientHello. The certificate validates, because it is a real certificate issued to a real domain. A classifier examining the handshake sees an ordinary HTTPS session, because by every measurable property that is what it is.

Active probing does not help either. If a censor connects to the server to test it, the server behaves as the site it mimics and serves real responses. There is nothing anomalous to find.

## The cost

Reality is slower to set up and slightly heavier to run. The server does real TLS work against a real upstream site, which costs more CPU than a bare WireGuard tunnel. Configuration is unforgiving: a wrong SNI, public key, or short ID fails the connection outright. And on a free, unfiltered network, WireGuard will usually be measurably faster.

That is the honest trade. WireGuard optimises for throughput. Reality optimises for not being noticed. Each is the right answer to a different question.

## Which you actually want

If your network does not filter, WireGuard is excellent and you should use it.

If you are in China, Iran, Russia, Turkey or the UAE — or travelling to one — throughput is not your constraint. Connecting at all is. That is the case VLESS-Reality is built for, and it is the protocol Doppler VPN runs on Xray-core across every platform.

A fuller breakdown of the camouflage mechanism is in [VLESS Reality, explained](/en/blog/vless-reality-explained), and the protocol comparison across Trojan and Shadowsocks is in [VLESS vs VMess vs Trojan](/en/blog/vless-vs-vmess-vs-trojan).$c$,
    NULL,
    $mt$VLESS-Reality vs WireGuard: Fast Is Not the Same as Unblockable$mt$,
    $md$WireGuard is faster and gets blocked in minutes. Why DPI fingerprints its handshake instantly, why Reality survives, and which one you actually need.$md$,
    $ot$VLESS-Reality vs WireGuard: Fast Is Not the Same as Unblockable$ot$,
    $od$WireGuard is the faster protocol and it is blocked in minutes. The reason is not encryption strength — it is what the handshake looks like to a classifier.$od$
  FROM upsert_post
  ON CONFLICT (post_id, locale) DO UPDATE SET
    title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
    og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
    updated_at = now()
  RETURNING post_id
)
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT up.id, bt.id FROM upsert_post up
CROSS JOIN blog_tags bt WHERE bt.slug IN ('protocol', 'comparison', 'speed')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- 4. vless-uri-format
-- -----------------------------------------------------
WITH upsert_post AS (
  INSERT INTO blog_posts (slug, author_name, status, published_at, template_type, topic_category)
  VALUES ('vless-uri-format', 'Doppler Team', 'draft', NULL, 'analysis', 'vpn-protocols')
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING id
), upsert_tr AS (
  INSERT INTO blog_post_translations
    (post_id, locale, title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description)
  SELECT id, 'en',
    $t$The vless:// Link Format, Field by Field$t$,
    $e$A vless:// link is a whole server configuration compressed into one line. Here is what every field means, and which ones break the connection when they are wrong.$e$,
    $c$# The vless:// Link Format, Field by Field

A `vless://` link is a complete client configuration packed into a single URI. Paste it into an Xray-compatible client and it expands into the JSON config the client actually uses. Knowing how to read one turns an opaque string into something you can debug.

## The shape of it

```
vless://UUID@host:port?encryption=none&security=reality&sni=www.example.com&fp=chrome&pbk=PUBLIC_KEY&sid=SHORT_ID&type=tcp&flow=xtls-rprx-vision#Label
```

It follows ordinary URI rules: a scheme, userinfo, host, port, a query string of parameters, and a fragment. Everything that varies between servers lives in the query string.

## The parts before the question mark

**UUID** — your client identifier, in standard UUID form. This is the credential: it is how the server recognises you. Treat a full link as a secret, because the UUID is in it.

**host** — the server address, a domain or IP.

**port** — usually 443. Not cosmetic. Reality is pretending to be ordinary HTTPS, and HTTPS lives on 443; a VLESS server on an unusual port undermines the disguise before any inspection happens.

## The parameters that matter

**encryption=none** — the one that alarms people. It is correct and it is mandatory. VLESS carries no encryption of its own by design; confidentiality comes from the TLS or Reality layer above it. `none` here does not mean an unencrypted connection.

**security** — `reality`, `tls`, or `none`. This selects the transport, and it is the field that determines whether the connection is censorship-resistant at all.

**sni** — the domain named in the TLS handshake. Under Reality this is the site being impersonated, and it must match what the server expects.

**fp** — TLS fingerprint to imitate, commonly `chrome`. This shapes the ClientHello so it matches a real browser. A mismatched or missing fingerprint is itself a detectable signal.

**pbk** — the server's Reality public key. Paired with the server's private key; wrong value, no connection.

**sid** — short ID, a small hex string the server uses to distinguish clients.

**type** — the underlying transport, typically `tcp`, sometimes `ws` or `grpc`.

**flow** — usually `xtls-rprx-vision`, an optimisation that reduces redundant encryption work on the relay path.

**#Label** — the fragment. Purely a display name in the client. Change it freely; it affects nothing.

## Where these links go wrong

Most failures are one of four things, and none produce a helpful error message.

A wrong or stale **pbk** is the most common — the handshake simply fails. A mismatched **sni** is next: the server expects one camouflage target and the client offers another. Missing **fp** makes the client detectable even while it connects fine. And links copied out of chat apps are frequently mangled, because `#` and `&` get eaten by formatting or URL-shorteners.

One more, easily missed: `vless://` links contain no expiry and no server-side revocation hint. If a link circulates, the UUID in it keeps working until someone removes it on the server.

## Why Doppler does not ask you to handle these

This format is powerful and unforgiving, which is why VLESS stayed a tool for people comfortable editing config files. Doppler VPN provisions VLESS-Reality on Xray-core and manages keys and camouflage targets inside the app — there is no link to paste and no field to get wrong.

For what the protocol is doing underneath, start with [What is VLESS](/en/blog/what-is-vless).$c$,
    NULL,
    $mt$The vless:// Link Format, Field by Field$mt$,
    $md$What every field in a vless:// URI means — UUID, sni, pbk, sid, fp, flow — and the four mistakes that silently break the connection.$md$,
    $ot$The vless:// Link Format, Field by Field$ot$,
    $od$A vless:// link is a whole server configuration in one line. What every field means, why encryption=none is correct, and the four mistakes that silently break a connection.$od$
  FROM upsert_post
  ON CONFLICT (post_id, locale) DO UPDATE SET
    title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
    og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
    updated_at = now()
  RETURNING post_id
)
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT up.id, bt.id FROM upsert_post up
CROSS JOIN blog_tags bt WHERE bt.slug IN ('protocol', 'setup-guide', 'vpn-guide')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- 5. censorship-protocol-history
-- -----------------------------------------------------
WITH upsert_post AS (
  INSERT INTO blog_posts (slug, author_name, status, published_at, template_type, topic_category)
  VALUES ('censorship-protocol-history', 'Doppler Team', 'draft', NULL, 'analysis', 'censorship-circumvention')
  ON CONFLICT (slug) DO UPDATE SET updated_at = now()
  RETURNING id
), upsert_tr AS (
  INSERT INTO blog_post_translations
    (post_id, locale, title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description)
  SELECT id, 'en',
    $t$From VMess to Reality: A Short History of Hiding Traffic$t$,
    $e$A decade of censorship-resistant protocols, each one a response to how the previous generation got caught. The pattern explains where this is going next.$e$,
    $c$# From VMess to Reality: A Short History of Hiding Traffic

Every censorship-resistant protocol is a reply to the thing that caught the last one. Read them in order and the sequence is not a series of clever inventions but an argument, conducted over a decade, about what "looking normal" means.

## Encrypt it (early 2010s)

The first answer was the obvious one: encrypt everything so filters cannot read it.

Shadowsocks, which appeared around 2012, is the clearest example — traffic reduced to a stream of bytes with no headers to match against. For a while it worked beautifully, because filtering at the time mostly meant keyword matching and IP blocklists. If the censor could not read it, the censor could not block it.

## Obfuscate it (2015)

Encryption alone stopped being enough once filtering moved from *reading* traffic to *classifying* it. A censor who cannot decrypt your packets can still measure them, and a flow of pure high-entropy bytes with no handshake is conspicuous in a world where nearly everything is TLS.

The V2Ray project began in 2015 against the Great Firewall, and its VMess protocol added obfuscation on top of encryption. It also added weight: its own encryption layer on top of the transport, a complex handshake, and a header with recognisable structure. Each of those eventually became the thing that identified it.

## Imitate it (2019)

The next move was to stop looking unusual and start looking boring. Rather than invent a new shape, wrap traffic in the most common shape on the internet: HTTPS.

Trojan took this approach — real TLS, a real certificate, and a real web page served to anyone who probes the server. The disguise is good. Its weak point is ownership: the certificate is yours, for a domain that is yours, and that domain carries nothing but proxy traffic. A censor who maps which domains carry suspicious long-lived sessions can block the domain without decrypting anything.

## Strip it down (2020)

VLESS arrived as VMess's successor with a deliberately subtractive design: no built-in encryption, no protocol-specific markers, minimal overhead. The reasoning was that every additional layer VMess added had eventually become a fingerprint. Remove the layers and there is less to recognise.

By itself this made VLESS light, not invisible. It needed a transport worthy of it.

## Borrow it (2022)

Reality, from the XTLS project, is where the argument lands. Instead of presenting a certificate you own, it completes a genuine TLS 1.3 handshake with a real third-party website and relays that site's real certificate chain.

The shift is subtle and decisive. Trojan asks a censor to believe your server is a website. Reality does not ask for belief: the handshake really is with a real site, the certificate really does validate, and probing the server produces the responses that site would produce. There is no attacker-owned domain to blocklist, because the domain in the handshake is not yours.

## What the pattern shows

Each generation was defeated not by broken cryptography but by being *distinguishable*. Encryption was beaten by classification. Obfuscation was beaten by better classification. Imitation was beaten by attribution — finding the domain rather than breaking the disguise.

Reality answers all three by refusing to be a distinct thing at all. That is a strong position, and it is not permanent. The likely next pressure is not on the protocol but on the camouflage targets: censors enumerating which sites are commonly impersonated, and treating traffic to them differently.

Doppler VPN runs VLESS-Reality on Xray-core today. For the mechanics, see [What is VLESS](/en/blog/what-is-vless); for how it compares to what you may be running now, [VLESS-Reality vs WireGuard](/en/blog/vless-reality-vs-wireguard).$c$,
    NULL,
    $mt$From VMess to Reality: A Short History of Hiding Traffic$mt$,
    $md$A decade of censorship-resistant protocols — Shadowsocks, VMess, Trojan, VLESS, Reality — and why each fell to classification, not broken cryptography.$md$,
    $ot$From VMess to Reality: A Short History of Hiding Traffic$ot$,
    $od$A decade of censorship-resistant protocols, each a response to how the last one got caught. Why every generation fell to classification rather than broken cryptography.$od$
  FROM upsert_post
  ON CONFLICT (post_id, locale) DO UPDATE SET
    title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
    meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description,
    og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description,
    updated_at = now()
  RETURNING post_id
)
INSERT INTO blog_post_tags (post_id, tag_id)
SELECT up.id, bt.id FROM upsert_post up
CROSS JOIN blog_tags bt WHERE bt.slug IN ('protocol', 'censorship', 'encryption')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------
-- Internal links — cluster the five posts plus the existing
-- vless-reality-explained, so each has related-post links and
-- link equity stays inside the VLESS cluster.
-- -----------------------------------------------------
INSERT INTO blog_internal_links (source_post_id, target_post_id, link_order)
SELECT s.id, t.id, l.link_order
FROM (VALUES
  ('what-is-vless',              'vless-reality-explained',     0),
  ('what-is-vless',              'vless-vs-vmess-vs-trojan',    1),
  ('what-is-vless',              'vless-uri-format',            2),
  ('vless-vs-vmess-vs-trojan',   'what-is-vless',               0),
  ('vless-vs-vmess-vs-trojan',   'vless-reality-vs-wireguard',  1),
  ('vless-vs-vmess-vs-trojan',   'censorship-protocol-history', 2),
  ('vless-reality-vs-wireguard', 'what-is-vless',               0),
  ('vless-reality-vs-wireguard', 'vless-reality-explained',     1),
  ('vless-reality-vs-wireguard', 'vless-vs-vmess-vs-trojan',    2),
  ('vless-uri-format',           'what-is-vless',               0),
  ('vless-uri-format',           'vless-reality-explained',     1),
  ('censorship-protocol-history','what-is-vless',               0),
  ('censorship-protocol-history','vless-vs-vmess-vs-trojan',    1),
  ('censorship-protocol-history','vless-reality-vs-wireguard',  2)
) AS l(source_slug, target_slug, link_order)
JOIN blog_posts s ON s.slug = l.source_slug
JOIN blog_posts t ON t.slug = l.target_slug
ON CONFLICT (source_post_id, target_post_id) DO NOTHING;

COMMIT;

-- =====================================================
-- Verify (run after COMMIT)
-- =====================================================
-- Expect 5 rows, all status='draft', each with exactly one 'en' translation:
--
--   SELECT p.slug, p.status, length(p.slug) AS slug_len,
--          count(t.locale) AS locales,
--          length(tr.meta_title) AS mt_len,
--          length(tr.meta_description) AS md_len
--   FROM blog_posts p
--   LEFT JOIN blog_post_translations t  ON t.post_id = p.id
--   LEFT JOIN blog_post_translations tr ON tr.post_id = p.id AND tr.locale = 'en'
--   WHERE p.slug IN ('what-is-vless','vless-vs-vmess-vs-trojan',
--                    'vless-reality-vs-wireguard','vless-uri-format',
--                    'censorship-protocol-history')
--   GROUP BY p.slug, p.status, tr.meta_title, tr.meta_description;
--
-- mt_len must be <= 70 and md_len <= 160 (DB caps; over-length would have
-- been rejected on insert, so this is a belt-and-braces check).
--
-- Confirm drafts are NOT publicly visible (should return 0 rows) using the
-- anon key rather than the service-role key.
