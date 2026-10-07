> **Röviden.** Az AmneziaWG a WireGuard elágazása, amely megőrzi a sebességét és a kriptográfiáját, de megváltoztatja a csomagalakokat és a fejléceket, amelyek miatt a WireGuard könnyen felismerhető. Erős lehetőség ott, ahol a sima WireGuard blokkolva van, egy megkötéssel: ha az álcázás be van kapcsolva, többé nem kommunikál a szabványos WireGuard-szerverekkel.

## Mi az AmneziaWG?

Az AmneziaWG-t az [Amnezia VPN](https://amnezia.org/) mögötti csapat fejleszti, amely nyílt forráskódú alkalmazás saját VPN-szerver futtatására. A projekt [Go-megvalósítása](https://github.com/amnezia-vpn/amneziawg-go) 2023-ban indult. A [WireGuard](/vpn-protocols/wireguard)-ot veszi alapul, amely gyors és egyszerű, de rögzített, felismerhető kézfogása van, és egy réteget ad hozzá, amely álcázza.

## Mit változtat?

Az [AmneziaWG dokumentációja](https://docs.amnezia.org/documentation/amnezia-wg/) több mechanizmust ír le, mindegyiket konfigurációs paraméterek vezérlik:

- **Dinamikus fejlécek (H1–H4).** A szabványos WireGuard-csomagok rögzített üzenettípussal kezdődnek mind a négy csomagformátumhoz. Az AmneziaWG ezeket az értékeket beállított tartományokból választott számokkal cseréli le, így két különböző beállításnak nem azonos a fejléce, és egyetlen szűrőszabály sem illik mindegyikre.
- **Csomaghossz-véletlenszerűsítés (S1–S4).** A WireGuardban a kezdeti kézfogáscsomag mindig pontosan 148 bájt. Az AmneziaWG véletlen előtagokat ad minden csomagtípushoz, így a méretek változnak.
- **Szemétcsomagok (Jc, Jmin, Jmax).** A kézfogás előtt a kliens beállítható számú, véletlen hosszúságú álvéletlen csomagot küld, amelyek időben és méretben is elmosják a munkamenet kezdetét.
- **Fejlécvédelem.** Az újabb verziók magát az üzenettípus-mezőt is titkosíthatják.

Alatta a kriptográfia és az általános felépítés a WireGuardé marad.

## Mennyire nehéz blokkolni az AmneziaWG-ot?

Eltávolítja azokat az egyszerű aláírásokat, amelyeket a szűrők a WireGuard ellen használnak: a rögzített méreteket és a rögzített fejlécértékeket. Ez sokkal ellenállóbbá teszi a sima WireGuard-nál azokon a hálózatokon, amelyek blokkolják a VPN-eket.

Továbbra is UDP-n fut, ezért az UDP-t széles körben lassító vagy blokkoló hálózatok érintik, és a forgalma nem utánoz egy konkrét alkalmazást úgy, ahogy a [VLESS-Reality](/vpn-protocols/vless-reality) egy valódi weboldal TLS-látogatását utánozza. Egy szűrő, amely a felismerhetetlen UDP-t egyenesen blokkolja, még elkaphatja.

## Mikor érdemes az AmneziaWG-ot használni?

- **Ahol a WireGuard blokkolva van**, de az UDP még működik, és WireGuard-szerű sebességet szeretnél.
- **Saját üzemeltetésű szervereken**, az Amnezia VPN alkalmazással a beállításukhoz.
- Tarts kéznél egy TCP-alapú lehetőséget, például a VLESS-Reality-t, azokra a hálózatokra, amelyek szűrik az UDP-t. Az [útmutatónk Oroszországhoz](/vpn-for-russia) arról szól, mi jut át jelenleg ott.

## Használ-e a Doppler AmneziaWG-ot?

Nem. A Doppler VLESS-Reality-t használ. Lásd: [miért a VLESS](/vpn-protocols/why-vless).
