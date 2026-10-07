> **Stručne.** IKEv2/IPsec je VPN, ktorú váš telefón a notebook už vedia používať bez akejkoľvek aplikácie. Je rýchly a dobre zvláda prepínanie medzi Wi-Fi a mobilnými dátami. Beží však na pevných, dobre známych portoch, a preto patrí medzi protokoly, ktoré cenzor zablokuje najjednoduchšie.

## Čo je IKEv2/IPsec?

„IKEv2“ sú v skutočnosti dve časti, ktoré pracujú spolu. IPsec je sada, ktorá šifruje a overuje IP pakety. IKE, Internet Key Exchange, je protokol, ktorým sa obe strany navzájom overia a dohodnú kľúče IPsec. Verzia 2 protokolu IKE bola štandardizovaná [v decembri 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange) a aktuálna špecifikácia je [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Pretože ide o štandard IETF, IKEv2 je vstavaný v iOS, macOS a Windows a v Androide od verzie 11. Používa ho mnoho firemných VPN brán.

## Ako funguje?

Výmena kľúčov beží cez UDP, [zvyčajne na porte 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Keď sa strany dohodnú na kľúčoch, zásobník IPsec operačného systému zašifruje vašu prevádzku pomocou ESP (Encapsulating Security Payload). Keď je v ceste smerovač s NAT, ako takmer v každej domácej a mobilnej sieti, IKE aj ESP sa zabalia do UDP na porte 4500.

IKEv2 má štandardné rozšírenie [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), vďaka ktorému spojenie prežije zmenu IP adresy. Preto je IKEv2 na telefónoch príjemný: vyjdete z dosahu Wi-Fi na mobilné dáta a tunel pokračuje, namiesto toho, aby sa pripájal odznova.

## Prečo sa IKEv2 ľahko blokuje?

IKEv2 sa ani nesnaží podobať na niečo iné. Jeho prevádzka používa dobre známe UDP porty a má štandardné formáty IKE a ESP, ktoré vie rozobrať každý sieťový nástroj. Na zablokovanie netreba ani hĺbkovú inšpekciu paketov: filter môže zahodiť UDP porty 500 a 4500 alebo rozpoznať výmenu IKE priamo.

Pre firemné siete a cesty v otvorených krajinách je to rozumný kompromis, pretože byť rozpoznaný ako VPN tam nič nestojí. V sieťach, ktoré VPN filtrujú zámerne, zvyčajne prestane fungovať ako prvý.

## Kedy použiť IKEv2?

- **Keď aplikácia nie je dovolená.** Na spravovanom zariadení, kde nemožno inštalovať softvér, môže byť vstavaný klient IKEv2 jediná možnosť.
- **Mobilný prechod v otvorených sieťach.** MOBIKE ho robí plynulým, keď prechádzate medzi sieťami.
- **Nie pod cenzúrou.** Vo filtrovaných sieťach zvoľte protokol navrhnutý tak, aby splýval, napríklad [VLESS-Reality](/vpn-protocols/vless-reality). Náš [sprievodca cenzúrou](/bypass-censorship) vysvetľuje, ako blokovanie funguje.

## Používa Doppler IKEv2?

Nie. Doppler sa pripája cez VLESS-Reality vo vlastných aplikáciách. Dôvody sú v sprievodcovi [prečo VLESS](/vpn-protocols/why-vless).
