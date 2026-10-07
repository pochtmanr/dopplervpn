> **Stručne.** Trojan skrýva proxy prevádzku vnútri skutočného TLS spojenia so skutočnou stránkou, ktorú ovládate. Kto sa pripojí bez hesla, jednoducho dostane stránku. Funguje to dobre, ale potrebujete vlastnú doménu a certifikát a tie sa dajú nájsť a zablokovať.

## Čo je Trojan?

Trojan je proxy protokol z [projektu trojan-gfw](https://github.com/trojan-gfw/trojan), prvýkrát vydaný v októbri 2017. Myšlienka je v názve: namiesto vymýšľania maskovania sa skrýva vnútri najbežnejšej šifrovanej prevádzky na internete, HTTPS.

## Ako funguje?

[Opis protokolu](https://trojan-gfw.github.io/trojan/protocol) je krátky. Server Trojan počúva ako bežný HTTPS server, so skutočným certifikátom pre skutočnú doménu. Klient vykoná ozajstný TLS handshake. Potom vnútri šifrovaného spojenia odošle:

- hexadecimálne zapísaný hash SHA-224 spoločného hesla, ktorý má 56 znakov,
- koniec riadka,
- krátku požiadavku, kam má prevádzka ísť, vo formáte podobnom SOCKS5,
- ďalší koniec riadka a za ním prvú časť dát.

Ak sú hash a požiadavka platné, server otvorí tunel k cieľu. Ak je niečo zlé, server berie spojenie ako „iné protokoly“ a odovzdá ho záložnému webovému serveru, takže návštevník vidí bežnú stránku.

## Ako ťažko sa Trojan blokuje?

Zvonku je spojenie Trojan relácia TLS k vašej doméne, s vaším certifikátom. Aktívne sondy dostanú späť skutočnú stránku. Preto sa Trojan vyčleňuje oveľa ťažšie ako protokoly, ktoré vyzerajú náhodne, napríklad [Shadowsocks](/vpn-protocols/shadowsocks).

Jeho slabé miesto je samotná doména. Každý server potrebuje doménu a certifikát a cenzor, ktorý zistí, ktoré domény patria proxy, ich môže zablokovať podľa mena alebo IP. Výskumníci tiež ukázali, že TLS prenášané vnútri TLS zanecháva vzory v čase a veľkosti, podľa ktorých sa dá [rozpoznať](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), a to sa týka Trojanu aj podobných návrhov.

[VLESS-Reality](/vpn-protocols/vless-reality) problém domény odstraňuje: požičia si TLS handshake existujúcej, obľúbenej stránky namiesto vašej vlastnej.

## Kedy použiť Trojan?

- **Keď ovládate doménu** a chcete jednoduché, dobre zrozumiteľné nastavenie, ktoré vyzerá ako HTTPS.
- **V stredne filtrovaných sieťach**, kde vaša doména pravdepodobne nebude cieľom.
- Naše porovnanie [VLESS, VMess a Trojan](/blog/vless-vs-vmess-vs-trojan) pomôže, ak sa medzi nimi rozhodujete.

## Používa Doppler Trojan?

Nie. Doppler používa VLESS-Reality, ktorý nepotrebuje vlastnú doménu. Pozrite [prečo VLESS](/vpn-protocols/why-vless).
