> **Röviden.** A VLESS minimális proxyprotokoll az Xray projektből. A Reality az a TLS-réteg, amely miatt a VLESS-kapcsolat egy valódi, népszerű weboldal hétköznapi TLS 1.3-as látogatásának látszik, saját domain és tanúsítvány nélkül. Együtt jelenleg ez a cenzorok számára legnehezebben blokkolható elterjedt kombináció. Ez az oldal az összefoglaló; a teljes történet a [részletes útmutatóban](/how-it-works/vless-reality-tunnel) van.

## Mi a VLESS?

A VLESS-t [2020 júliusában javasolták](https://github.com/v2ray/v2ray-core/issues/2636) a [VMess](/vpn-protocols/vmess) könnyebb utódjaként. A [specifikáció](https://xtls.github.io/en/development/protocols/vless.html) szándékosan kicsi: protokollverzió, egy 16 bájtos UUID, amely azonosítja a felhasználót, egy opcionális kiegészítőmező, valamint a cél parancsa, portja és címe. A VLESS-nek nincs saját titkosítása. Az alatta lévő TLS-rétegre támaszkodik, így a forgalom nem titkosítódik kétszer.

A VLESS az [Xray-core](https://github.com/XTLS/Xray-core) része, annak a projektnek, amely 2020 novemberében vált le a V2Ray-ról, és ma ennek a protokollcsaládnak a fejlesztését viszi.

## Mit ad hozzá a Reality?

Az olyan protokollok, mint a [Trojan](/vpn-protocols/trojan), a saját domainedre menő TLS-be bújnak, és ez a domain lesz az, amit a cenzor blokkolhat. A [Reality](https://github.com/XTLS/REALITY), amely az Xray-core [1.8.0-s verziójában, 2023 márciusában](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0) jelent meg, ezt kiveszi.

A Reality-szerver egy valódi, harmadik féltől származó weboldal TLS-kézfogását mutatja. A megfigyelő számára a kapcsolat normál TLS 1.3-as látogatás arra az oldalra. A kliens, amely ismeri a szerver kulcsát, bejut a VLESS-alagútba; mindenki mást, beleértve a cenzor aktív szondáját, a valódi weboldalra továbbítják, és annak valódi tanúsítványát látja. Nincs Doppler-domain vagy tanúsítvány, amelyet tiltólistára lehetne tenni.

## Mennyire nehéz blokkolni a VLESS-Reality-t?

Ez a legellenállóbb elterjedt lehetőség, amelyet ismerünk, de nem láthatatlan. Egy 2024-ben megjelent kutatás megmutatta, hogy a [TLS-be csomagolt TLS ujjlenyomatozható](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) az időzítése és a csomagméretei alapján, 2025 novemberében pedig felhasználók [beszámoltak](https://github.com/net4people/bbs/issues/546) róla, hogy egyes orosz internetszolgáltatók megszakítják a Reality-kapcsolatokat. A VPN-szolgáltatók a szerverbeállítások és a kölcsönzött oldalak hangolásával válaszolnak, és a macska-egér játék folytatódik.

## Mennyire gyors?

A mindennapi használatban a többletterhelés kicsi. A VLESS-fejléc kapcsolatonként egyszer megy el, az XTLS Vision adatfolyam pedig elkerüli, hogy a már titkosított webes forgalmat másodszor is titkosítsa. Mivel TCP-n fut, a VLESS-Reality veszteséges hálózaton lassabb lehet az olyan UDP-protokolloknál, mint a [WireGuard](/vpn-protocols/wireguard), de ott is működik, ahol azokat blokkolják.

## Hol tudhatok meg többet?

- [A VLESS-Reality-alagút részletesen](/how-it-works/vless-reality-tunnel): történelem, működés, korlátok.
- [Mi a VLESS?](/blog/what-is-vless) és [a VLESS URI formátuma](/blog/vless-uri-format) a blogunkon.
- [VLESS VPN](/vless-vpn): hogyan csomagolja a Doppler a VLESS-Reality-t egyérintéses alkalmazásokba.
