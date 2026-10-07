> **Pe scurt.** AmneziaWG este un fork al WireGuard care îi păstrează viteza și criptografia, dar schimbă formele pachetelor și anteturile care fac WireGuard ușor de observat. Este o opțiune solidă acolo unde WireGuard simplu este blocat, cu o singură rezervă: nu mai vorbește cu serverele WireGuard standard odată ce mascarea este pornită.

## Ce este AmneziaWG?

AmneziaWG este dezvoltat de echipa din spatele [Amnezia VPN](https://amnezia.org/), o aplicație open-source cu care îți rulezi propriul server VPN. [Implementarea Go](https://github.com/amnezia-vpn/amneziawg-go) a proiectului a fost pornită în 2023. Ia [WireGuard](/vpn-protocols/wireguard), care este rapid și simplu, dar are un handshake fix și recognoscibil, și adaugă un strat care îl deghizează.

## Ce schimbă?

[Documentația AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) descrie mai multe mecanisme, fiecare controlat de parametri de configurare:

- **Anteturi dinamice (H1–H4).** Pachetele WireGuard standard încep cu un tip de mesaj fix pentru fiecare dintre cele patru formate de pachet. AmneziaWG înlocuiește acele valori cu numere alese din intervale configurate, așa că două configurări diferite nu au aceleași anteturi și nicio regulă unică de filtrare nu le potrivește pe toate.
- **Randomizarea lungimii pachetelor (S1–S4).** În WireGuard, pachetul inițial de handshake are mereu exact 148 de octeți. AmneziaWG adaugă prefixe aleatorii fiecărui tip de pachet, așa că dimensiunile variază.
- **Pachete junk (Jc, Jmin, Jmax).** Înainte de handshake, clientul trimite un număr configurabil de pachete pseudoaleatorii, de lungime aleatorie, care estompează începutul sesiunii și în timp, și în dimensiune.
- **Protecția antetului.** Versiunile mai noi pot cripta și însuși câmpul tipului de mesaj.

Dedesubt, criptografia și proiectarea de ansamblu rămân cele ale WireGuard.

## Cât de greu este de blocat AmneziaWG?

Înlătură semnăturile simple pe care filtrele le folosesc împotriva WireGuard: dimensiuni fixe și valori fixe de antet. Asta îl face mult mai rezistent decât WireGuard simplu în rețelele care blochează VPN-urile.

Tot rulează peste UDP, așa că rețelele care limitează sau blochează UDP pe scară largă îl vor afecta, iar traficul lui nu imită nicio aplicație anume, așa cum [VLESS-Reality](/vpn-protocols/vless-reality) imită o vizită TLS la un site real. Un filtru care blochează de-a dreptul UDP-ul de nerecunoscut tot l-ar putea prinde.

## Când să folosești AmneziaWG?

- **Acolo unde WireGuard este blocat**, dar UDP încă funcționează, și vrei o viteză ca a WireGuard.
- **Servere găzduite de tine**, folosind aplicația Amnezia VPN ca să le configurezi.
- Păstrează o opțiune pe TCP, cum este VLESS-Reality, pentru rețelele care filtrează UDP. Al nostru [ghid pentru Rusia](/vpn-for-russia) acoperă ce trece în prezent pe acolo.

## Folosește Doppler AmneziaWG?

Nu. Doppler folosește VLESS-Reality. Vezi [de ce VLESS](/vpn-protocols/why-vless).
