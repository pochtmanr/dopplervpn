> **Ve zkratce.** Hysteria 2 je proxy protokol postavený na QUIC, transportu za HTTP/3. Je navržená pro rychlost na špatných spojích se ztrátami a pro každého bez hesla se její server chová jako běžný web HTTP/3. Slabé místo je závislost na UDP, které některé sítě omezují nebo blokují úplně.

## Co je Hysteria 2?

Hysteria je projekt s otevřeným zdrojovým kódem od [apernet](https://github.com/apernet/hysteria); verze 2, přepracovaný protokol, vyšla v září 2023. Stejně jako Shadowsocks a VLESS je to proxy, ne klasická VPN, a klienti přes ni mohou směrovat celé zařízení.

## Jak funguje?

Podle své [specifikace protokolu](https://v2.hysteria.network/docs/developers/Protocol/) běží Hysteria 2 přes QUIC, jak ho definuje [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), s rozšířením o nespolehlivé datagramy pro provoz UDP. QUIC už poskytuje šifrování TLS 1.3, multiplexované toky a rychlé navázání spojení.

Maskování začíná u ověření. Specifikace vyžaduje, aby server Hysteria **musel implementovat skutečný server HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) a vyřizoval požadavky tak, jak by to dělal jakýkoli webový server. Klient se ověřuje zvláštním požadavkem HTTP/3; kdokoli jiný, ať zvědavý návštěvník, nebo aktivní sonda, dostane běžné webové odpovědi. Specifikace uvádí, že pro třetí stranu bez přihlašovacích údajů se server chová úplně jako standardní webový server HTTP/3.

## Proč je rychlá?

QUIC běží po UDP a ze ztráty paketů se vzpamatovává, aniž by zastavoval každý tok, jak to dělá TCP. Hysteria může také použít vlastní řízení zahlcení, zaměřené na nestabilní spoje, takže obvykle drží rychlost v přetížených mobilních sítích, na vzdálených trasách a na Wi-Fi s rušením, kde protokoly založené na TCP zpomalují.

## Jak těžké je Hysteria 2 zablokovat?

Proti aktivnímu sondování obstojí dobře, protože sondy vidí webový server. Vystavení je v transportu. Cenzor může omezit nebo zablokovat UDP, nebo konkrétně QUIC, a nerozbít přitom většinu webů, protože prohlížeče při selhání HTTP/3 přejdou na HTTP/2 po TCP. Kde se to stane, Hysteria 2 se nemá kam přepnout, zatímco protokoly založené na TCP, například [VLESS-Reality](/vpn-protocols/vless-reality), fungují dál.

## Kdy použít Hysteria 2?

- **Spoje se ztrátami nebo na velkou vzdálenost**, kde se vyplatí jeho řízení zahlcení a zotavení ze ztrát v QUIC.
- **Sítě, které UDP dovolují.** Ověřte to, než se na něj spolehnete.
- Jako druhý protokol vedle varianty na TCP, abyste mohli přepnout, když se UDP filtruje. Náš [průvodce cenzurou](/bypass-censorship) popisuje, jak filtry míří na transporty.

## Používá Doppler Hysteria 2?

Ne. Doppler používá VLESS-Reality přes TCP. To funguje dál v sítích, které UDP blokují. Viz [proč VLESS](/vpn-protocols/why-vless).
