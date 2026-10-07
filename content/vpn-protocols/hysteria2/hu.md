> **Röviden.** A Hysteria 2 proxyprotokoll, amely QUIC-re épül, arra az átvitelre, amely a HTTP/3 mögött áll. Rossz és veszteséges kapcsolatokon való sebességre tervezték, és jelszó nélkül a szervere hétköznapi HTTP/3-weboldalként viselkedik. A gyenge pontja, hogy UDP-től függ, amelyet egyes hálózatok lassítanak vagy egyenesen blokkolnak.

## Mi a Hysteria 2?

A Hysteria nyílt forráskódú projekt az [apernet](https://github.com/apernet/hysteria) részéről; a 2-es verzió, egy újratervezett protokoll, 2023 szeptemberében jelent meg. A Shadowsockshoz és a VLESS-hez hasonlóan proxy, nem klasszikus VPN, és a kliensek egy egész eszközt átvezethetnek rajta.

## Hogyan működik?

A [protokollspecifikáció](https://v2.hysteria.network/docs/developers/Protocol/) szerint a Hysteria 2 QUIC fölött fut, ahogyan az [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000) meghatározza, az UDP-forgalomhoz a megbízhatatlan datagramok kiterjesztésével. A QUIC eleve ad TLS 1.3-titkosítást, multiplexelt adatfolyamokat és gyors kapcsolatfelépítést.

Az álcázás a hitelesítésnél lép be. A specifikáció megköveteli, hogy a Hysteria-szerver **valódi HTTP/3-szervert valósítson meg** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)), és a kéréseket úgy kezelje, ahogy bármely webszerver tenné. A kliens egy különleges HTTP/3-kéréssel hitelesít; mindenki más, legyen kíváncsi látogató vagy aktív szonda, hétköznapi webes válaszokat kap. A specifikáció kimondja, hogy hitelesítő adatok nélküli harmadik fél számára a szerver pontosan úgy viselkedik, mint egy szabványos HTTP/3-webszerver.

## Miért gyors?

A QUIC UDP-n fut, és a csomagvesztésből úgy áll helyre, hogy nem állít meg minden adatfolyamot, ahogy a TCP teszi. A Hysteria saját torlódáskezelést is használhat, instabil kapcsolatokra célozva, ezért hajlamos tartani a sebességét túlterhelt mobilhálózatokon, nagy távolságú útvonalakon és zavart Wi-Fi-n, ahol a TCP-alapú protokollok lelassulnak.

## Mennyire nehéz blokkolni a Hysteria 2-t?

Az aktív szondázással szemben jól tartja magát, mert a szondák webszervert látnak. A kitettség az átvitel. A cenzor lassíthatja vagy blokkolhatja az UDP-t, vagy konkrétan a QUIC-et, anélkül hogy a legtöbb weboldalt tönkretenné, mert a böngészők HTTP/2-re esnek vissza TCP-n, ha a HTTP/3 nem sikerül. Ahol ez megtörténik, a Hysteria 2-nek nincs hova mennie, míg a TCP-alapú protokollok, például a [VLESS-Reality](/vpn-protocols/vless-reality), tovább működnek.

## Mikor érdemes a Hysteria 2-t használni?

- **Veszteséges vagy nagy távolságú kapcsolatokon**, ahol a torlódáskezelése és a QUIC csomagvesztés-helyreállítása megtérül.
- **Olyan hálózatokon, amelyek engedik az UDP-t.** Ellenőrizd, mielőtt rá hagyatkozol.
- Második protokollként egy TCP-s lehetőség mellett, hogy válthass, ha az UDP-t szűrik. A [cenzúraútmutatónk](/bypass-censorship) arról szól, hogyan veszik célba a szűrők az átvitelt.

## Használ-e a Doppler Hysteria 2-t?

Nem. A Doppler VLESS-Reality-t használ TCP fölött, amely azokon a hálózatokon is működik, amelyek blokkolják az UDP-t. Lásd: [miért a VLESS](/vpn-protocols/why-vless).
