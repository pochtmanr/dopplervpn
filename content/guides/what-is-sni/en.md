> **The short version.** Every secure connection names the website it is going to, in plain text, before the encryption starts. That name is the SNI. Censors read it to decide what to block. Doppler makes each connection name an ordinary site that is allowed where you are, so the tunnel looks like a normal visit there.

## The name on the envelope

When your browser opens `https://example.com`, the first message it sends is called the ClientHello. It starts the encrypted session, and it carries a field called **Server Name Indication**, SNI for short. The field says, in readable text, which site you want.

It exists for a practical reason. One server often hosts hundreds of websites on a single IP address, and it needs to know which site's certificate to present before any encryption is set up. The idea was written down in 2003 and is specified today in RFC 6066.

The padlock in your address bar covers everything after that first message: the pages, the passwords, the cookies. It does not cover the name. Think of a sealed letter with the address written on the envelope. Nobody can read the letter. Everybody who handles it can read the address.

## Why censors read it

For a censor, the SNI is the cheapest signal there is. It does not need to break any encryption or guess from traffic patterns. It reads one field and compares it to a list.

That is how many national filters block websites today, and it is also one of the ways they spot VPNs. A connection whose SNI names a known VPN provider, or a name that does not exist, or one that does not match what the server answers with, is easy to drop. People who remember the early 2000s web, when a school or office proxy simply kept a list of forbidden addresses, will recognise the method. It has only moved one layer down.

## What Encrypted Client Hello changes

There is a fix in progress. **Encrypted Client Hello**, ECH, encrypts the whole first message, the name included. It is now an IETF standard, RFC 9849, and Cloudflare turned it on for sites behind its network in 2023.

It helps less than it sounds where censorship is heaviest. ECH only works when both the browser and the site support it, and a censor that cannot read the name can still block every connection that hides it. China blocked the earlier version, called ESNI, outright in 2020 for exactly that reason. A hidden name is itself a signal.

## How Doppler uses the name instead of hiding it

Doppler takes the opposite approach to ECH. Rather than hiding the name, it shows a name the censor has no reason to block.

The protocol underneath is **VLESS Reality**. A Doppler connection presents the SNI of a real, popular website that works where you are, such as a large search, shopping or software site. If a censor probes the server to check, Reality forwards the probe to the real site, so the check passes. Only a client holding the right key gets the tunnel.

![Doppler's Connection method screen on iPhone, listing the sites a connection can look like a visit to](/images/apple/sni-options-1800.avif "The Connection method screen. Each row is a site your connection can look like a visit to.")

## The Connection method screen

Which name works depends on the country and on the week. That is why Doppler gives the choice its own screen, **Connection method**, opened from the top of the server list or from App Settings.

- **Connecting from** is your country. Doppler detects it, and you can change it. Some countries need a special list of sites; others do not.
- **Automatic** is the default and the one we recommend. When you connect, the app tries the three likeliest sites at once and keeps whichever passes first. It learns from what has worked for people in your country recently.
- **One site of your choice** is there for when you know a particular name works on your network. Each row says how many servers carry it. If it stops working, switch back to Automatic.

![Doppler's Connection method sheet on a MacBook Pro](/images/apple/mac-hand-1800.avif "The same screen on Mac.")

If you allow it, Doppler sends anonymous counts of which sites connected and which failed. Those counts are what make Automatic smarter for everyone in your country. They never include your account or your IP address.

## What this does not promise

No disguise works forever. Censors study traffic, and researchers have shown that tunnels can sometimes be told apart from the sites they imitate by timing and size patterns, even when the SNI is perfect. In November 2025 users in Russia reported some VLESS Reality connections being disrupted.

Doppler's answer is to keep options open rather than to promise the impossible: several disguise sites per server, a race between them on every connect, and fallback routes when one fails. The [how it works series](/how-it-works/vless-reality-tunnel) goes deeper into the tunnel itself.
