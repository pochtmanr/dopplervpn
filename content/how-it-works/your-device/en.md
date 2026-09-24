> **The short version.** Before any VPN switches on, your phone or laptop already tells the network a lot: your IP address, the sites you look up, and often the name of every site you connect to. Most VPNs then ask for your email and card on top of that. Doppler takes the opposite route. The app makes up a random account ID on your device, asks you for nothing, and resolves your DNS inside the tunnel.

## What does your device reveal before you connect?

Open a website on café Wi-Fi and at least three parties can watch some of it: whoever runs the Wi-Fi, your internet provider, and the site itself. None of them need to hack anything. Each one sees what the network hands it by design.

Anyone who carried a laptop into a coffee shop around 2010 may remember Firesheep, a Firefox add-on released that October. It let whoever shared the open network click their way into other people's logged-in sessions on popular sites, no skill required. HTTPS on every page has since closed that particular hole. It did not close them all.

Here is what still leaves your device on an ordinary connection.

### Your IP address

Every packet carries your public IP address, and the IP says more than most people think. MaxMind, whose geolocation data sits behind a large share of the web, [says](https://support.maxmind.com/hc/en-us/articles/4407630607131-Geolocation-Accuracy) it places an IP in the right country 99.8% of the time. For US addresses it gets the city right, within 50 km, about two times in three. That is enough for a site to work out your town and your provider before you type a thing.

### Your DNS lookups

Before your browser can load `example.com` it has to ask a DNS server for the address. For most of the internet's history those questions went out in plain text, including for sites that use HTTPS. Firefox only began [turning on encrypted DNS by default](https://blog.mozilla.org/blog/2020/02/25/firefox-continues-push-to-bring-dns-over-https-by-default-for-us-users/) for US users in February 2020. On many phones, routers and apps, lookups still travel unencrypted, so your provider can read a list of every domain you visit.

### The site name inside HTTPS

On the early web, passwords crossed the network in plain text over HTTP and FTP, readable by anyone on the same wire who cared to look. Today HTTPS hides the page, the text you type and the pictures you load. It usually does not hide *which site* you are talking to. The first message of a TLS connection, the ClientHello, names the site in a field called SNI, and that field has traditionally been sent in the clear. A fix called Encrypted Client Hello (ECH) exists: Cloudflare [switched it on](https://blog.cloudflare.com/announcing-encrypted-client-hello/) for its customers in September 2023, and it became an IETF standard as [RFC 9849](https://www.rfc-editor.org/info/rfc9849/). It only works when both your browser and the site support it, though, and many sites still don't.

### WebRTC

In January 2015 a developer named Daniel Roesler published a short script that asked the browser's WebRTC video-call feature for the machine's network addresses. It needed no permission prompt, and it [revealed the real IP](https://thehackernews.com/2015/02/webrtc-leaks-vpn-ip-address.html) of people who were connected to a VPN. Browsers have since added limits, but a badly configured VPN can still leak this way. You can check yours with our [WebRTC leak test](/tools/webrtc-leak-test).

### Your browser's fingerprint

Even with a hidden IP, the browser gives away its own shape: screen size, fonts, graphics card, time zone, language. In 2010 the EFF's Panopticlick project [collected about 470,000 browsers](https://www.eff.org/press/archives/2010/05/13) and found that 83.6% of them were unique. A 2016 study, AmIUnique, looked at another 118,934 and still found 89.4% [unique](https://www.semanticscholar.org/paper/fe2f4faec5cf209ae7d8a73100db9cce46ce53d4).

```chart
fingerprint-uniqueness
```

A VPN does not fix fingerprinting. That is a browser problem, and we would rather say so here than let the table below suggest otherwise.

## Who can see what?

Here is the picture for someone browsing an HTTPS site, first with no VPN and then with Doppler connected.

| What is visible | To your Wi-Fi or ISP, no VPN | To your Wi-Fi or ISP, with Doppler | To the website, with Doppler |
|---|---|---|---|
| Your real IP address | Yes | Yes (they are your ISP) | **No**, it sees the edge node's IP |
| Domains you look up (DNS) | Often, if DNS is unencrypted | **No**, DNS is resolved inside the tunnel | Only its own domain |
| Site name in the TLS handshake (SNI) | Yes, unless the site uses ECH | **No**, it sees one ordinary-looking TLS session | Its own name |
| Page content | No (HTTPS protects it) | No | Yes, it's their page |
| That you use a VPN | Usually, for classic protocols | Very hard to tell, see [step 2](/how-it-works/vless-reality-tunnel) | Possibly, from the IP |
| Your browser fingerprint | No | No | **Yes**, a VPN does not change it |

The pattern is simple. A good VPN moves trust away from the network you happen to be sitting on. It does not make you invisible to the sites you sign into.

## Why do internet providers care what you do online?

Because the data is worth money, and in some countries the law requires them to keep it.

In October 2021 the US Federal Trade Commission [published a staff report](https://www.ftc.gov/news-events/news/press-releases/2021/10/ftc-staff-report-finds-many-internet-service-providers-collect-troves-personal-data-users-have-few) on six providers that between them serve about 98% of the country's mobile internet market. It found they collect "far more data than many consumers may expect," including access to all of their users' internet traffic and real-time location. Some sorted customers into groups by race or sexual orientation for advertising.

Retention laws add another layer:

- **United Kingdom.** Under section 87 of the [Investigatory Powers Act 2016](https://www.legislation.gov.uk/ukpga/2016/25/section/87), providers can be ordered to keep "internet connection records" (which services a device connected to) for up to 12 months.
- **Russia.** Since 1 July 2018 the Yarovaya law has required operators to [store the content of communications for six months and metadata for three years](https://www.hrw.org/news/2020/06/18/russia-growing-internet-isolation-control-censorship).
- **European Union.** The EU's highest court [threw out the Data Retention Directive](https://curia.europa.eu/site/upload/docs/application/pdf/2014-04/cp140054en.pdf) in 2014, and in 2016 it went further, ruling that blanket retention of traffic data breaks EU law. Several member states still run their own national schemes.

None of this needs your consent. It is simply what happens to traffic that leaves your device unprotected.

## Why is asking for your email a privacy risk?

Most VPN apps start with a sign-up form: email, password, then a card. Each field is a piece of data the provider now holds, and data that is held can leak.

Some of the worst leaks in the VPN industry came from providers that promised to keep nothing:

- **2020.** Seven Hong Kong VPN apps that shared one backend, among them UFO VPN, all claimed "no logs". Researchers found an open database holding [over a billion log entries](https://www.theregister.com/2020/07/17/ufo_vpn_database/), 1.2 TB in all, with email addresses, plain-text passwords, IP addresses and connection logs.
- **2021.** Records of [21 million users](https://www.kaspersky.com/blog/supervpn-geckovpn-chatvopn-leak/39029/) of SuperVPN, GeckoVPN and ChatVPN went up for sale on a hacker forum: emails, passwords, names, countries and payment details.
- **2023.** A researcher found an unprotected SuperVPN database with [360 million records](https://www.vpnmentor.com/news/report-super-vpn-breach/), including users' original IP addresses and web addresses they had visited.

VPNs are hardly alone here. [Have I Been Pwned](https://haveibeenpwned.com/), the breach index run by Troy Hunt, listed more than 17.8 billion breached accounts as of September 2026. Verizon's [2026 Data Breach Investigations Report](https://www.verizon.com/business/resources/executivebriefs/2026-dbir-executive-summary.pdf) found that stolen credentials were among the data taken in about a quarter of the breaches it studied.

```chart
dbir-2026
```

Europe's privacy law puts the fix in one line. Article 5(1)(c) of the [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj) says personal data must be "limited to what is necessary." Data that is never collected cannot be breached, sold or handed over.

## How does Doppler connect without an account?

When you first open Doppler, the app generates a random account ID on your device. It looks like `VPN-XXXX-XXXX-XXXX` and it *is* your subscription. There is no email field, no phone number and no password to reuse from another site.

```chart
schema-device
```

If you had an ICQ number in the late 1990s, the idea will feel familiar. Your contacts knew you by a string of digits, and that was enough to find you. Doppler works the same way, minus the contact list.

Set against the usual sign-up flow, this is what changes.

| Data point | Typical VPN sign-up | Doppler |
|---|---|---|
| Email address | Required | **Never asked for** |
| Phone number | Sometimes | **Never asked for** |
| Password | Required, often reused | **None**, the random ID is the credential |
| Real name | Taken from your card | Not collected when you pay through the app store or with crypto |
| Account identifier | Tied to your email | Random `VPN-XXXX-XXXX-XXXX` |
| Device identifier | Varies | Yes, to enforce your plan's device limit |
| API sign-in record | Varies, often undisclosed | IP, account ID, device ID and time, kept up to 90 days to stop abuse |

We list that last row on purpose. When the app talks to our API to sign in or fetch the server list, we see the IP address the request comes from, like any web service does. We keep that sign-in record for up to 90 days to stop abuse and enforce rate limits. It shows that a device signed in. It says nothing about what you did afterwards, because traffic is never logged. Our [security page](/security) spells out the full list.

If you pay on our website, the card processor sees your card details, not us. If you want no name attached at all, you can [pay with crypto](/pay-with-crypto).

### Isn't that just like passkeys?

The idea is related. Since the W3C made WebAuthn a web standard in March 2019, sites have been moving toward logins where a secret made on your device replaces a password you type. The FIDO Alliance [counted](https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/) about 5 billion passkeys in use by May 2026. Passkeys still sit on an account that usually has your email behind it. Doppler goes one step further and has no identity behind the ID at all.

## What happens next?

Once the app is signed in, it opens the tunnel. From that moment your DNS lookups, the site names in your TLS handshakes and your real destinations all travel inside it, where your Wi-Fi owner and your provider can no longer read them.

The catch is that a plain VPN tunnel is easy to spot, and in many countries spotting it means blocking it. How Doppler avoids that is the subject of [step 2: the VLESS-Reality tunnel](/how-it-works/vless-reality-tunnel).

Want to see your own device's exposure first? Our free [IP check](/tools/what-is-my-ip), [DNS leak test](/tools/dns-leak-test) and [WebRTC leak test](/tools/webrtc-leak-test) show exactly what a site can learn about your connection right now.
