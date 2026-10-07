> **Stručne.** VMess je pôvodný protokol projektu V2Ray. Sám šifruje svoje hlavičky a zvyčajne sa balí do iného prenosu, napríklad WebSocket cez TLS, aby vyzeral ako webová prevádzka. Stále funguje, ale jeho nástupcovia, VLESS a Trojan, robia tú istú prácu s menšou réžiou.

## Čo je VMess?

VMess je šifrovaný proxy protokol, ktorý [projekt V2Ray](https://github.com/v2fly/v2ray-core) predstavil, keď v roku 2015 vznikal. V2Ray vyrástol do modulárnej platformy na stavbu proxy: jedno jadro, mnoho protokolov a prenosov a smerovací mechanizmus, ktorý rozhoduje, ktorá prevádzka kam ide. VMess bol jeho prvý protokol a niekoľko rokov aj hlavný.

Rovnako ako Shadowsocks je VMess technicky proxy, nie VPN, ale aplikácie založené na V2Ray vedia cezeň smerovať celé zariadenie.

## Ako funguje?

Každý používateľ má UUID, ktorý slúži ako jeho údaj na overenie. Podľa [dokumentácie protokolu](https://www.v2fly.org/en_US/developer/protocols/vmess.html) hlavička požiadavky klienta obsahuje šifrované overovacie ID zložené z časovej pečiatky Unix, náhodného čísla a kontrolného súčtu, zašifrované kľúčom odvodeným od ID používateľa. Server podľa neho používateľa spozná, potom dešifruje zvyšok hlavičky a dáta.

Dokumentácia opisuje dva spôsoby ochrany hlavičky. Moderný používa šifrovanie AEAD, ktoré zaručuje, že hlavička nebola zmenená. Starší používal MD5 a AES-128-CFB a integritu hlavičky zaručiť nevedel; dokumentácia pred ním varuje. Pretože overovacie ID obsahuje časovú pečiatku, hodiny klienta a servera musia byť zhruba zosynchronizované, čo je častý zdroj problémov typu „jednoducho sa to nepripojí“.

## Ako ťažko sa VMess blokuje?

Sám osebe VMess vyzerá ako náhodné bajty, čo ho stavia do rovnakej pozície ako [Shadowsocks](/vpn-protocols/shadowsocks): je vystavený firewallom, ktoré blokujú úplne šifrovanú prevádzku. Preto sa VMess zvyčajne nasadzuje vnútri WebSocket alebo gRPC cez TLS, za doménou a certifikátom, aby pozorovateľ videl niečo, čo vyzerá ako bežné HTTPS spojenie so stránkou.

Tento obal odvedie väčšinu práce pri skrývaní prevádzky a prináša náklady: treba doménu, certifikát a často CDN pred serverom a server teraz šifruje dáta dvakrát, raz pre TLS a raz pre VMess.

## VMess, VLESS alebo Trojan?

[VLESS](/vpn-protocols/vless-reality) navrhol projekt Xray ako ľahšieho nástupcu: ponecháva identitu podľa UUID, ale opúšťa vlastné šifrovanie VMess a spolieha sa úplne na vrstvu TLS, čím sa vyhne dvojitému šifrovaniu. [Trojan](/vpn-protocols/trojan) ide podobnou cestou, len s heslom namiesto UUID. Podrobnosti sú v našom porovnaní [VLESS, VMess a Trojan](/blog/vless-vs-vmess-vs-trojan).

## Používa Doppler VMess?

Nie. Doppler používa VLESS s Reality. Sprievodca [prečo VLESS](/vpn-protocols/why-vless) vysvetľuje prečo.
