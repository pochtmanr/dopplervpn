> **Röviden.** A Trojan a proxyforgalmat egy valódi TLS-kapcsolatba rejti, egy valódi weboldalra, amelyet te irányítasz. Aki jelszó nélkül csatlakozik, egyszerűen a weboldalt kapja. Jól működik, de saját domain és tanúsítvány kell, és ezeket meg lehet találni és blokkolni.

## Mi a Trojan?

A Trojan proxyprotokoll a [trojan-gfw projektből](https://github.com/trojan-gfw/trojan), először 2017 októberében jelent meg. Az ötlet a nevében van: ahelyett hogy álcát találna ki, az internet leggyakoribb titkosított forgalmába, a HTTPS-be bújik.

## Hogyan működik?

A [protokoll leírása](https://trojan-gfw.github.io/trojan/protocol) rövid. A Trojan-szerver úgy figyel, mint egy normál HTTPS-szerver, valódi tanúsítvánnyal egy valódi domainre. A kliens valódi TLS-kézfogást végez. Ezután a titkosított kapcsolaton belül elküldi:

- a közös jelszó hexadecimálisan kódolt SHA-224 kivonatát, amely 56 karakter,
- egy sortörést,
- egy rövid kérést arról, hova menjen a forgalom, SOCKS5-szerű formátumban,
- egy újabb sortörést, majd az adatok első darabját.

Ha a kivonat és a kérés érvényes, a szerver alagutat nyit a cél felé. Ha bármi hibás, a szerver „más protokollként” kezeli a kapcsolatot, és átadja egy tartalék webszervernek, így a látogató hétköznapi weboldalt lát.

## Mennyire nehéz blokkolni a Trojan-t?

Kívülről a Trojan-kapcsolat TLS-munkamenet a domainedre, a te tanúsítványoddal. Az aktív szondák valódi weboldalt kapnak vissza. Ezért a Trojan-t sokkal nehezebb kiszúrni, mint a véletlenszerűnek látszó protokollokat, például a [Shadowsocks](/vpn-protocols/shadowsocks)-t.

A gyenge pontja maga a domain. Minden szerverhez domain és tanúsítvány kell, és a cenzor, amely megtudja, mely domainek tartoznak proxykhoz, név vagy IP szerint blokkolhatja őket. A kutatók azt is megmutatták, hogy a TLS-be csomagolt TLS időzítési és méretmintákat hagy, amelyek [ujjlenyomatozhatók](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting); ez a Trojan-t és a hasonló felépítéseket érinti.

A [VLESS-Reality](/vpn-protocols/vless-reality) megszünteti a domain problémáját: egy már létező, népszerű weboldal TLS-kézfogását kölcsönzi a sajátod helyett.

## Mikor érdemes a Trojan-t használni?

- **Ha van domained**, és egyszerű, jól érthető, HTTPS-nek látszó beállítást szeretnél.
- **Mérsékelten szűrt hálózatokon**, ahol a domainedet valószínűleg nem veszik célba.
- A [VLESS, VMess és Trojan](/blog/vless-vs-vmess-vs-trojan) összehasonlításunk segít, ha közülük választasz.

## Használ-e a Doppler Trojan-t?

Nem. A Doppler VLESS-Reality-t használ, amelynek nincs szüksége saját domainre. Lásd: [miért a VLESS](/vpn-protocols/why-vless).
