> **Kurz gesagt.** OpenVPN ist der Veteran unter den Open-Source-VPNs: flexibel, weit verbreitet und nach mehr als zwei Jahrzehnten gut verstanden. Es ist aber auch langsamer als neuere Protokolle und laut veröffentlichter Forschung eines der Protokolle, die ein Internetanbieter am leichtesten anhand eines Fingerabdrucks erkennt.

## Was ist OpenVPN?

OpenVPN ist freie Open-Source-VPN-Software, die James Yonan [im Mai 2001](https://en.wikipedia.org/wiki/OpenVPN) erstmals veröffentlichte. Während des größten Teils der 2000er und 2010er Jahre war es die Standardwahl für kommerzielle VPN-Dienste und den Fernzugriff in Unternehmen, und es wird noch heute in vielen Routern und Unternehmensprodukten mitgeliefert.

Es läuft im Benutzerbereich statt im Betriebssystemkern und stützt sich für den Schlüsselaustausch auf die OpenSSL-Bibliothek und das TLS-Protokoll. Der von der IANA zugewiesene Port ist 1194, OpenVPN kann aber über UDP oder TCP auf nahezu jedem Port laufen.

## Wie funktioniert es?

OpenVPN verwendet ein eigenes Protokoll mit zwei Teilen. Ein Steuerkanal nutzt TLS, um die beiden Seiten zu authentifizieren, meist mit Zertifikaten, und um Schlüssel zu vereinbaren. Ein Datenkanal transportiert dann Ihren Datenverkehr, mit diesen Schlüsseln verschlüsselt, in UDP- oder TCP-Paketen.

Diese Struktur macht OpenVPN sehr konfigurierbar. Man kann Cipher, Authentifizierungsmethoden, Ports und Transportprotokolle wählen und es über Proxys betreiben. Der Preis für diese Flexibilität ist Komplexität: mehr Code, mehr Einstellungen und mehr Möglichkeiten, bei einer schwachen Konfiguration zu landen.

## Warum wird OpenVPN blockiert?

TLS innerhalb von OpenVPN ist nicht dasselbe wie der HTTPS-Aufruf einer Website. OpenVPN verpackt seinen TLS-Handshake in ein eigenes Paketformat, sodass sein Datenverkehr eine Form hat, die gewöhnlicher Webverkehr nicht aufweist.

Forscher haben gemessen, wie stark das ins Gewicht fällt. Ein Team der University of Michigan und weiterer Einrichtungen [entwickelte ein Fingerprinting-System](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) und setzte es bei einem Internetanbieter mit etwa einer Million Nutzern ein. Es erkannte **über 85 % der OpenVPN-Flows** bei sehr wenigen Fehlalarmen und erfasste außerdem die meisten der getesteten kommerziellen „obfuskierten“ OpenVPN-Konfigurationen.

Die Filterung in der Praxis folgt der Forschung. Im August 2023 [berichteten](https://github.com/net4people/bbs/issues/274) Nutzer in Russland, dass Mobilfunkanbieter OpenVPN-Verbindungen kurz nach deren Beginn unterbrachen.

## Wann sollte man OpenVPN verwenden?

- **Kompatibilität.** Ältere Router, Unternehmens-Gateways und manche Firmennetzwerke unterstützen OpenVPN und nichts Neueres.
- **Reine TCP-Netzwerke.** OpenVPN kann über TCP laufen, wenn UDP blockiert ist, was [WireGuard](/vpn-protocols/wireguard) ohne Hilfsmittel nicht kann.
- **Nicht in gefilterten Netzwerken.** Wo VPNs blockiert werden, scheitert OpenVPN tendenziell früh. Ein Protokoll, das normalen Webverkehr nachahmt, etwa [VLESS-Reality](/vpn-protocols/vless-reality), ist dort das bessere Werkzeug. Unser [Leitfaden zur Zensur](/bypass-censorship) erklärt, wie Filtersysteme entscheiden, was sie unterbrechen.

## Nutzt Doppler OpenVPN?

Nein. Doppler verwendet auf jeder Plattform VLESS-Reality. Die Anleitung [Warum VLESS](/vpn-protocols/why-vless) erklärt, wie wir uns dafür entschieden haben.
