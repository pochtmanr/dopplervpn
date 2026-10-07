> **Lühidalt.** WireGuard on kiireim ja lihtsaim levinud VPN-protokoll ning filtreerimata võrgus on see väga hea valik. Seda ei loodud kunagi selleks, et varjata, et tegemist on VPN-iga, ning Venemaal, Iraanis ja Hiinas on see üks esimesi protokolle, mida blokeeritakse.

## Mis on WireGuard?

WireGuard on VPN-protokoll, mille kirjutas Jason A. Donenfeld ja mis ilmus esimest korda 2015. aastal. Selle eesmärk oli asendada varasemad suured seadistatavad protokollid millegagi, mis on piisavalt väike, et seda saaks auditeerida. 2020. aasta märtsis [liideti see Linuxi 5.6 tuuma](https://en.wikipedia.org/wiki/WireGuard) ning ametlikud rakendused on nüüd olemas Windowsi, macOS-i, iOS-i, Androidi ja Linuxi jaoks.

Selle asemel et lasta pooltel šifrikomplekti kokku leppida, fikseerib WireGuard ühe komplekti tänapäevaseid primitiive. Selle [protokollilehel](https://www.wireguard.com/protocol/) on need loetletud: ChaCha20 koos Poly1305-ga krüpteerimiseks, Curve25519 võtmevahetuseks ja BLAKE2s räsimiseks. Pole midagi, mida valesti seadistada, ega vanemat nõrgemat varianti, mille peale tagasi langeda.

## Kuidas see töötab?

Igal seadmel on võtmepaar, umbes nagu SSH-l. Klient ja server teavad teineteise avalikke võtmeid ette ning käepigistus põhineb Noise'i protokolliraamistikul (protokollileht nimetab täpse konstruktsiooni, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Kõik paketid saadetakse UDP kaudu](https://www.wireguard.com/protocol/) ja uus seanss luuakse ühe edasi-tagasi vahetusega.

See ülesehitus on põhjus, miks WireGuard tundub kiire. Läbi rääkida on vähe, Linuxis töötab kood operatsioonisüsteemi tuumas ning Wi-Fi ja mobiilandmeside vahel liikumine käib märkamatult, sest protokoll ei hoia pikaajalist ühendust lahti.

## Miks WireGuard blokeeritakse?

Sama lihtsus, mis teeb WireGuardi auditeerimise lihtsaks, teeb selle ka kergesti äratuntavaks. Selle [valge raamat](https://www.wireguard.com/papers/wireguard.pdf) kirjeldab käepigistuse sõnumeid baitide kaupa, nii et kliendi esimene pakett on alati 148 baiti ja vastus alati 92 baiti ning kumbki algab fikseeritud sõnumitüübi väljaga. Süvapaketikontrolli (DPI) süsteemile piisab lühikesest reeglist, et see muster UDP-s ära tunda.

Tsensorid on just nii teinud. 2023. aasta augustis [teatasid](https://github.com/net4people/bbs/issues/274) kasutajad Venemaal, et suured mobiilioperaatorid katkestavad WireGuardi seansid kohe pärast käepigistust. Krüpteerimine kaitses sisu endiselt, kuid ühendus ise oli kadunud.

See on ülesehituse kompromiss, mitte viga. WireGuardi autorid valisid fikseeritud minimaalse protokolli ja maskeerimine ei kuulunud eesmärkide hulka. Projektid nagu [AmneziaWG](/vpn-protocols/amneziawg) muudavad pakettide kuju, et osa maskeeringut tagasi saada.

## Millal WireGuardi kasutada?

- **Filtreerimata võrkudes.** Kodus, tööl või reisil riigis, mis VPN-e ei blokeeri, on WireGuardi kiiruse ja aku kestvuse poolest raske ületada.
- **Oma serveri pidamisel.** Kui peate ise serverit, on WireGuard üks lihtsamaid protokolle, mida õigesti üles seada.
- **Mitte DPI-filtreerimise all.** Kui teie võrk blokeerib VPN-e, sobib paremini protokoll, mis on loodud nägema välja nagu tavaline veebiliiklus, näiteks [VLESS-Reality](/vpn-protocols/vless-reality). Meie võrdlus [VLESS-Reality ja WireGuard](/blog/vless-reality-vs-wireguard) käsitleb seda kompromissi üksikasjalikumalt.

## Kas Doppler kasutab WireGuardi?

Ei. Doppleri rakendused ühenduvad VLESS-Reality kaudu, sest Doppler on loodud võrkude jaoks, kus WireGuardi filtreeritakse. Põhjendus on juhendis [miks VLESS](/vpn-protocols/why-vless).
