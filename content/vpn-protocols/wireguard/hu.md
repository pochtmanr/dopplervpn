> **Röviden.** A WireGuard a leggyorsabb és legegyszerűbb elterjedt VPN-protokoll, és szűretlen hálózaton kiváló választás. Arra viszont soha nem tervezték, hogy elrejtse, hogy ez VPN, Oroszországban, Iránban és Kínában pedig az elsők között blokkolják.

## Mi a WireGuard?

A WireGuard VPN-protokoll, amelyet Jason A. Donenfeld írt, és először 2015-ben jelent meg. A célja az volt, hogy a korábbi nagy, állítható protokollokat valami olyannal váltsa fel, ami elég kicsi az átvizsgáláshoz. 2020 márciusában [bekerült a Linux 5.6-os kernelbe](https://en.wikipedia.org/wiki/WireGuard), hivatalos alkalmazások pedig ma már vannak Windowsra, macOS-re, iOS-re, Androidra és Linuxra.

Ahelyett, hogy a két fél rejtjelkészletet egyeztetne, a WireGuard egyetlen modern primitívkészletet rögzít. A [protokolloldal](https://www.wireguard.com/protocol/) felsorolja őket: ChaCha20 a Poly1305-tel a titkosításhoz, Curve25519 a kulcscseréhez, és BLAKE2s a kivonatoláshoz. Nincs mit rosszul beállítani, és nincs régebbi, gyengébb lehetőség, amelyre vissza lehetne esni.

## Hogyan működik?

Minden eszköznek kulcspárja van, hasonlóan az SSH-hoz. A kliens és a szerver előre ismeri egymás nyilvános kulcsát, a kézfogás pedig a Noise protokollkeretre épül (a protokolloldal a pontos felépítést nevezi meg: `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Minden csomag UDP-n megy](https://www.wireguard.com/protocol/), az új munkamenet pedig egyetlen oda-vissza üzenetváltással jön létre.

Ezért érződik gyorsnak a WireGuard. Kevés dologról kell egyeztetni, Linuxon a kód az operációs rendszer kernelében fut, a Wi-Fi és a mobiladat közötti váltás pedig észrevétlenül megy, mert a protokoll nem tart nyitva hosszan élő kapcsolatot.

## Miért blokkolják a WireGuard-ot?

Ugyanaz az egyszerűség, amely miatt a WireGuard könnyen átvizsgálható, felismerhetővé is teszi. A [tanulmány](https://www.wireguard.com/papers/wireguard.pdf) bájtról bájtra meghatározza a kézfogás üzeneteit, ezért a kliens első csomagja mindig 148 bájt, a válasz pedig mindig 92 bájt, és mindegyik rögzített üzenettípus-mezővel kezdődik. Egy mélycsomag-vizsgáló (DPI) rendszernek csak egy rövid szabály kell, hogy ezt a mintát észrevegye UDP-n.

A cenzorok pontosan ezt teszik. 2023 augusztusában oroszországi felhasználók [beszámoltak](https://github.com/net4people/bbs/issues/274) róla, hogy a nagy mobilszolgáltatók a kézfogás után rögtön megszakítják a WireGuard-munkameneteket. A titkosítás továbbra is védte a tartalmat, maga a kapcsolat viszont eltűnt.

Ez tervezési kompromisszum, nem hiba. A WireGuard szerzői rögzített, minimális protokollt választottak, és az álcázás nem szerepelt a célok között. Az olyan projektek, mint az [AmneziaWG](/vpn-protocols/amneziawg), megváltoztatják a csomagok alakját, hogy részben visszaállítsák a takarást.

## Mikor érdemes a WireGuard-ot használni?

- **Szűretlen hálózatokon.** Otthon, a munkahelyen vagy olyan országban utazva, amely nem blokkolja a VPN-eket, a WireGuard-ot sebességben és akkumulátor-üzemidőben nehéz felülmúlni.
- **Saját szerveren.** Ha saját szervert üzemeltetsz, a WireGuard az egyik legkönnyebben helyesen beállítható protokoll.
- **Nem DPI-szűrés alatt.** Ha a hálózatod blokkolja a VPN-eket, jobb egy olyan protokoll, amelyet arra építettek, hogy hétköznapi webes forgalomnak látsszon, például a [VLESS-Reality](/vpn-protocols/vless-reality). A [VLESS-Reality és a WireGuard](/blog/vless-reality-vs-wireguard) összehasonlításunk részletesebben tárgyalja a kompromisszumot.

## Használ-e a Doppler WireGuard-ot?

Nem. A Doppler alkalmazásai VLESS-Reality-n csatlakoznak, mert a Doppler olyan hálózatokra készült, ahol a WireGuard-ot szűrik. A [miért a VLESS](/vpn-protocols/why-vless) útmutató elmagyarázza az indoklást.
