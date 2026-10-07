> **Stručne.** Hysteria 2 je proxy protokol postavený na QUIC, prenose za HTTP/3. Je navrhnutý na rýchlosť na slabých spojeniach so stratami a pre každého bez hesla sa jeho server správa ako bežná stránka HTTP/3. Slabé miesto je, že závisí od UDP, ktoré niektoré siete priškrtia alebo zablokujú úplne.

## Čo je Hysteria 2?

Hysteria je projekt s otvoreným kódom od [apernet](https://github.com/apernet/hysteria); verzia 2, prepracovaný protokol, vyšla v septembri 2023. Rovnako ako Shadowsocks a VLESS je to proxy, nie klasická VPN, a klienti vedia cezeň smerovať celé zariadenie.

## Ako funguje?

Podľa [špecifikácie protokolu](https://v2.hysteria.network/docs/developers/Protocol/) beží Hysteria 2 cez QUIC podľa [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), s rozšírením o nespoľahlivé datagramy pre prevádzku UDP. QUIC už poskytuje šifrovanie TLS 1.3, multiplexované toky a rýchle nadviazanie spojenia.

Maskovanie začína pri overení. Špecifikácia vyžaduje, aby server Hysteria **musel implementovať skutočný server HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) a vybavoval požiadavky tak, ako by to robil ktorýkoľvek webový server. Klient sa overí zvláštnou požiadavkou HTTP/3; ktokoľvek iný, či zvedavý návštevník alebo aktívna sonda, dostane bežné webové odpovede. Špecifikácia hovorí, že pre tretiu stranu bez prihlasovacích údajov sa server správa presne ako štandardný webový server HTTP/3.

## Prečo je rýchly?

QUIC beží cez UDP a po strate paketov sa zotaví bez toho, aby zastavil každý tok, ako to robí TCP. Hysteria môže použiť aj vlastné riadenie zahltenia, zamerané na nestabilné linky, takže rýchlosť zvyčajne udrží v preťažených mobilných sieťach, na diaľkových trasách a na Wi-Fi s rušením, kde protokoly na TCP spomaľujú.

## Ako ťažko sa Hysteria 2 blokuje?

Voči aktívnemu sondovaniu obstojí dobre, pretože sondy vidia webový server. Vystavený je prenos. Cenzor môže priškrtiť alebo zablokovať UDP, alebo konkrétne QUIC, bez toho, aby rozbil väčšinu stránok, pretože prehliadače pri zlyhaní HTTP/3 prejdú na HTTP/2 cez TCP. Tam, kde sa to stane, Hysteria 2 nemá kam ísť, zatiaľ čo protokoly na TCP, ako [VLESS-Reality](/vpn-protocols/vless-reality), fungujú ďalej.

## Kedy použiť Hysteria 2?

- **Linky so stratami alebo na diaľku**, kde sa vyplatí jeho riadenie zahltenia a zotavenie zo strát v QUIC.
- **Siete, ktoré UDP povoľujú.** Overte to, kým sa naň spoľahnete.
- Ako druhý protokol popri možnosti na TCP, aby ste sa mohli prepnúť, keď sa UDP filtruje. Náš [sprievodca cenzúrou](/bypass-censorship) opisuje, ako filtre cielia na prenosy.

## Používa Doppler Hysteria 2?

Nie. Doppler používa VLESS-Reality cez TCP, ktorý funguje ďalej v sieťach, ktoré blokujú UDP. Pozrite [prečo VLESS](/vpn-protocols/why-vless).
