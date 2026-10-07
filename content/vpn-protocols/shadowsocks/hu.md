> **Röviden.** A Shadowsocks könnyű, titkosított proxy, amelyet Kínában készítettek, hogy átjusson a Nagy Tűzfalon. Évekig úgy működött, hogy semminek sem látszott. 2021 óta a kutatások azt mutatják, hogy a tűzfal pontosan az ilyen forgalmat blokkolja, mert a valódi forgalom ritkán ennyire véletlenszerű.

## Mi a Shadowsocks?

A Shadowsocks nyílt forráskódú proxyprotokoll, amely először [2012 áprilisában](https://en.wikipedia.org/wiki/Shadowsocks) jelent meg. Szigorúan véve nem VPN: SOCKS5-stílusú proxy titkosítással, és az alkalmazások döntik el, melyik forgalmat küldik át rajta. A gyakorlatban a legtöbb Shadowsocks-kliens ma rendszerszintű módot kínál, amely VPN-ként viselkedik.

Azért népszerű, mert egyszerű és gyors. A jelenlegi verziók [AEAD-rejtjeleket](https://shadowsocks.org/doc/aead.html) használnak, amelyek egy lépésben biztosítják a bizalmasságot, a sértetlenséget és a hitelességet, a protokoll [2022-es kiadása](https://shadowsocks.org/doc/sip022.html) pedig szigorította a visszajátszás elleni védelmet.

## Hogyan működik?

A kliens és a szerver közös jelszót használ, amelyből titkosítási kulcs lesz. Minden, amit a kliens küld, beleértve a kívánt weboldal címét, az első bájttól titkosított. Nincs felismerhető kézfogás, nincs tanúsítvány, és nincs nyílt szöveges fejléc. A megfigyelő számára a Shadowsocks-kapcsolat véletlenszerűnek látszó bájtok folyama.

## Hogyan észleli a Nagy Tűzfal a Shadowsocks-t?

Először aktív szondázással. A GFW Report kutatói [rögzítették](https://gfw.report/publications/imc20/en/), hogy a tűzfal több tízezer szondát küldött a gyanús Shadowsocks-szerverekre, valós kapcsolatokat játszott vissza és módosított, hogy lássa, hogyan reagál a szerver.

Aztán 2021 novembere óta egy durvább és szélesebb módszerrel. Egy [USENIX Security 2023-as tanulmány](https://gfw.report/publications/usenixsecurity23/en/) azt találta, hogy a tűzfal valós időben blokkolja a „teljesen titkosított” forgalmat. A kapcsolat első csomagját nézi, és mindent kihagy, ami ismert protokollnak látszik, vagy elég nyomtatható szöveget tartalmaz. Az egyik szabály a bájtonként beállított bitek átlagos számát méri: a 3.4 vagy az alatti, illetve a 4.6 vagy a feletti értékek mentesülnek, a köztes, véletlenszerűnek látszó adatok pedig nem. Ami megmarad, blokkolható.

A kutatók azt is megállapították, hogy a tűzfal ezt a kapcsolatok körülbelül 26%-ára alkalmazta, és csak a népszerű adatközpontok IP-tartományaira, valószínűleg a járulékos kár korlátozására. A protokolltervezőknek a tanulság egyértelmű volt: a véletlenszerű kinézet maga is ujjlenyomat.

## Mikor érdemes a Shadowsocks-t használni?

- **Könnyű, gyors proxyzásra** olyan hálózatokon, amelyek nem vizsgálják közelről a forgalmat.
- **Saját szerverre**, olyan eszközökkel, mint az Outline, amelyek egyszerűvé teszik a beállítást.
- **Óvatosan erős szűrés alatt.** Kínában és máshol, ahol a teljesen titkosított forgalmat blokkolják, a Shadowsocks sokkal kevésbé megbízható, mint a valódi TLS-t utánzó protokollok, például a [VLESS-Reality](/vpn-protocols/vless-reality). A [cenzúraprotokollok története](/blog/censorship-protocol-history) végigköveti, hogyan lépett tovább a terület.

## Használ-e a Doppler Shadowsocks-t?

Nem. A Doppler VLESS-Reality-t használ, az indokok a [miért a VLESS](/vpn-protocols/why-vless) útmutatóban vannak.
