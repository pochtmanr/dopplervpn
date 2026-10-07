> **Röviden.** Az OpenVPN a nyílt forráskódú VPN-ek veteránja: rugalmas, széles körben támogatott, és több mint két évtized után jól ismert. Lassabb is az újabb protokolloknál, és a publikált kutatások szerint az internetszolgáltató számára az egyik legkönnyebben ujjlenyomatozható.

## Mi az OpenVPN?

Az OpenVPN ingyenes, nyílt forráskódú VPN-szoftver, amelyet James Yonan [2001 májusában](https://en.wikipedia.org/wiki/OpenVPN) adott ki először. A 2000-es és 2010-es évek nagy részében ez volt az alapértelmezett választás a kereskedelmi VPN-szolgáltatásoknál és a vállalati távoli elérésnél, és ma is sok routerben és vállalati termékben megtalálható.

Felhasználói térben fut, nem az operációs rendszer kernelében, a kulcscseréhez pedig az OpenSSL könyvtárra és a TLS protokollra támaszkodik. Az IANA által kijelölt port a 1194, az OpenVPN azonban UDP-n vagy TCP-n szinte bármelyik porton futhat.

## Hogyan működik?

Az OpenVPN saját protokollt használ, két részből. A vezérlőcsatorna TLS-sel hitelesíti a két felet, általában tanúsítványokkal, és kulcsokban egyeznek meg. Az adatcsatorna ezután ezekkel a kulcsokkal titkosítva viszi a forgalmadat, UDP- vagy TCP-csomagokon belül.

Ez a felépítés nagyon állíthatóvá teszi az OpenVPN-t. Választhatsz rejtjeleket, hitelesítési módokat, portokat és átviteleket, és proxykon is átfuttathatod. A rugalmasság ára a bonyolultság: több kód, több beállítás, és több módja annak, hogy gyenge konfigurációnál köss ki.

## Miért blokkolják az OpenVPN-t?

Az OpenVPN-en belüli TLS nem ugyanaz, mint egy weboldal HTTPS-látogatása. Az OpenVPN a saját csomagkeretébe csomagolja a TLS-kézfogását, ezért a forgalmának olyan alakja van, amilyen a hétköznapi webes forgalomnak nincs.

A kutatók megmérték, mennyit számít ez. A Michigani Egyetem és mások egy csapata [ujjlenyomat-rendszert épített](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen), és egy körülbelül egymillió felhasználót kiszolgáló internetszolgáltatón belül futtatta. Azonosította **az OpenVPN-adatfolyamok több mint 85%-át**, nagyon kevés téves találattal, és a tesztelt kereskedelmi „álcázott” OpenVPN-beállítások többségét is elkapta.

A valós szűrés követi a kutatást. 2023 augusztusában oroszországi felhasználók [beszámoltak](https://github.com/net4people/bbs/issues/274) róla, hogy a mobilszolgáltatók nem sokkal a kapcsolat indulása után megszakítják az OpenVPN-kapcsolatokat.

## Mikor érdemes az OpenVPN-t használni?

- **Kompatibilitás.** A régebbi routerek, a vállalati átjárók és egyes céges hálózatok az OpenVPN-t támogatják, újabbat pedig nem.
- **Csak TCP-s hálózatok.** Az OpenVPN TCP-n is futhat, ha az UDP blokkolva van, amit a [WireGuard](/vpn-protocols/wireguard) segítség nélkül nem tud.
- **Nem szűrt hálózatokon.** Ahol a VPN-eket blokkolják, az OpenVPN általában hamar elbukik. Jobb eszköz egy olyan protokoll, amely a normál webes forgalmat utánozza, például a [VLESS-Reality](/vpn-protocols/vless-reality). A [cenzúraútmutatónk](/bypass-censorship) elmagyarázza, hogyan döntik el a szűrőrendszerek, mit szakítsanak meg.

## Használ-e a Doppler OpenVPN-t?

Nem. A Doppler minden platformon VLESS-Reality-t használ. A [miért a VLESS](/vpn-protocols/why-vless) útmutató elmagyarázza, hogyan választottuk.
