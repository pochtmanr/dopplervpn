> **Ve zkratce.** IKEv2/IPsec je VPN, kterou váš telefon a notebook umí používat bez jakékoli aplikace. Je rychlý a dobře zvládá přechod mezi Wi-Fi a mobilními daty. Běží také na pevných, dobře známých portech, a proto patří mezi protokoly, které cenzor zablokuje nejjednodušeji.

## Co je IKEv2/IPsec?

„IKEv2“ jsou ve skutečnosti dvě části, které pracují společně. IPsec je sada, která šifruje a ověřuje IP pakety. IKE, Internet Key Exchange, je protokol, kterým se obě strany vzájemně ověří a dohodnou klíče IPsec. Verze 2 protokolu IKE byla standardizována [v prosinci 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange) a aktuální specifikace je [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Protože jde o standard IETF, je IKEv2 vestavěný v iOS, macOS a Windows a v Androidu od verze 11. Používá ho mnoho firemních VPN bran.

## Jak funguje?

Výměna klíčů běží po UDP, [obvykle na portu 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Jakmile se strany dohodnou na klíčích, zásobník IPsec operačního systému šifruje váš provoz pomocí Encapsulating Security Payload (ESP). Když je v cestě NAT router, jako téměř v každé domácí a mobilní síti, IKE i ESP se balí do UDP na portu 4500.

IKEv2 má standardní rozšíření [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), které nechá spojení přežít změnu IP adresy. Proto je IKEv2 na telefonech příjemný: vyjdete z dosahu Wi-Fi na mobilní data a tunel pokračuje, místo aby se navazoval znovu od začátku.

## Proč se IKEv2 snadno blokuje?

IKEv2 se ani nesnaží vypadat jako něco jiného. Jeho provoz používá dobře známé UDP porty a má standardní formáty IKE a ESP, které umí rozebrat jakýkoli síťový nástroj. K blokování není potřeba ani hloubková inspekce paketů: filtr může zahodit UDP porty 500 a 4500, nebo rozpoznat výměnu IKE přímo.

Pro firemní sítě a cesty v otevřených zemích je to rozumný kompromis, protože být rozpoznán jako VPN tam nic nestojí. V sítích, které VPN filtrují záměrně, obvykle přestane fungovat jako první.

## Kdy použít IKEv2?

- **Když aplikace není dovolena.** Na spravovaném zařízení, kde nelze instalovat software, může být vestavěný klient IKEv2 jedinou možností.
- **Mobilní přechody v otevřených sítích.** MOBIKE je dělá plynulými, když přecházíte mezi sítěmi.
- **Ne pod cenzurou.** Ve filtrovaných sítích zvolte protokol navržený tak, aby splynul, například [VLESS-Reality](/vpn-protocols/vless-reality). Náš [průvodce cenzurou](/bypass-censorship) vysvětluje, jak blokování funguje.

## Používá Doppler IKEv2?

Ne. Doppler se připojuje pomocí VLESS-Reality ve vlastních aplikacích. Důvody jsou v průvodci [proč VLESS](/vpn-protocols/why-vless).
