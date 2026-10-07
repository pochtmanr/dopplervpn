> **Kort version.** WireGuard är det snabbaste och enklaste vanliga VPN-protokollet, och i ett ofiltrerat nät är det ett utmärkt val. Det utformades aldrig för att dölja att det är en VPN, och i Ryssland, Iran och Kina är det bland de första protokollen som blockeras.

## Vad är WireGuard?

WireGuard är ett VPN-protokoll som skrevs av Jason A. Donenfeld och släpptes första gången 2015. Målet var att ersätta de stora, konfigurerbara protokoll som kom före med något så litet att det går att granska. I mars 2020 [togs det in i Linuxkärnan 5.6](https://en.wikipedia.org/wiki/WireGuard), och officiella appar finns nu för Windows, macOS, iOS, Android och Linux.

I stället för att låta parterna förhandla fram en chiffersvit låser WireGuard fast en uppsättning moderna primitiver. På [protokollsidan](https://www.wireguard.com/protocol/) listas de: ChaCha20 med Poly1305 för kryptering, Curve25519 för nyckelutbyte och BLAKE2s för hashning. Det finns inget att konfigurera fel och inget äldre, svagare alternativ att falla tillbaka på.

## Hur fungerar det?

Varje enhet har ett nyckelpar, ungefär som SSH. Klienten och servern känner till varandras publika nycklar i förväg, och handskakningen bygger på Noise-protokollramverket (protokollsidan anger den exakta konstruktionen, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Alla paket skickas över UDP](https://www.wireguard.com/protocol/), och en ny session upprättas i en enda tur och retur.

Den konstruktionen är skälet till att WireGuard känns snabbt. Det finns lite att förhandla om, koden körs i operativsystemets kärna på Linux, och byte mellan Wi-Fi och mobildata sker tyst eftersom protokollet inte håller en långlivad anslutning öppen.

## Varför blockeras WireGuard?

Samma enkelhet som gör WireGuard lätt att granska gör det lätt att känna igen. Dess [vitbok](https://www.wireguard.com/papers/wireguard.pdf) anger handskakningsmeddelandena byte för byte, så det första paketet från en klient är alltid 148 byte och svaret alltid 92 byte, och båda börjar med ett fast fält för meddelandetyp. Ett system för djup paketinspektion (DPI) behöver bara en kort regel för att se det mönstret i UDP.

Censorer har gjort just det. I augusti 2023 [rapporterade](https://github.com/net4people/bbs/issues/274) användare i Ryssland att stora mobiloperatörer bröt WireGuard-sessioner direkt efter handskakningen. Krypteringen skyddade fortfarande innehållet, men själva anslutningen var borta.

Det är en konstruktionsavvägning, inte en bugg. WireGuards författare valde ett fast, minimalt protokoll, och förklädnad ingick inte i målen. Projekt som [AmneziaWG](/vpn-protocols/amneziawg) ändrar paketens form för att återställa en del av täckmanteln.

## När ska du använda WireGuard?

- **Ofiltrerade nät.** Hemma, på jobbet eller på resa i ett land som inte blockerar VPN:er är WireGuard svårt att överträffa i hastighet och batteritid.
- **Egen server.** Om du driver en egen server är WireGuard ett av de lättaste protokollen att konfigurera rätt.
- **Inte under DPI-filtrering.** Om ditt nät blockerar VPN:er passar ett protokoll som är byggt för att se ut som vanlig webbtrafik bättre, till exempel [VLESS-Reality](/vpn-protocols/vless-reality). Vår jämförelse av [VLESS-Reality och WireGuard](/blog/vless-reality-vs-wireguard) tar upp avvägningen mer ingående.

## Använder Doppler WireGuard?

Nej. Dopplers appar ansluter via VLESS-Reality, eftersom Doppler är byggt för nät där WireGuard filtreras. Guiden [varför VLESS](/vpn-protocols/why-vless) förklarar resonemanget.
