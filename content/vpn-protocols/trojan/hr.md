> **Ukratko.** Trojan skriva proxy promet unutar prave TLS veze s pravim web-mjestom koje vi kontrolirate. Tko se spoji bez lozinke, jednostavno dobije web-mjesto. Dobro radi, ali potrebni su vlastita domena i certifikat, a njih se može pronaći i blokirati.

## Što je Trojan?

Trojan je proxy protokol [projekta trojan-gfw](https://github.com/trojan-gfw/trojan), prvi put objavljen u listopadu 2017. Ideja mu je u imenu: umjesto da izmišlja prikrivanje, skriva se unutar najčešćeg šifriranog prometa na internetu, HTTPS-a.

## Kako radi?

[Opis protokola](https://trojan-gfw.github.io/trojan/protocol) kratak je. Poslužitelj Trojan sluša kao običan HTTPS poslužitelj, s pravim certifikatom za pravu domenu. Klijent izvodi pravo TLS rukovanje. Zatim unutar šifrirane veze šalje:

- heksadecimalni SHA-224 heš zajedničke lozinke, koji ima 56 znakova,
- prijelom retka,
- mali zahtjev koji kaže kamo promet treba ići, u formatu nalik na SOCKS5,
- još jedan prijelom retka, a zatim prvi dio podataka.

Ako su heš i zahtjev valjani, poslužitelj otvara tunel prema odredištu. Ako nešto nije u redu, poslužitelj vezu tretira kao „druge protokole” i prosljeđuje je rezervnom web-poslužitelju, pa posjetitelj vidi obično web-mjesto.

## Koliko je Trojan teško blokirati?

Izvana je veza Trojan TLS sesija prema vašoj domeni, s vašim certifikatom. Aktivne probe dobivaju natrag pravo web-mjesto. Zato je Trojan mnogo teže izdvojiti od protokola koji izgledaju slučajno, poput [Shadowsocksa](/vpn-protocols/shadowsocks).

Njegova je slaba točka sama domena. Svakom poslužitelju trebaju domena i certifikat, a cenzor koji sazna koje domene pripadaju proxyjima može ih blokirati po imenu ili po IP-u. Istraživači su također pokazali da TLS nošen unutar TLS-a ostavlja obrasce vremena i veličine koje se mogu [prepoznati po otisku](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), što pogađa Trojan i slične nacrte.

[VLESS-Reality](/vpn-protocols/vless-reality) uklanja problem domene tako što posuđuje TLS rukovanje postojećeg, popularnog web-mjesta umjesto vašega.

## Kada koristiti Trojan?

- **Kad kontrolirate domenu** i želite jednostavnu, dobro razumljivu postavku koja izgleda kao HTTPS.
- **Na umjereno filtriranim mrežama** gdje vaša domena vjerojatno neće biti meta.
- Naša usporedba [VLESS, VMess i Trojan](/blog/vless-vs-vmess-vs-trojan) pomaže ako birate među njima.

## Koristi li Doppler Trojan?

Ne. Doppler koristi VLESS-Reality, kojem ne treba vlastita domena. Pogledajte [zašto VLESS](/vpn-protocols/why-vless).
