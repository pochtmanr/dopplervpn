> **Röviden.** A VMess a V2Ray projekt eredeti protokollja. Saját fejléceit titkosítja, és általában egy másik átvitelbe csomagolják, például WebSocketbe TLS fölött, hogy webes forgalomnak látsszon. Még működik, de az utódai, a VLESS és a Trojan, ugyanazt a feladatot kisebb többletterheléssel végzik.

## Mi a VMess?

A VMess az a titkosított proxyprotokoll, amelyet a [V2Ray projekt](https://github.com/v2fly/v2ray-core) a 2015-ös indulásakor bevezetett. A V2Ray moduláris platformmá nőtte ki magát proxyk építésére: egy mag, sok protokoll és átvitel, és egy útválasztó motor, amely eldönti, melyik forgalom hova megy. A VMess volt az első protokollja, és több évig a fő protokollja.

A Shadowsockshoz hasonlóan a VMess technikailag proxy, nem VPN, a V2Ray-alapú alkalmazások azonban az egész eszközödet átvezethetik rajta.

## Hogyan működik?

Minden felhasználónak van egy UUID-ja, amely a hitelesítő adata. A [protokolldokumentáció](https://www.v2fly.org/en_US/developer/protocols/vmess.html) szerint a kliens kérésének fejléce titkosított hitelesítési azonosítót tartalmaz, amelyet Unix-időbélyegből, véletlen számból és ellenőrzőösszegből építenek, a felhasználó azonosítójából származtatott kulccsal titkosítva. A szerver ezzel ismeri fel a felhasználót, majd visszafejti a fejléc többi részét és az adatokat.

A dokumentáció a fejléc védelmének két módját írja le. A mai AEAD-titkosítást használ, amely garantálja, hogy a fejlécet nem módosították. A régebbi MD5-öt és AES-128-CFB-t használt, és nem tudta garantálni a fejléc sértetlenségét; a dokumentáció óva int tőle. Mivel a hitelesítési azonosító időbélyeget tartalmaz, a kliens és a szerver órájának nagyjából szinkronban kell lennie. Ez gyakori forrása az „egyszerűen nem csatlakozik” problémáknak.

## Mennyire nehéz blokkolni a VMess-t?

Önmagában a VMess véletlen bájtoknak látszik, ezért ugyanabban a helyzetben van, mint a [Shadowsocks](/vpn-protocols/shadowsocks): ki van téve azoknak a tűzfalaknak, amelyek a teljesen titkosított forgalmat blokkolják. Ezért a VMess-t általában WebSocket vagy gRPC belsejébe telepítik, TLS fölött, egy domain és egy tanúsítvány mögé, hogy a megfigyelő olyasmit lásson, ami egy weboldalra menő normál HTTPS-kapcsolatnak tűnik.

A takarás munkájának nagy részét ez a burkolat végzi, és költsége van: kell egy domain, egy tanúsítvány, és gyakran egy CDN a szerver elé, a szerver pedig kétszer titkosítja az adatokat, egyszer a TLS-hez és egyszer a VMess-hez.

## VMess, VLESS vagy Trojan?

A [VLESS](/vpn-protocols/vless-reality)-t az Xray projekt könnyebb utódként tervezte: megőrzi az UUID-alapú azonosítást, de elhagyja a VMess saját titkosítását, és teljesen a TLS-rétegre támaszkodik, így elkerüli a kétszeres titkosítást. A [Trojan](/vpn-protocols/trojan) hasonló megközelítést használ, jelszóval UUID helyett. A [VLESS, VMess és Trojan](/blog/vless-vs-vmess-vs-trojan) összehasonlításunk a részletekbe megy.

## Használ-e a Doppler VMess-t?

Nem. A Doppler VLESS-t használ Reality-vel. A [miért a VLESS](/vpn-protocols/why-vless) útmutató elmagyarázza, miért.
