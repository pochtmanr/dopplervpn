> **Ve zkratce.** Doppler jsme stavěli pro lidi v sítích, které VPN blokují. V těch sítích nejde o to, který protokol je na papíře nejrychlejší, ale který bude připojený i zítra. Zvolili jsme VLESS s Reality, protože dává cenzorovi nejméně k rozpoznání a nejméně k zablokování, a přijímáme kompromisy, které s tím jdou.

## Pro co jsme vybírali?

Doppler je stavěný pro lidi, kteří se připojují z míst, kde se VPN filtrují záměrně: Rusko, Írán, Čína, část zemí Perského zálivu. V těch sítích je šifrování ta snadná část. Každý protokol v našem [srovnání](/vpn-protocols) šifruje dobře. Liší se tím, jestli filtrační systém pozná, že spojení je VPN, a co může zablokovat, jakmile to pozná.

Proto jsme každou možnost posuzovali podle tří otázek:

1. **Má pevný otisk?** Navázání spojení pevné velikosti nebo standardní port lze zachytit jedním pravidlem.
2. **Co se stane, když cenzor sonduje server?** Firewally se aktivně připojují k podezřelým proxy, aby viděly, jak odpoví.
3. **Je co dát na seznam blokovaných?** Doména, certifikát nebo rozpoznatelný server je cíl, i když je samotný provoz dobře schovaný.

## Proč ne WireGuard, OpenVPN nebo IKEv2?

Všechny tři neprojdou první otázkou. Pakety navázání spojení [WireGuard](/vpn-protocols/wireguard) mají vždy 148 a 92 bajtů. [OpenVPN](/vpn-protocols/openvpn) výzkumníci pracující uvnitř skutečného poskytovatele rozpoznali ve více než 85% toků. [IKEv2](/vpn-protocols/ikev2) běží na standardních UDP portech, které lze zahodit hromadně. V srpnu 2023 uživatelé v Rusku [hlásili](https://github.com/net4people/bbs/issues/274), že operátoři přerušují WireGuard a OpenVPN už u prvních paketů. Jsou to dobré protokoly pro otevřené sítě. Pro naše sítě navrženy nebyly.

## Proč ne Shadowsocks nebo VMess?

První otázkou projdou tím, že vypadají jako náhodné bajty, a to se ukázalo jako otisk samo o sobě. Od listopadu 2021 Velký čínský firewall [blokuje plně šifrovaný provoz](https://gfw.report/publications/usenixsecurity23/en/), který nepřipomíná žádný známý protokol. [VMess](/vpn-protocols/vmess) lze zabalit do TLS, aby se tomu vyhnul, ale pak potřebuje doménu, a tím se dostáváme ke třetí otázce.

## Proč ne Trojan?

[Trojan](/vpn-protocols/trojan) na první dvě otázky odpovídá dobře: je to skutečné TLS a sondy vidí skutečný web. Každý server Trojan ale potřebuje vlastní doménu a certifikát. Jakmile cenzor tu doménu zjistí, může ji zablokovat a provoz mnoha domén je neustálý hon.

## Co VLESS-Reality dělá správně

[VLESS-Reality](/vpn-protocols/vless-reality) odpovídá na všechny tři:

- **Žádný pevný otisk.** Spojení je TLS 1.3 po TCP, nejběžnější šifrovaný provoz na internetu.
- **Sondy vidí skutečný web.** Reality předává každého, kdo se nedokáže ověřit, na skutečný web, jehož navázání spojení si půjčuje, s pravým certifikátem toho webu.
- **Nic našeho k zablokování podle jména.** V navázání spojení není doména ani certifikát Doppler.

Běží také po TCP, takže funguje dál v sítích, které UDP omezují nebo blokují a kde mají potíže [Hysteria 2](/vpn-protocols/hysteria2) a [AmneziaWG](/vpn-protocols/amneziawg). A samotný VLESS je malý: na šifrování se spoléhá na TLS, místo aby přidával vlastní, takže k dvojitému šifrování nedochází.

## Čeho jsme se vzdali

- **Čisté rychlosti na spojích se ztrátami.** TCP se ze ztráty paketů vzpamatovává hůř než QUIC nebo UDP u WireGuard. Na čistém spojení je rozdíl malý; na špatném může být znát.
- **Vestavěné podpory v operačním systému.** Žádný operační systém nedodává klienta VLESS, takže je potřeba aplikace. Usoudili jsme, že je to přijatelné, a postavili jsme vlastní pro iOS, Android, macOS a Windows.
- **Úplné neviditelnosti.** Ta neexistuje. Výzkum ukázal, že [TLS uvnitř TLS lze rozpoznat podle otisku](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), a v listopadu 2025 se [hlásilo](https://github.com/net4people/bbs/issues/546), že někteří ruští poskytovatelé přerušují spojení Reality. VLESS-Reality je návrh odolný vůči cenzuře, ne záruka.

## Co s těmito limity děláme

Cenzura se mění, takže volba protokolu není konec práce. Jak se filtrace mění, upravujeme nastavení serverů a weby, jejichž navázání spojení si Reality půjčuje, a sledujeme stejný výzkum a hlášení komunity, na které tyto stránky odkazují. Pokud se objeví lepší postup, napíšeme to zde.

Celý technický popis toho, jak VLESS-Reality funguje, je v textu [tunel VLESS-Reality](/how-it-works/vless-reality-tunnel). Vyzkoušet ho můžete na stránce [VLESS VPN](/vless-vpn).
