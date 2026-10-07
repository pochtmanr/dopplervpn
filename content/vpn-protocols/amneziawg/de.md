> **Kurz gesagt.** AmneziaWG ist ein Fork von WireGuard, der dessen Geschwindigkeit und Kryptografie beibehält, aber die Paketformen und Header verändert, an denen sich WireGuard leicht erkennen lässt. Es ist eine starke Option, wo reines WireGuard blockiert wird, mit einem Haken: Sobald seine Obfuskation aktiviert ist, kommuniziert es nicht mehr mit standardmäßigen WireGuard-Servern.

## Was ist AmneziaWG?

AmneziaWG wird vom Team hinter [Amnezia VPN](https://amnezia.org/) entwickelt, einer Open-Source-App zum Betrieb eines eigenen VPN-Servers. Die [Go-Implementierung](https://github.com/amnezia-vpn/amneziawg-go) des Projekts wurde 2023 begonnen. Sie nimmt [WireGuard](/vpn-protocols/wireguard), das schnell und einfach ist, aber einen festen, erkennbaren Handshake hat, und ergänzt eine Schicht, die ihn tarnt.

## Was ändert es?

Die [AmneziaWG-Dokumentation](https://docs.amnezia.org/documentation/amnezia-wg/) beschreibt mehrere Mechanismen, die jeweils über Konfigurationsparameter gesteuert werden:

- **Dynamische Header (H1–H4).** Standardmäßige WireGuard-Pakete beginnen für jedes ihrer vier Paketformate mit einem festen Nachrichtentyp. AmneziaWG ersetzt diese Werte durch Zahlen, die aus konfigurierten Bereichen gewählt werden, sodass zwei verschiedene Einrichtungen keine gemeinsamen Header haben und keine einzelne Filterregel auf alle passt.
- **Zufällige Paketlängen (S1–S4).** Bei WireGuard ist das erste Handshake-Paket immer genau 148 Byte groß. AmneziaWG fügt jedem Pakettyp zufällige Präfixe hinzu, sodass die Größen variieren.
- **Junk-Pakete (Jc, Jmin, Jmax).** Vor dem Handshake sendet der Client eine konfigurierbare Anzahl pseudozufälliger Pakete zufälliger Länge, die den Beginn der Sitzung zeitlich und größenmäßig verwischen.
- **Header-Schutz.** Neuere Versionen können auch das Feld für den Nachrichtentyp selbst verschlüsseln.

Darunter bleiben die Kryptografie und das Gesamtdesign die von WireGuard.

## Wie schwer ist AmneziaWG zu blockieren?

Es beseitigt die einfachen Signaturen, die Filter gegen WireGuard einsetzen: feste Größen und feste Header-Werte. Dadurch ist es in Netzwerken, die VPNs blockieren, deutlich widerstandsfähiger als reines WireGuard.

Es läuft weiterhin über UDP, sodass Netzwerke, die UDP breit drosseln oder blockieren, es beeinträchtigen, und sein Datenverkehr ahmt keine bestimmte Anwendung nach, so wie [VLESS-Reality](/vpn-protocols/vless-reality) den TLS-Besuch einer echten Website nachahmt. Ein Filter, der nicht erkennbares UDP grundsätzlich blockiert, könnte es dennoch erfassen.

## Wann sollte man AmneziaWG verwenden?

- **Wo WireGuard blockiert wird**, UDP aber noch funktioniert und Sie eine Geschwindigkeit wie bei WireGuard wünschen.
- **Selbst betriebene Server**, die Sie mit der App Amnezia VPN einrichten.
- Halten Sie eine TCP-basierte Option wie VLESS-Reality für Netzwerke bereit, die UDP filtern. Unser [Leitfaden für Russland](/vpn-for-russia) behandelt, was dort derzeit durchkommt.

## Nutzt Doppler AmneziaWG?

Nein. Doppler verwendet VLESS-Reality. Siehe [Warum VLESS](/vpn-protocols/why-vless).
