> **Ve zkratce.** Trojan skrývá proxy provoz uvnitř skutečného spojení TLS se skutečným webem, který ovládáte. Kdo se připojí bez hesla, dostane prostě ten web. Funguje to dobře, ale potřebujete vlastní doménu a certifikát a ty lze najít a zablokovat.

## Co je Trojan?

Trojan je proxy protokol z [projektu trojan-gfw](https://github.com/trojan-gfw/trojan), poprvé vydaný v říjnu 2017. Myšlenka je v názvu: místo aby vymýšlel maskování, schovává se uvnitř nejběžnějšího šifrovaného provozu na internetu, HTTPS.

## Jak funguje?

[Popis protokolu](https://trojan-gfw.github.io/trojan/protocol) je krátký. Server Trojan naslouchá jako běžný server HTTPS, se skutečným certifikátem pro skutečnou doménu. Klient provede opravdové navázání spojení TLS. Pak uvnitř šifrovaného spojení odešle:

- šestnáctkový hash SHA-224 sdíleného hesla, který má 56 znaků,
- konec řádku,
- malý požadavek, kam má provoz jít, ve formátu podobném SOCKS5,
- další konec řádku a za ním první část dat.

Pokud jsou hash a požadavek platné, server otevře tunel k cíli. Pokud je něco špatně, server bere spojení jako „jiné protokoly“ a předá ho záložnímu webovému serveru, takže návštěvník vidí běžný web.

## Jak těžké je Trojan zablokovat?

Zvenku je spojení Trojan relace TLS k vaší doméně, s vaším certifikátem. Aktivní sondy dostanou zpět skutečný web. Proto je Trojan mnohem těžší vyčlenit než protokoly, které vypadají náhodně, například [Shadowsocks](/vpn-protocols/shadowsocks).

Jeho slabé místo je samotná doména. Každý server potřebuje doménu a certifikát a cenzor, který zjistí, které domény patří proxy, je může zablokovat podle jména nebo podle IP. Výzkumníci také ukázali, že TLS nesené uvnitř TLS zanechává vzorce v čase a velikosti, podle kterých ho lze [rozpoznat](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), a to se týká Trojanu i podobných návrhů.

[VLESS-Reality](/vpn-protocols/vless-reality) problém s doménou odstraňuje tím, že si půjčuje navázání spojení TLS existujícího, oblíbeného webu místo vašeho vlastního.

## Kdy použít Trojan?

- **Když ovládáte doménu** a chcete jednoduché, dobře srozumitelné nastavení, které vypadá jako HTTPS.
- **Ve středně filtrovaných sítích**, kde vaše doména pravděpodobně nebude cílem.
- Naše srovnání [VLESS, VMess a Trojan](/blog/vless-vs-vmess-vs-trojan) pomůže, pokud mezi nimi vybíráte.

## Používá Doppler Trojan?

Ne. Doppler používá VLESS-Reality, který vlastní doménu nepotřebuje. Viz [proč VLESS](/vpn-protocols/why-vless).
