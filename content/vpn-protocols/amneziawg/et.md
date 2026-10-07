> **Lühidalt.** AmneziaWG on WireGuardi haru, mis säilitab selle kiiruse ja krüptograafia, kuid muudab pakettide kuju ja päised, mille järgi WireGuardi on lihtne ära tunda. See on tugev variant seal, kus tavaline WireGuard on blokeeritud, ühe mööndusega: kui maskeerimine on sees, ei suhtle see enam tavaliste WireGuardi serveritega.

## Mis on AmneziaWG?

AmneziaWG-d arendab rakenduse [Amnezia VPN](https://amnezia.org/) taga olev meeskond. Amnezia VPN on avatud lähtekoodiga rakendus oma VPN-serveri käitamiseks. Projekti [Go-teostus](https://github.com/amnezia-vpn/amneziawg-go) algas 2023. aastal. See võtab protokolli [WireGuard](/vpn-protocols/wireguard), mis on kiire ja lihtne, kuid millel on fikseeritud äratuntav käepigistus, ja lisab kihi, mis seda maskeerib.

## Mida see muudab?

[AmneziaWG dokumentatsioon](https://docs.amnezia.org/documentation/amnezia-wg/) kirjeldab mitut mehhanismi, millest igaüht juhivad konfiguratsiooniparameetrid:

- **Dünaamilised päised (H1–H4).** Tavalised WireGuardi paketid algavad fikseeritud sõnumitüübiga iga nelja paketivormingu jaoks. AmneziaWG asendab need väärtused arvudega seadistatud vahemikest, nii et kahel erineval seadistusel ei ole ühiseid päiseid ja ükski üksik filtrireegel ei kata neid kõiki.
- **Paketi pikkuse juhuslikustamine (S1–S4).** WireGuardis on algne käepigistuse pakett alati täpselt 148 baiti. AmneziaWG lisab igale paketiliigile juhuslikud eesliited, nii et suurused varieeruvad.
- **Rämpspaketid (Jc, Jmin, Jmax).** Enne käepigistust saadab klient seadistatava arvu pseudujuhuslikke juhusliku pikkusega pakette, mis hägustavad seansi algust nii ajas kui ka suuruses.
- **Päise kaitse.** Uuemad versioonid saavad krüpteerida ka sõnumitüübi välja ennast.

Selle all jäävad krüptograafia ja üldine ülesehitus WireGuardi omaks.

## Kui raske on AmneziaWG blokeerida?

See eemaldab lihtsad signatuurid, mida filtrid WireGuardi vastu kasutavad: fikseeritud suurused ja fikseeritud päiseväärtused. See teeb selle võrkudes, mis blokeerivad VPN-e, tavalisest WireGuardist palju vastupidavamaks.

See töötab endiselt UDP kaudu, nii et võrgud, mis UDP-d laialt aeglustavad või blokeerivad, mõjutavad seda, ning selle liiklus ei jäljenda ühtegi kindlat rakendust nii, nagu [VLESS-Reality](/vpn-protocols/vless-reality) jäljendab TLS-külastust päris veebisaidile. Filter, mis blokeerib äratundmatu UDP otse, võib selle ikkagi kinni püüda.

## Millal AmneziaWG kasutada?

- **Seal, kus WireGuard on blokeeritud**, kuid UDP töötab veel, ja te tahate WireGuardi-sarnast kiirust.
- **Ise majutatud serverites**, kasutades nende ülesseadmiseks Amnezia VPN-i rakendust.
- Hoidke TCP-põhist varianti, näiteks VLESS-Reality, võrkude jaoks, mis filtreerivad UDP-d. Meie [juhend Venemaa jaoks](/vpn-for-russia) käsitleb, mis sealt praegu läbi pääseb.

## Kas Doppler kasutab AmneziaWG-d?

Ei. Doppler kasutab VLESS-Realityt. Vaadake [miks VLESS](/vpn-protocols/why-vless).
