> **Röviden.** A Dopplert olyan embereknek építettük, akiknek a hálózata blokkolja a VPN-eket. Azokon a hálózatokon nem az a kérdés, melyik protokoll a leggyorsabb papíron, hanem az, melyik csatlakozik még holnap is. A VLESS-t választottuk Reality-vel, mert ez hagy a cenzornak a legkevesebb felismernivalót és a legkevesebb blokkolnivalót, és elfogadjuk a vele járó kompromisszumokat.

## Mire választottunk?

A Doppler azoknak készült, akik olyan helyekről csatlakoznak, ahol a VPN-eket szándékosan szűrik: Oroszország, Irán, Kína, az Öböl egy része. Azokon a hálózatokon a titkosítás a könnyű rész. Az [összehasonlításunk](/vpn-protocols) minden protokollja jól titkosít. Az választja el őket, hogy a szűrőrendszer meg tudja-e mondani, hogy a kapcsolat VPN, és mit tud blokkolni, ha igen.

Ezért minden lehetőséget három kérdés alapján ítéltünk meg:

1. **Van rögzített ujjlenyomata?** Egy rögzített méretű kézfogást vagy egy szabványos portot egyetlen szabály is eltalálhat.
2. **Mi történik, amikor a cenzor megszondázza a szervert?** A tűzfalak maguk csatlakoznak a gyanús proxykhoz, hogy lássák, hogyan válaszolnak.
3. **Van mit tiltólistára tenni?** Egy domain, egy tanúsítvány vagy egy felismerhető szerver célpont, még akkor is, ha maga a forgalom jól el van rejtve.

## Miért nem a WireGuard, az OpenVPN vagy az IKEv2?

Mindhárom elbukik az első kérdésen. A [WireGuard](/vpn-protocols/wireguard) kézfogáscsomagjai mindig 148 és 92 bájtosak. Az [OpenVPN](/vpn-protocols/openvpn)-t a kutatók az adatfolyamok több mint 85%-ában azonosították, egy valódi internetszolgáltatón belül dolgozva. Az [IKEv2](/vpn-protocols/ikev2) szabványos UDP-portokon fut, amelyeket egészében el lehet dobni. 2023 augusztusában oroszországi felhasználók [beszámoltak](https://github.com/net4people/bbs/issues/274) róla, hogy a szolgáltatók az első csomagokon belül megszakítják a WireGuard-ot és az OpenVPN-t. Ezek jó protokollok nyílt hálózatokra. A mieinkre nem ezeket tervezték.

## Miért nem a Shadowsocks vagy a VMess?

Az első kérdésen átmennek, mert véletlen bájtoknak látszanak, és ez saját ujjlenyomatnak bizonyult. 2021 novembere óta a Nagy Tűzfal [blokkolja a teljesen titkosított forgalmat](https://gfw.report/publications/usenixsecurity23/en/), amely nem hasonlít egyetlen ismert protokollra sem. A [VMess](/vpn-protocols/vmess) TLS-be csomagolható, hogy ezt elkerülje, de akkor domain kell, és ezzel a harmadik kérdésnél vagyunk.

## Miért nem a Trojan?

A [Trojan](/vpn-protocols/trojan) az első két kérdésre jól válaszol: valódi TLS, és a szondák valódi weboldalt látnak. De minden Trojan-szervernek saját domain és tanúsítvány kell. Ha a cenzor megtudja azt a domaint, blokkolhatja, és sok domain fenntartása állandó hajsza.

## Amit a VLESS-Reality jól megold

A [VLESS-Reality](/vpn-protocols/vless-reality) mind a háromra válaszol:

- **Nincs rögzített ujjlenyomat.** A kapcsolat TLS 1.3 TCP-n, az internet leggyakoribb titkosított forgalma.
- **A szondák valódi weboldalt látnak.** A Reality mindenkit, aki nem tud hitelesíteni, arra a valódi oldalra továbbítja, amelynek a kézfogását kölcsönzi, az oldal valódi tanúsítványával.
- **Nincs a miénkből semmi, amit név szerint blokkolni lehetne.** A kézfogásban nincs Doppler-domain vagy tanúsítvány.

TCP-n is fut, ezért azokon a hálózatokon is működik, amelyek lassítják vagy blokkolják az UDP-t, ahol a [Hysteria 2](/vpn-protocols/hysteria2) és az [AmneziaWG](/vpn-protocols/amneziawg) nehezen boldogul. Maga a VLESS pedig kicsi: a titkosításhoz a TLS-re támaszkodik a sajátja helyett, így nincs kétszeres titkosítás.

## Amiről lemondtunk

- **A nyers sebességről veszteséges kapcsolatokon.** A TCP kevésbé jól heveri ki a csomagvesztést, mint a QUIC vagy a WireGuard UDP-je. Tiszta kapcsolaton a különbség kicsi; gyenge kapcsolaton észrevehető lehet.
- **A beépített operációsrendszer-támogatásról.** Egyetlen operációs rendszer sem szállít VLESS-klienst, ezért alkalmazás kell. Úgy döntöttünk, ez elfogadható, és sajátot készítettünk iOS-re, Androidra, macOS-re és Windowsra.
- **A tökéletes láthatatlanságról.** Ilyen nincs. A kutatás megmutatta, hogy a [TLS-en belüli TLS ujjlenyomatozható](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), 2025 novemberében pedig egyes orosz internetszolgáltatókról [beszámoltak](https://github.com/net4people/bbs/issues/546), hogy megszakítják a Reality-kapcsolatokat. A VLESS-Reality cenzúraállósági felépítés, nem garancia.

## Mit teszünk a korlátokkal

A cenzúra változik, ezért a protokollválasztás nem a munka vége. Ahogy a szűrés változik, igazítjuk a szerverbeállításokat és azokat az oldalakat, amelyek kézfogását a Reality kölcsönzi, és tovább figyeljük ugyanazokat a kutatásokat és közösségi beszámolókat, amelyekre ezek az oldalak hivatkoznak. Ha jobb megközelítés jelenik meg, ez az oldal meg fogja mondani.

A VLESS-Reality működésének teljes technikai története a [VLESS-Reality-alagút](/how-it-works/vless-reality-tunnel) oldalon olvasható. A kipróbáláshoz lásd a [VLESS VPN](/vless-vpn) oldalt.
