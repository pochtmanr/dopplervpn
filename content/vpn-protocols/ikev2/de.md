> **Kurz gesagt.** IKEv2/IPsec ist das VPN, das Ihr Smartphone und Ihr Laptop ohne jede App bereits sprechen. Es ist schnell und kommt gut mit dem Wechsel zwischen WLAN und Mobilfunk zurecht. Es läuft außerdem auf festen, allgemein bekannten Ports, wodurch es für einen Zensor eines der am einfachsten zu blockierenden Protokolle ist.

## Was ist IKEv2/IPsec?

„IKEv2“ besteht eigentlich aus zwei Teilen, die zusammenarbeiten. IPsec ist die Protokollsuite, die IP-Pakete verschlüsselt und authentifiziert. IKE, der Internet Key Exchange, ist das Protokoll, mit dem die beiden Seiten einander authentifizieren und IPsec-Schlüssel vereinbaren. Version 2 von IKE wurde [im Dezember 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange) standardisiert, die aktuelle Spezifikation ist [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Da es ein IETF-Standard ist, ist IKEv2 in iOS, macOS und Windows eingebaut, in Android seit Version 11. Viele VPN-Gateways in Unternehmen verwenden es.

## Wie funktioniert es?

Der Schlüsselaustausch läuft über UDP, [meist auf Port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Sobald sich beide Seiten auf Schlüssel geeinigt haben, verschlüsselt der IPsec-Stack des Betriebssystems Ihren Datenverkehr mit dem Encapsulating Security Payload (ESP). Befindet sich ein NAT-Router im Weg, wie in fast jedem Heim- und Mobilfunknetz, werden IKE und ESP in UDP auf Port 4500 eingepackt.

IKEv2 hat eine Standarderweiterung namens [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), mit der eine Verbindung eine Änderung der IP-Adresse übersteht. Deshalb ist IKEv2 auf Smartphones angenehm: Verlässt man die WLAN-Reichweite und wechselt auf Mobilfunk, läuft der Tunnel weiter, statt sich von Grund auf neu zu verbinden.

## Warum lässt sich IKEv2 leicht blockieren?

IKEv2 versucht gar nicht erst, wie etwas anderes auszusehen. Sein Datenverkehr nutzt allgemein bekannte UDP-Ports und hat die Standardformate von IKE und ESP, die jedes Netzwerkwerkzeug auswerten kann. Zum Blockieren ist nicht einmal Deep Packet Inspection nötig: Ein Filter kann die UDP-Ports 500 und 4500 verwerfen oder den IKE-Austausch direkt erkennen.

Für Firmennetzwerke und Reisen in offenen Ländern, wo es nichts kostet, als VPN erkannt zu werden, ist das ein vernünftiger Kompromiss. In Netzwerken, die VPNs gezielt filtern, ist es meist das Erste, was nicht mehr funktioniert.

## Wann sollte man IKEv2 verwenden?

- **Keine App erlaubt.** Auf einem verwalteten Gerät, auf dem Sie keine Software installieren können, ist der eingebaute IKEv2-Client möglicherweise die einzige Option.
- **Mobiles Roaming in offenen Netzwerken.** MOBIKE sorgt für einen reibungslosen Wechsel zwischen Netzwerken.
- **Nicht unter Zensur.** In gefilterten Netzwerken sollten Sie ein Protokoll wählen, das darauf ausgelegt ist, nicht aufzufallen, etwa [VLESS-Reality](/vpn-protocols/vless-reality). Unser [Leitfaden zur Zensur](/bypass-censorship) erklärt, wie das Blockieren funktioniert.

## Nutzt Doppler IKEv2?

Nein. Doppler verbindet sich in den eigenen Apps mit VLESS-Reality. Die Gründe finden Sie unter [Warum VLESS](/vpn-protocols/why-vless).
