> **The short version.** The edge node is where your traffic comes out of the tunnel and goes to the open internet. It swaps your real IP for its own, resolves your DNS, and sits as close to you as the network allows, because every 100 km of fibre costs about a millisecond of round trip. It is also where a VPN's "no logs" promise is either kept or broken. Here is what ours does and does not keep, including the parts other providers leave out.

## What does an edge node actually do?

If you got online in the dial-up years, you will remember that your ISP was once your only door to the internet. Every request left through their building, under their name. A VPN edge node puts a second door somewhere else and lends you its name.

In technical terms it does three jobs.

1. **It ends the tunnel.** Your encrypted VLESS-Reality connection from [step 2](/how-it-works/vless-reality-tunnel) lands here and is unwrapped.
2. **It swaps the address.** The node forwards your request using its own public IP, a technique called network address and port translation, defined back in [RFC 3022](https://www.rfc-editor.org/rfc/rfc3022) in 2001. The site you visit sees the node, not your home or mobile connection.
3. **It answers your DNS lookups.** Doppler resolves DNS inside the tunnel, so the list of domains you visit never passes through your ISP's resolver.

```chart
schema-edge
```

That third point is easy to miss. Unencrypted DNS is a leftover from the old plain-text internet, and a VPN that sends your traffic through the tunnel but leaves DNS outside it still hands your ISP a neat diary of every site you open. Our [DNS leak test](/tools/dns-leak-test) will tell you in a few seconds whether yours is doing that.

## Why does the distance to the server matter?

Because light is fast, but not fast enough to ignore. Anyone who played online games over a 56k modem learned the word "lag" long before learning what caused it. Part of the answer was always distance.

Light in optical fibre travels at roughly two thirds of its speed in a vacuum, about 200,000 km per second. Cloudflare's engineers [put it neatly](https://blog.cloudflare.com/fastest-internet/): a server 100 km away costs you at least **1 ms** of round trip before any computer does any work. Real routes are never straight lines, so real numbers are always higher.

```chart
latency-distance
```

The gap between the dotted line and the measured dots is routing: cables that follow coastlines, traffic that hops between networks, links that are simply busy. The best transatlantic cable ever tested, Hibernia Express, [managed under 59 ms](https://www.submarinenetworks.com/en/systems/trans-atlantic/project-express/hibernia-express-connects-new-york-to-london-in-under-58-95ms) between New York and London in 2015. The ordinary internet path between the same cities measures about 70 ms.

### How much delay can you feel?

For calls, the telecom world settled this long ago. The ITU's [G.114 recommendation](https://www.itu.int/rec/T-REC-G.114-200305-I/en) sets out how much one-way delay a conversation can take.

| One-way delay | What it feels like (ITU-T G.114) |
|---|---|
| 0 to 150 ms | Essentially transparent. Most people notice nothing. |
| 150 to 400 ms | Usable, but you start talking over each other. |
| Over 400 ms | Unacceptable for normal conversation. |

For web pages the tolerance is even lower than people admit. Google's research found that [53% of mobile visits](https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/) are abandoned when a page takes more than three seconds to load. A detour through a far-away server eats into that budget on every single request.

That is why the Doppler app picks the fastest node for your location automatically. A nearby node adds a few milliseconds. The wrong one, on the far side of the planet, can add a quarter of a second to everything you do.

## What does "zero-log" really mean?

Every VPN says it keeps no logs. Some have been telling the truth. Some have not. The only test that counts is what happens when someone with a court order comes knocking, and that has happened often enough to give us a record.

| Year | Provider | What happened | Result |
|---|---|---|---|
| 2011 | HideMyAss | UK court order in the LulzSec investigation | Session logs [handed over](https://www.theregister.com/2011/09/26/hidemyass_lulzsec_controversy/); a user was arrested |
| 2016 | Private Internet Access | FBI subpoena in a bomb-hoax case | Could only say the IPs were ["from the east coast"](https://torrentfreak.com/vpn-providers-no-logging-claims-tested-in-fbi-case-160312/) |
| 2016 | IPVanish | US Homeland Security summons | Real IP and connection times [handed over](https://torrentfreak.com/ipvanish-no-logging-vpn-led-homeland-security-to-comcast-user-180505/) despite a "zero logs" claim |
| 2017 | PureVPN | FBI cyberstalking case | Records [linked](https://torrentfreak.com/purevpn-logs-helped-fbi-net-alleged-cyberstalker-171009/) the account to the suspect's home and work IPs |
| 2017 | ExpressVPN | Server seized in Turkey | Police [found nothing](https://torrentfreak.com/vpn-server-seized-to-investigate-russian-ambassadors-assassination-1171219/) that identified users |
| 2023 | Mullvad | Swedish police search warrant | Officers [left with nothing](https://mullvad.net/en/blog/mullvad-vpn-was-subject-to-a-search-warrant-customer-data-not-compromised); the data did not exist |
| 2025 | Windscribe | CEO charged in Greece over a user's actions | Court [dismissed the case](https://windscribe.com/blog/windscribe-greek-court-case/); there were no logs to link anyone |

The lesson in that table is not about which brand is good. It is that a promise in a privacy policy is only as strong as the system behind it. The providers that came through had built servers that did not write the data down in the first place.

The industry has also moved toward proving it. Since ExpressVPN [announced](https://www.expressvpn.com/blog/introducing-trustedserver/) servers that run entirely from memory in 2019, RAM-only designs have become common. The large providers now pay firms such as Deloitte, KPMG and Cure53 for regular no-logs audits.

## What does a Doppler edge node keep?

Here is the full list, in the same terms as our [security page](/security) and [privacy policy](/privacy).

| Data | Stored? |
|---|---|
| Websites you visit, or your browsing history | **Never** |
| The content of your traffic | **Never** |
| DNS queries | **Never** |
| Bandwidth used, or how long you were connected | **Never** |
| Anything that links a person to specific network activity | **Never** |
| Anonymous, aggregated server performance metrics | Yes, for keeping the network healthy |
| A sign-in record for our API (IP, anonymous account ID, device ID, time) | Yes, up to 90 days, to stop abuse |

The last row is not about the edge node. It covers the moment your app signs in to our API, before the tunnel exists, and we list it because we would rather be precise than sound absolute. That record shows that a device signed in. It cannot show what that device did afterwards, because no traffic record exists to join it to.

### Where is Doppler based?

Doppler VPN is run by SIMNETIQ LTD, a company registered in England and Wales. The UK is one of the [Five Eyes](https://www.dni.gov/files/ICIG/Documents/Partnerships/FIORC/FIORC-Charter-2025.pdf) intelligence partners, and its [Investigatory Powers Act](https://www.legislation.gov.uk/ukpga/2016/25/section/87) lets the government ask telecom operators to keep connection records. We won't pretend otherwise. What we can say is what the table above says: the traffic records such a request would look for are not created, and a legal request can't produce data that was never written down.

## How do edge nodes help with censorship?

A censor that cannot read your traffic will try to block the servers instead. So the edge network has to keep moving.

- **Servers in multiple countries.** If one route is slow or blocked, there is another, and automatic selection picks the fastest one that works for you.
- **Rotation.** Addresses and configurations change as blocking techniques change, without you updating anything.
- **Protocol updates on the server side.** When a network starts filtering a transport, as some Russian ISPs did with Reality in late 2025, the fix ships from our side and your app picks it up.

This is the unglamorous half of fighting censorship. The protocol gets the headlines. Keeping a lot of small settings one step ahead of a filtering system is what keeps you connected on a Tuesday.

## Where does your traffic go next?

From the edge node your request reaches the open internet, and the site you asked for sees the node's address rather than yours. That is the last step of the journey, and it is the one you can check for yourself.

Our free tools run in your browser with no signup and nothing stored: the [IP address check](/tools/what-is-my-ip), the [DNS leak test](/tools/dns-leak-test) and the [WebRTC leak test](/tools/webrtc-leak-test). Run them once with Doppler off and once with it on, and compare. That comparison says more than anything we could write here.
