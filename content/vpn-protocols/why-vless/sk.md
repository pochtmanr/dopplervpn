> **Stručne.** Doppler sme stavali pre ľudí v sieťach, ktoré blokujú VPN. V tých sieťach nejde o to, ktorý protokol je na papieri najrýchlejší, ale ktorý bude pripojený aj zajtra. Zvolili sme VLESS s Reality, pretože dáva cenzorovi najmenej na rozpoznanie a najmenej na zablokovanie, a prijímame kompromisy, ktoré s tým idú.

## Na čo sme vyberali?

Doppler je stavaný pre ľudí, ktorí sa pripájajú z miest, kde sa VPN filtrujú zámerne: Rusko, Irán, Čína, časť krajín Perzského zálivu. V tých sieťach je šifrovanie tá ľahká časť. Každý protokol v našom [porovnaní](/vpn-protocols) šifruje dobre. Líšia sa tým, či filtrovací systém spozná, že spojenie je VPN, a čo môže zablokovať, keď to spozná.

Preto sme každý variant posudzovali podľa troch otázok:

1. **Má pevný odtlačok?** Handshake pevnej veľkosti alebo štandardný port sa dá zachytiť jedným pravidlom.
2. **Čo sa stane, keď cenzor sonduje server?** Firewally sa samy pripájajú k podozrivým proxy, aby videli, ako odpovedia.
3. **Je čo dať na zoznam blokovania?** Doména, certifikát alebo rozpoznateľný server je cieľ, aj keď je samotná prevádzka dobre skrytá.

## Prečo nie WireGuard, OpenVPN alebo IKEv2?

Všetky tri zlyhajú na prvej otázke. Pakety handshake [WireGuardu](/vpn-protocols/wireguard) majú vždy 148 a 92 bajtov. [OpenVPN](/vpn-protocols/openvpn) výskumníci pracujúci vnútri skutočného poskytovateľa rozpoznali vo viac ako 85 % tokov. [IKEv2](/vpn-protocols/ikev2) beží na štandardných UDP portoch, ktoré sa dajú zahodiť hromadne. V auguste 2023 používatelia v Rusku [hlásili](https://github.com/net4people/bbs/issues/274), že operátori prerušovali WireGuard a OpenVPN už pri prvých paketoch. Sú to dobré protokoly pre otvorené siete. Pre naše siete navrhnuté neboli.

## Prečo nie Shadowsocks alebo VMess?

Prvú otázku prejdú tým, že vyzerajú ako náhodné bajty, a to sa ukázalo ako odtlačok sám osebe. Od novembra 2021 Veľký čínsky firewall [blokuje úplne šifrovanú prevádzku](https://gfw.report/publications/usenixsecurity23/en/), ktorá sa nepodobá na žiadny známy protokol. [VMess](/vpn-protocols/vmess) sa dá zabaliť do TLS, aby sa tomu vyhol, ale potom potrebuje doménu, a tým sme pri tretej otázke.

## Prečo nie Trojan?

[Trojan](/vpn-protocols/trojan) na prvé dve otázky odpovedá dobre: je to skutočné TLS a sondy vidia skutočnú stránku. Každý server Trojan však potrebuje vlastnú doménu a certifikát. Keď sa cenzor tú doménu dozvie, môže ju zablokovať a prevádzka mnohých domén je neustály hon.

## Čo VLESS-Reality robí správne

[VLESS-Reality](/vpn-protocols/vless-reality) odpovedá na všetky tri:

- **Žiadny pevný odtlačok.** Spojenie je TLS 1.3 cez TCP, najbežnejšia šifrovaná prevádzka na internete.
- **Sondy vidia skutočnú stránku.** Reality každého, kto sa nevie overiť, pošle na skutočnú stránku, ktorej handshake si požičiava, s pravým certifikátom tej stránky.
- **Nič naše, čo by sa dalo zablokovať podľa mena.** V handshake nie je doména ani certifikát Doppler.

Beží aj cez TCP, takže funguje ďalej v sieťach, ktoré priškrtia alebo zablokujú UDP, kde [Hysteria 2](/vpn-protocols/hysteria2) a [AmneziaWG](/vpn-protocols/amneziawg) narážajú na ťažkosti. A samotný VLESS je malý: na šifrovanie sa spolieha na TLS, namiesto toho, aby pridával vlastné, takže niet dvojitého šifrovania.

## Čoho sme sa vzdali

- **Surová rýchlosť na linkách so stratami.** TCP sa zo straty paketov zotavuje menej hladko ako QUIC alebo UDP vo WireGuarde. Na čistom spojení je rozdiel malý; na zlom môže byť citeľný.
- **Vstavaná podpora v operačnom systéme.** Žiadny operačný systém nedodáva klienta VLESS, takže treba aplikáciu. Rozhodli sme sa, že je to prijateľné, a postavili sme vlastné pre iOS, Android, macOS a Windows.
- **Dokonalá neviditeľnosť.** Neexistuje. Výskum ukázal, že [TLS vnútri TLS sa dá rozpoznať](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), a v novembri 2025 sa [hlásilo](https://github.com/net4people/bbs/issues/546), že niektorí ruskí poskytovatelia prerušujú spojenia Reality. VLESS-Reality je návrh odolnosti voči cenzúre, nie záruka.

## Čo s týmito limitmi robíme

Cenzúra sa mení, takže voľba protokolu nie je koniec práce. Nastavenia serverov a stránky, ktorých handshake Reality požičiava, upravujeme podľa toho, ako sa mení filtrovanie, a naďalej sledujeme ten istý výskum a hlásenia komunity, na ktoré sa tieto stránky odvolávajú. Ak sa objaví lepší prístup, táto stránka to povie.

Celý technický príbeh toho, ako VLESS-Reality funguje, je v texte [tunel VLESS-Reality](/how-it-works/vless-reality-tunnel). Vyskúšať ho môžete na stránke [VLESS VPN](/vless-vpn).
